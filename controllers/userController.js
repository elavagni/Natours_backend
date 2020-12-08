const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

//Create object with only the fields that are allowed to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  //Loop through all the fields of the object obj
  Object.keys(obj).forEach(element => {
    //for each field check if it is part of the allowedFields array, if it is
    //create a new field in the new object with the same name, and same value as in the original object
    if (allowedFields.includes(element)) newObj[element] = obj[element];
  });
  //return the new object
  return newObj;
};

//Update the currently logged user
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.passwordConfirm) {
    next(
      new AppError(
        'This route is not for password updates.  Please use /updateMyPassword',
        400
      )
    );
  }

  //Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Since we are not updating the password here, we can use User.findByIdAndUpdate
  // as the pre save middleware is not necessary, so it is ok if it doesn't run
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users
    }
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
