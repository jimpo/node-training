var pred = exports;


pred.matches = function (field, pattern) {
    return {
        error: field + ' does not have correct format',
        condition: function () {
            return this.get(field).search(pattern) !== -1;
        }
    };
};

pred.exists = function (field) {
    return {
        error: field + ' is required',
        condition: function () {
            return this.has(field);
        }
    };
};