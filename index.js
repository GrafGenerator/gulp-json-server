'use strict';
var _ = require('lodash');

var gulpServerStart = function (options) {
	var serverOptions = {
		data: 'db.json',
		port: 3000
	};

	_.assign(serverOptions, options || {});

	var jsonServer = require('json-server');
	var server = jsonServer.create();

	server.use(jsonServer.defaults);

	var router = jsonServer.router(serverOptions.data);
	server.use(router);

	return server.listen(serverOptions.port);
};

module.exports = {
	start: gulpServerStart
};
