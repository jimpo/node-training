'use strict';

var User = require('models/user');


describe('User', function () {
    var user;

    beforeEach(function () {
        user = new User({
            username: 'pikachu',
            name: 'Pikachu',
            email: 'pikachu@pika.com',
            passwd_hash: 'pikahash',
        });
    });

    describe('constructor', function () {
        it('should be valid', function (done) {
            user.validate(done);
        });

        it('should be invalid without username', function (done) {
            user.username = undefined;
            user.validate(function (err) {
                err.should.be.an.instanceOf(Error);
                err.name.should.equal('ValidationError');
                err.errors.should.have.property('username');
                done();
            });
        });

        it('should be invalid without name', function (done) {
            user.name = undefined;
            user.validate(function (err) {
                err.should.be.an.instanceOf(Error);
                err.name.should.equal('ValidationError');
                err.errors.should.have.property('name');
                done();
            });
        });

        it('should be invalid with bad email format', function (done) {
            user.email = 'not an email';
            user.validate(function (err) {
                err.should.be.an.instanceOf(Error);
                err.name.should.equal('ValidationError');
                err.errors.should.have.property('email');
                done();
            });
        });
    });

    describe('#setPassword()', function () {
        it("should set 'passwd_hash' attribute", function (done) {
            user.passwd_hash = undefined;
            user.setPassword('pikapass', function (err) {
                expect(user.passwd_hash).to.exist;
                done(err);
            });
        });
    });

    describe('#matchesPassword()', function () {
        beforeEach(function (done) {
            user.setPassword('pikapass', done);
        });

        it('should match correct password', function (done) {
            user.matchesPassword('pikapass', function (err, match) {
                match.should.be.ok;
                done(err);
            });
        });

        it('should not match incorrect password', function (done) {
            user.matchesPassword('wrong_pass', function (err, match) {
                match.should.not.be.ok;
                done(err);
            });
        });
    });
});
