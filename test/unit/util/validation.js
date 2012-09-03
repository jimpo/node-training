'use strict';

var Validation = require('util/validation');


describe('Validation', function () {
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
    });
});
