'use strict';

var pipeHelper = require('./helpers/pipeHelper');

describe('#pipe()', function(){
	/* ===== sample data ===== */
	var post1 = { id: 1, title: "json-server", author: "typicode" };
	var post2 = { id: 2, title: "gulp-json-srv", author: "grafgenerator" }
	var post3 = { id: 3, title: "gulp-json-srv@1.0.0", author: "grafgenerator" }
	var post4 = { id: 4, title: "gulp-json-srv@beta", author: "grafgenerator" }

	var dbBigger = {
		posts: [
			post1,
			post2,
			post3
		]
	};

	var dbLesser = {
		posts: [post1, post4]
	};
	/* ===== sample data ===== */




	it('should load file content when it\'s piped', function(done){
		var helper = new pipeHelper('http://localhost:3003', done, {
			port: 3003
		});

		helper
			.pipeContent(dbBigger)
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, post1);
			});

		helper.go();
	});

	it('should drop previous state when cumulative=false', function(done){
		var helper = new pipeHelper('http://localhost:3003', done, {
			port: 3003,
			cumulative: false
		});

		helper
			.pipeContent(dbBigger)
			.request(function(req){
				return req
					.get('/db')
					.expect(200, dbBigger);
			})
			.pipeContent(dbLesser)
			.request(function(req){
				return req
					.get('/db')
					.expect(200, dbLesser);
			});

		helper.go();
	});

	it('should combine previous state with new when cumulative=true', function(done){
		var helper = new pipeHelper('http://localhost:3003', done, {
			port: 3003,
			cumulative: true
		});

		helper
			.pipeContent(dbBigger)
			.request(function(req){
				return req
					.get('/db')
					.expect(200, dbBigger);
			})
			.pipeContent(dbLesser)
			.request(function(req){
				return req
					.get('/db')
					.expect(200, dbLesser);
			});

		helper.go();
	});

	it('should combine input in one pipe session when cumulative input=true', function(done){
		var helper = new pipeHelper('http://localhost:3003', done, {
			port: 3003			
		});

		helper
			.pipeContent(dbBigger)
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, post1);
			});

		helper.go();
	});

	it('should take last one input in one pipe session when cumulative input=false', function(done){
		var helper = new pipeHelper('http://localhost:3003', done, {
			port: 3003			
		});

		helper
			.pipeContent(dbBigger)
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, post1);
			});

		helper.go();
	});

	it('should override options set at plugin level', function(done){
		var helper = new pipeHelper('http://localhost:3003', done, {
			port: 3003			
		});

		helper
			.pipeContent(dbBigger)
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, post1);
			});

		helper.go();
	});
});
