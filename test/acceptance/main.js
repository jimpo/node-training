'use strict';

var Browser = require('zombie');
var errs = require('errs');
var nock = require('nock');
var url = require('url');

var SUCCESS_CODE = 200;
// Valid bcrypt hash for password 'pikapass'
var PASS_HASH = '$2a$10$bJGLPL19uo0ojAe97jQk5.KeafoWk.MQGFEtXmdneGHjBDPxUU9bi';


describe('main', function () {
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
        var scope, browser;

        beforeEach(function (done) {
            scope = nock(url.format(config.couchdb));
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
            browser.pressButton('Log In', function () {
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
            scope
                .get('/' + config.dbName + '/pokefan')
                .reply(404, '{"error":"not_found","reason":"missing"}');
            browser
                .fill('Username', 'pokefan')
                .fill('Password', 'pikapass')
                .pressButton('Log In', function () {
                    browser.text('.alert-error').should.contain(
                        'User "pokefan" does not exist');
                    done();
                });
        });

        it("should fail if password is incorrect", function (done) {
              var user = {
                _id: 'pokefan',
                _rev: 'rev',
                passwd_hash: PASS_HASH,
            };
            scope
                .get('/' + config.dbName + '/pokefan')
                .reply(200, JSON.stringify(user));
            browser
                .fill('Username', 'pokefan')
                .fill('Password', 'wrong_pass')
                .pressButton('Log In', function () {
                    browser.text('.alert-error').should.contain(
                        'Password did not match')
                    done();
                });
        });

        it("should redirect to specified url after login", function (done) {
            var user = {
                _id: 'pokefan',
                _rev: 'rev',
                passwd_hash: PASS_HASH,
            };
            scope
                .get('/' + config.dbName + '/pokefan')
                .reply(200, JSON.stringify(user));
            browser
                .fill('Username', 'pokefan')
                .fill('Password', 'pikapass')
                .pressButton('Log In', function () {
                    browser.redirected.should.be.true;
                    browser.location.pathname.should.equal('/after/path');
                    done();
                });
        });

        it('should redirect to home page if no redirect', function (done) {
            var user = {
                _id: 'pokefan',
                _rev: 'rev',
                passwd_hash: PASS_HASH,
            };
            scope
                .get('/' + config.dbName + '/pokefan')
                .reply(200, JSON.stringify(user));
            Browser.visit(fullUrl('/login'), function (err, browser) {
                expect(err).not.to.exist;
                browser
                    .fill('Username', 'pokefan')
                    .fill('Password', 'pikapass')
                    .pressButton('Log In', function () {
                        browser.redirected.should.be.true;
                        browser.location.pathname.should.equal('/');
                        done();
                    });
            });
        });
    });
});
