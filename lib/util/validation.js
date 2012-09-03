'use strict';

var validators = require('validator').validators;


var Validation = module.exports = function (target, message, validator) {
    this.target = target;
    this.message = message;
    this.validator = validator;
};

Validation.prototype.check = function () {
    this.validator(this.target);
};
