const mongoose = require('mongoose');
const Tours = require('./tourModel');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price.']
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: 'Start date required'
    }

});


bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: '-guides -bookings -images'
    });
    next();
});

bookingSchema.statics.calcNoBookings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nbookings: {$sum: 1},            
            }
        }
    ]);

    if (stats.length > 0) {
        const tour = await Tours.findById(tourId);
        const startDate = tour.startDates[Math.floor(tour.bookings/tour.maxGroupSize)]
        await Tours.findByIdAndUpdate(tourId, {
          bookings: stats[0].nbookings,
          startDate
        });
      } else {
        await Tours.findByIdAndUpdate(tourId, {
          bookings: 0
        });
      }
}

bookingSchema.post('save', function () {
    // this points to current booking
  
    this.constructor.calcNoBookings(this.tour);
  });

  bookingSchema.post('findOneAndDelete', async function (doc) {
    // Call calcAverageRatings method
  
    await this.model.calcNoBookings(doc.tour._id);
  });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;