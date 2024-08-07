const AppError = require('./../utils/appError');
const Users = require('./../models/userModel');
const Tours = require('./../models/tourModel');
const Reviews = require('./../models/reviewModel');
const axios = require('axios');

const Bookings = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');

exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking was successful! Please check your email for confirmation.';
  next();
};

exports.getOverview = catchAsync(async (req, res) => {
  // Get tour data from collection
  let tours;
  if (req.query.sort) {
    tours = await Tours.find().sort(req.query.sort);
  } else {
    tours = await Tours.find();
  }
  // Build Templete

  // Render the templete using tour data

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  const tour = await Tours.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log in to your account',
  });
};

exports.getSignupForm = (req, res) => {
  res
    .status(200)

    .render('signup', {
      title: 'Create an account',
    });
};

exports.getUserAccount = (req, res) => {
  res
    .status(200)

    .render('account', {
      title: 'Your account',
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await Users.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Bookings.find({ user: req.user.id });
  if(!bookings) {
    res.status(200).render('fallback', {
      title: 'My bookings',
    });
  }
  console.log(bookings
  res.status(200).render('myBookings', {
    title: 'My bookings',
    bookings,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Reviews.find({ user: req.user.id });
  if(!reviews) {
    res.status(200).render('fallback', {
      title: 'My reviews',
    });
  }
  res.status(200).render('myReview', { title: 'My reviews', reviews });
});

exports.getEditReviewForm = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const selectedReview = await Reviews.findOne({ _id: id });
  const reviews = await Reviews.find({ user: selectedReview.user._id });
  res.status(200).render('myReview', {
    reviews,
    showEditReviewOverlay: true,
    selectedReview,
  });
});

exports.getCreateReviewForm = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Bookings.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tours.find({ _id: { $in: tourIds } });
  const selectedTour = await Tours.findOne({ slug: req.params.slug });

  res.status(200).render('myBookings', {
    title: 'My bookings',
    tours,
    selectedTour,
    showEditReviewOverlay: true,
  });
});

exports.manageTours = catchAsync(async (req, res, next) => {
  const tours = await Tours.find();
  if(tours.length === 0) {
    return res.status(200).render('fallback', {
      title: 'Manage Tours',
    });
  }
  res.status(200).render('manageTours', {
    title: 'Manage Tours',
    tours,
  });
});

exports.manageUsers = catchAsync(async (req, res, next) => {
  const users = await Users.find({ role: { $ne: 'admin' }, isActive: true });
  if(users.length === 0) {
    return res.status(200).render('fallback', {
      title: 'Manage Users',
    });
  }
  res.status(200).render('manageUsers', {
    title: 'Manage Users',
    users,
  });
});

exports.manageReviews = catchAsync(async (req, res, next) => {
  const tours = await Reviews.aggregate([
    {
      $lookup: {
        from: 'tours',
        localField: 'tour',
        foreignField: '_id',
        as: 'tourInfo',
      },
    },
    // Unwind stage to deconstruct the tourInfo array
    {
      $unwind: '$tourInfo',
    },
    // Group stage to group the reviews based on the tour
    {
      $group: {
        _id: '$tour',
        tourName: { $first: '$tourInfo.name' }, // Get the tour name
        imageCover: { $first: '$tourInfo.imageCover' },
        reviews: {
          $push: { id: '$_id', review: '$review', rating: '$rating' }, // Create an array of review objects
        },
      },
    },
  ]);
  if(tours.length === 0) {
    return res.status(200).render('fallback', {
      title: 'Manage reviews',
    });
  }
  res.status(200).render('manageReviews', {
    title: 'Manage Reviews',
    tours,
  });
});

exports.manageBookings = catchAsync(async (req, res, next) => {
  const tours = await Bookings.aggregate([
    // Match stage to filter documents based on certain conditions, if needed
    // Lookup stage to join the bookings with the tours collection based on the tour field
    {
      $lookup: {
        from: 'tours',
        localField: 'tour',
        foreignField: '_id',
        as: 'tourInfo',
      },
    },
    // Unwind stage to deconstruct the tourInfo array
    {
      $unwind: '$tourInfo',
    },
    // Group stage to group the bookings based on the tour and the start date
    {
      $group: {
        _id: {
          tour: '$tour',
          year: { $year: '$startDate' }, // Extract year from startDate
          month: { $month: '$startDate' }, // Extract month from startDate
        },
        tourName: { $first: '$tourInfo.name' }, // Get the tour name
        imageCover: { $first: '$tourInfo.imageCover' },
        bookings: {
          $push: {
            bookingId: '$_id', // Include the booking ID
            price: '$price',
            user: '$user',
            startDate: '$startDate',
          }, // Create an array of booking objects
        },
      },
    },
    // Lookup stage to join the bookings with the users collection based on the user field
    {
      $lookup: {
        from: 'users',
        localField: 'bookings.user',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    // Unwind stage to deconstruct the userInfo array
    {
      $unwind: '$userInfo',
    },
    // Project stage to reshape the data and include user name and email
    {
      $project: {
        tourName: 1,
        imageCover: 1,
        bookings: {
          $map: {
            input: '$bookings',
            as: 'booking',
            in: {
              bookingId: '$$booking.bookingId',
              price: '$$booking.price',
              user: {
                name: '$userInfo.name',
                email: '$userInfo.email',
              },
              startDate: '$$booking.startDate',
            },
          },
        },
      },
    },
    // Group stage to group based on tour and start date
    {
      $group: {
        _id: {
          tour: '$_id.tour',
          year: '$_id.year',
          month: '$_id.month',
        },
        tourName: { $first: '$tourName' },
        imageCover: { $first: '$imageCover' },
        bookings: {
          $push: {
            startDate: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: 1, // Assuming you want the first day of the month
              },
            },
            bookings: '$bookings',
          },
        },
      },
    },
    // Group stage to group based on tour, and push into an array
    {
      $group: {
        _id: '$_id.tour',
        tourName: { $first: '$tourName' },
        imageCover: { $first: '$imageCover' },
        bookingsByMonth: { $push: '$bookings' },
      },
    },
  ]);

  if (req.query.id) {
    const booking = await Bookings.findById(req.query.id);
    const tour = await Tours.findById(booking.tour);
    return res.status(200).render('manageBookings', {
      title: 'Manage Bookings',
      tours,
      selectedBooking: req.query.id,
      startDates: tour.startDates,
      showEditBookingOverlay: true,
    });
  }
  if(tours.length === 0) {
    console.log(tours)
    return res.status(200).render('fallback', {
      title: 'Manage Bookings',
    });
  }
  res.status(200).render('manageBookings', {
    title: 'Manage Bookings',
    tours,
  });
});
