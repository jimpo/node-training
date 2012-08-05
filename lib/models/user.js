'use strict'

var bcrypt = require('bcrypt');
var util = require('util');

var base = require('./base');


var User = exports.Model = function (attributes) {
    base.Model.call(this, attributes, 'user');
};

util.inherits(User, base.Model);

User.prototype.setPassword = function (passwd, callback) {
    var self = this;
    bcrypt.genSalt(function (err, salt) {
        if (err) return callback(err);
        bcrypt.hash(passwd, salt, function (err, hash) {
            if (err) return callback(err);
            self.set({passwd_hash: hash});
            callback();
        });
    });
};

User.prototype.matchesPassword = function (hash, callback) {
    if (!this.has('passwd_hash')) {
        return callback('User has no password set.');
    }

    bcrypt.compare(hash, this.get('passwd_hash'), callback);
};
