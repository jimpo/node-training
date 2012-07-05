var Backbone = require('backbone');


exports.Model = Backbone.Model.extend({
    idAttribute: '_id',

    isNew: function () {
        return this.id == null || !this.has('_rev');
    },
});
