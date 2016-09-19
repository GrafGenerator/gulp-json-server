'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var PipeHelper = require('./pipeHelper');


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

var makeOptions = function(options){
	return _.extend({debug: true}, options);
};
/* ===== sample data ===== */




describe('#pipe()', function(){
	beforeEach(function(){
		console.log();
		console.log();
		console.log();
		console.log();
		console.log(chalk.blue("======================================================="));		
	});

	it('should load file content when it\'s piped', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions());

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
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulative: false
		}));

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(200, makeCopy(post2));
			})
			.pipeContent(makeCopy(dbLesser))
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(404);
			})
			.request(function(req){
				return req
					.get('/posts/4')
					.expect(200, makeCopy(post4));
			});

		helper.go();
	});

	it('should combine previous state with new when cumulative=true', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulative: true
		}));

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(200, makeCopy(post2));
			})
			.pipeContent(makeCopy(dbLesser))
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(200, makeCopy(post2));
			})
			.request(function(req){
				return req
					.get('/posts/4')
					.expect(200, makeCopy(post4));
			});

		helper.go();
	});

	it('should combine input in one pipe session when cumulativeSession=true', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulativeSession: true
		}));

		helper
			.pipeContent([makeCopy(dbBigger), makeCopy(dbLesser)])
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(200, makeCopy(post2));
			})
			.request(function(req){
				return req
					.get('/posts/4')
					.expect(200, makeCopy(post4));
			});

		helper.go();
	});

	it('should take last occurence of property in one pipe session when cumulativeSession=true', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulativeSession: true
		}));
		var differentPost = { id: 1, title: "different", author: "anyone" };
		
		helper
			.pipeContent([makeCopy(dbBigger), makeCopy({ posts: [ differentPost]})])
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, makeCopy(differentPost));
			});

		helper.go();
	});

	it('should take last one input in one pipe session when cumulative input=false', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulativeSession: false
		}));

		helper
			.pipeContent([makeCopy(dbBigger), makeCopy(dbLesser)])
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(404);
			})
			.request(function(req){
				return req
					.get('/posts/4')
					.expect(200, makeCopy(post4));
			});

		helper.go();
	});

	it('should override cumulative option set at plugin level', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulative: false
		}));

		helper
			.pipeContent(makeCopy(dbBigger))
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(200, makeCopy(post2));
			})
			.pipeContent(makeCopy(dbLesser), { cumulative: true })
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(200, makeCopy(post2));
			})
			.request(function(req){
				return req
					.get('/posts/4')
					.expect(200, makeCopy(post4));
			});

		helper.go();
	});

	it('should override cumulativeSession option set at plugin level', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			cumulativeSession: true
		}));

		helper
			.pipeContent([makeCopy(dbBigger), makeCopy(dbLesser)], { cumulativeSession: false})
			.request(function(req){
				return req
					.get('/posts/2')
					.expect(404);
			})
			.request(function(req){
				return req
					.get('/posts/4')
					.expect(200, makeCopy(post4));
			});

		helper.go();
	});
});
