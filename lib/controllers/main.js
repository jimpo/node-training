var models = require('../models');


exports.home = function (req, res, next) {
    res.render('home');
};

exports.login = function (req, res, next) {
    res.render('login', {
        user: undefined,
        errors: null,
        token: req.session._csrf,
    });
};

exports.loginData = function (req, res, next) {
    checkUserPassword(
        req.body.user, req.body.passwd, function (err, retryErrors) {
            if (err) next(err);
            else if (retryErrors) {
                res.render('login', {
                    user: req.body.user,
                    errors: retryErrors,
                    token: req.session._csrf,
                });
            }
            else {
                res.redirect('/');
            }
        });
};

function checkUserPassword(username, password, callback) {
    var errors = [];
    if (!username) {
        errors.push('Please enter username');
    }
    if (!password) {
        errors.push('Please enter password');
    }

    if (errors.length > 0) {
        return callback(null, errors);
    }

    var user = new models.User({_id: username});
    user.fetch(function (err) {
        callback(err);
    });
};
