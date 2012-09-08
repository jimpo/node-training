'use strict';

var main = require('controllers/main');


describe('main', function () {
    var req, res, next;

    beforeEach(function () {
        req = {
            session: {
                _csrf: 'csrf token',
            }
        };
        res = {};
        next = {};
    });

    describe('#home()', function () {
        it('should render home view', function () {
            res.render = sinon.spy();
            main.home(req, res, next);
            res.render.should.have.been.calledWith('home');
        });
    });

    describe('#login()', function () {
        it('should render login page', function () {
            res.render = sinon.spy();
            main.login(req, res, next);
            res.render.should.have.been.calledWith('login', {
                user: undefined,
                errors: undefined,
                token: 'csrf token',
            });
        });
    });

    describe('#loginData()', function () {
        it('should fail if username is not provided');
        it('should fail if password is not provided');
        it('should fill in username on failure');
        it('should fetch given user');
        it('should fail if user doesn\'t exist');
        it('should fail if password is incorrect');
        it('should set session user to user id after login');
        it('should redirect to specified url after login');
        it('should redirect to home page if no redirect given');
    });
});