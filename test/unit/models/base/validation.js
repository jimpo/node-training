'use strict';

var validator = require('validator');
var _ = require('underscore');

var Validation = require('models/base/validation');


describe('Validation', function () {
    describe('constructor', function () {
        it('should validate existence if no validator is given', function () {
            var validation = new Validation('target');
            validation.validator().should.be.false;
            validation.validator(false).should.be.true;
        });
    });

    describe('#message()', function () {
        it('should use given error message', function () {
            var validation = new Validation('target', 'Error message');
            validation.message().should.equal('Error message');
        });

        it('should use default error message if no message given', function () {
            var validation = new Validation('target');
            expect(validation.message()).to.exist;
        });
    });

    describe('#check()', function () {
        it('should run validation function', function () {
            var validator = sinon.spy();
            var validation = new Validation('target', 'error', validator);
            validation.check({});
            validator.should.have.been.called;
        });

        it('should pass target property to validation function', function () {
            var validator = sinon.spy();
            var validation = new Validation('target', 'error', validator);
            validation.check({target: 'value'});
            validator.should.have.been.calledWith('value');
        });

        it('should return undefined if validator succeeds', function () {
            var validation = new Validation(
                'target', 'Error message', function () { return true; });
            expect(validation.check({})).not.to.exist;
        });

        it('should return error message if validator fails', function () {
            var validation = new Validation(
                'target', 'Error message', function () { return false; });
            validation.check({}).should.equal('Error message');
        });
    });

    describe('validators', function () {
        it('should respond to validator functions', function () {
            var validation = new Validation('target');
            _.each(_.keys(validator.validators), function (functionName) {
                validation.should.respondTo(functionName);
            });
        });

        it('should replace validator function when node validator is called',
           function () {
               var validation = new Validation('target');
               validation.contains('b');
               validation.validator('ac').should.be.false;
               validation.validator('ab').should.be.true;
           });

        it('should reset default error with more appropriate one', function () {
            var validation = new Validation('target');
            validation.contains('b');
            var errorRegex = new RegExp(validator.defaultError.contains);
            validation.message().should.match(errorRegex);
        });
    });
});
