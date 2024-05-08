const AppError = require('./../utils/appError');
const Users = require('./../models/userModel');
const Tours = require('./../models/tourModel');
const Bookings = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const axios = require('axios');

exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for confirmation.";
  next();
};


exports.getOverview = catchAsync(async (req, res) => {
  // Get tour data from collection
  const tours = await Tours.find();
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
  // 1) Find all bookings
  const bookings = await Bookings.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tours.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});

exports.getMyReviews =async (req, res, next) => {
  try {
    const doc = await axios({
      method: 'GET',
      url: `/api/v1/users/${req.user.id}/reviews`
    });
    const reviews = doc.data
  }catch(err) {
    return next(new AppError('Something went wrong! try again later', 500))
  }
  
  res.status(200).render('myReview', {
    title: 'My review',
    reviews
  });

}