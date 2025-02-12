const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/AppError');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsyncMiddleware');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment', // Required for one-time payments
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/tour-2-cover.jpg`],
          },
          unit_amount: tour.price * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
  });

  // 3) Send session to client
  res.status(200).json({ status: 'success', session });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // Temp
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.filterBasedUser = (req, res, next) => {
  req.filter = { user: req.user.id };
  next();
};
exports.indexBookings = handlerFactory.indexDoc(Booking);
exports.showBooking = handlerFactory.showDoc(Booking);
exports.storeBooking = handlerFactory.storeDoc(Booking);

exports.updateBooking = handlerFactory.updateDoc(Booking);
exports.destroyBooking = handlerFactory.destroyDoc(Booking);
