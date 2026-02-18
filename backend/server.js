const mongoose = require('mongoose');
const dotenv = require('dotenv'); //importing dotenv to use environment variables
dotenv.config({ path: './config.env' }); //configuring dotenv to use the config.env file

process.on('uncaughtException', (err) => {
  console.error(err.name, err.message);
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1); //exiting the application
});

const app = require('./app'); //importing the app from app.js
//4) Start the server

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD),
);

mongoose
  .connect(DB, {
    dbName: 'milfios',
  })
  .then(() => console.info('DB connection successful'));

// environment variables are intentionally not logged
const path = require('path');
const express = require('express');

// servir frontend estático (só se a pasta existir)
const frontendPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
    const localUrl = `http://127.0.0.1:${port}`;
  console.info(`Servers running on ${localUrl}`);
  //initializing the server, listening
  console.info(`Server is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');


  server.close(() => {
    process.exit(1); //
  });
});
