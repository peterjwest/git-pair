#!/usr/bin/env node

var https = require('https');
var async = require('async');
var _ = require('lodash');
var childProcess = require('child_process');
var handleError = require('./lib/handle-error');
var gitConfig = require('./lib/git-config');

// User types to set in git config
var types = ['user', 'author'];

// Parse command line input
var emails = process.argv.slice(2);

// Gets the installed scope for git-pair (global or local)
gitConfig.get('git-pair.scope', function(err, scope) {
    if (scope !== 'global' && scope !== 'local') {
        return next('git-pair not installed correctly');
    }

    // If any emails have been specified, set git users
    if (emails.length) {
        if (emails.length > 2) return console.error('Error: Cannot use more than 2 users');

        // Get usernames from github
        async.map(emails, requestGitUsername, function (err, usernames) {
            if (err) return console.error(err);

            var users = types.map(function(type, i) {
                return { name: usernames[i], email: emails[i], type: type };
            })

            gitConfig.setUsers(scope, users, function(err) {
                if (err) return console.error(err);
                console.log('Set users to: ' + usernames.join(' and '));
            });
        });
    }

    // Otherwise get git users
    else {
        gitConfig.getUsers(scope, types, function(err, users) {
            if (err) return console.error("Error: Couldn't read git config");

            console.log('Configured users:');
            users.forEach(function(user) {
                console.log(user.name + ' <' + user.email + '>');
            });
        });
    }
});

// Get usernames from github
function requestGitUsername(email, next) {
    var options = {
        hostname: 'api.github.com',
        path: '/search/users?q=' + email + '+in:email',
        headers: {'User-Agent': 'Node'}
    };
    var req = https.request(options, function(res) {
        var json = '';
        res.on('data', function(chunk) {
            json += chunk;
        });
        res.on('end', function() {
            var data = JSON.parse(json);

            if (data.message && data.message.match(/^API rate limit exceeded/)) {
                return next('Error: Github API rate limit exceeded');
            }

            if (data.items.length === 0) {
                return next('Error: Email account is not a public email account for a Github user');
            }

            next(null, data.items[0].login);
        })
        res.on('error', next);
    }).end();
};
