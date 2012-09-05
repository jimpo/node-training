'use strict';

var Browser = require('zombie');
var errs = require('errs');

var db = require('db');
var server = require('../../server');

var SUCCESS_CODE = 200;


describe('user', function () {
    before(function (done) {
        server.run(done);
    });

    describe('/users/new', function () {
        var browser;

        beforeEach(function (done) {
            Browser.visit(url('/users/new'), function (err, _browser) {
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
            sinon.stub(db, 'insert').yields(null, {});
            browser
                .fill('Name', 'Ash Ketchum')
                .fill('Email', 'ash.ketchum@pallettown.com')
                .fill('Username', 'pokefan')
                .fill('Password', 'pikachu')
                .fill('Confirm password', 'pikachu')
                .pressButton('Submit', function () {
                    db.insert.should.have.been.called;
                    var doc = db.insert.args[0][0];
                    var id = db.insert.args[0][1];
                    id.should.equal('pokefan');
                    doc.should.have.property('passwd_hash');
                    delete doc.passwd_hash;
                    doc.should.deep.equal({
                        _id: 'pokefan',
                        email: 'ash.ketchum@pallettown.com',
                        name: 'Ash Ketchum',
                        type: 'User',
                    });
                    db.insert.restore();
                    done();
                });
        });

        it('should not create new user when model is invalid', function (done) {
            sinon.stub(db, 'insert');
            browser
                .fill('Name', 'Ash Ketchum')
                .pressButton('Submit', function () {
                    db.insert.should.not.have.been.called;
                    db.insert.restore();
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
                    errors.should.contain('Invalid email');
                    errors.should.contain('Username is required');
                    errors.should.contain('Password is required');
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
            sinon.stub(db, 'insert').yields(errs.create({status_code: 409}));
            browser
                .fill('Name', 'Ash Ketchum')
                .fill('Email', 'ash.ketchum@pallettown.com')
                .fill('Username', 'pokefan')
                .fill('Password', 'pikachu')
                .fill('Confirm password', 'pikachu')
                .pressButton('Submit', function () {
                    browser.statusCode.should.equal(SUCCESS_CODE);
                    var errors = browser.text('.alert-error');
                    expect(errors).to.exist;
                    errors.should.contain('ID "pokefan" already exists');
                    db.insert.restore();
                    done();
                });
        });
    });
});

function url(path) {
    return 'http://localhost:3000' + path;
};
