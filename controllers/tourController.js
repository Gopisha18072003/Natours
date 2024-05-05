const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { getAllUsers } = require('./userController');
const multer = require('multer');
const sharp = require('sharp');


const factory = require('./handlerFactory');

// MULTIPLE FILE UPLOAD

// 1. Create storage
const multerStorage = multer.memoryStorage();

// 2. Create filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload image only'), false);
  }
};

// 3. Create upload object
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// 4. Upload imgage
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// 5. Process images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 6.1) Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 6.2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      // console.log(filename)
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});

/***********************
 * ALIASING MIDDLEWARE *
 ***********************/

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

/********************
 * PARAM MIDDLEWARE *
 ********************/

{
  // exports.checkID = (req, res, next, val) => {
  //     console.log(`Tour id is: ${val}`);
  //     const id = req.params.id * 1
  //     if (id > tours.length) {
  //         return res.status(404).json({
  //             status: 'fail',
  //             message: 'Invalid Id'
  //         });
  //     }
  //     next();
  // };
}

/**************
 * MIDDLEWARE *
 **************/

exports.checkBody = (req, res, next) => {
  console.log(req.body);
  if (req.body.name === undefined || req.body.price === undefined) {
    return res.status(400).send('Bad request');
  }
  next();
};

/******************
 * ROUTE HANDLERS *
 ******************/

/*******************
 * OLD GETALLTOURS *
 *******************/

// exports.getAllTours = async (req, res) => {
// if no query is provided in the find then it will return all documents
//    try {
{
  // BUILD QUERY
  // 1A) Filtering
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);
  // 1B) Advance filtering
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // let query = Tour.find(JSON.parse(queryStr));
  // 2) SORTING
  // if (req.query.sort) {
  //     const sortBy = req.query.sort.split(',').join(' ');
  //     query = query.sort(sortBy);
  // } else {
  //     query = query.sort('-createdAt');
  // using -ve sign to sort in descending order
  // }
  // 3) Field limiting(Projection)
  // if (req.query.fields) {
  //     const fields = req.query.fields.split(',').join(' ');
  //     query = query.select(fields);
  // } else {
  //     query = query.select('-__v');
  // }
  // 4) Paginaton
  // page=2&limit=10, 1-10 : page 1, 11-20: page2, 21-30: page3 .....
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;
  // if (req.query.page) {
  //     const numTours = await Tour.countDocuments();
  //     if (skip >= numTours) throw new Error('This page does not exist');
  // }
  // query = query.skip(skip).limit(limit);
  // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
}

// EXECUTE QUERY

//        const features = new APIFeatures(Tour.find(), req.query)
//            .filter()
//            .sort()
//            .limitFields()
//            .paginate();
//        const tours = await features.query;

// SEND RESPONSE
//        res.status(200).json({
//            status: 'success',
//            results: tours.length,
//            data: { tours },
//        });
//     } catch (err) {
//        console.log(err);
//        res.status(401).json({
//            status: 'fail',
//            message: err,
//        });
//    }
// };

/*******************
 * NEW GETALLTOURS *
 *******************/
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, 'reviews');
// ********** old Code **********

// console.log(req.params);
// const id = req.params.id * 1
// const tour = tours.find(el => el.id === id)

// res.status(200).json({
//     status: 'success',
//     // data: { tour: tours[req.params.id * 10] }
//     data: { tour }
// });
// };

/************
 * OLD CODE *
 ************/

// exports.createTour = async (req, res) => {
//    try {
// method 1
// const newTour = new Tour({})
// newTour.save()

// method 2
//         const newTour = await Tour.create(req.body);

//       res.status(201).json({
//            status: 'success',
//            data: {
//                tours: newTour,
//            },
//        });
//    } catch (err) {
//        res.status(400).json({
//            status: 'fail',
//            message: err,
//        });
//    }
// };

/************
 * NEW CODE *
 ************/

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

/*********************************************
 * AGGREGATION PIPELINE: MATCHING & GROUPING *
 *********************************************/

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //     $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

/**************************************************
 * AGGREGATION PIPELINE: UNWINDING AND PROJECTING *
 **************************************************/

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1, month: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

// Geospatial query

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide lattitude and longitude in the format lat, lng',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    // always needs to be first stage
    // it requires one of a fields contains geoSpatial index
    // if we have mutiple field with geoSpatial index then we have to use key paramter in order to define a field
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
