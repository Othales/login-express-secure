'use strict';

const config = require('./config.json');

const mongoose = require('mongoose');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const passport = require('passport');
const { Server } = require('socket.io');
const models = path.join(__dirname, 'app/models');

const app = express();

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^.].*\.js$/))
    .forEach(file => require(path.join(models, file)));

require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

connect();

function listen() {
    let server;

    if (config.server.port === 80) {
        server = http.createServer(app);
    } else {
        const options = {
            cert: fs.readFileSync(config.server.crt),
            ca: fs.readFileSync(config.server.ca),
            key: fs.readFileSync(config.server.key)
        };

        server = https.createServer(options, app);
    }

    const io = new Server(server);

    app.set('io', io);

    io.on("connection", (socket) => {
        console.log(socket)
    });

    server.listen(config.server.port);
}

function connect() {
    mongoose.connection
        .on('error', console.log)
        .on('disconnected', connect)
        .once('open', listen);

    const URI = `mongodb://${config.mongo.ip}:${config.mongo.port}/${config.mongo.collection}`;

    return mongoose.connect(URI, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}