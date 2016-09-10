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
/* ===== sample data ===== */





		
describe('#start()', function(){

	beforeEach(function(done){
		db = dbSample;

		fs.writeFileSync('./db.json', fs.readFileSync('sample/db.json'));
		fs.writeFileSync('test/db.json', fs.readFileSync('sample/db.json'));
		fs.writeFileSync('test/changed_db.json', fs.readFileSync('sample/changed_db.json'));

		done();
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