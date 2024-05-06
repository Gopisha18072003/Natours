const express = require('express');
const path = require('path');
// helmet is used for security reasons
const helmet = require('helmet');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
// third party middleware
const morgan = require('morgan');
// It will compress all the responses
const compression = require('compression');

// CORS = Cross Origin Resource Sharing
const cors = require('cors');



const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const bookingController = require('./controllers/bookingController');


const app = express();
app.post('/webhook-checkout', express.raw({type: 'application/json'}), bookingController.webhookCheckout);

app.set('view engine', 'pug');
app.set('views',path.join(__dirname, 'views'));

// serving static files
app.use(express.static(path.join(__dirname, 'public')));
// 1. GLOBAL MIDDLEWARES

// Implementing CORS
app.use(cors());

app.options('*', cors());

// stripe webhook



// Set Security HTTP header
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
 
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);


app.use(compression());

// development logging
if (process.env.NODE_ENV === 'development') {
  // app.use(morgan('dev'));
  app.use(morgan('tiny'));
}

// rate limitter
// 100 requests in 1hr window
const limitter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many requests this IP, please try again later!',
});
// this will used for every route which starts /api', limitter);

// body parser, reading data from body into req.body
// request body can contain only 10kb of data
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

// DATA SANITIZATION
// It is a process of cleaning malecious code from the data that are comming in
// Data Sanitization against NoSql query injection (express-mongo-sanitize)
app.use(mongoSanitize());

// Data Sanitization against cross site scripting attacks (xss-clean)
app.use(xss());

// http parameter pollution is refer to the case when attackers might add duplicatie query to a single query string causes an error
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

// The express.json middleware in the Express.js framework is used to parse incoming request bodies in JSON format.
// When a client sends data to a server, it can be sent in various formats, such as JSON, URL-encoded, or multipart form data.
// When you use express.json(), it tells Express to parse incoming request bodies as JSON. This middleware will then parse
// the JSON data and make it available as req.body in your Express route handlers, allowing you to easily access and work with the JSON data sent by the client.

// serving static files
app.use(express.static(`${__dirname}/public`));

// creating my own middleware function
app.use((req, res, next) => {
  // console.log('Hello from middleware 👋');
  next(); // very imp
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // very imp
});

/* Middleware in Express.js is a function that has 
access to the request object(req), the response object(res),
and the next middleware function in the application's request-response
cycle. */

/* app.get('/', (req, res) => {
     res.status(200).json({ message: 'Hello World!', app: 'Natrous' });
 })
 app.get('/simple', (req, res) => {
     res.status(200).send('Hello from server side');
 })

 app.post('/', (req, res) => {
     res.send("You ca post to this endpoint....")
 })
 */

// 3. ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

// mounting the router


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);



/******************
 * ERROR HANDLING *
 ******************/

app.all('*', (req, res, next) => {
  // res.status(404).json({
  // status: 'fail',
  // message: `Can't find ${req.originalUrl} on this server!`
  // });

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // this will skip all other middlewre and goes directly to Global error handling middlweare
});

// Global error handling middleware in errorController.js
app.use(globalErrorHandler);
module.exports = app;
