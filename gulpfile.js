var _ = require('lodash');
var fs = require('fs');
var gulp = require('gulp');
var gulpIstanbul = require('gulp-istanbul');
var istanbul = require('istanbul');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var path = require('path');
var reporter = require('istanbul-text-full-reporter');

gulp.task('standards', function() {
    return gulp.src(['lib/**/*.js', '*.js'])
        .pipe(jscs());
});

gulp.task('coverage', function(cb) {
    return gulp.src(['lib/**/*.js', '*.js'])
        .pipe(gulpIstanbul({ includeUntested: true }))
        .pipe(gulpIstanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['test/**/*.js', '!gulpfile.js'])
                .pipe(mocha())
                .pipe(gulpIstanbul.writeReports({ reporters: [reporter] }))
        });
});
