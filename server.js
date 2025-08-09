const mongoose = require('mongoose');
const dotenv = require('dotenv'); //importing dotenv to use environment variables
dotenv.config({ path: './config.env' }); //configuring dotenv to use the config.env file

const app = require('./app'); //importing the app from app.js
//4) Start the server

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

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  //initializing the server, listening
  console.log(`Server is running on port ${port}...`);
});
