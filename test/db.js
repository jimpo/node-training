var db = require('../lib/db');


describe('db', function () {
    describe('#init()', function () {
        it('should check that database exists', function (done) {
            var mockDb = {
                exists: sinon.stub().yields(null, true)
            };
            db.init(mockDb, function (err) {
                mockDb.exists.should.have.been.called;
                done(err);
            });
        });

        it('should create database if it does not exist', function (done) {
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
