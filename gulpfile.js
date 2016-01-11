'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jsonSrvMocha = require('gulp-mocha');

gulp.task('jshint', function(){
	gulp.src(['*.js', 'test/*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function(){
	return gulp.src('test/*.js', {read: false})
		.pipe(jsonSrvMocha({reporter: 'spec'}));
});

gulp.task('default', ['jshint','test']);
