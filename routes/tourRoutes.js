const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

// const {
//     getAllTours,
//     aliasTopTours,
//     getTour,
//     createTour,
//     updateTour,
//     deleteTour,
// } = require('./../controllers/tourController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.use(express.json());

// router.param('id', tourController.checkID);
router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// I WANT TO PROTECT GETALLTOURS ROUTE

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.checkBody,
    tourController.createTour,
  );
// chaining of middleware function
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin,
);
router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

// router
// .route('/:tourId/reviews')
// .post(authController.protect, authController.restrictTo('user'),
//       reviewController.createReview
// );

module.exports = router;
