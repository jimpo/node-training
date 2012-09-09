var models = require('../models');


exports.home = function (req, res, next) {
    res.render('home', {
        user: req.session.user,
    });
};

exports.login = function (req, res, next) {
    res.render('login', {
        user: undefined,
        errors: undefined,
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
                req.session.user = req.body.user;
                res.redirect(req.query.redirect || '/');
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

    var user = new models.User(username);
    user.fetch(function (err) {
        if (err && err.status_code === 404) {
            callback(null, ['User "' + username + '" does not exist']);
        }
        else if (err) {
            callback(err);
        }
        else {
            user.matchesPassword(password, function (err, match) {
                if (err) {
                    callback(err);
                }
                else if (!match) {
                    callback(null, ['Password did not match']);
                }
                else {
                    callback();
                }
            });
        }
    });
};
