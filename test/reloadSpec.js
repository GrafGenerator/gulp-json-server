'use strict';

var fs = require('fs');
var startHelper = require('./helpers/startHelper');

/* ===== sample data ===== */
var dbSample = {
	posts: [{ id: 1, title: "json-server", author: "typicode" }],
	comments: [{ id: 1, body: "some comment", postId: 1 }],
	mongoposts: [{ _id: 1, title: "json-server", author: "typicode" }]
};

var db = dbSample;
var dbJsonPost1 = { id: 1, title: "json-server", author: "typicode" };
var dbJsonPost1Changed = { id: 1, title: "gulp-json-srv", author: "grafgenerator" };
/* ===== sample data ===== */



		

describe('#reload()', function(){
	
	beforeEach(function(done){
		db = JSON.parse(JSON.stringify(dbSample));

		fs.writeFileSync('./db.json', fs.readFileSync('sample/db.json'));
		fs.writeFileSync('test/db.json', fs.readFileSync('sample/db.json'));
		fs.writeFileSync('test/changed_db.json', fs.readFileSync('sample/changed_db.json'));

		done();
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