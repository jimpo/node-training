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
    var errors = [];
    if (!req.body.user) {
        errors.push('Please enter username');
    }
    if (!req.body.passwd) {
        errors.push('Please enter password');
    }

    if (errors.length > 0) {
        res.render('login', {
            user: req.body.user,
            errors: errors,
            token: req.session._csrf,
        });
    }
};