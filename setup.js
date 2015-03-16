#!/usr/bin/env node

var childProcess = require('child_process');

var action = process.argv[2];

if (action === 'install') {
    childProcess.exec("git config --global alias.users '!"+__dirname+"/users.js'");
}

if (action === 'uninstall') {
    childProcess.exec("git config --global --unset alias.users");
}
