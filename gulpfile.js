'use strict';

var gulp       = require('gulp'),
    coffee     = require('gulp-coffee'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber    = require('gulp-plumber'),
    pathCoffee = 'src/**/*.coffee';

gulp.task('coffee', function() {
  return gulp.src(pathCoffee)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(coffee({
      bare: true,
      map: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(pathCoffee, ['coffee']);
});

gulp.task('default', ['watch']);
gulp.task('build',   ['watch']);
