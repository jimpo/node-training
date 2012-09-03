'use strict';

var nanolib = require('nano');
var url = require('url');
var _ = require('underscore');

var config = require('../../config');


exports.init = function (nano, callback) {
    nano = nano || exports.connect();
    nano.db.get(config.dbName, function (err, body) {
        callback();
    });
};

exports.connect = function () {
    return nanolib(url.format(config.couchdb));
};
