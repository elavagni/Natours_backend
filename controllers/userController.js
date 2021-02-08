const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/* upload image without image processing 

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    //user-userId-datetime.jpeg
    const extension = file.mimetype.split('/')[1];
    callback(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  }
});
*/

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.uploadUserPhoto = upload.single('photo');

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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
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
  if (req.file) filteredBody.photo = req.file.filename;

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

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not  defined! Please use /signup instead'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do not update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
