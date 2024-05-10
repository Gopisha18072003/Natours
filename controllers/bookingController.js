const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const Bookings = require('./../models/bookingModel');
const factory = require('../controllers/handlerFactory');
const Users = require('../models/userModel');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-bookings/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'successs',
    session,
  });
});

exports.createBookingCheckout = catchAsync( async (req, res, next) => {
   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const {tour, user, price} = req.query;
  const bookedTour = await Tour.findById(tour);
  if(!tour && !user && !price) return next();
  await Bookings.create({tour, user, price, startDate: bookedTour.startDates[Math.floor(bookedTour.bookings/bookedTour.maxGroupSize)]});
  // not using next because we do not want to leak the query of the success_url
  res.redirect(`${req.protocol}://${req.get('host')}/my-bookings/?alert=booking`);
});



exports.createBooking = factory.createOne(Bookings);
exports.getBooking = factory.getOne(Bookings);
exports.getAllBookings = factory.getAll(Bookings);
exports.updateBooking = factory.updateOne(Bookings);
exports.deleteBooking = factory.deleteOne(Bookings);
