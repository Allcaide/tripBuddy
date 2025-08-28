const Tour = require('./../Models/tourModels'); // Importing the Tour model
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//Route Handlers
exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log('GET /tours query:', req.query);
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //3RD SEND REPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.addNewTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour, // Return the actual updated tour data
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null, // No content to return after deletion
  });
});

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
