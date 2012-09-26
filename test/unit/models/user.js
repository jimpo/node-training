'use strict';

var User = require('models/user');


describe('User', function () {
    var user;

    beforeEach(function () {
        user = new User('pikachu', {
            name: 'Pikachu',
            email: 'pikachu@pika.com',
        });
    });

    describe('constructor', function () {
        it('should be valid', function () {
            expect(user.validate()).not.to.exist;
        });

        it('should be invalid without _id', function () {
            user.unset('_id');
            user.validate().should.exist;
            //user.validate().should.deep.equal(['Username is required']);
        });

        it('should be invalid without name', function () {
            user.set('name', '');
            user.validate().should.exist;
            //user.validate().should.deep.equal(['Name is required']);
        });

        it('should be invalid with bad email format', function () {
            user.set('email', 'not an email');
            user.validate().should.exist;
            //user.validate().should.be.ok;
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
