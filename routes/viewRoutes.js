const express = require('express');

const router = express.Router();
const viewContolller = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewContolller.getOverview,
);

router.get('/tour/:slug', authController.isLoggedIn, viewContolller.getTours);

router.get('/login', authController.isLoggedIn, viewContolller.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewContolller.getSignupForm);
router.get('/me', authController.protect, viewContolller.getUserAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewContolller.updateUserData,
);

router.get('/my-tours', viewContolller.getMyTours);
module.exports = router;
