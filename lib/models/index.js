var models = exports;

var Backbone = require('backbone');


models.BaseModel = Backbone.Model.extend({
    idAttribute: '_id',
});