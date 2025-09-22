const mongoose = require('mongoose');
const dotenv = require('dotenv'); //importing dotenv to use environment variables
const fs = require('fs');
const Tour = require('./../../Models/tourModels');
const Review = require('./../../Models/reviewModel');
const User = require('./../../Models/userModel');
// Ensure we load the project's root config.env regardless of cwd
dotenv.config({ path: `${__dirname}/../../config.env` }); //configuring dotenv to use the config.env file

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
); //replacing the <PASSWORD> in the DATABASE string with the actual password from the environment variable

mongoose
  .connect(DB, {
    // opcional: dbName se não estiver explícito na connection string
    dbName: 'tripbuddy',
  })
  .then(() => console.log('DB connection successful'))
  .catch((err) => {
    console.error('DB connection error:', err.message);
    process.exit(1);
  });
// console.log(process.env); //checking the environment, if it is development or production

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//console.log('Tours lidos:', tours);
//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData()
    .then(() => {
      console.log('Import finished, exiting.');
      process.exit();
    })
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
} else if (process.argv[2] === '--delete') {
  deleteData()
    .then(() => {
      console.log('Delete finished, exiting.');
      process.exit();
    })
    .catch((err) => {
      console.error('Delete failed:', err);
      process.exit(1);
    });
}

console.log(process.argv);
