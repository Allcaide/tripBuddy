const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'], //making the name field
      unique: true, //making the name field unique
      trim: true, //removing whitespace from the beginning and end of the string
      maxlength: [40, 'A product name must have less or equal than 40 characters'], //setting a maximum length for the name field
      minlength: [10, 'A product name must have more or equal than 10 characters'], //setting a minimum length for the name field
      //validate: [validator.isAlpha, 'The name must only contain characters'],
    },
    slug: String, //slug field for URL-friendly names
    secretproduct: {
      type: Boolean,
      default: false,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A product must have a group size'], //making the maxGroupSize field required
    },
    difficulty: {
      type: String,
      required: [true, 'A product must have a difficulty level'], //making the difficulty field required
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
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0, //setting a default value for the ratingsQuantity field
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'], //making the price field required
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
      required: [true, 'A product must have a summary'], //making the summary field required
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A product must have a cover image'], //making the imageCover field required
    },
    images: {
      type: [String], //array of strings for multiple images
    },
    createdAt: {
      type: Date,
      default: Date.now, //setting the default value to the current date
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, //including virtual properties in JSON and object representations
  },
);

productSchema.index({ price: 1, ratingsAverage: -1 }); //Consumes more memory but it's fast looking for the results
productSchema.index({ slug: 1 });
productSchema.index({ startLocation: '2dsphere' });

productSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //creating a virtual property to calculate duration in weeks
});

//virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE runs before .save() and .create()
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); //creating a slug from the name field
  next(); //calling the next middleware in the stack //If it doesnt call the next middleware function it will hang
});

// productSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// productSchema.pre('save', function (next) {
//   next();
// });

// productSchema.post('save', function (doc, next) {
//   next();
// });

//QueryMiddleWare
productSchema.pre(/^find/, function (next) {
  // Desta forma é executado sempre que é feito qualquer comando com find
  //productSchema.pre('find', function (next) {// estava assim, se fosse assim era executado previamente porque utiliza find, tal como o getAllproducts, se usasse uma função diferente era executado antes do find, que não existiria

  this.find({ secretproduct: { $ne: true } });
  this.start = Date.now();
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

productSchema.post(/^find/, function (docs, next) {
  next();
});

//AGGREGATION MIDDLEWARE
// productSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretproduct: { $ne: true } } });
//   next();
// });

const product = mongoose.model('product', productSchema); //creating a model for the product schema

module.exports = product; //exporting the product model so it can be used in other files
