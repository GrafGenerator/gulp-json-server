'use strict';

var _ = require('lodash');
var jsonServer = require('json-server');
var Merger = require('./merger');
var through = require('through2');
var PluginError = require('plugin-error');
var log = require('loglevel');
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
		cumulative: false,
		cumulativeSession: true,
		verbosity: {
			level: "error",
			urlTracing: true
		},
		bodyParserJson: null
	};

	var self = this;

	var prepareOptions = function(inputOptions){
		_.merge(this.options, inputOptions || {});

		if(typeof this.options.verbosity === "string"){
			var verbosityLevel = this.options.verbosity;

			this.options.verbosity = {
				level: verbosityLevel,
				urlTracing: true
			}
		}

		log.setLevel(this.options.verbosity.level);
	}.bind(this);

	prepareOptions(options);

	var start = function (data) {
		if(this.serverStarted){
			log.debug(chalk.yellow('server already started'));
			return this.instance;
		}

		log.info(chalk.green("starting server"));

		var server = jsonServer.create();

		server.use(this.options.bodyParserJson || bodyParser.json());
		server.use(bodyParser.urlencoded({ extended: true }));

		if(this.options.rewriteRules){
			server.use(jsonServer.rewriter(this.options.rewriteRules));
		}

		var defaultsOpts = { };

		if (!this.options.verbosity.urlTracing) {
			defaultsOpts.logger = false;
		}

		if (this.options.static) {
			defaultsOpts.static = this.options.static;
		}

		server.use(jsonServer.defaults(defaultsOpts));

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
			log.debug(chalk.yellow('nothing to reload, quit'));
			return;
		}

		if(this.options.debug){
			log.debug(chalk.green("reloading data:"));
			log.debug(JSON.stringify(data));
			log.debug(chalk.yellow("destroying server..."));
		}

		this.kill(function(){
			log.debug(chalk.yellow("server destroyed"));
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

		log.trace(chalk.red("server started: " + this.serverStarted));
		log.trace(chalk.red("cumulative: " + this.options.cumulative));
		log.trace(chalk.red("aggregator object:"));
		log.trace(JSON.stringify(aggregatorObject));

		return through.obj(function (file, enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}

			if (file.isStream()) {
				cb(new PluginError('gulp-json-srv', 'Streaming not supported'));
				return;
			}

			try {
				var appendedObject = JSON.parse(file.contents.toString());
				log.debug(chalk.green('file data:'));
				log.debug(JSON.stringify(appendedObject));

				if(isCumulativeSession){
					aggregatorObject = new Merger(self.options).merge(aggregatorObject, appendedObject || {});
					log.debug(chalk.green("combine DB data in session"));
				}
				else{
					aggregatorObject = appendedObject || {};
					log.debug(chalk.green("override DB data in session (cumulativeSession=false)"));
				}

				log.trace(chalk.red("pipe reloading data:"));
				log.trace(JSON.stringify(aggregatorObject));

				reload(aggregatorObject);

				this.push(file);
			} catch (err) {
				this.emit('error', new PluginError('gulp-json-srv', err));
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
