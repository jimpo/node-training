'use strict';

var validators = require('validator').validators;

var Validation = require('util/validation');


describe('Validation', function () {
    describe('constructor', function () {
        it('should use given error message', function () {
            var validation = new Validation('target', 'Error message');
            validation.message.should.equal('Error message');
        });

        it('should set default error message if there is none', function () {
            var validation = new Validation('target');
            expect(validation.message).to.exist;
        });

        it('should validate existence if no validator is given', function () {
            var validation = new Validation('target');
            validation.validator().should.be.false;
            validation.validator(false).should.be.true;
        });
    });

    describe('#check()', function () {
        it('should run validation function', function () {
            var validator = sinon.spy();
            var validation = new Validation('target', 'error', validator);
            validation.check();
            validator.should.have.been.called;
        });

        it('should pass target to validation function', function () {
            var validator = sinon.spy();
            var validation = new Validation('target', 'error', validator);
            validation.check();
            validator.should.have.been.calledWith('target');
        });

        it('should return undefined if validator succeeds', function () {
            var validation = new Validation(
                'target', 'Error message', function () { return true; });
            expect(validation.check()).not.to.exist;
        });

        it('should return undefined if validator succeeds', function () {
            var validation = new Validation(
                'target', 'Error message', function () { return true; });
            expect(validation.check()).not.to.exist;
        });

        it('should return error message if validator fails', function () {
            var validation = new Validation(
                'target', 'Error message', function () { return false; });
            validation.check().should.equal('Error message');
        });
    });

    describe('validators', function () {
        it('should respond to validator functions', function () {
            var validation = new Validation('target');
            // Verify a subset of the node-validator validators are present
            validation.should.respondTo('isEmail');
            validation.should.respondTo('isUrl');
            validation.should.respondTo('isIP');
            validation.should.respondTo('regex');
            validation.should.respondTo('equals');
            validation.should.respondTo('contains');
        });

        it('should replace validator function when node validator is called',
           function () {
               var validation = new Validation('target');
               validation.contains('b');
               validation.validator('ac').should.be.false;
               validation.validator('ab').should.be.true;
           });
    });
});
