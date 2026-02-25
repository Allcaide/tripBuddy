const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Nested reviews: POST /products/:productId/reviews
router.use('/:productId/reviews', reviewRouter);

// ───────── Rotas públicas ─────────

// Valores distintos para dropdowns (categorias, cores, tamanhos, etc.)
router.get('/field-options', productController.getFieldOptions);

// Buscar produto por slug (para páginas de detalhe com URL amigável)
router.get('/slug/:slug', productController.getProductBySlug);

// Listar todos / ver um produto — público
router
  .route('/')
  .get(productController.getAllProducts);

router
  .route('/:id')
  .get(productController.getProduct);

// ───────── Rotas protegidas (admin) ─────────
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .post(
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.addNewProduct,
  );

router
  .route('/:id')
  .patch(
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct,
  )
  .delete(productController.deleteProduct);

module.exports = router;
