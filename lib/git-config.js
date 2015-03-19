var async = require('async');
var childProcess = require('child_process');
var _ = require('lodash');
var handleError = require('./handle-error');

// Git config getters and setters
var config = {
    // Gets the user and author data from git
    getUsers: function(scope, types, next) {
        async.map(types, _.partial(config.getUser, [scope]), handleError(next, function(users) {
            next(null, users.filter(function(u) { return u.name; }));
        }));
    },

    // Get configured user from git
    getUser: function(scope, type, next) {
        var keys = [type + '.name', type + '.email'];
        async.map(keys, _.partial(config.getScoped, [scope]), handleError(next, function(user) {
            next(null, { name: user[0], email: user[1] });
        }));
    },

    // Sets users to git
    setUsers: function(scope, users, next) {
        async.map(users, _.partial(config.setUser, [scope]), next);
    },

    // Clear users from git
    clearUsers: function(scope, types, next) {
        async.map(types, _.partial(config.removeSectionScoped, [scope]), next);
    },

    // Set user to git
    setUser: function(scope, user, next) {
        config.setScoped(scope, user.type + '.name', user.name, handleError(next, function() {
            config.setScoped(scope, user.type + '.email', user.email, next);
        }));
    },

    // Get a config flag from git
    get: function(name, next) {
        childProcess.exec('git config ' + name, function(err, stdout, stderr) {
            // Ignore errors since git errors when a value doesn't exist
            next(null, stdout.trim());
        });
    },

    // Get a scoped config flag from git
    getScoped: function(scope, name, next) {
        childProcess.exec('git config --' + scope + ' ' + name, function(err, stdout, stderr) {
            // Ignore errors since git errors when a value doesn't exist
            next(null, stdout.trim());
        });
    },

    // Remove a config section from git
    removeSectionScoped: function(scope, section, next) {
        childProcess.exec('git config --' + scope + ' --remove-section ' + section,
            function(err, stdout, stderr) {
                // Ignore errors since git errors when a section doesn't exist
                next(null);
            }
        );
    },

    // Set a global config flag in git
    setScoped: function(scope, name, value, next) {
        var command = value ? (name + ' ' + value) : ('--unset ' + name);
        childProcess.exec('git config --' + scope + ' ' + command, function(err, stdout, stderr) {
            // Ignore errors since git errors when a value doesn't exist
            next(null);
        });
    }
};

module.exports = config;
