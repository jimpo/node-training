'use strict';

var Browser = require('zombie');

var server = require('../../server');

var SUCCESS_CODE = 200;


describe('controllers/user', function () {
    before(function (done) {
        server.run(done);
    });

    describe('GET /users/new', function () {
        var browser, status;

        beforeEach(function (done) {
            Browser.visit(url('/users/new'), function (err, _browser, _status) {
                browser = _browser;
                status = _status;
                done();
            });
        });

        it('should successfully load page', function () {
            status.should.equal(SUCCESS_CODE);
        });

        it('should have form posting to /users', function () {
            var form = browser.query('form');
            expect(form).to.exist;
            form.getAttribute('method').should.equal('POST');
            form.getAttribute('action').should.equal('/users');
        });
    });
});

function url(path) {
    return 'http://localhost:3000' + path;
};
