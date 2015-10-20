'use strict';

var GulpJsonServerOld = function(options){
	this.server = null;
	this.instance = null;
	this.router = null;
	this.serverStarted = false;
	this.pipedKickStart = false;

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
			utils.log('JSON server already started');
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

		var isDataFile = typeof this.options.data === 'string';
		var newDb = null;

		if(typeof(data) === 'undefined'){
			if(!isDataFile){
				// serving in-memory DB, exit without changes
				return;
			}

			utils.log('reload from default file', utils.colors.yellow(this.options.data));
			newDb = JSON.parse(fs.readFileSync(this.options.data));
		}
		else if(data !== null){
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
		}

		if(newDb === null){
			throw 'No valid data passed for reloading. You should pass either data file path or new DB in-memory object';
		}

		this.router.db.object = newDb;
		utils.log(utils.colors.magenta('server reloaded'));
	};

	this.pipe = function(options){
		var defaultPipeOptions = {
			merge: true,
			includePreviousDbState: false
		};

		var aggregatorObject = {};
		var serverInstance = this;

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
				//file.contents = new Buffer(someModule(file.contents.toString(), options));
				var appendedObject = JSON.parse(file.contents.toString());
				utils.log('reload with data', appendedObject);
				_.assign(aggregatorObject, appendedObject || {});
				serverInstance.reload(aggregatorObject);

				this.push(file);
			} catch (err) {
				this.emit('error', new utils.PluginError('gulp-json-srv', err));
			}

			cb();
		});
	};

	// ==== Initialization ====
	if(!this.options.deferredStart){
		this.start();
	}
};


// ===========================================================


var _ = require('lodash');
var jsonServer = require('json-server');
var utils = require('gulp-util');
var fs = require('fs');
var through = require('through2');


var GulpJsonServer = function(immediateOptions){
	this.server = null; // json server instance
	this.instance = null; // express instance
	this.router = null; // nuff said
	this.serverStarted = false; // why i'm writing this?
	
	var legacyMode = typeof immediateOptions !== 'undefined' && immediateOptions !== null;
	
	var resolveOptions = function(opts){
		var defaultOptions = {
			data: 'db.json',
			port: 3000,
			rewriteRules: null,
			baseUrl: null,
			id: 'id',
			deferredStart: false,
			debug: false,
			merge: true,
			includePreviousDbState: false
		};
		_.assign(defaultOptions, opts || {});
		
		return defaultOptions;
	};
	
	var ensureServerStarted = function(){
		if(this.instance === null){
			throw 'JSON server not started';
		}
	}.bind(this);
	
	var start = function (options) {
		if(this.serverStarted){
			utils.log('JSON server already started');
			return this.instance;
		}

		var server = jsonServer.create();
		server.use(jsonServer.defaults);

		if(options.rewriteRules){
			server.use(jsonServer.rewriter(options.rewriteRules));
		}

		var router = jsonServer.router(options.data);
		if(options.baseUrl) {
			server.use(options.baseUrl, router);
		}
		else{
			server.use(router);
		}

		if(options.id){
			router.db._.id = this.options.id;
		}

		this.server = server;
		this.router = router;
		this.instance = server.listen(this.options.port);
		this.serverStarted = true;

		return this.instance;
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
		ensureServerStarted();
		this.instance.close();
	};
	
	
	// ==== new impl ====
	
	this.pipe = function(options){
		
	};
	
	
	
	if(legacyMode){
		var resolvedImmediateOptions = resolveOptions(immediateOptions);
		
		var logDeprecationMessage = function(funcName){
			utils.log(utils.colors.yellow('The function "' + funcName + '" is deprecated since release of v0.0.8. Consider using pipeline intergation using pipe() function.'));
		};
		
		// ==== legacy impl ====
		this.start = function(){
			logDeprecationMessage('start()');
			start(resolvedImmediateOptions);
		};
		
		this.reload = function(data){
			logDeprecationMessage('reload()');
			ensureServerStarted();

			var isDataFile = typeof resolvedImmediateOptions.data === 'string';
				
			if(typeof(data) === 'undefined' && !isDataFile){
				// serving in-memory DB, exit without changes
				return;
			}
	
			if(typeof data === 'string'){
				reload(data || resolvedImmediateOptions.data)
			}
			else{
				reload(data);
			}
		};
		
		// maintain legacy behavior
		if(!resolvedImmediateOptions.deferredStart)
			start(resolvedImmediateOptions);
	}
};





module.exports = {
	create: function(){
		// create server, not start immediately 
		return new GulpJsonServer();	
	},
	start: function(options){
		// legacy implementation - create server and start immediately with specified options
		return new GulpJsonServer(options);
	}
};
