'use strict';

var gulp       = require('gulp'),
    coffee     = require('gulp-coffee'),
    po2json    = require('gulp-po2json'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber    = require('gulp-plumber'),
    pathCoffee = 'coffee/**/*.coffee',
    pathPo     = 'translations/**/*.po';

gulp.task('coffee', function() {
  return gulp.src(pathCoffee)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(coffee({
      bare: true,
      map: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('js'));
});

gulp.task('po2json', function() {
  return gulp.src([pathPo])
    .pipe(po2json({format: 'jed'}))
    .pipe(gulp.dest('translations'));
});

gulp.task('watch', function() {
  gulp.watch(pathCoffee, ['coffee']);
  gulp.watch(pathPo,     ['po2json']);
});

gulp.task('default', ['watch']);
gulp.task('build',   ['coffee', 'po2json']);
