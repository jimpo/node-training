'use strict';

var Browser = require('zombie');
var errs = require('errs');

var db = require('db');
var server = require('../../server');

var SUCCESS_CODE = 200;


describe('/', function () {
    before(function (done) {
        server.run(done);
    });

    describe('GET /', function () {
        var browser;

        beforeEach(function (done) {
            Browser.visit(url('/'), function (err, _browser) {
                browser = _browser;
                done(err);
            });
        });


        it('should load successfully', function () {
            browser.statusCode.should.equal(SUCCESS_CODE);
        });
    });
});

function url(path) {
    return 'http://localhost:3000' + path;
};
