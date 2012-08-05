'use strict'

var models = require('../lib/models')


describe('User', function () {
    var user;

    before(function () {
        user = new models.User({
            _id: 'pikachu',
            species: 'mouse',
        });
    });

    describe('#setPassword()', function () {
        it("should set 'passwd_hash' attribute", function (done) {
            user.has('passwd_hash').should.be.false;
            user.setPassword('pikapass', function (err) {
                expect(err).not.to.exist;
                user.has('passwd_hash').should.be.true;
                done();
            });
        });
    });

    describe('#matchesPassword()', function () {
        beforeEach(function (done) {
            user.setPassword('pikapass', done);
        });

        it('should match correct password', function (done) {
            user.matchesPassword('pikapass', function (err, match) {
                expect(err).not.to.exist;
                match.should.be.ok;
                done();
            });
        });

        it('should not match incorrect password', function (done) {
            user.matchesPassword('wrong_pass', function (err, match) {
                expect(err).not.to.exist;
                match.should.not.be.ok;
                done();
            });
        });
    });
});
