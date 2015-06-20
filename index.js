'use strict';
var gutil = require('gulp-util');
var _ = require('lodash');

const PLUGIN_NAME = "gulp-json-server";

var gulpServerStart = function (options) {
	/*if (typeof(dataSource) === "undefined") {
		throw new gutil.PluginError(PLUGIN_NAME, 'Data source required to start the server');
	}*/

	var serverOptions = {
		data: 'db.json'
		port: 3000
	};
	
	_.assign(serverOptions, options || {});
	
	var jsonServer = require('json-server');
	var server = jsonServer.create();

	server.use(jsonServer.defaults);

	var router = jsonServer.router(serverOptions.data);
	server.use(router);

	server.listen(serverOptions.port);
};

module.exports = {
	start: gulpServerStart
};