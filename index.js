'use strict';
var _ = require('lodash');
var jsonServer = require('json-server');
var utils = require('gulp-util');
var fs = require('fs');
var through = require('through2');
var bodyParser = require('body-parser');

var GulpJsonServer = function(options){
	this.server = null;
	this.instance = null;
	this.router = null;
	this.serverStarted = false;
	this.pipedKickStart = false;

	this.options = {
		data: 'db.json',
		port: 3000,
		rewriteRules: null,
		customRoutes: null,
		baseUrl: null,
		id: 'id',
		deferredStart: false,
		static: null
	};
	_.assign(this.options, options || {});

	this.start = function () {
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


module.exports = {
	start: function(options){
		return new GulpJsonServer(options);
	}
};
