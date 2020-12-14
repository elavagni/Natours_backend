const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  //retrieve all reviews
  let filter = {};
  //If there is a tour id in the query string, only retrieve the reviews that belong to that tour
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //If the tour id was not provided, use the one from the query string
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //If the user id was not provided, use the one from the current logged user
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
