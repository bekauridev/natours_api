const User = require('./../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsyncMiddleware');
const handlerFactory = require('./handlerFactory');

const filterObj = (objInput, ...fields) => {
  const newObj = {};
  Object.keys(objInput).forEach((el) => {
    if (fields.includes(el)) newObj[el] = objInput[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields
  const fields = filterObj(req.body, 'name', 'email');
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.storeUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is not yet defined! Please use ${
      req.protocol
    }://${req.get('host')}/api/v1/users/signup`,
  });
};

exports.indexUser = handlerFactory.indexDoc(User);
exports.showUser = handlerFactory.showDoc(User);
// Do NOT update passwords with this!
exports.updateUser = handlerFactory.updateDoc(User);
exports.destroyUser = handlerFactory.destroyDoc(User);
