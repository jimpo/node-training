'use strict';

var bcrypt = require('bcrypt');
var errs = require('errs');
var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;


var User = module.exports = mongoose.model('User', new Schema({
    username: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    passwd_hash: {type: String, required: true},
});

User.methods.setPassword = function (passwd, callback) {
    var self = this;
    bcrypt.genSalt(function (err, salt) {
        if (err) return callback(err);
        bcrypt.hash(passwd, salt, function (err, hash) {
            if (err) return callback(err);
            self.set('passwd_hash', hash);
            callback();
        });
    });
};

User.methods.matchesPassword = function (hash, callback) {
    if (!this.has('passwd_hash')) {
        return callback('User has no password set.');
    }

    bcrypt.compare(hash, this.get('passwd_hash'), callback);
};
