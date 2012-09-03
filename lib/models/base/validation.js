'use strict';

var validator = require('validator');
var _ = require('underscore');

var DEFAULT_ERROR_MESSAGE = 'Validation failed';


var Validation = module.exports = function (property, message, validator) {
    this.property = property;
    this._message = message;
    this._defaultMessage = DEFAULT_ERROR_MESSAGE;
    if (validator) {
        this.validator = validator;
    }
    else {
        this.exists();
    }
};

Validation.prototype.name = 'Validation';

Validation.prototype.check = function (object) {
    return this.validator(object[this.property]) ? undefined : this.message();
};

Validation.prototype.message = function (object) {
    return this._message || (this.property + ': ' + this._defaultMessage);
};

validator.validators.exists = function (target) {
    return target !== undefined && target !== null;
};
validator.defaultError.exists = 'Property does not exist';

_.each(validator.validators, function (validatorFunction, key) {
    Validation.prototype[key] = function () {
        var outerArguments = arguments;
        this._defaultMessage = validator.defaultError[key];
        this.validator = function (target) {
            var args = Array.prototype.slice.call(outerArguments);
            args.unshift(target);
            return validatorFunction.apply(this, args);
        }
    };
});
