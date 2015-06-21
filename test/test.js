'use strict';
var request = require('supertest');
var jsonServer = require('../');

describe('Server', function(){
	var db = {
		posts: [{ id: 1, title: "json-server", author: "typicode" }],
		comments: [{ id: 1, body: "some comment", postId: 1 }]
	};
	
	describe('#start()', function(){
		var startHelper = function(options, serverUrl, done, assertFn){
			var server = jsonServer.start(options);
			var r = request(serverUrl || server);
			
			var r2 = assertFn(r);
			
			r2.end(function(){
				server.close(); 
				done();
			});
		};
		
		it('should start server with default options (file "db.json" on port 3000)', function(done){
			startHelper(null, 'http://localhost:3000', done, function(request){
				return request.get('/posts')
					.expect(db.posts)
					.expect(200, null);
			});
		});
		it('should start server from specific file on specific port', function(done){
			startHelper({ data: 'test/db.json', port: 3001}, 'http://localhost:3001', done, function(request){
				return request.get('/comments')
					.expect(db.comments)
					.expect(200, null);
			});
		});
		it('should start server in memory db', function(done){
			startHelper({ data: db }, null, done, function(request){
				return request.get('/db')
					.expect(db)
					.expect(200, null);
			});
		});
		it('should return 404 when json file not exist', function(done){
			startHelper({ data: 'test/db1.json' }, null, done, function(request){
				return request.get('/posts')
					.expect(404, null);
			});
		});
	});
});