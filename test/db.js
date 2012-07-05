var Backbone = require('backbone');

var db = require('../lib/db');
var models = require('../lib/models');


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

describe('Backbone', function () {
    before(function (done) {
        db.init(null, done);
    });

    describe('#sync()', function () {
        var pikachu = {
            _id: 'pikachu',
            type: 'electric',
            species: 'mouse',
        };

        it("should fetch document on 'read' method", function (done) {
            var model = new models.BaseModel({
                _id: 'pikachu',
            });
            sinon.stub(db, 'get').withArgs('pikachu').yields(null, pikachu);
            Backbone.sync('read', model, {
                error: done,
                success: function (res) {
                    res.should.be.equal(pikachu);
                    done();
                },
            });
        });

        it("should save document on 'create' method", function (done) {
            var model = new models.BaseModel(pikachu);
            sinon.stub(db, 'save').withArgs(pikachu).yields(null, {ok:true});
            Backbone.sync('create', model, {
                error: done,
                success: function (res) {
                    res.ok.should.be.ok;
                    done();
                },
            });
        });
    });

});