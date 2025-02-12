const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
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

// Initialize app
const app = express();

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

// 4. **Enable CORS**
app.use(
  cors({
    credentials: true, // Allow cookies
    origin: 'http://localhost:3000',
  })
);
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

// 10. **Custom middleware for debugging or additional functionality**
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies); // Debug cookies
  next();
});

// 11. **Route handlers**
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 12. **Catch-all for unhandled routes**
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 13. **Global error handling middleware**
app.use(globalErrorHandler);

module.exports = app;
