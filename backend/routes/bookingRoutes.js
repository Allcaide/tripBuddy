const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Webhook
router.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Rotas com autenticação
router.get(
  '/my-bookings',
  authController.protect,
  bookingController.getMyBookings,
);

router.get('/:id', authController.protect, bookingController.getBooking);

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = router;
