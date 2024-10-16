const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Tour = require('../models/tourModel');
dotenv.config({ path: '../config.env' });
console.log(process.env.DATABASE);
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

//   Read Json vile

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);

// Import data into DB

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data imported...'.green.inverse);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete All Data from Collection

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

[, , ...args] = process.argv;
const [action] = args;
if (action === '-i') {
  importData();
} else if (action === '-d') {
  deleteData();
}
