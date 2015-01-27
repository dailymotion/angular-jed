'use strict';

var gulp       = require('gulp'),
    coffee     = require('gulp-coffee'),
    plumber    = require('gulp-plumber'),
    pathCoffee = 'src/**/*.coffee';

gulp.task('coffee', function() {
  return gulp.src(pathCoffee)
    .pipe(plumber())
    .pipe(coffee({
      bare: false
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(pathCoffee, ['coffee']);
});

gulp.task('default', ['watch']);
gulp.task('build',   ['coffee']);
