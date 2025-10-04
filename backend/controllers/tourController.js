const Tour = require('./../Models/tourModels'); // Importing the Tour model
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//Route Handlers
exports.getAllTours = factory.getAll(Tour);
exports.addNewTour = factory.createOne(Tour);

// exports.addNewTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour, // Return the actual updated tour data
//     },
//   });
// });
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: null, // No content to return after deletion
//   });
// });

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // Match tours with high ratings
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // Group by difficulty level
        numTours: { $sum: 1 }, // Count the number of tours
        avgRating: { $avg: '$ratingsAverage' }, // Calculate average rating
        avgPrice: { $avg: '$price' }, // Calculate average price
        minPrice: { $min: '$price' }, // Find minimum price
        maxPrice: { $max: '$price' }, // Find maximum price
      },
    },
    {
      $sort: { avgPrice: 1 }, // Sort by average price ascending
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthStats = catchAsync(async (req, res) => {
  const year = req.params.year * 1; // Convert year to number
  //console.log(year); Até aqui está certo
  const plan = await Tour.aggregate([
    //https://www.mongodb.com/pt-br/docs/manual/aggregation/
    //https://www.mongodb.com/pt-br/docs/manual/reference/mql/aggregation-stages/#std-label-aggregation-pipeline-operator-reference
    {
      $unwind: '$startDates', // Unwind the startDates array
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`), //yyyy-MM-DD
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
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
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    status_lenght: plan.length,
    data: {
      plan,
    },
  });
});

// '/tours-within/:distance/center/:latlng/unit/:unit',
// tourController.getToursWithin
// /tours-within/233/center/38.662869,-8.997813/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //radius of earth in miles(3963.2) or in km 6378.1
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  // console.log(distance, lat, lng, unit),
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //https://www.mongodb.com/pt-br/docs/manual/reference/operator/query/geoWithin/#mongodb-query-op.-geoWithin
  });

  res.status(200).json({
    status: ' sucess',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi'? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
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
    status: ' sucess',
    data: {
      data: distances,
    },
  });
});

exports.getTourBySlug = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  if (!tour) {
    return next(new AppError('No tour found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { doc: tour }
  });
});
