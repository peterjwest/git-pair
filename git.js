#!/usr/bin/env node

var async = require('async');
var childProcess = require('child_process');
var _ = require('lodash');

// User types to set in git config
var types = ['user', 'author'];

// Wrapper function to handle asynchronous errors
function handleError(next, cb) {
    return function (err) {
        if (err) return next(err);
        cb.apply(null, [].slice.call(arguments, 1));
    }
}

// Run GIT with additional env variables
authorEnvVars(function (err, env) {
	childProcess.spawn('git', process.argv.slice(2), {stdio: "inherit", env: env});
});

// Gets the environment variables for the author, if set
function authorEnvVars(next) {
	getUsers(function (err, users) {
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
}

// Gets the author of the last commit
function getLastAuthor(next) {
	childProcess.exec('git --no-pager show -s --format=\'%an\'', handleError(next, function (author) {
		next(null, author.trim());
	}));
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
