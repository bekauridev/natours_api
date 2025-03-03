const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cron = require('node-cron');
const axios = require('axios');
// security
const hpp = require('hpp');
const xss = require('xss-clean');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
// Routes
const viewRoutes = require('./routes/viewRoute');
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const bookingController = require('./controllers/bookingController');

// Initialize app
const app = express();
//  1 - number of proxies between user and server
app.set('trust proxy', 1);

// Initialize view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. **Set security HTTP headers**

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://unpkg.com',
          'https://*.tile.openstreetmap.org',
          'https://tile.jawg.io',
          'https://server.arcgisonline.com',
          'https://cdn.jsdelivr.net',
        ],
        scriptSrc: [
          "'self'",
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
          'https://js.stripe.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        connectSrc: ["'self'", 'http://localhost:3000', 'ws://localhost:*'],
      },
    },
  })
);

// 2. **Development logging**
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 3. **Limit requests from the same API**
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
// Before Body parser, because stripe to work
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// 4. **Enable CORS**
app.use(
  cors({
    credentials: true, // Allow cookies
    origin: 'https://natours-api-9og2.onrender.com/',
  })
);
app.options('*', cors());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. **Serving static files**
app.use(express.static(path.join(__dirname, 'public')));

// 6. **Cookie parser**
app.use(cookieParser());

// 7. **Body parser**
app.use(express.json({ limit: '100kb' })); // Parse JSON request bodies

// 8. **Data sanitization**
// - Against NoSQL query injection
app.use(mongoSanitize());

// - Against XSS
app.use(xss());

// 9. **Prevent parameter pollution**
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// 10. **Compression**
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false; // Skip compression if header exists
      }
      return compression.filter(req, res); // Use default filter
    },
  })
);

// 11. **Custom middleware for debugging or additional functionality**
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 12. **Route handlers**
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//13. **Cron job to keep the server active**
cron.schedule('*/10 * * * *', async () => {
  try {
    const response = await axios.get('https://natours-api-9og2.onrender.com/');
    console.log(
      `[${new Date().toISOString()}] Ping successful: ${response.status}`
    );
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Ping failed: ${
        err.response?.status || 'No Response'
      } - ${err.message}`
    );
  }
});
// 14. **Catch-all for unhandled routes**
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 15. **Global error handling middleware**
app.use(globalErrorHandler);

module.exports = app;
