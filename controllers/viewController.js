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
      "Your booking was successful! Please check your email for confirmation.";
  next();
};


exports.getOverview = catchAsync(async (req, res) => {
  // Get tour data from collection
  let tours;
  if(req.query.sort){
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
  res.status(200).render('myBookings', {
    title: 'My bookings',
    bookings
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Reviews.find({user: req.user.id});
  res.status(200).render('myReview', {title: 'My reviews', reviews});

})

exports.getEditReviewForm = catchAsync(async(req, res, next) => {
  const {id} = req.query;
  const selectedReview = await Reviews.findOne({_id:id})
  const reviews = await Reviews.find({user: selectedReview.user._id});
  res.status(200).render('myReview', {reviews, showEditReviewOverlay: true, selectedReview});
})

exports.getCreateReviewForm = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Bookings.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tours.find({ _id: { $in: tourIds } });
  const selectedTour = await Tours.findOne({slug: req.params.slug})

  res.status(200).render('myBookings', {
    title: 'My bookings',
    tours,
    selectedTour,
    showEditReviewOverlay: true
  });
});

exports.manageTours = catchAsync( async (req, res, next) => {
  const tours = await Tours.find();

  res.status(200).render('manageTours', {
    title: 'Manage Tours',
    tours
  });
})

exports.manageUsers = catchAsync( async (req, res, next) => {
  const users = await Users.find({role: {$ne: 'admin'}, isActive: true});

  res.status(200).render('manageUsers', {
    title: 'Manage Users',
    users
  });
})

exports.manageReviews = catchAsync( async (req, res, next) => {
  const reviews = await Reviews.find();

  res.status(200).render('manageReviews', {
    title: 'Manage Reviews',
    reviews
  });
})

exports.manageBookings = catchAsync( async (req, res, next) => {
  const bookings = await Bookings.find();

  res.status(200).render('manageBookings', {
    title: 'Manage Bookings',
    bookings
  });
})

