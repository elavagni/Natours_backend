/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', error => {
  console.log('Uncaught Exception! Shutting down...');
  console.log(`${error.name}, ${error.message}`);
  console.log(`${error.stack}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection sucessful!'));

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', error => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(`${error.name}, ${error.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
