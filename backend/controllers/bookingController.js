const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../Models/tourModels');
const Booking = require('./../Models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');

// Função auxiliar para criar booking
const createBooking = async (tourId, userId, price) => {
  return await Booking.create({ tour: tourId, user: userId, price });
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tours`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    // ✅ IMPORTANTE: Metadata (dados que passamos para o webhook)
    metadata: {
      tourId: tour._id.toString(),
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
    event = stripe.webhooks.constructEvent(
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
      session.metadata.tourId,
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