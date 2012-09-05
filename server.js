'use strict';

var express = require('express');

var config = require('./config');
var db = require('./lib/db');
var route = require('./lib/route');
var helpers = require('./lib/helpers');

var app = express();
var running = false;


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
    app.use(app.router);
    app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
});

route.init(app);

exports.run = function (callback) {
    if (running) {
        return callback()
    }
    db.init(null, function (err) {
        if (err) return callback(err);
        else {
            console.log('Server is listening on port ' + config.port);
            app.listen(config.port);
            running = true;
            callback();
        }
    });
};

if (require.main === module) {
    exports.run(function (err) {
        err && console.error(err);
    });
}
