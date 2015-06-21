# gulp-json-server [![Build Status](https://travis-ci.org/GrafGenerator/gulp-json-server.svg?branch=develop)](https://travis-ci.org/GrafGenerator/gulp-json-server)

Wrapper for [json-server](https://github.com/typicode/json-server).


## Install

```
$ npm install --save-dev gulp-json-servr
```


## Usage
### Server with default parameters
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-servr');

gulp.task('default', function () {
	jsonServer.start(); // start serving 'db.json' on port 3000
});
```

### Server with custom parameters
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-servr');

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
var jsonServer = require('gulp-json-servr');

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

## API

### jsonServer.start(options)

#### options

##### data

Type: `string` or `object`<br/>
Default: `'db.json'`

Input source for server's DB. May be either a path to the file or in-memory object.

##### port

Type: `integer`<br/>
Default: `3000`

Port number on which json-server will listen.


## License

MIT © Nikita Ivanov (http://borodatik.net)
