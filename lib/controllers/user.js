'use strict'

var errs = require('errs');
var _ = require('underscore');

var User = require('../models/user');


exports.new = function (req, res, next) {
    res.render('users/new', {
        doc: {},
        errors: null,
        token: req.session._csrf,
    });
};

exports.create = function (req, res, next) {
    createUser(req.body.doc, req.body.passwd, req.body.passwd_confirm,
               function (err, retryErrors) {
                   if (err) next(err);
                   else if (retryErrors) {
                       res.render('users/new', {
                           doc: req.body.doc,
                           errors: retryErrors,
                           token: req.session._csrf,
                       });
                   }
                   else {
                       req.session.user = new User(req.body.doc);
                       res.redirect('/');
                   }
               });
};

function createUser(doc, passwd, passwdConfirm, callback) {
    var user = new User(doc);

    var errors = _.map(user.validate() || [], function (error) {
        return JSON.stringify(error);
    });
    if (!passwd) {
        errors.push('Password is required');
    }
    else if (passwd !== passwdConfirm) {
        errors.push('Passwords do not match. Enter password again.');
    }

    if (errors.length > 0) {
        return callback(null, errors);
    }

    user.setPassword(passwd, function (err) {
        if (err) return errs.handle(err, callback);
        user.save(function (err) {
            if (err && err.name === 'UniquenessError') {
                callback(null, [err.message]);
            }
            else {
                callback(err);
            }
        });
    });
};
