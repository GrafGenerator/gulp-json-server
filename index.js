'use strict';
var _ = require('lodash');
var jsonServer = require('json-server');

var GulpJsonServer = function(options){
	this.server = null;
	this.instance = null;
	this.router = null;
	this.serverStarted = false;

	this.options = {
		data: 'db.json',
		port: 3000,
		rewriteRules: null,
		baseUrl: null,
		id: 'id',
		deferredStart: false
	};
	_.assign(this.options, options || {});

	this.start = function () {
		if(this.serverStarted){
			return this.instance;
		}

		var server = jsonServer.create();
		server.use(jsonServer.defaults);

		if(this.options.rewriteRules){
			server.use(jsonServer.rewriter(this.options.rewriteRules));
		}

		var router = jsonServer.router(this.options.data);
		if(this.options.baseUrl) {
			server.use(this.options.baseUrl, router);
		}
		else{
			server.use(router);
		}

		if(this.options.id){
			router.db._.id = this.options.id;
		}

		this.server = server;
		this.router = router;
		this.instance = server.listen(this.options.port);
		this.serverStarted = true;

		return this.instance;
	};

	var ensureServerStarted = function(){
		if(this.instance === null){
			throw 'JSON server not started';
		}
	}.bind(this);

	this.kill = function(){
		ensureServerStarted();
		this.instance.close();
	};

	this.reload = function(data){
		ensureServerStarted();
	};

	// ==== Initialization ====
	if(!this.options.deferredStart){
		this.start();
	}
};


module.exports = GulpJsonServer;
