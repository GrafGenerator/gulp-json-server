'use strict';

var _ = require('lodash');
var jsonServer = require('json-server');
var Merger = require('./merger');
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
	this.devMode = false;

	this.options = {
		port: 3000,
		rewriteRules: null,
		customRoutes: null,
		baseUrl: null,
		id: 'id',
		static: null,
		cumulative: false,
		cumulativeSession: true,
		debug: false
	};
	
	var self = this;

	_.extend(this.options, options || {});

	var start = function (data) {
		if(this.serverStarted){
			if(this.options.debug){
				console.log(chalk.yellow('JSON server already started'));
			}
			return this.instance;
		}

		if(this.options.debug){
			console.log(chalk.green("starting server"));
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
			var newId = this.options.id;
			router.db._.mixin({
				__id: function(){
					return newId;
				}
			});
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
			if(this.options.debug){
				console.log(chalk.yellow('nothing to reload, quit'));
			}
			return;
		}

		if(this.options.debug){
			console.log(chalk.green("reloading data:"));			
			console.log(JSON.stringify(data));
			console.log(chalk.yellow("destroying server..."));
		}
		var gulpJsonSrvInstance = this;
		this.kill(function(){
			if(gulpJsonSrvInstance.options.debug){
				console.log(chalk.yellow("server destroyed"));
			}
		});
		start(data);
	}.bind(this);



	this.kill = function(callback){
		if(this.instance){
			this.instance.destroy(callback);
			this.serverStarted = false;
		}
	};
	
	this.pipe = function(options){
		var isCumulative = options && typeof(options.cumulative) !== "undefined" ? options.cumulative : self.options.cumulative;
		var isCumulativeSession = options && typeof(options.cumulativeSession) !== "undefined" ? options.cumulativeSession : self.options.cumulativeSession;

		// HACK json-server to get its db object if needed
		var aggregatorObject = self.serverStarted && isCumulative ? self.router.db.getState() || {} : {};
		
		if(this.devMode){
			console.log(chalk.red("server started: " + this.serverStarted));			
			console.log(chalk.red("cumulative: " + this.options.cumulative));			
			console.log(chalk.red("aggregator object:"));			
			console.log(JSON.stringify(aggregatorObject));
		}

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
				if(self.options.debug){
					console.log(chalk.green('file data:'));
					console.log(JSON.stringify(appendedObject));
				}

				if(isCumulativeSession){
					aggregatorObject = new Merger(self.options).merge(aggregatorObject, appendedObject || {});
					if(self.options.debug){
						console.log(chalk.green("combine DB data in session"));
					}
				}
				else{
					aggregatorObject = appendedObject || {};
					if(self.options.debug){
						console.log(chalk.green("override DB data in session (cumulativeSession=false)"));
					}
				}
				
				if(self.devMode){
					console.log(chalk.red("pipe reloading data:"));			
					console.log(JSON.stringify(aggregatorObject));
				}
				
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
