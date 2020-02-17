const express = require('express');
const tourController = require('./../controllers/tourController');
const { getAllTours, createTour } = require('./../controllers/tourController');

const router = express.Router();

//using functions with destructuring
router
  .route('/')
  .get(getAllTours)
  .post(createTour);

//using functions without destructuring
router
  .route(':id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
