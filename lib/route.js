var controllers = require('./controllers');


exports.init = function (app) {

    app.get('/', controllers.page.home);

};
