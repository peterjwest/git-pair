var gulp = require('gulp');
var jscs = require('gulp-jscs');

gulp.task('standards', function() {
    return gulp.src(['lib/*.js', '*.js'])
        .pipe(jscs());
});
