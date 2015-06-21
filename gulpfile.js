'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('jshint', function(){
	gulp.src('*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function(){
	return gulp.src('test.js', {read: false})
		.pipe(mocha({reporter: 'dot'}));
});

gulp.task('default', ['jshint','test']);