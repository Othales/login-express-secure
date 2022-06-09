'use strict';

const express = require('express');
const csrf = require("csurf");

const users = require('../app/controllers/user');
const auth = require('./middlewares/authorization');

function routesWithCsrf (passport) {
    const router = new express.Router();

    const csrfProtection = csrf({ cookie: true });

    router.use(csrfProtection);

    router.get('/login', users.login);
    router.get('/logout', users.logout);

    router.post('/login',
        passport('local', {
            failureRedirect: '/login',
            failureFlash: 'log-in-error'
        }),
        users.session
    );

    require('../app/exceptions/csrf')(router);

    return router;
}

module.exports = function (app, passport) {
    const passportAuth = passport.authenticate.bind(passport);

    app.use(routesWithCsrf(passportAuth));

    app.get('/logout', users.logout);

    app.get('/', auth.requiresLogin, function (req, res) {
       res.render('index');
    });
};