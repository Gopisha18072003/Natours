const stripe = require('stripe')('sk_test_51PCc9nSBggYrNv4RapRsdXh7AsGTn0ffFh4V8DNe4XhnvTIZZLcyiRkyCNEFSAloYlEg1D1rSdINo6F3OdCl3Jmx00UJ0cuXPp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Bookings = require('./../models/bookingModel');
const factory = require('../controllers/handlerFactory');
const Users = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
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
  console.log(session, req.headers);
  // 3) Create session as response
  res.status(200).json({
    status: 'successs',
    session,
  });
});

// exports.createBookingCheckout = catchAsync( async (req, res, next) => {
//    This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const {tour, user, price} = req.query;
//   if(!tour && !user && !price) return next();
//   await Bookings.create({tour, user, price});
//   // not using next because we do not want to leak the query of the success_url
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await Users.findOne({email: session.customer_email})).id;
  const price = session.line_items[0].price_data.unit_amount / 100;

  await Bookings.create({tour, user, price});
}

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['Stripe-Signature'];
  console.log(signature);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      'whsec_H2qRHveILDFAX7H9qpmV04S5O77kjfbm',
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err}`);
  }

  if(event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({received: true});
};

exports.createBooking = factory.createOne(Bookings);
exports.getBooking = factory.getOne(Bookings);
exports.getAllBookings = factory.getAll(Bookings);
exports.updateBooking = factory.updateOne(Bookings);
exports.deleteBooking = factory.deleteOne(Bookings);
