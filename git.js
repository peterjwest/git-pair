#!/usr/bin/env node

var async = require('async');
var childProcess = require('child_process');
var _ = require('lodash');
var handleError = require('./lib/handle-error');
var gitConfig = require('./lib/git-config');

// User types to set in git config
var types = ['user', 'author'];

// Run GIT with additional env variables
authorEnvVars(function(err, env) {
    childProcess.spawn('git', process.argv.slice(2), { stdio: 'inherit', env: env });
});

// Gets the environment variables for the author, if set
function authorEnvVars(next) {
    // Gets the installed scope for git-pair (global or local)
    gitConfig.get('git-pair.scope', handleError(next, function(scope) {
        if (scope !== 'global' && scope !== 'local') {
            return next('git-pair not installed correctly');
        }

        gitConfig.getUsers(scope, types, function(err, users) {
            if (users.length == 2) {
                return getLastAuthor(function(err, author) {
                    if (author === users[1].name) {
                        users = _(users).reverse().value();
                    }
                    var env = {
                        GIT_COMMITTER_NAME: users[0].name,
                        GIT_COMMITTER_EMAIL: users[0].email,
                        GIT_AUTHOR_NAME: users[1].name,
                        GIT_AUTHOR_EMAIL: users[1].email
                    };
                    return next(null, _.assign(env, process.env));
                });

            }
            next(null, process.env);
        });
    }));
}

// Gets the author of the last commit
function getLastAuthor(next) {
    childProcess.exec('git --no-pager show -s --format=\'%an\'', handleError(next, function(author) {
        next(null, author.trim());
    }));
}
