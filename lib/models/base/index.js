'use strict';

var errs = require('errs');
var _ = require('underscore');

var db = require('../../db');
var Validation = require('./validation');
var util = require('../../util');


var BaseModel = exports.Model = function BaseModel(id, attributes) {
    attributes = attributes || {};
    if (_.isObject(id)) {
        attributes = id;
        id = undefined;
    }

    this.attributes = _.clone(attributes);
    if (id) {
        this.set('_id', id);
    }

    this._validations = [];
    this.set('type', this.constructor.name);
    this.validates('type', 'Type must be ' + this.constructor.name)
        .equals(this.constructor.name);
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

BaseModel.prototype.validates = function () {
    var validation = util.construct(Validation, arguments);
    this._validations.push(validation);
    return validation;
};

BaseModel.prototype.errors = function () {
    var self = this;
    var errors = _.map(this._validations, function (validation) {
        return validation.check(self.attributes);
    });
    errors = _.compact(errors);
    return errors.length > 0 ? errors : undefined;
};

BaseModel.prototype.isValid = function () {
    return !this.errors();
};

BaseModel.prototype.exists = function (callback) {
    if (!this.id()) return callback('Model cannot exist without id');
    db.head(this.id(), function (err, undefined_body, headers) {
        if (err && err.status_code === 404) {
            callback();
        }
        else if (err) {
            callback(err);
        }
        else {
            var revision = headers.etag.replace(/"/g, '');
            callback(null, revision);
        }
    });
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
    var errors = this.errors();
    if (errors) {
        return errs.handle({
            name: 'ValidationError',
            errors: errors,
        }, callback);
    }

    var self = this;
    db.insert(this.attributes, this.id(), function (err, res) {
        if (err && self.isNew() && err.status_code === 409) {
            return errs.handle({
                name: 'UniquenessError',
                message: 'ID "' + self.id() + '" already exists',
            }, callback);
        }
        else if (err) {
            return errs.handle(err, callback);
        }
        else if (!res.ok) {
            return errs.handle(res, callback);
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

BaseModel.prototype.destroy = function (callback) {
    var self = this;
    db.destroy(this.id(), this.rev(), function (err, res) {
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
