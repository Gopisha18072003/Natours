const mongoose = require('mongoose');
const Tours = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name imageCover',
  }).populate({
    path: 'user',
    select: 'name photo ',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// prevents duplicate reviews
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.post('save', function () {
  // this points to current review

  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.post('findOneAndDelete', async function (doc) {
  // Call calcAverageRatings method

  await this.model.calcAverageRatings(doc.tour._id);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  // Call calcAverageRatings method
  await this.model.calcAverageRatings(doc.tour._id);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
