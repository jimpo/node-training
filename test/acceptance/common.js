global.config = require('../../config');
global.server = require('../../server');

global.sinon = require('sinon');
global.chai = require('chai');
global.should = require('chai').should();
global.expect = require('chai').expect;

var sinonChai = require('sinon-chai');
chai.use(sinonChai);

global.fullUrl = function (path) {
    return 'http://localhost:' + config.port + path;
};
