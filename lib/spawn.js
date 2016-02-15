var spawn = require('cross-spawn-async');

module.exports = function(cmd, args, opt, cb) {
    if (typeof opt === 'function') {
        cb = opt;
        opt = {};
    }
    var proc = spawn(cmd, args, opt);
    var stdout = '';
    var stderr = '';
    proc.stdout.on('data', function(data) {
        stdout += data.toString();
    });
    proc.stderr.on('data', function(data) {
        stderr += data.toString();
    });
    proc.on('close', function(code) {
        if (typeof cb === 'function') {
            var error = code ? new Error('Exited with status ' + code) : null;
            cb(error, stdout, stderr);
        }
    })
};
