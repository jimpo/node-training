'use strict'

var db = exports;

var cradle = require('cradle');
var _ = require('underscore');

var config = require('../../config').options;

var couchdb;


db.init = function (callback) {
    cradle.setup(_.defaults(config.db_options, {
        secure: true,
        cache: true,
        raw: false,
    }));
    var connection = new cradle.Connection;
    couchdb = connection.database(config.db_name);
    couchdb.exists(function (err, exists) {
        if (err) callback(err);
        else if (exists) {
            callback();
        }
        else {
            couchdb.create(callback);
        }
    });
};
