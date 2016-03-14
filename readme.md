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

See [samples](SAMPLES.MD) for more information about usage of plugin.


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

##### customRoutes

Type: `object`<br/>
Default: `null`

A key-value pairs of custom routes that should be applied to server.

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


## Links

* [SAMPLES.MD](SAMPLES.MD) - more examples of usage
* [CHANGELOG.MD](CHANGELOG.MD)
* [CONTRIBUTING.MD](CONTRIBUTING.MD) - info for contributors

## License

MIT © Nikita Ivanov (http://borodatik.net)
