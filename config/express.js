'use strict';

const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { I18n } = require('i18n');

const config = require('../config.json');
const flashMessageMiddleware = require('./middlewares/flashMessage');

const i18n = new I18n({
    locales: ['en', 'es', 'pt'],
    defaultLocale: 'en',
    directory: path.join(__dirname, 'locales')
});

module.exports = function (app, passport) {

    app.set("trust proxy", true);
    app.disable("x-powered-by");

    app.use(helmet());
    app.use(helmet.frameguard());
    app.use(helmet.hsts());
    app.use(helmet.noSniff());
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.ieNoOpen());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
    app.use(helmet.hidePoweredBy());

    app.set('views', path.join(config.root, 'views'));
    app.set("view engine", "ejs");

    app.use(express.static(path.join(config.root, 'public')));

    app.use(express.urlencoded({ extended: false }));

    app.use(cookieParser());

    app.use(i18n.init);

    const options = {
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 60 * 1000
        }
    };

    app.use(session(options));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

    app.use(flashMessageMiddleware.flashMessage);
};