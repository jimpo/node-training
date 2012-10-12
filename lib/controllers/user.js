'use strict'

var errs = require('errs');
var _ = require('underscore');
var nock = require('nock');

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

    var errors = [];
    if (!passwd) {
        return callback(null, ['Password is required']);
    }
    if (passwd !== passwdConfirm) {
        return callback(null, ['Passwords do not match. Enter password again.']);
    }

    user.setPassword(passwd, function (err) {
        if (err) return errs.handle(err, callback);
        user.validate(function (err) {
            if (err && err.name == 'ValidationError') {
                console.log('there');
                return callback(null, err);
            }
            else if (err) {
                return errs.handle(err, callback);
            }
            else {
                user.save(function (err) {
                    callback(err);
                });
            }
        });
    });
};
