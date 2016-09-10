'use strict';

var _ = require('lodash');
var jsonServer = require('json-server');
var through = require('through2');
var utils = require('gulp-util');
var chalk = require('chalk');
var bodyParser = require('body-parser');
var enableDestroy = require('server-destroy');

var GulpJsonServer = function(options){
	this.server = null;
	this.instance = null;
	this.router = null;
	this.serverStarted = false;

	this.options = {
		port: 3000,
		rewriteRules: null,
		customRoutes: null,
		baseUrl: null,
		id: 'id',
		static: null,
		cumulative: false
	};
	
	_.extend(this.options, options || {});

	
	var start = function (data) {
		if(this.serverStarted){
			console.log(chalk.yellow('JSON server already started'));
			return this.instance;
		}

        var server = jsonServer.create();
        
		server.use(bodyParser.json());
		server.use(bodyParser.urlencoded({ extended: true }));

		if(this.options.rewriteRules){
			server.use(jsonServer.rewriter(this.options.rewriteRules));
		}

		if (this.options.static) {
			server.use(jsonServer.defaults({static: this.options.static}));
		} else {
			server.use(jsonServer.defaults());
		}

		if(this.options.customRoutes){
			for(var path in this.options.customRoutes) {
				var customRoute = this.options.customRoutes[path];
				server[customRoute.method.toLocaleLowerCase()](path, customRoute.handler);
			}
		}

		var router = jsonServer.router(data || this.options.data);
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

		enableDestroy(this.instance);

		this.serverStarted = true;

		return this.instance;
	}.bind(this);

	var reload = function(data){
		if(typeof data === 'undefined'){
			console.log(chalk.yellow('nothing to reload, quit'));
			return;
		}

		this.kill();
		start(data);		
	}.bind(this);



	this.kill = function(callback){
		if(this.instance){
			this.instance.destroy(callback);
			this.serverStarted = false;
		}
	};
	
	this.pipe = function(options){
		// HACK json-server to get its db object if needed
		var aggregatorObject = this.serverStarted && this.options.cumulative ? this.router.db.object || {} : {};
		var gulpJsonSrvInstance = this;
		
		return through.obj(function (file, enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}

			if (file.isStream()) {
				cb(new utils.PluginError('gulp-json-srv', 'Streaming not supported'));
				return;
			}

			try {
				var appendedObject = JSON.parse(file.contents.toString());
				if(gulpJsonSrvInstance.debug){
					console.log(chalk.green('reload with data:'));
					console.log(JSON.stringify(appendedObject));
				}

				_.extend(aggregatorObject, appendedObject || {});
				
				reload(aggregatorObject);

				this.push(file);
			} catch (err) {
				this.emit('error', new utils.PluginError('gulp-json-srv', err));
			}

			cb();
		});
	};
};

module.exports = {
	create: function(options){
		return new GulpJsonServer(options);
	}	
};
