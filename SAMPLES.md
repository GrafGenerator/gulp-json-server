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
        customRoutes: {
            '/big_post': {
                method: 'get',
                handler: function(req, res) {
                    return res.json({id: 1, title: 'Big post'});
                }
            }
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
