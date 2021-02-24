const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

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

//When there is a mix of images with the same name, and images with a different name
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

//When there is only one image
//upload.sinble('images')
//Where there are many images with the same name
//upload.array('images', 5)

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //Process cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //Process images

  req.body.images = [];

  // use map to store the promises returned by each iteration of the foreach loop
  // if we do not use map, the promises will not be awaited, and the next function will be call
  // before the image processing is done
  const imgProcessing = req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    await sharp(req.files.images[i].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
  });

  await Promise.all(imgProcessing);

  next();
});

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      //Use the name defined in the group above to reference the fields, do not use the name in the db
      $sort: { avgPrice: 1 }
    }
    //,
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

//tours-within/:distance/center/:latlng/unit/:unit
//tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [latitude, longitude] = latlng.split(',');

  if (!latitude || !longitude) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }

  //in orther to get the radiosu divide the distance by the radious of the earth
  // eath radios is 3963.2 mi or 6578.1km
  const radious = unit === 'mi' ? distance / 3963.2 : distance / 6578.1;

  //coordinates often start with latitude first and longitude second, however for geoJson data is the
  // other way around
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radious] }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [latitude, longitude] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!latitude || !longitude) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //Since we only have one geoInex in the collection that one would be use by default for the aggregation
        near: {
          type: 'Point',
          //Multiply by one to convert them into numbers
          coordinates: [longitude * 1, latitude * 1]
        },
        //Field to be created with the result of the aggregation (calculated disntances)
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
