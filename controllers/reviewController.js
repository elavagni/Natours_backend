const factory = require('./handlerFactory');
const Review = require('./../models/reviewModel');

exports.setTourUserIds = (req, res, next) => {
  //If the tour id was not provided, use the one from the query string
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //If the user id was not provided, use the one from the current logged user
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updatedReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
