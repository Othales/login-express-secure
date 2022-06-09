'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

/**
 * User Schema
 */

const UserSchema = new Schema({
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
});

const validatePresenceOf = value => value && value.length;

/**
 * Virtuals
 */

UserSchema.virtual('password')
    .set(function(password) {
        this._password = password;
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

/**
 * Validations
 */

UserSchema.path('email').validate(function(email) {
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function(email) {
    return new Promise(resolve => {
        const User = mongoose.model('User');
        // Check only when it is a new user or when email field is modified
        if (this.isNew || this.isModified('email')) {
            User.find({ email }).exec((err, users) => resolve(!err && !users.length));
        } else resolve(true);
    });
}, 'Email `{VALUE}` already exists');

UserSchema.path('username').validate(function(username) {
    return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    return hashed_password.length && this._password.length;
}, 'Password cannot be blank');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password)) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});

/**
 * Methods
 */

UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} password
     * @return {Boolean}
     * @api public
     */

    authenticate: function(password) {
        return bcrypt.compareSync(password, this.hashed_password);
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return bcrypt.hashSync(password, 10);
        } catch (err) {
            return '';
        }
    }
};

/**
 * Statics
 */

UserSchema.statics = {
    /**
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    load: function(options, cb) {
        options.select = options.select || 'username';
        return this.findOne(options.criteria)
            .select(options.select)
            .exec(cb);
    }
};

mongoose.model('User', UserSchema);