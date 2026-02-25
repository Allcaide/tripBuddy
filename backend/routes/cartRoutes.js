const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

// Todas as rotas do carrinho requerem autenticação
router.use(authController.protect);

// ── Rotas do cliente ──
router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

// ── Admin: ver carrinhos (ANTES de /:itemId para evitar conflito) ──
router.get('/admin/all', authController.restrictTo('admin'), cartController.getAllCarts);
router.get('/admin/:userId', authController.restrictTo('admin'), cartController.getUserCart);

// ── Rotas com param (cliente) ──
router
  .route('/:itemId')
  .patch(cartController.updateCartItem)
  .delete(cartController.removeCartItem);

module.exports = router;
