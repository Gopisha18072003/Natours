const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({mergeParams: true});

router
    .route('/')
    .get(authController.protect, authController.restrictTo('admin'), reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.checkBody,
        reviewController.createReview
    );

router.delete('/:id',authController.protect, authController.restrictTo('admin'), reviewController.deleteReview);

module.exports = router;