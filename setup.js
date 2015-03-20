#!/usr/bin/env node

var childProcess = require('child_process');

var action = process.argv[2];

var scope = process.env.npm_config_global ? 'global' : 'local';

if (action === 'install') {
    childProcess.exec('git config --' + scope + ' alias.users \\!' + __dirname + '/users.js');
    childProcess.exec('git config --' + scope + ' git-pair.scope ' + scope);
}

if (action === 'uninstall') {
    childProcess.exec('git config --' + scope + ' --unset alias.users');
    childProcess.exec('git config --' + scope + ' --remove-section git-pair');
}
