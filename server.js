const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const { bgRed } = require('colors');

// Uncaught exceptions = Bugs,errors that occur in our synchronous! code
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! 💥 Shutting down...');
  console.log(`${err.name}: `.bgRed, `${err.message}`.red);
  process.exit(1);
});

// Replace <PASSWORD> in connection string with DATABASE_PASSWORD from environment
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false, // Set to false to opt-out of deprecated behavior
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port} at ${process.env.NODE_ENV} mode`);
});

// Handle unhandled rejection Globbaly
// unhandledRejection occurs when a rejected promise has no error handler
process.on('unhandledRejection', (reason, promise) => {
  console.log('UNHANDLET REJECTION! 💥 Shutting down...');
  console.log(`${reason}: `.bgRed, `${promise}`.red);
  server.close(() => {
    process.exit(1);
  });
});
