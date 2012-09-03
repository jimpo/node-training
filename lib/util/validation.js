'use strict';

var validators = require('validator').validators;
var _ = require('underscore');

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

_.each(validators, function (validatorFunction, key) {
    Validation.prototype[key] = function () {
        var outerArguments = arguments;
        this.validator = function (target) {
            var args = Array.prototype.slice.call(outerArguments);
            args.unshift(target);
            return validatorFunction.apply(this, args);
        }
    };
});