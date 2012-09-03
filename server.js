'use strict'

var express = require('express');

var config = require('./config');
var db = require('./lib/db');
var route = require('./lib/route');
var helpers = require('./lib/helpers');

var app = express();


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals(helpers);
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
});

route.init(app);

db.init(null, function (err) {
    if (err) console.error(err);
    else {
        console.log('Server is listening on port ' + config.port);
        app.listen(config.port);
    }
});
