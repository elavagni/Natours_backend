/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below or eqaul to 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(discount) {
          // the keyword 'this' only points to current doc on NEW document creation, the validator will not work
          // when updating documents
          return discount < this.price;
        },
        message:
          'Discount price ({VALUE}) should be less than the regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      // coordinates in GeoJSON (Longitud first, then latitud) most of the times coordinates are represented the
      // other way around (Latitud first Longitud second)
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//1 = ascending order, -1 = desceding order
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slugify: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//Use regular function instead of arrow function, because we need access to 'this' keyword. Arrow functions do not get
//their own 'this' keyword.  In this case 'this' will be pointing to the current document
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//Virtual populate, get the reviews from the Review collection
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//DOCUMENT MIDDLEWARE: runs before the .save() and .create() but not on .insertMany()
tourSchema.pre('save', function(next) {
  //this represents the document that is being process
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Leave this code as reference
//Code to embed guides (users) into tours
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//Leave this code as reference
// tourSchema.pre('save', function(next) {
//   console.log('Will save document soon...');
//   next();
// });
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
//Add regular expression so that the middleware is executed for all commands that start with find (find, findOne,..)
tourSchema.pre(/^find/, function(next) {
  //"this" represents the current query object
  this.find({ secretTour: { $eq: false } });

  //Dynamically add property to object to know when the query started
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   //"this" represents the current aggregation object

//   //Add another stage at the beginning of the array
//   this.pipeline().unshift({ $match: { secretTour: { $eq: false } } });
//   console.log(this.pipeline());
//   next();
// });

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
