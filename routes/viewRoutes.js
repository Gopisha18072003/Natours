const express = require('express');

const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

router.get(
  '/',
  authController.isLoggedIn,
  viewController.getOverview,
);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTours);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);
router.get('/me', authController.protect, viewController.getUserAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

router.get('/my-tours',bookingController.createBookingCheckout,viewController.alert, authController.protect, viewController.getMyTours);
router.get('/my-reviews',authController.protect, viewController.getMyReviews);

module.exports = router;
