'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var gulpMocha = require('gulp-mocha');

gulp.task('jshint', function(){
	gulp.src(['*.js', 'test/*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function(){
	return gulp.src('test/pipeSpec.js', {read: false})
		.pipe(gulpMocha({reporter: 'spec'}));
});

gulp.task('default', ['jshint','test']);
