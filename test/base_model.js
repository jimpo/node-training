'use strict'

var should = require('chai').should();

var db = require('../lib/db');
var models = require('../lib/models');


describe('models.BaseModel', function () {
    var pikachu;

    beforeEach(function () {
        pikachu = new models.BaseModel({
            _id: 'pikachu',
            type: 'electric',
            species: 'mouse',
        });
    });

    describe('constructor', function () {
        it('should initialize attributes to constructor argument', function () {
            pikachu.attributes.should.deep.equal({
                _id: 'pikachu',
                type: 'electric',
                species: 'mouse',
            });
        });

        it('should initialize attributes to emtpy object otherwise',
           function () {
               pikachu = new models.BaseModel();
               should.exist(pikachu.attributes);
               pikachu.attributes.should.deep.equal({});
           });
    });

    describe('#get()', function () {
        it('should return attribute if present', function () {
            should.exist(pikachu.get('species'));
            pikachu.get('species').should.equal('mouse');
        });

        it('should return undefined unless present', function () {
            should.not.exist(pikachu.get('fake field'));
        });
    });

    describe('#set()', function () {
        it('should set attributes given an object', function () {
            pikachu.set({
                color: 'yellow',
                location: 'Viridian Forest',
            });
            pikachu.attributes.color.should.equal('yellow');
            pikachu.attributes.location.should.equal('Viridian Forest');
        });

        it('should override old attributes given an object', function () {
            pikachu.set({species: 'cute mouse'});
            pikachu.attributes.species.should.equal('cute mouse');
        });

        it('should keep old attributes', function () {
            pikachu.set({
                color: 'yellow',
                species: 'cute mouse',
            });
            pikachu.attributes.type.should.equal('electric');
        });

        it('should set one attribute given key and value', function () {
            pikachu.set('color', 'yellow');
            pikachu.attributes.color.should.equal('yellow');
        });
    });

    describe('#has()', function () {
        it('should be true if attribute exists', function () {
            pikachu.attributes.trainer = undefined;
            pikachu.has('trainer').should.be.true;
        });

        it('should be false if attribute does not exist', function () {
            pikachu.has('trainer').should.be.false;
        });
    });

    describe('#unset()', function () {
        it('should clear attribute and return false', function () {
            pikachu.unset('species').should.be.true;
            pikachu.attributes.should.not.have.property('species');
        });

        it('should be false on nonexistent attribute', function () {
            pikachu.unset('fake attribute').should.be.false;
        });
    });

    describe('#isNew()', function () {
        it('should be true unless model has rev', function () {
            pikachu.isNew().should.be.true;
        });

        it('should be true unless model has id', function () {
            pikachu = new models.BaseModel({_rev: 'kanto version'});
            pikachu.isNew().should.be.true;
        });

        it('should be false if model has id and rev', function () {
            pikachu.attributes._rev = 'kanto version';
            pikachu.isNew().should.be.false;
        });
    });

    describe('#isValid()', function () {
        it('should be invalid on false condition', function () {
            pikachu.validates(function () {
                return this.get('evolution') === 'riachu';
            });
            pikachu.validates(function () {
                return this.get('type') === 'electric';
            });
            pikachu.isValid().should.be.false;
        });

        it('should be valid on only true conditions', function () {
            pikachu.validates(function () {
                return this.get('type') === 'electric';
            });
            pikachu.isValid().should.be.true;
        });
    });
});

describe('models.BaseModel persistence', function () {
    var pikachu, mockDb;

    beforeEach(function (done) {
        pikachu = {
            _id: 'pikachu',
            type: 'electric',
            species: 'mouse',
        };

        var couchdb = {
            exists: sinon.stub().yields(null, true),
            get: function(){},
            save: function(){},
            remove: function(){},
        };
        db.init(couchdb, done);
        mockDb = sinon.mock(db);
    });

    afterEach(function () {
        mockDb.verify();
    });

    describe('#fetch()', function () {
        it('should retrieve object from database', function (done) {
            var model = new models.BaseModel({
                _id: 'pikachu',
            });
            mockDb.expects('get').withArgs('pikachu').yields(null, pikachu);
            model.fetch(function (err) {
                model.attributes.should.deep.equal(pikachu);
                done(err);
            });
        });
    });

    describe('#save()', function () {
        it('should create without id', function (done) {
            delete pikachu._id;
            var model = new models.BaseModel(pikachu);
            var res = {
                ok: true,
                _id: 'id',
                _rev: 'rev',
            };
            mockDb.expects('save').once()
                .withArgs(undefined, undefined, pikachu)
                .yields(null, res);
            model.save(function (err) {
                model.has('_id').should.be.true;
                model.has('_rev').should.be.true;
                done(err);
            });
        });

        it('should update with id and rev', function (done) {
            pikachu._rev = 'rev';
            var model = new models.BaseModel(pikachu);
            var res = {
                ok: true,
                _id: 'pikachu',
                _rev: 'rev2',
            };
            mockDb.expects('save').once()
                .withArgs('pikachu', 'rev', pikachu)
                .yields(null, res);
            model.save(function (err) {
                model.id().should.equal('pikachu');
                model.rev().should.not.equal(pikachu._rev);
                done(err);
            });
        });
    });

    describe('#destroy()', function () {
        it('should delete with id and rev', function (done) {
            var model = new models.BaseModel({
                _id: 'pikachu',
                _rev: 'rev',
            });
            var res = {
                ok: true,
                _id: 'pikachu',
                _rev: 'rev2',
            };
            mockDb.expects('remove').once()
                .withArgs('pikachu', 'rev')
                .yields(null, res);
            model.destroy(function (err) {
                model.id().should.equal('pikachu');
                model.rev().should.not.equal(pikachu._rev);
                done(err);
            });
        });
    });
});
