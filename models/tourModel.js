const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./../models/userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: Number,
    slug: String,
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        } 
    ],
    // guides: Array      used for embedding
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Simple Index
// tourSchema.index({price: 1});

// for geoSpatial data '2dsphere' index for real location
// or, '2dindex' for imaginary location
tourSchema.index({startLocation: '2dsphere'});
tourSchema.index({ slug: 1 });
// Compound Index
tourSchema.indexes({price: 1, ratingsAverage: -1});


// it means when data gets outputed as JSON or Object show virtual properties

/**********************
 * VIRTUAL PROPERTIES *
 **********************/

// using function not arrow function because arrow function doesn't have access to this 
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

/***********************
 * DOCUMENT MIDDLEWARE *
 ***********************/

// runs before .save() and .create()
tourSchema.pre('save', function (next) {
    // console.log(this);
    // this will not create a slug field in the document we have to add a field name slug otherwise it will not work
    this.slug = slugify(this.name, { lower: true });
    next();
});
tourSchema.pre('save', function (next) {
    // console.log(this);
    // console.log('One hook can have multiple pre or post middleware')
    next();
});

// Embedding/Denormalization

// tourSchema.pre('save', async function(next) {
//     const guidePromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidePromise);
//     next();
// })

// Poulating the reference Object
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})
// does not have access to this keyword
tourSchema.post('save', function (doc, next) {
    // console.log(this);
    // console.log(doc);
    next();
});

/********************
 * QUERY MIDDLEWARE *
 ********************/

// using regular expression because it will not run for findOne
tourSchema.pre(/^find/, function (next) {
    // tourSchema.pre('find', function (next) 
    this.find({ secretTour: { $ne: true } })

    next();
})

/**************************
 * AGGREGATION MIDDLEWARE *
 **************************/

// causes error in geoSpatial query because geoNear should be the first stage
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;