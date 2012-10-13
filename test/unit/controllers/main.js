'use strict';

var errs = require('errs');

var main = require('controllers/main');
var User = require('models/user');


describe('main', function () {
    var req, res, next;

    beforeEach(function () {
        req = {
            session: {
                _csrf: 'csrf token',
            }
        };
        res = {render: sinon.spy()};
        next = sinon.spy();
    });

    describe('#home()', function () {
        it('should render home view', function () {
            main.home(req, res, next);
            res.render.should.have.been.calledWith('home');
        });

        it('should pass signed in user to view', function () {
            var user = new User({username: 'pokefan'});
            sinon.stub(User, 'findOne')
                .withArgs({username: 'pokefan'})
                .yields(null, user);
            req.session = {user: 'pokefan'};
            main.home(req, res, next);
            res.render.should.have.been.calledWith('home');
            User.findOne.should.have.been.called;
            User.findOne.restore();
        });
    });

    describe('#login()', function () {
        it('should render login page', function () {
            main.login(req, res, next);
            res.render.should.have.been.calledWith('login', {
                username: undefined,
                errors: undefined,
                token: 'csrf token',
            });
        });
    });

    describe('#loginData()', function () {
        var successfulLogin = function (req, res, next, callback) {
            var user = new User();
            sinon.stub(User, 'findOne').yields(null, user);
            sinon.stub(user, 'matchesPassword').yields(null, true);
            req.body = {
                user: 'pokefan',
                passwd: 'pikapass',
            };
            res.redirect = function (url) {
                User.findOne.restore();
                callback(url);
            };
            main.loginData(req, res, next);
        };

        it('should fail if username is not provided', function () {
            req.body = {passwd: 'pikapass'};
            main.loginData(req, res, next);
            res.render.should.have.been.calledWith('login');
            res.render.firstCall.args[1].errors
                .should.have.property('username');
        });

        it('should fail if password is not provided', function () {
            req.body = {user: 'pokefan'};
            main.loginData(req, res, next);
            res.render.should.have.been.calledWith('login');
            res.render.firstCall.args[1].errors
                .should.have.property('passwd');
        });

        it('should render with user on failure', function () {
            req.body = {user: 'pokefan'};
            main.loginData(req, res, next);
            res.render.should.have.been.calledWith('login');
            res.render.firstCall.args[1].errors.should.exist;
            res.render.firstCall.args[1].username.should.equal('pokefan');
        });

        it('should find given user', function () {
            sinon.stub(User, 'findOne').yields();
            req.body = {
                user: 'pokefan',
                passwd: 'pikapass',
            };
            main.loginData(req, res, next);
            User.findOne.should.have.been.called;
            User.findOne.restore();
        });

        it('should fail if user doesn\'t exist', function () {
            sinon.stub(User, 'findOne')
                .withArgs({username: 'pokefan'})
                .yields();
            req.body = {
                user: 'pokefan',
                passwd: 'pikapass',
            };
            main.loginData(req, res, next);
            res.render.should.have.been.calledWith('login');
            res.render.firstCall.args[1].errors.username.should.deep.equal({
                message: 'User "pokefan" does not exist',
            });
            User.findOne.restore();
        });

        it('should fail if password is incorrect', function (done) {
            var user = new User();
            sinon.stub(User, 'findOne').yields(null, user);
            sinon.stub(user, 'matchesPassword').yields(null, false);
            req.body = {
                user: 'pokefan',
                passwd: 'pikapass',
            };
            res.render = function (view, locals) {
                view.should.equal('login');
                locals.errors.passwd.message.should.equal(
                    'Password did not match');
                User.findOne.restore();
                done();
            };
            main.loginData(req, res, next);
        });

        it('should set session user to user id after login', function (done) {
            req.session = {};
            req.query = {};
            successfulLogin(req, res, next, function () {
                req.session.should.have.property('user');
                req.session.user.should.equal('pokefan');
                done();
            });
        });

        it('should redirect to specified url after login', function (done) {
            req.session = {};
            req.query = {redirect: '/after/path'};
            successfulLogin(req, res, next, function (url) {
                url.should.equal('/after/path');
                done();
            });
        });

        it('should redirect to home page if no redirect given', function (done) {
            req.session = {};
            req.query = {};
            successfulLogin(req, res, next, function (url) {
                url.should.equal('/');
                done();
            });
        });
    });

    describe('#logout()', function () {
        it('should redirect to home page', function () {
            res.redirect = sinon.spy();
            main.logout(req, res, next);
            res.redirect.should.have.been.calledWith('/');
        });

        it('should delete session user', function () {
            res.redirect = sinon.spy();
            req.session = {user: new User()};
            main.logout(req, res, next);
            req.session.should.not.have.property('user');
        });
    });
});
