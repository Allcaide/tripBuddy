const Tour = require('./../Models/tourModels'); // Importing the Tour model
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//Route Handlers
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Error fetching tours:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching tours',
    });
  }
};

exports.addNewTour = async (req, res) => {
  try {
    // const newTour = new tour({});
    // newTour.save(); //Como se fazia antes de saber como se faz bem

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.error('Error creating new tour:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Tour not found' });
    }
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    console.error('Error fetching tour:', err);
    res.status(500).json({ status: 'fail', message: 'Error fetching tour' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour, // Return the actual updated tour data
      },
    });
  } catch (err) {
    console.error('Error updating tour:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null, // No content to return after deletion
    });
  } catch (err) {
    console.error('Error deleting tour:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error deleting tour',
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Error fetching tour stats:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching tour stats',
    });
  }
};

exports.getMonthStats = async (req, res) => {
  try {
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
  
  } catch (err) {
    console.error('Error fetching tour stats:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching tour stats',
    });
  }
};
