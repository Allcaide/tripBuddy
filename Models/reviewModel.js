//review/ rating/ createAt/ reftotour/ ref to user
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const Tour = require('./tourModels');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belongo to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, //including virtual properties in JSON and object representations
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name' }).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//Mission:
/*
Implement both endpoints
Controller file
Controller functions
Routes in reviewroutes files

create new reviews and retrieve them from the data base
*/
