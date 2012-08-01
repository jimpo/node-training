'use strict'

var _ = require('underscore');


var BaseModel = exports.Model = function (attributes) {
    this.attributes = attributes || {};
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