# gulp-json-server [![Build Status](https://travis-ci.org/GrafGenerator/gulp-json-server.svg?branch=master)](https://travis-ci.org/GrafGenerator/gulp-json-server)

Wrapper for [json-server](https://github.com/typicode/json-server).


## Install

```
$ npm install --save-dev gulp-json-srv
```


## Usage
### Server with default parameters
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-srv');

gulp.task('default', function () {
	jsonServer.start(); // start serving 'db.json' on port 3000
});
```

### Server with custom parameters
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-srv');

gulp.task('default', function () {
	jsonServer.start({
		data: 'some-else-data-file.json',
		port: 25000
	});
});
```

### Server with in-memory DB
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-srv');

var db = {
	users: [
		{id: 0, name: "user0"},
		{id: 1, name: "user1"},
		{id: 2, name: "user2"}
	],
	posts: [
		{id: 0, title: "title 1", author_id: 0},
		{id: 1, title: "title 2", author_id: 2},
		{id: 2, title: "title 3", author_id: 0}
	],
	likes: [
		{id: 0, post_id: 0, user_id: 2},
		{id: 0, post_id: 0, user_id: 1},
		{id: 0, post_id: 2, user_id: 2},
		{id: 0, post_id: 1, user_id: 0}
	]
};

gulp.task('default', function () {
	jsonServer.start({
		data: db
	});
});
```

### Server with changed REST API URL
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-srv');

gulp.task('default', function () {
	jsonServer.start({
		baseUrl: '/api' // change base URl from / to /api
	});
});
```

### Server with rewrite rules
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-srv');

gulp.task('default', function () {
	jsonServer.start({
		rewriteRules: {
			'/api/': '/',
			'/blog/:resource/:id/show': '/:resource/:id'
		}
	});
});
```

## API

### jsonServer.start(options)
Starts the server according to specified options.<br/> Returns the started server instance.

#### options

##### data

Type: `string` or `object`<br/>
Default: `'db.json'`

Input source for server's DB. May be either a path to the file or in-memory object.

##### port

Type: `integer`<br/>
Default: `3000`

Port number on which json-server will listen.

##### baseUrl

Type: `string`<br/>
Default: `null`

The base URL for REST API.

##### rewriteRules

Type: `object`<br/>
Default: `null`

A key-value pairs of rewrite rules that should be applied to server.


## License

MIT © Nikita Ivanov (http://borodatik.net)
