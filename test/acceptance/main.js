'use strict';

var Browser = require('zombie');
var errs = require('errs');

var db = require('db');
var server = require('../../server');

var SUCCESS_CODE = 200;


describe('main', function () {
    before(function (done) {
        server.run(done);
    });

    describe('/', function () {
        var browser;

        beforeEach(function (done) {
            Browser.visit(url('/'), function (err, _browser) {
                browser = _browser;
                done(err);
            });
        });

        it('should successfully load page', function () {
            browser.statusCode.should.equal(SUCCESS_CODE);
        });
    });

    describe('/login', function () {
        var browser;

        beforeEach(function (done) {
            Browser.visit(url('/login'), function (err, _browser) {
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
    });
});

function url(path) {
    return 'http://localhost:3000' + path;
};
