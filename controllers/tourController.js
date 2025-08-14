const Tour = require('./../Models/tourModels'); // Importing the Tour model

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// exports.checkID = (req, res, next, val) => {
//     // if (Number(req.params.id) * 1 > tours.length) {
//     //   return res.status(404).json({
//     //     status: '404',
//     //     message: 'Invalid Id',
//     //   }

//   console.log(`Tour id is: ${val}`);
//   //console.log('req params id ', req.params.id, 'tours len ', tours.length);
//   next();
// };

//Route Handlers
exports.getAllTours = async (req, res) => {
  //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
  // res.status(200).json({
  //   status: 'success',
  //   ResponseTime: req.resquestTime,
  //   results: tours.length,
  //   data: {
  //     tours: tours,
  //   },
  // });

  // app.get('/api/v1/tours/:id', (req, res) => {
  //   console.log(req.params)
  //   //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
  //   res.status(200).json({
  //     status: 'success',
  //   //   results: tours.length,
  //   //   data: {
  //   //     tours: tours,
  //   //   },
  //   });
  // });
  try {
    //1st BUILD QUERY
    //FILTERING
    const queryObj = { ...req.query }; // Creating a hardcopy by {} and distructuring
    // //Create a shallow copy of the query parameters
    //console.log(req.query); // Log the query parameters for debugging
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // Fields to exclude from the query
    excludedFields.forEach((el) => delete queryObj[el]); // Remove excluded fields

    //1B ADVANCE FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));


    //2nd SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
      //ratingsAverage
    } else {
      query = query.sort('-createdAt'); // Default sorting by createdAt in descending order
    }

    //3rd Field Limiting
    if (req.query.fields){
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields); // Select specific fields
    } else { 
      query = query.select('-__v'); // Exclude the __v field by default with de '-' we will exlude it
    }

    //4 PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit*1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if(skip>numTours) throw new Error('This page does not exist');
    }


    //2ND EXECUTE QUERY
    const tours = await query;

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
