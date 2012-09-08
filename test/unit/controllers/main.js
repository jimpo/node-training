'use strict';

var main = require('controllers/main');


describe('main', function () {
    var req, res, next;

    beforeEach(function () {
        req = {
            session: {
                _csrf: 'csrf token',
            }
        };
        res = {};
        next = {};
    });

    describe('#home()', function () {
        it('should render home view', function () {
            res.render = sinon.spy();
            main.home(req, res, next);
            res.render.should.have.been.calledWith('home');
        });
    });

    describe('#login()', function () {
        it('should render login page', function () {
            res.render = sinon.spy();
            main.login(req, res, next);
            res.render.should.have.been.calledWith('login');
        });
    });
});