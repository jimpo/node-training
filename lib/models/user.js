'use strict';

var bcrypt = require('bcrypt');
var monster = require('couch-monster');
var util = require('util');


var User = module.exports = monster.define('User', {
    schema: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                required: true,
                minLength: 1,
            },
            name: {
                type: 'string',
                required: true,
                minLength: 1,
            },
            email: {
                type: 'string',
                required: true,
                pattern: /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
                format: 'email',
            }
        }
    }
});

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
