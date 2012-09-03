'use strict';

var nanolib = require('nano');
var url = require('url');
var _ = require('underscore');

var config = require('../../config');

var NONEXISTENT_DATABASE = 'Database does not exist.';


exports.init = function (nano, callback) {
    nano = nano || exports.connect();
    nano.db.get(config.dbName, function (err, body) {
        if (err && err.message === NONEXISTENT_DATABASE) {
            nano.db.create(config.dbName, callback);
        }
        else if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
};

exports.connect = function () {
    return nanolib(url.format(config.couchdb));
};
