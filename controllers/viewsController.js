const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getTour = catchAsync(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return new AppError('Please provide a tour slug', 400);
  }

  const tour = await Tour.findOne({
    slug: slug
  }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!slug) {
    return new AppError('The tour with the slug provided does not exist', 404);
  }

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour
  });
});
