const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const invoiceController = require('./../controllers/invoiceController');

const router = express.Router();
router.use(express.json());
router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession, invoiceController.getInvoice);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.checkBody, bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
