const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
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
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
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

const createBookingCheckout = catchAsync(async (session) => {
  try {
    const tour = session.client_reference_id;
    const userDoc = await User.findOne({ email: session.customer_email });

    if (!userDoc) {
      console.error('User not found for email:', session.customer_email);
      return;
    }

    const user = userDoc.id;

    // Retrieve line items separately (Stripe does not send them in session object)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    if (!lineItems.data.length) {
      console.error('No line items found for session:', session.id);
      return;
    }

    const price = lineItems.data[0].price_data.unit_amount / 100;

    await Booking.create({ tour, user, price });
  } catch (error) {
    console.error('Error in createBookingCheckout:', error);
  }
});

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

exports.filterBasedUser = (req, res, next) => {
  req.filter = { user: req.user.id };
  next();
};

exports.indexBookings = handlerFactory.indexDoc(Booking);
exports.showBooking = handlerFactory.showDoc(Booking);
exports.storeBooking = handlerFactory.storeDoc(Booking);
exports.updateBooking = handlerFactory.updateDoc(Booking);
exports.destroyBooking = handlerFactory.destroyDoc(Booking);
