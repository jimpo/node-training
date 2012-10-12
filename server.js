'use strict';

var express = require('express');
var mongoose = require('mongoose');

var config = require('./config');
var helpers = require('./lib/helpers');
var route = require('./lib/route');
var User = require('./lib/models/user');


var app = express();
var running = false;


function sessionUser(req, res, next) {
    req.session.user = req.session.user &&
        new User(req.session.user);
    res.locals.user = req.session.user;
    next();
}

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals(helpers);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    app.use(express.session());
    app.use(express.csrf());
    app.use(express.static(__dirname + '/public'));
    app.use(sessionUser);
    app.use(app.router);
    app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
});

route.init(app);

exports.run = function (callback) {
    if (running) {
        return callback()
    }
    mongoose.connect(config.db);
    mongoose.connection.on(
        'error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function () {
        console.log('Server is listening on port ' + config.port);
        app.listen(config.port);
        running = true;
        callback();
    });
};

if (require.main === module) {
    exports.run(function (err) {
        err && console.error(err);
    });
}
