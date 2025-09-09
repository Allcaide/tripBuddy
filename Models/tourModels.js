const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //making the name field
      unique: true, //making the name field unique
      trim: true, //removing whitespace from the beginning and end of the string
      maxlength: [40, 'A tour name must have less or equal than 40 characters'], //setting a maximum length for the name field
      minlength: [10, 'A tour name must have more or equal than 10 characters'], //setting a minimum length for the name field
      //validate: [validator.isAlpha, 'The name must only contain characters'],
    },
    slug: String, //slug field for URL-friendly names
    secretTour: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'], //making the duration field required
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'], //making the maxGroupSize field required
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'], //making the difficulty field required
      enum: {
        values: ['easy', 'medium', 'difficult'], //defining the possible values for difficulty
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, //setting a default value for the rating field
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0, //setting a default value for the ratingsQuantity field
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'], //making the price field required
    },
    priceDiscount: {
      type: Number,
      validate: {
        //It will not work on update trips, only in new DOCUMENTS
        validator: function (val) {
          // 'this' only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price should be below the trip price',
      },
    },
    summary: {
      type: String,
      trim: true, //removing whitespace from the beginning and end of the string
      required: [true, 'A tour must have a summary'], //making the summary field required
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'], //making the imageCover field required
    },
    images: {
      type: [String], //array of strings for multiple images
    },
    createdAt: {
      type: Date,
      default: Date.now, //setting the default value to the current date
      select: false,
    },
    startDates: [Date], //array of dates for tour start dates
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coodinates: [Number],
        address: String,
        decription: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, //including virtual properties in JSON and object representations
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //creating a virtual property to calculate duration in weeks
});

// DOCUMENT MIDDLEWARE runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); //creating a slug from the name field
  next(); //calling the next middleware in the stack //If it doesnt call the next middleware function it will hang
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...'); //logging a message before saving the document
//   next(); //calling the next middleware in the stack
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc); //logging the document after it has been saved
//   next(); //calling the next middleware in the stack
// });

//QueryMiddleWare
tourSchema.pre(/^find/, function (next) {
  // Desta forma é executado sempre que é feito qualquer comando com find
  //tourSchema.pre('find', function (next) {// estava assim, se fosse assim era executado previamente porque utiliza find, tal como o getAllTours, se usasse uma função diferente era executado antes do find, que não existiria

  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.select('-__v').populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took, ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema); //creating a model for the tour schema

module.exports = Tour; //exporting the Tour model so it can be used in other files
