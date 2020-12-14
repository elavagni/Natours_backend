const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//allow the router to get params from parent route so that we can access the tourId if necessary
//e.g. POST /tour/2334adrf/reviews
//e.g. GET /tour/2334adrf/reviews
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
