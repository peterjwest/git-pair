#!/usr/bin/env node

var async = require('async');
var slash = require('slash');
var path = require('path');
var spawn = require('./lib/spawn');

var action = process.argv[2];

var scope = process.env.npm_config_global ? 'global' : 'local';

if (action === 'install') {
    async.series([
        function(cb) {
            spawn('git', ['config', '--' + scope, 'alias.users', '!' + slash(path.resolve(__dirname, 'users.js'))], cb);
        },
        function(cb) {
            spawn('git', ['config', '--' + scope, 'git-pair.scope', scope], cb);
        }
    ], function(err) {
        if (err != null) {
            console.error('Error installing git-pair: %s', err);
        } else {
            console.info('git-pair installed');
        }
    });
}

if (action === 'uninstall') {
    async.series([
        function(cb) {
            spawn('git', ['config', '--' + scope, '--unset', 'alias.users'], cb);
        },
        function(cb) {
            spawn('git', ['config', '--' + scope, '--remove-section', 'git-pair'], cb);
        }
    ], function(err) {
        if (err != null) {
            console.error('Error uninstalling git-pair: %s', err);
        } else {
            console.info('git-pair uninstalled');
        }
    });
}
