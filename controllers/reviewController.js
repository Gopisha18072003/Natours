const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);

exports.checkBody = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user._id;
    next();
}
exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);
exports.editReview = factory.updateOne(Review);
