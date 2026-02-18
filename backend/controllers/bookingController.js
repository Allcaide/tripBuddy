const Stripe = require('stripe');
const Product = require('../Models/productModels');
const Booking = require('./../Models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Lazy init — garante que STRIPE_SECRET_KEY já foi carregada pelo dotenv
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');

// Função auxiliar para criar booking
const createBooking = async (productId, userId, price) => {
  return await Booking.create({ product: productId, user: userId, price });
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // 2) Create checkout session
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${product.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: product.price * 100,
          product_data: {
            name: product.name,
            description: product.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/products/${product.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    // Metadata (dados que passamos para o webhook)
    metadata: {
      productId: product._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// Webhook seguro do Stripe
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verifica a assinatura (confirma que veio do Stripe)
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Só processar quando pagamento foi concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // SEGURO: Criar booking com dados verificados pelo Stripe
    const booking = await createBooking(
      session.metadata.productId,
      session.metadata.userId,
      session.amount_total / 100,
    );
  }

  res.status(200).json({ received: true });
});

// Obter todos os bookings (com filtros, paginação, etc)
exports.getAllBookings = factory.getAll(Booking);

// Obter um booking específico
exports.getBooking = factory.getOne(Booking);  //

// Obter bookings (filtrado por user)
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const filter = { user: req.user.id };
  const features = new APIFeatures(Booking.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const bookings = await features.query;  // ✅ Remove o populate (o schema já faz)

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      data: bookings,
    },
  });
});