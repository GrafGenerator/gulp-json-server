'use strict';

var _ = require('lodash');
var PipeHelper = require('./helpers/pipeHelper');


/* ===== sample data ===== */
var post1 = { id: 1, title: "json-server", author: "typicode" };
var post2 = { id: 2, title: "gulp-json-srv", author: "grafgenerator" };
var post3 = { id: 3, title: "gulp-json-srv@1.0.0", author: "grafgenerator" };
var post4 = { id: 4, title: "gulp-json-srv@beta", author: "grafgenerator" };

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

var makeCopy = function(input){
	return JSON.parse(JSON.stringify(input));
};
/* ===== sample data ===== */




describe('#pipe()', function(){
	it('should load file content when it\'s piped', function(done){
		var helper = new PipeHelper('http://localhost:3000', done);

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, makeCopy(post1));
			});

		helper.go();
	});

	it('should drop previous state when cumulative=false', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, {
			cumulative: false
		});

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/db')
					.expect(200, makeCopy(dbBigger));
			})
			.pipeContent(makeCopy(dbLesser))
			.request(function(req){
				return req
					.get('/db')
					.expect(200, makeCopy(dbLesser));
			});

		helper.go();
	});

	it('should combine previous state with new when cumulative=true', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, {
			cumulative: true
		});
		var combinedDb = _.extend(makeCopy(dbBigger), makeCopy(dbLesser));

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/db')
					.expect(200, makeCopy(dbBigger));
			})
			.pipeContent(makeCopy(dbLesser))
			.request(function(req){
				return req
					.get('/db')
					.expect(200, combinedDb);
			});

		helper.go();
	});

	it('should combine input in one pipe session when cumulative input=true', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, {
			cumulativeSession: true
		});
		var combinedDb = _.extend(makeCopy(dbBigger), makeCopy(dbLesser));

		helper
			.pipeContent([makeCopy(dbBigger), makeCopy(dbLesser)])
			.request(function(req){
				return req
					.get('/db')
					.expect(200, makeCopy(combinedDb));
			});

		helper.go();
	});

	it('should take last one input in one pipe session when cumulative input=false', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, {
			cumulativeSession: false
		});

		helper
			.pipeContent([makeCopy(dbBigger), makeCopy(dbLesser)])
			.request(function(req){
				return req
					.get('/db')
					.expect(200, makeCopy(dbLesser));
			});

		helper.go();
	});

	it('should override options set at plugin level', function(done){
		var helper = new PipeHelper('http://localhost:3000', done);

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, makeCopy(post1));
			});

		helper.go();
	});
});
