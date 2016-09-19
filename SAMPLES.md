## Usage
### Server with default options
```js
var gulp = require("gulp");
var jsonServer = require("gulp-json-srv");

var server = jsonServer.create();

gulp.task("start", function(){
    return gulp.src("data.json")
        .pipe(server.pipe());
});
```

### Server with custom options
```js
var gulp = require("gulp");
var jsonServer = require("gulp-json-srv");

var server = jsonServer.create({
	port: 25000,
	id:   '_id',
	baseUrl: '/api',
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
	static: './static',
	cumulative: true,
	cumulativeSession: false 
});

gulp.task("start", function(){
    return gulp.src("data.json")
        .pipe(server.pipe());
});
```

### Watching files and reloading server
```js
var gulp = require("gulp");
var jsonServer = require("gulp-json-srv");

var server = jsonServer.create();

gulp.task("db", function(){
    return gulp.src("data.json")
        .pipe(server.pipe());
});

gulp.task("watch", function () {
    gulp.watch(["data.json"], ["db"]);
});

gulp.task("default", ["db", "watch"]);
```

### Start server from object
This functionality now available by using [gulp-file](https://github.com/alexmingoia/gulp-file) plugin.

```js
var gulp = require("gulp");
var file = require("gulp-file");
var jsonServer = require("gulp-json-srv");

var server = jsonServer.create();

var db = {
	posts: [
		{id: 1, title: "title 1"}
	]
};

gulp.task("start", function () {
	return file("this-is-actually-in-memory.js", JSON.stringify(db), { src: true })
		.pipe(server.pipe());
});
```
