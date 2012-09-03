'use strict';

var validator = require('validator');
var _ = require('underscore');

var DEFAULT_ERROR_MESSAGE = 'Validation failed';


var Validation = module.exports = function (target, message, validator) {
    this.target = target;
    this.message = message;
    this._defaultMessage = DEFAULT_ERROR_MESSAGE;
    this.validator = validator || function (target) {
        return target !== undefined;
    };
};

Validation.prototype.name = 'Validation';

Validation.prototype.check = function () {
    var errorMessage = this.message || this._defaultMessage;
    return this.validator(this.target) ? undefined : errorMessage;
};

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