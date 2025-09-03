const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID); // Middleware to check ID

// router.param('body', tourController.checkBody); // Middleware to check body
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/month-stats/:year').get(tourController.getMonthStats);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.addNewTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
