'use strict'

var db = require('db');
var models = require('models');


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
               expect(pikachu.attributes).to.exist;
               pikachu.attributes.should.deep.equal({});
           });

        it('should set type if exists', function () {
            pikachu = new models.BaseModel({}, 'pokemon');
            pikachu.get('type').should.equal('pokemon');
            pikachu.isValid().should.be.true;
        });

        it('should make model invalid on type mismatch', function () {
            pikachu = new models.BaseModel({}, 'pokemon');
            pikachu.set('type', 'not pokemon');
            pikachu.isValid().should.be.false;
        });
    });

    describe('#get()', function () {
        it('should return attribute if present', function () {
            expect(pikachu.get('species')).to.exist;
            pikachu.get('species').should.equal('mouse');
        });

        it('should return undefined unless present', function () {
            expect(pikachu.get('fake field')).not.to.exist;
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

    describe('#validates()', function () {
        it('should return a validation with arguments', function () {
            var validation = pikachu.validates('species', 'Error message');
            validation.name.should.equal('Validation');
            validation.target.should.equal('species');
            validation.message.should.equal('Error message');
        });
    });

    describe('#errors()', function () {
        it('should call check on validators with attributes', function () {
            var validation = pikachu.validates('species', 'Error message');
            var mock = sinon.mock(validation);
            mock.expects('check').withArgs(pikachu.attributes);
            pikachu.errors();
            mock.verify();
        });

        it('should not exist if validations succeed', function () {
            sinon.stub(pikachu.validates(), 'check').returns();
            expect(pikachu.errors()).not.to.exist;
        });

        it('should not exist if validations succeed', function () {
            sinon.stub(pikachu.validates(), 'check').returns('Error 1');
            sinon.stub(pikachu.validates(), 'check').returns('Error 2');
            pikachu.errors().should.deep.equal(['Error 1', 'Error 2']);
        });
    });
});

describe('models.BaseModel persistence', function () {
    var pikachu, mock;

    beforeEach(function () {
        pikachu = {
            _id: 'pikachu',
            type: 'electric',
            species: 'mouse',
        };

        db.get = function(){};
        db.insert = function(){};
        db.destroy = function(){};
        db.head = function(){};
        mock = sinon.mock(db);
    });

    afterEach(function () {
        mock.verify();
    });

    describe('#exists()', function () {
        it('should return revision if object exists', function (done) {
            var model = new models.BaseModel({
                _id: 'pikachu',
            });
            var headers = {etag: '"rev"'};
            mock.expects('head').withArgs('pikachu')
                .yields(null, null, headers);
            model.exists(function (err, revision) {
                expect(err).not.to.exist;
                revision.should.equal('rev');
                done();
            });
        });

        it("should be falsy if object doesn't exist", function (done) {
            var model = new models.BaseModel({
                _id: 'pikachu',
            });
            var error = new Error;
            error.status_code = 404;
            mock.expects('head').withArgs('pikachu').yields(error);
            model.exists(function (err, revision) {
                expect(err).not.to.exist;
                expect(revision).not.to.be.ok;
                done();
            });
        });
    });

    describe('#fetch()', function () {
        it('should retrieve object from database', function (done) {
            var model = new models.BaseModel({
                _id: 'pikachu',
            });
            mock.expects('get').withArgs('pikachu').yields(null, pikachu);
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
            mock.expects('insert').once()
                .withArgs(pikachu, undefined)
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
            mock.expects('insert').once()
                .withArgs(pikachu, 'pikachu')
                .yields(null, res);
            model.save(function (err) {
                model.id().should.equal('pikachu');
                model.rev().should.not.equal(pikachu._rev);
                done(err);
            });
        });

        it('should fail if model is invalid', function (done) {
            var model = new models.BaseModel(pikachu);
            sinon.stub(model, 'errors').returns(['Oh no']);
            mock.expects('insert').never();
            model.save(function (err) {
                err.should.deep.equal(['Oh no']);
                done();
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
            mock.expects('destroy').once()
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
