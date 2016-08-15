'use strict';

var request = require('supertest');
var jsonServer = require('../');
var fs = require('fs');

describe('Server', function(){

	/* ===== sample data ===== */
	var dbSample = {
		posts: [{ id: 1, title: "json-server", author: "typicode" }],
		comments: [{ id: 1, body: "some comment", postId: 1 }],
		mongoposts: [{ _id: 1, title: "json-server", author: "typicode" }]
	};

	var db = dbSample;
	var dbJsonPost1 = { id: 1, title: "json-server", author: "typicode" };
	var dbJsonPost1Changed = { id: 1, title: "gulp-json-srv", author: "grafgenerator" };

	var routes = {
	  '/api/': '/',
	  '/blog/:resource/:id/show': '/:resource/:id'
	};

	var customRoutes = {
		'/big_post': {
			method: 'get',
			handler: function(req, res) {
				return res.json({id: 1, title: 'Big post'});
			}
		}
	};

	/* ===== tests running helpers ===== */
	var chainedRun = function(server, url, asserts, currentIndex, done){
		var assert = asserts[currentIndex];
		var lastAssert = currentIndex == asserts.length - 1;

		var r = request(url || server.instance);
		var r2 = assert(r, server);

		r2.end(function(err, res){
			if(err) {
				server.kill();
				return done(err);
			}
			if(lastAssert){
				server.kill();
				done();
			}
			else {
				chainedRun(server, url, asserts, currentIndex + 1, done);
			}
		});
	};

	var startHelper = function(options, serverUrl, done, assertFns){
		var server = jsonServer.start(options || {});;
		var asserts = Array.isArray(assertFns) ? assertFns : [ assertFns ];

		if(asserts.length === 0){
			throw 'No asserts provided in test';
		}

		chainedRun(server, serverUrl, asserts, 0, done);
	};
	
	
	
	
	
	
	
	/* ===== main tests fixture =====*/
	describe('#start()', function(){

		beforeEach(function(){
			db = dbSample;

			fs.writeFileSync('./db.json', fs.readFileSync('sample/db.json'));
			fs.writeFileSync('test/db.json', fs.readFileSync('sample/db.json'));
			fs.writeFileSync('test/changed_db.json', fs.readFileSync('sample/changed_db.json'));
		});



		it('should start server with default options (file "db.json" on port 3000)', function(done){
			startHelper(null, 'http://localhost:3000', done, function(request){
				return request.get('/posts')
					.expect(200, db.posts);
			});
		});

		it('should start server from specific file on specific port', function(done){
			startHelper({ data: 'test/db.json', port: 3001}, 'http://localhost:3001', done, function(request){
				return request.get('/comments')
					.expect(200, db.comments);
			});
		});

		it('should start server in memory db', function(done){
			startHelper({ data: db }, null, done, function(request){
				return request.get('/db')
					.expect(200, db);
			});
		});

		it('should return 404 when json file not exist', function(done){
			startHelper({ data: 'test/db1.json' }, null, done, function(request){
				return request.get('/posts')
					.expect(404, {});
			});
		});

		it('should be able to change base API URL', function(done){
			startHelper({ data: db, baseUrl: '/api' }, null, done, function(request){
				return request.get('/api/db')
					.expect(200, db);
			});
		});

		it('should not be available on root after changing base API URL', function(done){
			startHelper({ data: db, baseUrl: '/api' }, null, done, function(request){
				return request.get('/db')
					.expect(404, {});
			});
		});

		it('should be able to use rewrite rules', function(done){
			startHelper({ data: db, rewriteRules: routes }, null, done, function(request){
				return request.get('/blog/posts/1/show')
					.expect(200, db.posts[0]);
			});
		});

		it('should get a post with mongodb\'s _id' , function(done){
			startHelper({ data: db, id: '_id' }, null, done, function(request){
				return request.get('/mongoposts/1')
					.expect(200, db.mongoposts[0]);
			});
		});

		it('should return 404 for mongopost if default id option' , function(done){
			startHelper({ data: db }, null, done, function(request){
				return request.get('/mongoposts/1')
					.expect(404, {});
			});
		});

		it('should be able to use custom routes', function(done){
			startHelper({ data: db, customRoutes: customRoutes }, null, done, function(request){
				return request.get('/big_post')
					.expect(200, {id: 1, title: 'Big post'});
			});
		});
	});

	describe('#reload()', function(){
		
		beforeEach(function(){
			db = dbSample;

			fs.writeFileSync('./db.json', fs.readFileSync('sample/db.json'));
			fs.writeFileSync('test/db.json', fs.readFileSync('sample/db.json'));
			fs.writeFileSync('test/changed_db.json', fs.readFileSync('sample/changed_db.json'));
		});
		
		/* ===== reload testing ===== */
		it('should reload default file when no arguments passed to reload method while serving file', function(done){
			startHelper({}, null, done, [
					function(request){
						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					},
					function(request, server){
						fs.writeFileSync('db.json', fs.readFileSync('test/changed_db.json'));

						server.reload();

						return request.get('/posts/1')
							.expect(200, dbJsonPost1Changed);
					}
				]
			);
		});

		it('should leave in-memory DB as is when no arguments passed reload method', function(done){
			startHelper({ data: db }, null, done, [
					function(request){
						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					},
					function(request, server){
						server.reload();

						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					}
				]
			);
		});

		it('should reload specified file when it passed to reload method while serving file', function(done){
			startHelper({}, null, done, [
					function(request){
						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					},
					function(request, server){
						server.reload('test/changed_db.json');

						return request.get('/posts/1')
							.expect(200, dbJsonPost1Changed);
					}
				]
			);
		});

		it('should reload specified file when it passed to reload method while serving in-memory DB', function(done){
			startHelper({ data: db }, null, done, [
					function(request){
						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					},
					function(request, server){
						server.reload('test/changed_db.json');

						return request.get('/posts/1')
							.expect(200, dbJsonPost1Changed);
					}
				]
			);
		});

		it('should reload in-memory DB when new object passed to reload method', function(done){
			startHelper({ data: db }, null, done, [
					function(request){
						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					},
					function(request, server){
						var newDb = { posts: [dbJsonPost1Changed]};
						server.reload(newDb);

						return request.get('/posts/1')
							.expect(200, dbJsonPost1Changed);
					}
				]
			);
		});

		it('should reload in-memory DB when original DB object modified', function(done){
			var dbCopy = JSON.parse(JSON.stringify(db));

			startHelper({ data: dbCopy }, null, done, [
					function(request){
						return request.get('/posts/1')
							.expect(200, dbJsonPost1);
					},
					function(request, server){
						dbCopy.posts[0] = dbJsonPost1Changed;

						return request.get('/posts/1')
							.expect(200, dbJsonPost1Changed);
					}
				]
			);
		});
	});
	
	describe('#pipe()', function(){
		var pipeHelper = function(url, done, options){
			this.url = url;
			this.done = done;
			this.options = options || {};

			var ActionName = {
				Request: "request",
				PipeContent: "pipeContent"
			};

			this.actions = [];
			this.lastActionIndex = -1;

			var addAction = function(actionName, fn){
				this.actions.push({
					name: actionName,
					info: fn
				});
			}.bind(this);

			this.request = function(fn){
				addAction(ActionName.Request, fn);
				this.lastActionIndex = this.actions.length - 1;
				return this;
			};

			this.pipeContent = function(content){
				addAction(ActionName.PipeContent, content);
				return this;
			};

			var chainedRun = function(server, serverStream, url, actions, currentIndex, done){
				var action = actions[currentIndex];
				var isLastAction = currentIndex === this.lastActionIndex;

				var r = request(url || server.instance);

				switch(action.name){
					case ActionName.PipeContent:
						serverStream.write({
							isNull: function(){return false;},
							isStream: function(){return false;},
							contents: JSON.stringify(action.info)
						});

						chainedRun(server, serverStream, url, actions, currentIndex + 1, done);

						break;

					case ActionName.Request:
						var r2 = action.info(r);

						r2.end(function(err, res){
							if(err) {
								server.kill();
								return done(err);
							}
							console.log(isLastAction)
							if(isLastAction){
								server.kill();
								done();
							}
							else {
								chainedRun(server, serverStream, url, actions, currentIndex + 1, done);
							}
						});
						break;

					default:
						throw "Unknown test action type."
				}

				
			}.bind(this);

			this.go = function(){
				var server = jsonServer.create(this.options);
				var serverStream = server.pipe();

				if(this.actions.length === 0){
					throw "No actions specified in test."
				}

				if(this.lastActionIndex === -1){
					throw "No request actions specified in test."
				}

				chainedRun(server, serverStream, this.url, this.actions, 0, this.done);
			};
		}


		
		it('should load file content when it\'s piped', function(done){
			var helper = new pipeHelper('http://localhost:3000', done);

			helper
				.pipeContent(db)
				.request(function(req){
					return req
						.get('/posts/1')
						.expect(200, dbJsonPost1);
				});

			helper.go();
		});
	});
});
