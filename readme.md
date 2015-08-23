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
		port: 25000,
		id:   '_id',
		baseUrl: '/api', // change base URl from / to /api
		rewriteRules: {
			'/': '/api/',
			'/blog/:resource/:id/show': '/api/:resource/:id'
		}
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
	],
	posts: [
		{id: 0, title: "title 1", author_id: 0},
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

##### id

Type: `string`<br/>
Default: `id`

`id` key used to match objects in collections. Usually `id`, but for example MongoDB use `_id`.

## Release notes
### v0.0.5
* The `id` key, used to match objects in collections now could be changed using `id` parameter in options. Useful to simulate other DBs, for example MongoDB's `_id`.

### v0.0.4
* Added ability to change server's base URL.
* Added ability to use rewrite rules.

### v0.0.0 - v0.0.3
Basic version of plugin with ability to start json-server from specified file or object, on specific port.


## License

MIT © Nikita Ivanov (http://borodatik.net)
