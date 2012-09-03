'use strict';

var validators = require('validator').validators;

var DEFAULT_ERROR_MESSAGE = 'Validation failed on: ';


var Validation = module.exports = function (target, message, validator) {
    this.target = target;
    this.message = message || DEFAULT_ERROR_MESSAGE + target;
    this.validator = validator || function (target) {
        return target !== undefined;
    };
};

Validation.prototype.check = function () {
    return this.validator(this.target) ? undefined : this.message;
};
