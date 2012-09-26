'use strict';

var assert = require('assert');
var Browser = require('zombie');
var errs = require('errs');
var nock = require('nock');
var url = require('url');

var SUCCESS_CODE = 200;


describe('user', function () {
    before(function (done) {
        server.run(done);
    });

    describe('/users/new', function () {
        var scope, browser;

        beforeEach(function (done) {
            scope = nock(url.format(config.url));
            Browser.visit(fullUrl('/users/new'), function (err, _browser) {
                browser = _browser;
                done(err);
            });
        });

        it('should successfully load page', function () {
            browser.statusCode.should.equal(SUCCESS_CODE);
        });

        it('should have form posting to /users', function () {
            var form = browser.query('form');
            expect(form).to.exist;
            form.getAttribute('method').should.equal('POST');
            form.getAttribute('action').should.equal('/users');
        });

        it('should create new user when form is submitted', function (done) {
            scope
                .filteringRequestBody(function (body) {
                    body = JSON.parse(body);
                    body.should.have.property('passwd_hash');
                    body.passwd_hash = 'pikahash';
                    return JSON.stringify(body);
                })
                .put('/' + config.db + '/pokefan', JSON.stringify({
                    name: 'Ash Ketchum',
                    email: 'ash.ketchum@pallettown.com',
                    _id: 'pokefan',
                    passwd_hash: 'pikahash',
                    type: 'User',
                }))
                .reply(201, {
                    ok: true,
                    id: 'pokefan',
                    rev: 'rev',
                });
            browser
                .fill('Name', 'Ash Ketchum')
                .fill('Email', 'ash.ketchum@pallettown.com')
                .fill('Username', 'pokefan')
                .fill('Password', 'pikapass')
                .fill('Confirm password', 'pikapass')
                .pressButton('Submit', function () {
                    scope.done();
                    done();
                });
        });

        it('should not create new user when model is invalid', function (done) {
            scope.put('/' + config.db + '/pokefan').reply(201);
            browser
                .fill('Name', 'Ash Ketchum')
                .pressButton('Submit', function () {
                    scope.done.should.throw();
                    done();
                });
        });

        it('should display errors when model is invalid', function (done) {
            browser
                .fill('Name', 'Ash Ketchum')
                .fill('Email', 'not an email')
                .pressButton('Submit', function () {
                    var errors = browser.text('.alert-error');
                    expect(errors).to.exist;
//                    errors.should.contain('Invalid email');
//                    errors.should.contain('Username is required');
//                    errors.should.contain('Password is required');
                    done();
                });
        });

        it('should fill fields with values when model is invalid',
           function (done) {
               browser
                   .fill('Name', 'Ash Ketchum')
                   .fill('Email', 'not an email')
                   .fill('Username', 'pokefan')
                   .pressButton('Submit', function () {
                       var form = browser.query('form');
                       expect(form).to.exist;
                       form.querySelector('input#name').value
                           .should.equal('Ash Ketchum');
                       form.querySelector('input#_id').value
                           .should.equal('pokefan');
                       done();
                   });
           });

        it('should fail registration if username exists', function (done) {
            scope
                .filteringRequestBody(function (body) {
                    body = JSON.parse(body);
                    body.should.have.property('passwd_hash');
                    body.passwd_hash = 'pikahash';
                    return JSON.stringify(body);
                })
                .put('/' + config.db + '/pokefan', JSON.stringify({
                    name: 'Ash Ketchum',
                    email: 'ash.ketchum@pallettown.com',
                    _id: 'pokefan',
                    passwd_hash: 'pikahash',
                    type: 'User',
                }))
                .reply(409, {
                    error: 'conflict',
                    reason: 'Document update conflict.',
                });
            browser
                .fill('Name', 'Ash Ketchum')
                .fill('Email', 'ash.ketchum@pallettown.com')
                .fill('Username', 'pokefan')
                .fill('Password', 'pikapass')
                .fill('Confirm password', 'pikapass')
                .pressButton('Submit', function () {
                    browser.statusCode.should.equal(SUCCESS_CODE);
                    var errors = browser.text('.alert-error');
                    expect(errors).to.exist;
                    errors.should.contain('ID "pokefan" already exists');
                    done();
                });
        });
    });
});
