const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({mergeParams: true});
router.use(authController.protect)
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.checkBody,
        reviewController.createReview
    );


router.route('/:id').patch(authController.restrictTo('user'),reviewController.editReview).delete(reviewController.deleteReview);

module.exports = router;