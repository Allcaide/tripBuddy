const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../Models/tourModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // ✅ URLs apontam para o FRONTEND, não para o backend
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?tour=${tour.slug}&user=${req.user.id}&price=${tour.price}`,
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
  });

  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
