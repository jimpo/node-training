'use strict';

var nano = require('nano');
var sinon = require('sinon');

var config = require('../config');
var db = require('../lib/db');


describe('db', function () {
    describe('#init()', function () {
        var nano;

        beforeEach(function () {
            nano = db.connect();
        });

        it('should check if the database exists', function (done) {
            var mock = sinon.mock(nano.db);
            mock.expects('get').yields();
            db.init(nano, function (err) {
                expect(err).not.to.exist;
                mock.verify();
                done();
            });
        });

        it('should create database if it does not exist', function (done) {
            sinon.stub(nano.db, 'get').yields(new Error('Database does not exist.'));
            var mock = sinon.mock(nano.db);
            mock.expects('create').withArgs(config.dbName).yields();
            db.init(nano, function (err) {
                expect(err).not.to.exist;
                mock.verify();
                done();
            });
        });

        it('should not create if it already exists', function (done) {
            sinon.stub(nano.db, 'get').yields();
            var mock = sinon.mock(nano.db);
            mock.expects('create').never();
            db.init(nano, function (err) {
                expect(err).not.to.exist;
                mock.verify();
                done();
            });
        });

        it('should respond to database methods', function (done) {
            sinon.stub(nano.db, 'get').yields();
            db.init(nano, function (err) {
                db.should.respondTo('insert');
                db.should.respondTo('destroy');
                db.should.respondTo('get');
                db.should.respondTo('view');
                done();
            });
        });
    });
});
