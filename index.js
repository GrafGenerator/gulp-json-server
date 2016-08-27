'use strict';

var _ = require('lodash');
var jsonServer = require('json-server');
var utils = require('gulp-util');
var fs = require('fs');
var through = require('through2');
var bodyParser = require('body-parser');

var GulpJsonServer = function(options, legacyMode){
	this.server = null;
	this.instance = null;
	this.router = null;
	this.serverStarted = false;

	this.options = {
		data: 'db.json',
		port: 3000,
		rewriteRules: null,
		customRoutes: null,
		baseUrl: null,
		id: 'id',
		deferredStart: false,
		static: null,
		cumulative: false
	};
	_.assign(this.options, options || {});

	
	var start = function () {
		if(this.serverStarted){
			utils.log('JSON server already started');
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
	}.bind(this);

	var ensureServerStarted = function(silent){
		if(this.instance === null){
			if(!silent){
				throw 'JSON server not started';
			}
		}

		return this.instance !== null;
	}.bind(this);
	
	var reload = function(data){
		var newDb = null;

		if(typeof data === 'undefined'){
			utils.log('nothing to reload, quit', utils.colors.green(data));
		}
		
		if(typeof data === 'string'){
			// attempt to reload file
			utils.log('reload from file', utils.colors.yellow(data));
			newDb = JSON.parse(fs.readFileSync(data));
		}
		else{
			// passed new DB object, store it
			utils.log('reload from object');
			newDb = data;
		}

		if(newDb === null){
			throw 'No valid data passed for reloading. You should pass either data file path or new DB in-memory object';
		}

		this.router.db.object = newDb;
		utils.log(utils.colors.magenta('server reloaded'));
	}.bind(this);
	
	this.kill = function(){
		if(legacyMode){
			ensureServerStarted();
			this.instance.close();
		}
		else{
			var instanceExist = ensureServerStarted(true);
			if(instanceExist){
				this.instance.close();
			}
		}
	};
	
	
	// ==== new impl ====
	
	this.pipe = function(options){
		var aggregatorObject = this.serverStarted && this.options.cumulative 
			? this.router.db.object || {} 
			: {};
		
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
					utils.log('reload with data', appendedObject);
				}
				_.assign(aggregatorObject, appendedObject || {});
				
				if(!gulpJsonSrvInstance.serverStarted){
					start();
				}
				
				reload(aggregatorObject);

				this.push(file);
			} catch (err) {
				this.emit('error', new utils.PluginError('gulp-json-srv', err));
			}

			cb();
		});
	};
	
	
	
	// ==== legacy impl ====
	if(legacyMode){
		this.start = function(){
			start();
		};
		
		this.reload = function(data){
			ensureServerStarted();

			var isDataFile = typeof this.options.data === 'string';
			var noData = typeof(data) === 'undefined';
				
			if(noData){
				if(!isDataFile){
					// serving in-memory DB, exit without changes
					return;
				}
				
				reload(this.options.data);
			}
			else{
				reload(data);
			}
		};
		
		// maintain legacy behavior
		if(!this.options.deferredStart){
			this.start();
		}
	}
};





module.exports = {
	create: function(options){
		// create server, not start immediately 
		return new GulpJsonServer(options, false);	
	},
	start: function(options){
		// legacy implementation - create server and start immediately with specified options
		return new GulpJsonServer(options, true);
	}
};
