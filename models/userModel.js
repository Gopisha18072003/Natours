const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        required: [true, 'User must have a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm the password'],
        minLength: 8,
        validate: {
            validator: function(ps) {
                return ps === this.password
            }
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
        type: Boolean,
        default: true,
        select: false
    }
});

// PASSWORD ENCRYPTION

userSchema.pre('save', async function(next) {
    // here, this refers to the current document
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    // Delete confirm password
    // It is not necessary to persist the data into database
    // confirm password is necessary to input but not necessay to persist in the database
    this.confirmPassword = undefined;
    next();
})

// CHANGE CHANGEDPASSWORDAT VALUE
userSchema.pre('save', function(next) {
    if(!this.isModified('password' || this.isNew )) return next();

    this.passwordChangedAt = Date.now() - 1000;
    // substracting 1 sec because sometime tokens are generated before changedPasswordAt property gets updated
    next(); 
});

// QUERY MIDDLEWARE TO NOT DISPLAY INACTIVE USER DATA
userSchema.pre(/^find/, function(next) {
    // this points to current query
    this.find({active: {$ne: false}});
    next();
});

// instanse methods
userSchema.methods.isPasswordCorrect = async function(candidatePassword, userPassword) {

    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime()/ 1000, 10
        );

        return JWTTimestamp < changedTimestamp
        // if true then password is changed
        // else password if not changed
    }
    return false
} 

userSchema.methods.createPasswordResetToken = function() {
    // generating token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // encrypt token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10*60*1000;
    console.log({resetToken}, this.passwordResetToken);
    return resetToken;
}

const user = mongoose.model('User', userSchema);

module.exports = user;