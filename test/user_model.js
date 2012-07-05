var db = require('../lib/db')
var models = require('../lib/models')


describe('User', function () {
    var user;

    before(function (done) {
        db.init(null, done);
        user = new models.User({
            _id: 'pikachu',
            species: 'mouse',
        });
    });

    describe('#setPassword()', function () {
        it("should set 'passwd_hash' attribute", function (done) {
            user.has('passwd_hash').should.be.false;
            user.setPassword('pikapass', function (err) {
                expect(err).not.to.exist;
                user.has('passwd_hash').should.be.true;
                done();
            });
        });
    });
});