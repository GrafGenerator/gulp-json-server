'use strict';

var pipeHelper = require('./helpers/pipeHelper');


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




describe('#pipe()', function(){
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

	it('should drop previous state when includePreviousDbState=false', function(done){
		var helper = new pipeHelper('http://localhost:3000', done, {
			cumulative: false
		});

		helper
			.pipeContent(db)
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, dbJsonPost1);
			});

		helper.go();
	});

	it('should combine previous state with new when includePreviousDbState=true', function(done){
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

	it('should combine input in one pipe session', function(done){
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

	it('should override options set at plugin level', function(done){
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
