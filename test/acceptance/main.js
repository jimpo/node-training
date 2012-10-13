'use strict';

var Browser = require('zombie');
var errs = require('errs');
var url = require('url');

var User = require('models/user');

var SUCCESS_CODE = 200;
// Valid bcrypt hash for password 'pikapass'
var PASS_HASH = '$2a$10$bJGLPL19uo0ojAe97jQk5.KeafoWk.MQGFEtXmdneGHjBDPxUU9bi';


describe('main not logged in', function () {
    before(function (done) {
        server.run(done);
    });

    describe('/', function () {
        var browser;

        beforeEach(function (done) {
            Browser.visit(fullUrl('/'), function (err, _browser) {
                browser = _browser;
                done(err);
            });
        });

        it('should successfully load page', function () {
            browser.statusCode.should.equal(SUCCESS_CODE);
        });

        it('should have links to sign in and register on navbar', function () {
            var navbar = browser.query('.navbar');
            expect(navbar).to.exist;
            navbar.querySelector('a:contains("Sign In")')
                .getAttribute('href').should.equal('/login');
            navbar.querySelector('a:contains("Register")')
                .getAttribute('href').should.equal('/users/new');
        });
    });

    describe('/login', function () {
        var browser;

        beforeEach(function (done) {
            Browser.visit(fullUrl('/login?redirect=/after/path'),
                          function (err, _browser) {
                              browser = _browser;
                              done(err);
                          });
        });

        it('should successfully load page', function () {
            browser.statusCode.should.equal(SUCCESS_CODE);
        });

        it('should have form', function () {
            var form = browser.query('form');
            expect(form).to.exist;
            form.getAttribute('method').should.equal('POST');
        });

        it('should require username to submit', function (done) {
            browser.pressButton('Log In', function () {
                var errors = browser.text('.alert-error');
                expect(errors).to.exist;
                errors.should.contain('Please enter username');
                done();
            });
        });

        it('should require password to submit', function (done) {
            browser.fill('Username', 'pokefan')
                .pressButton('Log In', function () {
                    var errors = browser.text('.alert-error');
                    expect(errors).to.exist;
                    errors.should.contain('Please enter password');
                    done();
                });
        });

        it('should fill in username on failure', function (done) {
            browser.fill('Username', 'pokefan')
                .pressButton('Log In', function () {
                    browser.query('form input#user').value
                        .should.equal('pokefan');
                    done();
                });
        });

        it('should keep redirect url on failed login', function (done) {
            browser.pressButton('Log In', function () {
                browser.location.pathname.should.equal('/login');
                browser.location.search.should.equal('?redirect=/after/path');
                done();
            });
        });

        it("should fail if user doesn't exist", function (done) {
            sinon.stub(User, 'findOne')
                .withArgs({username: 'pokefan'})
                .yields();
            browser
                .fill('Username', 'pokefan')
                .fill('Password', 'pikapass')
                .pressButton('Log In', function () {
                    browser.text('.alert-error').should.contain(
                        'User "pokefan" does not exist');
                    User.findOne.restore();
                    done();
                });
        });

        it("should fail if password is incorrect", function (done) {
            sinon.stub(User, 'findOne')
                .withArgs({username: 'pokefan'})
                .yields(null, new User({passwd_hash: PASS_HASH}));
            browser
                .fill('Username', 'pokefan')
                .fill('Password', 'wrong_pass')
                .pressButton('Log In', function () {
                    browser.text('.alert-error').should.contain(
                        'Password did not match');
                    User.findOne.restore();
                    done();
                });
        });

        it("should redirect to specified url after login", function (done) {
            sinon.stub(User, 'findOne')
                .withArgs({username: 'pokefan'})
                .yields(null, new User({passwd_hash: PASS_HASH}));
            browser
                .fill('Username', 'pokefan')
                .fill('Password', 'pikapass')
                .pressButton('Log In', function () {
                    browser.redirected.should.be.true;
                    browser.location.pathname.should.equal('/after/path');
                    User.findOne.restore();
                    done();
                });
        });

        it('should redirect to home page if no redirect', function (done) {
            sinon.stub(User, 'findOne')
                .withArgs({username: 'pokefan'})
                .yields(null, new User({passwd_hash: PASS_HASH}));
            Browser.visit(fullUrl('/login'), function (err, browser) {
                expect(err).not.to.exist;
                browser
                    .fill('Username', 'pokefan')
                    .fill('Password', 'pikapass')
                    .pressButton('Log In', function () {
                        browser.redirected.should.be.true;
                        browser.location.pathname.should.equal('/');
                        User.findOne.restore();
                        done();
                    });
            });
        });
    });
});

describe('main logged in', function () {
    var user = {
        username: 'pokefan',
        name: 'Ash Ketchum',
        email: 'ash.ketchum@pallettown.com',
        type: 'User',
        passwd_hash: PASS_HASH,
    };

    var logIn = function (path, callback) {
        sinon.stub(User, 'findOne')
            .withArgs({username: 'pokefan'})
            .yields(null, new User(user));
        Browser.visit(
            fullUrl('/login?redirect=' + path), function (err, browser) {
                if (err) return callback(err);
                browser
                    .fill('Username', 'pokefan')
                    .fill('Password', 'pikapass')
                    .pressButton('Log In', function () {
                        browser.redirected.should.be.true;
                        browser.location.pathname.should.equal('/');
                        User.findOne.restore();
                        callback(null, browser);
                    });
            });
    };

    describe('/', function () {
        var browser;

        beforeEach(function (done) {
            logIn('/', function (err, _browser) {
                browser = _browser;
                done(err);
            });
        });

        it('should welcome user with name', function () {
            browser.text('body').should.contain('Welcome, Ash Ketchum!');
        });

        it('should have a logout link', function () {
            var navbar = browser.query('.navbar');
            expect(navbar).to.exist;
            navbar.querySelector('a:contains("Log Out")')
                .getAttribute('href').should.equal('/logout');
        });
    });

    describe('/logout', function () {
        var browser;

        beforeEach(function (done) {
            logIn('/logout', function (err, _browser) {
                browser = _browser;
                done(err);
            });
        });

        it('should redirect to home page on logout', function () {
            browser.redirected.should.be.true;
            browser.location.pathname.should.equal('/');
        });

        it('should have links to sign in and register on navbar', function () {
            var navbar = browser.query('.navbar');
            expect(navbar).to.exist;
            navbar.querySelector('a:contains("Sign In")')
                .getAttribute('href').should.equal('/login');
            navbar.querySelector('a:contains("Register")')
                .getAttribute('href').should.equal('/users/new');
        });
    });
});
