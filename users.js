#!/usr/bin/env node

var https = require('https');
var async = require('async');
var _ = require('lodash');
var childProcess = require('child_process');

// User types to set in git config
var types = ['user', 'author'];

// Wrapper function to handle asynchronous errors
function handleError(next, cb) {
    return function (err) {
        if (err) return next(err);
        cb.apply(null, [].slice.call(arguments, 1));
    }
}

// Parse command line input
var emails = process.argv.slice(2);

// If any emails have been specified, set git users
if (emails.length) {
    if (emails.length > 2) return console.error('Cannot use more than 2 users')

    // Get usernames from github
    async.map(emails, requestGitUsername, function (err, usernames) {
        if (err) return console.error(err);

        var users = types.map(function(type, i) {
            return { name: usernames[i], email: emails[i], type: type };
        })

        setUsers(users, function(err) {
            if (err) return console.error(err);
            console.log('Set users to: ' + usernames.join(' and '));
        });
    });
}

// Otherwise get git users
else {
    getUsers(function(err, users) {
        if (err) return console.error("Couldn't read git config");

        console.log('Configured users:');
        users.forEach(function(user) {
            console.log((user.name) + ' <' + (user.email) + '>');
        });
    });
}

// Gets the user and author data from git
function getUsers(next) {
    async.map(types, getUser, handleError(next, function (users) {
        next(null, users.filter(function(u) { return u.name; }));
    }));
}

// Get configured user from git
function getUser(type, next) {
    async.map([type + '.name', type + '.email'], getGlobalConfig, handleError(next, function (user) {
        next(null, {name: user[0], email: user[1]});
    }));
}

// Get a global config flag from git
function getGlobalConfig(name, next) {
    childProcess.exec('git config --global ' + name, function (err, stdout, stderr) {
        // Ignore errors since git errors when a value doesn't exist
        next(null, stdout.trim());
    });
}

// Sets the users to git
function setUsers(users, next) {
    async.map(users, setUser, handleError(next, function (users) {
        next(null);
    }));
}

// Set user to git
function setUser(user, next) {
    setGlobalConfig(user.type + '.name', user.name, handleError(next, function () {
        setGlobalConfig(user.type + '.email', user.email, next)
    }));
}

// Set a global config flag in git
function setGlobalConfig(name, value, next) {
    var command = value ? (name + ' ' + value) : ('--unset ' + name);
    childProcess.exec('git config --global ' + command, function (err, stdout, stderr) {
        // Ignore errors since git errors when a value doesn't exist
        next(null);
    });
}

// Get usernames from github
function requestGitUsername(email, next) {
    var options = {
        hostname: 'api.github.com',
        path: '/search/users?q=' + email + '+in:email',
        headers: {'User-Agent': 'Node server'}
    };
    var req = https.request(options, function(res) {
        var json = '';
        res.on('data', function(chunk) {
            json += chunk;
        });
        res.on('end', function() {
            var data = JSON.parse(json);

            if (data.message && data.message.match(/^API rate limit exceeded/)) {
                return next('API rate limit exceeded');
            }

            if (data.items.length !== 1) {
                return next('Email account registered to ' + data.items.length + ' users');
            }

            next(null, data.items[0].login);
        })
        res.on('error', next);
    }).end();
};
