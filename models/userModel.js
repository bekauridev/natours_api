const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: [true, 'A user must have name!'],
  },
  email: {
    type: String,
    require: [true, 'A user must have email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'A user must have password!'],
    min: [8, 'Password should be more then 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'A user must have password!'],
    validate: {
      // This only works on Create and SAVE!!!
      // if other cases runValidators is on you're good
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // hash password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

usersSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

usersSchema.pre(/^find/, function (next) {
  // This points to current query
  this.find({ active: { $ne: false } });
  next();
});

usersSchema.methods.matchPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

usersSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // convert to miliseconds
    const changedDate = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // Changed
    return JWTTimestamp < changedDate;
  }

  // False menas Not changed
  return false;
};

usersSchema.methods.getResetPasswordToken = function () {
  const restToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');
  console.log({ restToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return restToken;
};

const User = mongoose.model('User', usersSchema);
module.exports = User;
