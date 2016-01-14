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
		},
		deferredStart: true,
		static: './static' // serves HTML, JS and CSS from 'static' folder 
	});
});
```

### Server with DB reloading
```js
var gulp = require('gulp');
var jsonServer = require('gulp-json-srv');
var server = jsonServer.start({
    data: 'db.json',
    deferredStart: true
});

gulp.task('serverStart', function () {
    server.start();
});

gulp.task('watch', function () {
    gulp.watch(['db.json'], function(){
      server.reload();
    });
});

gulp.task('default', ['serverStart', 'watch']);
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

## jsonServer API

### start(options)
Creates new server with specified options and immediately starts it until `deferredStart` option specified.<br/>

#### Returns
Returns a wrapper object for the server (see it's API below).

#### Options

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

##### deferredStart

Type: `bool`<br/>
Default: `false`

Used to specify that server object should be created, but not started, assuming manual start later.

##### static

Type: `string`<br/>
Default: `null`

If specified and not null, sets the static files folder and lets json-server serve static files from that folder. 


## Server wrapper object API

### start()
Manually starts server in case of deferred start. Has no effect in case server is already running.

### kill()
Stops the server.

### reload(data)
Reloads server DB with new data. The data can be object or data file path, or can be omitted.

#### Options

##### data

Type: `string` or `object`<br/>
Default: `undefined`

Input source for new DB's content. May be either a path to the file or in-memory object.

If path to file, or object is passed, reloads DB with new data, no matter if serving file or in-memory DB.
If omitted, do nothing in case of in-memory DB, and reload data from file, specified by server options in case of serving the file.


## Release notes
### v0.1.0
* Added `static` option to serve static files using json-server.
* Starting to use semantic versioning.

### v0.0.7
* Fixed typo in server reloading sample and updated sample itself.

### v0.0.6
* Added reloading functionality. Now DB could be easily reloaded either from file or from object.
* Added ability to kill the server.
* Added deferredStart option, allowing to define server instance, but start it later.

### v0.0.5
* The `id` key, used to match objects in collections now could be changed using `id` parameter in options. Useful to simulate other DBs, for example MongoDB's `_id`.

### v0.0.4
* Added ability to change server's base URL.
* Added ability to use rewrite rules.

### v0.0.0 - v0.0.3
Basic version of plugin with ability to start json-server from specified file or object, on specific port.


## License

MIT © Nikita Ivanov (http://borodatik.net)
