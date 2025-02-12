const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.filterBasedUser, bookingController.indexBookings) // Only here
  .post(bookingController.storeBooking);

router
  .route('/:id')
  .get(bookingController.showBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.destroyBooking);

module.exports = router;
