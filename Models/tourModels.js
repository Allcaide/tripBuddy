const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'], //making the name field
    unique: true, //making the name field unique
  },
  rating: {
    type: Number,
    default: 4.5, //setting a default value for the rating field
    min: [1, 'Rating must be above 1.0'], //setting a minimum value for the rating field
    max: [5, 'Rating must be below 5.0'], //setting a maximum value for the rating field
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'], //making the price field required
  },
});

const Tour = mongoose.model('Tour', tourSchema); //creating a model for the tour schema

module.exports = Tour; //exporting the Tour model so it can be used in other files