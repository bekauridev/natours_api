const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../middlewares/catchAsyncMiddleware');
const handlerFactory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// Saves to buffer
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .resize(500, 500) // Resize the image to 500x500 pixels
    .toFormat('webp') // Convert the image to WebP format
    .webp({
      quality: 90, // Set the quality of the WebP image (0-100)
      lossless: false, // Use lossy compression (set to `true` for lossless)
      alphaQuality: 90, // Quality of alpha layer (if applicable)
    })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
const filterObj = (objInput, ...fields) => {
  const newObj = {};
  Object.keys(objInput).forEach((el) => {
    if (fields.includes(el)) newObj[el] = objInput[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
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
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
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
