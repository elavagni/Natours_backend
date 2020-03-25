const express = require('express');
const tourController = require('./../controllers/tourController');
const { getAllTours, createTour } = require('./../controllers/tourController');

const router = express.Router();

//router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(tourController.aliasTopTours, getAllTours);

//using functions with destructuring
router
  .route('/')
  .get(getAllTours)
  .post(createTour);

//using functions without destructuring
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
