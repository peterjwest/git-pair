var async = require('async');
var childProcess = require('child_process');
var _ = require('lodash');

// Wrapper function to handle asynchronous errors
module.exports = function(next, cb) {
    return function(err) {
        if (err) return next(err);
        cb.apply(null, [].slice.call(arguments, 1));
    }
};
