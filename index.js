'use strict';
var _ = require('lodash');

var gulpServerStart = function (options) {
	var serverOptions = {
		data: 'db.json',
		port: 3000,
		rewriteRules: null,
    baseUrl: null,
    id: 'id'
	};

	_.assign(serverOptions, options || {});

	var jsonServer = require('json-server');
	var server = jsonServer.create();

	server.use(jsonServer.defaults);

	if(serverOptions.rewriteRules){
		server.use(jsonServer.rewriter(serverOptions.rewriteRules));
	}

	var router = jsonServer.router(serverOptions.data);
	if(serverOptions.baseUrl) {
		server.use(serverOptions.baseUrl, router);
	}
	else{
		server.use(router);
	}
  if(serverOptions.id)
    router.db._.id = serverOptions.id

	return server.listen(serverOptions.port);
};

module.exports = {
	start: gulpServerStart
};
