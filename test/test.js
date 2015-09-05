'use strict';
var request = require('supertest');
var jsonServer = require('../');

describe('Server', function(){
	var db = {
		posts: [{ id: 1, title: "json-server", author: "typicode" }],
		comments: [{ id: 1, body: "some comment", postId: 1 }],
		mongoposts: [{ _id: 1, title: "json-server", author: "typicode" }]
	};

	var routes = {
	  '/api/': '/',
	  '/blog/:resource/:id/show': '/:resource/:id'
	};

	describe('#start()', function(){
		var startHelper = function(options, serverUrl, done, assertFn){
			var server = new jsonServer(options || {});
			var r = request(serverUrl || server.instance);

			var r2 = assertFn(r);

			r2.end(function(err, res){
				server.kill();
				if(err) { return done(err); }
				done();
			});
		};

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
	});
});
