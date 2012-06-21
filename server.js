'use strict'

var express = require('express')


var app = express.createServer();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false,
    });
});

app.get('/', function (req, res, next) {
    res.render('home');
});

app.listen(3000);