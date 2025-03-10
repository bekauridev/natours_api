const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0 '],
      max: [5, 'Rating must be below 5.0 '],
      // runs each time when field updated (new value set)
      set: (val) => Math.round(val * 10) / 10, // 4.66666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must have name'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      require: [true, 'A tour must have cover image '],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // Hide parameter from user
      select: false,
    },
    slug: String,
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // lon lat
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },

  // When data is outputed as json virtual properties will be allowed
  // virtuals are properties that not saved in database it's like derived state
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// sort price ascending (metoba)
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// we use function because we need to access to "this" keyword
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// "save" - we call it hook
// Document middleware: runs before schema is saved to the database
tourSchema.pre('save', function (next) {
  // this = currently proccesed document
  // console.log(this);
  // if slug is nod defined in model it will not be saved
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embeding example
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (userId) =>
//     User.findById(userId)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
// console.log('Will save docuent...');
//   next();
// });

// after all pre middleware finishes
// doc = finished document
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// this = current query
// query middleware
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this);
//   next();
// });

// Cascade delete
tourSchema.pre(
  'findOneAndDelete',
  { document: false, query: true },
  async function (next) {
    try {
      const tourId = this.getFilter()._id;

      if (!tourId) {
        throw new Error('Tour ID not found in query filter.');
      }

      // Delete all reviews associated with the tour
      await mongoose.model('Review').deleteMany({ tour: tourId });

      next(); // Proceed with deleting the tour
    } catch (err) {
      next(err); // Pass the error to the next middleware
    }
  }
);

// Collection name
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// middleware types: document, query, aggregate, model
