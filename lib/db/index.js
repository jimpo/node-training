'use strict'

var db = exports;

var cradle = require('cradle');
var util = require('util');
var _ = require('underscore');

var config = require('../../config');


db.init = function (couchdb, callback) {
    _.extend(db, couchdb || connect());
    db.exists(function (err, exists) {
        if (err) callback(err);
        else if (exists) {
            callback();
        }
        else {
            db.create(callback);
        }
    });
};

function connect() {
    cradle.setup(_.defaults(config.dbOptions, {
        secure: true,
        cache: true,
        raw: false,
    }));
    var connection = new cradle.Connection;
    return connection.database(config.dbName);
}
