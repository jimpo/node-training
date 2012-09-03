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
    });
});


/*
describe('db', function () {

            var mockDb = {
                exists: sinon.stub().yields(null, false),
                create: sinon.stub().yields(),
            };
            db.init(mockDb, function (err) {
                mockDb.create.should.have.been.called;
                done(err);
            });
        });

        it('should not create if it already exists', function (done) {
            var mockDb = {
                exists: sinon.stub().yields(null, true),
                create: sinon.stub().yields(),
            };
            db.init(mockDb, function (err) {
                mockDb.create.should.not.have.been.called;
                done(err);
            });
        });
    });
});
*/