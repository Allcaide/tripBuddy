const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });
// POST /products/:productId/reviews
// GET /products/:productId/reviews
// POST /reviews

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setProductUserIds,
    reviewController.createReview,
  );

router.get(
  '/my-reviews',
  authController.protect,
  reviewController.getMyReviews,
);
router
  .route('/:id')
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .get(reviewController.getReview);

module.exports = router;
