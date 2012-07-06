var controllers = require('./controllers');


exports.init = function (app) {

    app.get('/', controllers.page.home);
    app.get('/users/new', controllers.user.new);
    app.post('/users', controllers.user.create);

};
