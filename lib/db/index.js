'use strict'

var db = exports;

var Backbone = require('backbone');
var cradle = require('cradle');
var util = require('util');
var _ = require('underscore');

var config = require('../../config').options;


db.init = function (couchdb, callback) {
    Backbone.sync = function (method, model, options) {
        switch (method) {
        case 'create':
            return create(model, options);
        case 'read':
            return read(model, options);
        case 'update':
            return update(model, options);
        case 'delete':
            return destroy(model, options);
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

function syncCallback(options) {
    return function (err, res) {
        if (err && options.error)
            options.error(new Error(util.inspect(err)));
        if (!err && options.success)
            options.success(res);
    };
};

function create(model, options) {
    db.save(model.toJSON(), syncCallback(options));
}

function read(model, options) {
    db.get(model.id, syncCallback(options));
}

function update(model, options) {
    db.merge(model.id, model.toJSON(), syncCallback(options));
}

function destroy(model, options) {
    db.remove(model.id, model.get('_rev'), syncCallback(options));
}
