const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'], //making the name field
    unique: true, //making the name field unique
    trim: true, //removing whitespace from the beginning and end of the string
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
  },
  startDates: [Date], //array of dates for tour start dates
});

const Tour = mongoose.model('Tour', tourSchema); //creating a model for the tour schema

module.exports = Tour; //exporting the Tour model so it can be used in other files
