const Stripe = require('stripe');
const Order = require('../Models/orderModel');
const Cart = require('../Models/cartModel');
const Product = require('../Models/productModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// ───────── Stripe: lazy init ─────────
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// ───────── Helper: snapshot cart items → order items ─────────
const cartItemsToOrderItems = (cartItems) => {
  return cartItems.map((item) => {
    const product = item.product; // populado pelo cart middleware
    const productId =
      typeof product === 'object' && product._id
        ? product._id
        : product;
    const name =
      typeof product === 'object' ? product.name : 'Produto';
    const imageCover =
      typeof product === 'object' ? product.imageCover : undefined;
    const sku =
      typeof product === 'object' ? product.sku : undefined;
    const brand =
      typeof product === 'object' ? product.brand : undefined;

    return {
      product: productId,
      name,
      imageCover,
      sku,
      brand,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    };
  });
};

// ═══════════════════════════════════════
//  CUSTOMER ENDPOINTS
// ═══════════════════════════════════════

// ───────── POST /orders — Criar encomenda a partir do carrinho ─────────
exports.createOrder = catchAsync(async (req, res, next) => {
  // 1) Buscar carrinho do user
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    return next(
      new AppError('O carrinho está vazio. Adicione produtos antes de encomendar.', 400),
    );
  }

  // 2) Validar stock de cada item
  for (const item of cart.items) {
    const productId =
      typeof item.product === 'object' && item.product._id
        ? item.product._id
        : item.product;

    const product = await Product.findById(productId);
    if (!product) {
      return next(
        new AppError(`Produto "${item.product?.name || productId}" já não existe.`, 404),
      );
    }
    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Stock insuficiente para "${product.name}". Disponível: ${product.stock}, pedido: ${item.quantity}`,
          400,
        ),
      );
    }
  }

  // 3) Calcular totais
  const orderItems = cartItemsToOrderItems(cart.items);
  const subtotal = orderItems.reduce(
    (sum, i) => sum + i.priceAtPurchase * i.quantity,
    0,
  );
  const shippingCost = req.body.shippingCost || 0;
  const discount = req.body.discount || 0;
  const totalPrice = Math.max(0, subtotal + shippingCost - discount);

  // 4) Criar a order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost,
    discount,
    totalPrice: Math.round(totalPrice * 100) / 100,
    currency: req.body.currency || 'EUR',
    paymentMethod: req.body.paymentMethod || 'stripe',
    shippingAddress: req.body.shippingAddress,
    notes: req.body.notes,
    status: 'pending',
  });

  // 5) Decrementar stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // 6) Limpar carrinho
  cart.items = [];
  await cart.save();

  res.status(201).json({
    status: 'success',
    data: {
      data: order,
    },
  });
});

// ───────── GET /orders/my-orders — As minhas encomendas ─────────
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      data: orders,
    },
  });
});

// ───────── GET /orders/:id — Detalhe de uma encomenda (minha) ─────────
exports.getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!order) {
    return next(new AppError('Encomenda não encontrada', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: order,
    },
  });
});

// ───────── PATCH /orders/:id/cancel — Cancelar encomenda (cliente) ─────────
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!order) {
    return next(new AppError('Encomenda não encontrada', 404));
  }

  // Só pode cancelar se estiver pending ou paid
  if (!['pending', 'paid'].includes(order.status)) {
    return next(
      new AppError(
        `Não é possível cancelar uma encomenda com estado "${order.status}"`,
        400,
      ),
    );
  }

  // Repor stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: order,
    },
  });
});

// ═══════════════════════════════════════
//  ADMIN ENDPOINTS
// ═══════════════════════════════════════

// ───────── GET /orders — Todas as encomendas (admin) ─────────
exports.getAllOrders = factory.getAll(Order);

// ───────── GET /orders/:id — Detalhe (admin) ─────────
exports.getOrder = factory.getOne(Order);

// ───────── PATCH /orders/:id/status — Atualizar estado (admin) ─────────
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, trackingNumber, adminNotes } = req.body;

  if (!status) {
    return next(new AppError('Por favor indique o novo estado', 400));
  }

  const validStatuses = [
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
  ];
  if (!validStatuses.includes(status)) {
    return next(
      new AppError(`Estado inválido. Valores possíveis: ${validStatuses.join(', ')}`, 400),
    );
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Encomenda não encontrada', 404));
  }

  const oldStatus = order.status;

  // Se cancelar/reembolsar → repor stock (se ainda não tinha sido)
  if (
    ['cancelled', 'refunded'].includes(status) &&
    !['cancelled', 'refunded'].includes(oldStatus)
  ) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  // Atualizar campos conforme o estado
  order.status = status;

  if (status === 'paid' && !order.paidAt) {
    order.paidAt = new Date();
  }
  if (status === 'shipped') {
    order.shippedAt = new Date();
    if (trackingNumber) order.trackingNumber = trackingNumber;
  }
  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }
  if (adminNotes) {
    order.adminNotes = adminNotes;
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: order,
    },
  });
});

// ───────── DELETE /orders/:id — Eliminar encomenda (admin) ─────────
exports.deleteOrder = factory.deleteOne(Order);

// ═══════════════════════════════════════
//  STRIPE CHECKOUT
// ═══════════════════════════════════════

// ───────── GET /orders/checkout-session — Criar sessão Stripe a partir do carrinho ─────────
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Buscar carrinho do user
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    return next(new AppError('O carrinho está vazio.', 400));
  }

  // 2) Construir line_items para o Stripe
  const line_items = cart.items.map((item) => {
    const product = item.product; // populado
    const name =
      typeof product === 'object' ? product.name : 'Produto';
    const description = [item.color, item.size].filter(Boolean).join(' / ') || undefined;
    const imageCover =
      typeof product === 'object' ? product.imageCover : undefined;
    const images = imageCover
      ? [`${req.protocol}://${req.get('host')}/img/products/${imageCover}`]
      : [];

    return {
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name,
          ...(description && { description }),
          ...(images.length && { images }),
        },
      },
      quantity: item.quantity,
    };
  });

  // 3) Criar sessão Stripe
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    mode: 'payment',
    line_items,
    metadata: {
      userId: req.user._id.toString(),
    },
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// ───────── POST /orders/webhook-checkout — Webhook Stripe ─────────
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.userId;

    if (!userId) {
      console.error('Stripe webhook: userId em falta');
      return res.status(200).json({ received: true });
    }

    try {
      // Buscar carrinho do user
      const cart = await Cart.findOne({ user: userId });

      if (cart && cart.items.length > 0) {
        const orderItems = cartItemsToOrderItems(cart.items);
        const subtotal = orderItems.reduce(
          (sum, i) => sum + i.priceAtPurchase * i.quantity,
          0,
        );

        // Criar order paga
        await Order.create({
          user: userId,
          items: orderItems,
          subtotal: Math.round(subtotal * 100) / 100,
          totalPrice: Math.round((session.amount_total / 100) * 100) / 100,
          status: 'paid',
          paidAt: new Date(),
          paymentMethod: 'stripe',
          paymentIntentId: session.payment_intent || session.id,
        });

        // Decrementar stock
        for (const item of orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }

        // Limpar carrinho
        cart.items = [];
        await cart.save();
      }
    } catch (err) {
      console.error('Order creation from Stripe webhook failed:', err.message);
    }
  }

  res.status(200).json({ received: true });
});
