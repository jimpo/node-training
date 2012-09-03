'use strict';

var _ = require('underscore');

var db = require('../db');


var BaseModel = exports.Model = function (attributes, type) {
    this.attributes = _.clone(attributes || {});
    this._validations = [];
    if (type) {
        this.set('type', type);
        this.validates('type', 'Type must be ' + type, function (property) {
            return property === type;
        });
    }
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
    var validation;
    if (arguments.length === 1 && _.isObject(arguments[0]) &&
        arguments[0].error && arguments[0].condition) {
        validation = arguments[0];
    }
    else if (arguments.length === 2) {
        validation = {
            error: arguments[0],
            condition: arguments[1],
        }
    }
    else {
        throw new Error('Invalid arguments to "validates"');
    }
    this._validations.push(validation);
};

BaseModel.prototype.validationErrors = function () {
    var self = this;
    var errors = _.map(this._validations, function (validation) {
        return validation.condition.call(self) ? null : validation.error;
    });
    errors = _.compact(errors);
    return errors.length > 0 ? errors : null;
};

BaseModel.prototype.isValid = function () {
    return !this.validationErrors();
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
    var err = this.validationErrors();
    if (err) return callback(err);

    var self = this;
    db.insert(this.attributes, this.id(), function (err, res) {
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
