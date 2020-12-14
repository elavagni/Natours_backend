const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const { getAllTours, createTour } = require('./../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

//router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(tourController.aliasTopTours, getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//using functions with destructuring
router
  .route('/')
  .get(authController.protect, getAllTours)
  .post(createTour);

//using functions without destructuring
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
