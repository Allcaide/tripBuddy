const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// ───────── Webhook Stripe (SEM auth, precisa de raw body) ─────────
router.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout,
);

// ───────── Todas as rotas seguintes requerem autenticação ─────────
router.use(authController.protect);

// ── Rotas do cliente ──
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/my-orders/:id', orderController.getMyOrder);
router.patch('/:id/cancel', orderController.cancelOrder);
router.get('/checkout-session', orderController.getCheckoutSession);

// ── Rotas de admin ──
router.use(authController.restrictTo('admin'));

router.get('/', orderController.getAllOrders);
router
  .route('/:id')
  .get(orderController.getOrder)
  .delete(orderController.deleteOrder);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
