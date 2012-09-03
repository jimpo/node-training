'use strict'

var models = require('../lib/models')

/*
describe('User', function () {
    var user;

    beforeEach(function () {
        user = new models.User({
            _id: 'pikachu',
            name: 'Pikachu',
            email: 'pikachu@pika.com',
        });
    });

    describe('constructor', function () {
        it('should be "user" type by default', function () {
            user.get('type').should.equal('user');
            user.isValid().should.be.true;
        });

        it('should be invalid without _id', function () {
            user.unset('_id');
            user.validationErrors().should.deep.equal(
                ['_id is required']);
        });

        it('should be invalid without name', function () {
            user.set('name', '');
            user.validationErrors().should.deep.equal(
                ['name is required']);
        });

        it('should be invalid with bad email format', function () {
            user.set('email', 'not an email');
            user.validationErrors().should.deep.equal(
                ['email does not have correct format']);
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
*/