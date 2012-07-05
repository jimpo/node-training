var bcrypt = require('bcrypt');

var base = require('./base');


exports.Model = base.Model.extend({

    defaults: {
        type: 'user',
    },

    setPassword: function (passwd, callback) {
        var self = this;
        bcrypt.genSalt(function (err, salt) {
            if (err) return callback(err);
            bcrypt.hash(passwd, salt, function (err, hash) {
                if (err) return callback(err);
                self.set({passwd_hash: hash});
                callback();
            });
        });
    },

    matchesPassword: function (hash, callback) {
        if (!this.has('passwd_hash')) {
            return callback('User has no password set.');
        }

        bcrypt.compare(hash, this.get('passwd_hash'), callback);
    },

});