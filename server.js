'use strict'

var express = require('express');

var route = require('./lib/route');

var app = express.createServer();


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false,
    });
    app.use(express.static(__dirname + '/public'));
});

route.init(app);

app.listen(3000);