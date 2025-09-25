const mongoose = require('mongoose');
const dotenv = require('dotenv'); //importing dotenv to use environment variables
dotenv.config({ path: './config.env' }); //configuring dotenv to use the config.env file

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  //handling unhandled promise rejections
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1); //exiting the application
});

const app = require('./app'); //importing the app from app.js
//4) Start the server

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
); //replacing the <PASSWORD> in the DATABASE string with the actual password from the environment variable

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    dbName: 'tripbuddy',
  })
  .then(() => console.log('DB connection successful'));

// console.log(process.env); //checking the environment, if it is development or production

const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  //initializing the server, listening
  console.log(`Server is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  //handling unhandled promise rejections
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');

  server.close(() => {
    process.exit(1); //
  });
});
