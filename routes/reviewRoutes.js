const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//allow the router to get params from parent route so that we can access the tourId if necessary
//e.g. POST /tour/2334adrf/reviews
//e.g. GET /tour/2334adrf/reviews
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updatedReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
