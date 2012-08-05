'use strict'

var _ = require('underscore');

var db = require('../db');


var BaseModel = exports.Model = function (attributes) {
    this.attributes = _.clone(attributes || {});
};

BaseModel.prototype.get = function (attr) {
    return this.attributes[attr];
};

BaseModel.prototype.set = function (attr, value) {
    if (arguments.length == 1) {
        var new_attributes = attr;
        this.attributes = _.extend(this.attributes, new_attributes);
    }
    else {
        this.attributes[attr] = value;
    }
};

BaseModel.prototype.has = function (attr) {
    return (attr in this.attributes);
};

BaseModel.prototype.unset = function (attr) {
    if (this.has(attr)) {
        delete this.attributes[attr];
        return true;
    }
    return false;
};

BaseModel.prototype.id = function () {
    return this.attributes._id;
};

BaseModel.prototype.rev = function () {
    return this.attributes._rev;
};

BaseModel.prototype.isNew = function () {
    return this.id() == undefined || this.rev() == undefined;
};

BaseModel.prototype.isValid = function () {
    return true;
};

BaseModel.prototype.fetch = function (callback) {
    var self = this;
    if (!this.id()) return callback('Cannot fetch model without id');
    db.get(this.id(), function (err, res) {
        if (err) return callback(err);
        self.attributes = res;
        callback();
    });
};

BaseModel.prototype.save = function (callback) {
    var self = this;
    db.save(this.attributes, function (err, res) {
        if (err) return callback(err);
        else if (!res.ok) {
            return callback(res);
        }
        else {
            self.set({
                _id: res._id,
                _rev: res._rev,
            });
            callback();
        }
    });
};