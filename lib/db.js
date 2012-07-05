'use strict'

var db = exports;

var Backbone = require('backbone');
var cradle = require('cradle');
var _ = require('underscore');

var config = require('../config').options;


db.init = function (couchdb, callback) {
    Backbone.sync = function (method, model, options) {
        switch (method) {
        case 'read':
            return read(model, options);
        default:
            throw 'Unknown sync method: ' + method;
        }
    };

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

function read(model, options) {
    db.get(model.id, function (err, res) {
        if (err && options.error)
            options.error(err);
        if (!err && options.success)
            options.success(res);
    });
}