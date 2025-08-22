const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //making the name field
      unique: true, //making the name field unique
      trim: true, //removing whitespace from the beginning and end of the string
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
    },
    ratingsQuantity: {
      type: Number,
      default: 0, //setting a default value for the ratingsQuantity field
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'], //making the price field required
    },
    priceDiscount: Number,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, //including virtual properties in JSON and object representations
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //creating a virtual property to calculate duration in weeks
});

//DOCUMENT MIDDLEWARE runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); //creating a slug from the name field
  next(); //calling the next middleware in the stack //If it doesnt call the next middleware function it will hang
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...'); //logging a message before saving the document
//   next(); //calling the next middleware in the stack
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc); //logging the document after it has been saved
//   next(); //calling the next middleware in the stack
// });

//QueryMiddleWare
tourSchema.pre(/^find/, function (next) {// Desta forma é executado sempre que é feito qualquer comando com find
//tourSchema.pre('find', function (next) {// estava assim, se fosse assim era executado previamente porque utiliza find, tal como o getAllTours, se usasse uma função diferente era executado antes do find, que não existiria

  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log( `Query took, ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
})

const Tour = mongoose.model('Tour', tourSchema); //creating a model for the tour schema

module.exports = Tour; //exporting the Tour model so it can be used in other files
