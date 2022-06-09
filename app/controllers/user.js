'use strict';

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const User = mongoose.model('User');

exports.load = async(function*(req, res, next, _id) {
    const criteria = { _id };
    try {
        req.profile = yield User.load({ criteria });
        if (!req.profile) return next(new Error('User not found'));
    } catch (err) {
        return next(err);
    }
    next();
});

exports.login = function(req, res) {
    res.render('users/login', {
        csrfToken: req.csrfToken()
    });
};

exports.logout = function(req, res, next) {
    req.logout(req.user, err => {
        if(err) return next(err);
        res.redirect("/login");
    });
};

exports.session = login;

function login(req, res) {
    const redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
}