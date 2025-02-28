const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Email = require('../utils/email');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyncMiddleware');
const AppError = require('../utils/AppError');
const { userInfo } = require('os');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    maxAge: +process.env.JWT_COOKIE_EXPIRESIN_IN * 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: '/', // Path for the cookie
    secure: process.env.NODE_ENV === 'production', // Automatically set to true in production (when HTTPS is used)
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // Temp
    // passwordChangedAt: req.body.passwordChangedAt,
  });
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  // await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // const matchPass = ;

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isMatch = await user.matchPassword(password, user.password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // 3) If everything is ok, sent token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', '', { expires: new Date(0), httpOnly: true });
  res.status(200).json({ status: 'success', message: 'Logged out!' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // console.log(decoded.id);
    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 3) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // There is a logged in user
    // make it available to pug
    res.locals.user = currentUser;
    req.user = currentUser;

    return next();
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with email adress.', 404));
  // 2) Generate the random reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send it to user's email
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token send to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) if token has not expired, and there is user, set the new password
  if (!user) return next(new AppError('Token is invalid or expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4)Log the user in, send JWT

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, currentPassword } = req.body;

  // 1) Check if password or passwordConfirm is missing
  if (!password || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide both password and password confirmation',
        400
      )
    );
  }

  // 2) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 3) Check if opsted password is correct
  if (!(await user.matchPassword(currentPassword, user.password))) {
    return next(new AppError('Current password is not valid', 401));
  }

  // 3) If correct update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // 4) Log user in, sent JTW

  createSendToken(user, 200, res);
});
