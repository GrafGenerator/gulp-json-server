'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var PipeHelper = require('./pipeHelper');


/* ===== sample data ===== */
var post1 = { id: 1, title: "json-server", author: "typicode" };
var post2 = { id: 2, title: "gulp-json-srv", author: "grafgenerator" };
var post3 = { id: 3, title: "gulp-json-srv@1.0.0", author: "grafgenerator" };
var mongopost = { _id: 1, title: "json-server", author: "typicode" };

var db = {
	posts: [
		post1,
		post2,
		post3
	]
};

var mongodb = {
	posts: [
		mongopost
	]
};

var makeCopy = function(input){
	return JSON.parse(JSON.stringify(input));
};

var makeOptions = function(options){
	return _.extend({debug: true}, options);
};





		
describe('#start()', function(){
	beforeEach(function(){
		console.log();
		console.log();
		console.log();
		console.log();
		console.log(chalk.blue("======================================================="));		
	});



	it('should start server on port 3000 by default', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions());

		helper
			.pipeContent(makeCopy(db))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, makeCopy(post1));
			});

		helper.go();
	});

	it('should start server on specific port', function(done){
		var helper = new PipeHelper('http://localhost:3001', done, makeOptions({
			port: 3001
		}));

		helper
			.pipeContent(makeCopy(db))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, makeCopy(post1));
			});

		helper.go();
	});

	it('should be able to change base API URL', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			baseUrl: '/api'
		}));

		helper
			.pipeContent(makeCopy(db))
			.request(function(req){
				return req
					.get('/api/posts/1')
					.expect(200, makeCopy(post1));
			});

		helper.go();
	});

	it('should not be available on root after changing base API URL', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			baseUrl: '/api'
		}));

		helper
			.pipeContent(makeCopy(db))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(404);
			});

		helper.go();
	});

	it('should be able to use rewrite rules', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			rewriteRules: {
				'/api/': '/',
				'/blog/:resource/:id/show': '/:resource/:id'
			}
		}));

		helper
			.pipeContent(makeCopy(db))
			.request(function(req){
				return req
					.get('/blog/posts/1/show')
					.expect(200, makeCopy(post1));
			});

		helper.go();
	});

	it('should get a post with mongodb\'s _id' , function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			id: '_id'
		}));

		helper
			.pipeContent(makeCopy(mongodb))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(200, makeCopy(mongopost));
			});

		helper.go();
	});

	it('should return 404 for mongopost if default id option' , function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions());

		helper
			.pipeContent(makeCopy(mongodb))
			.request(function(req){
				return req
					.get('/posts/1')
					.expect(404);
			});

		helper.go();
	});

	it('should be able to use custom routes', function(done){
		var helper = new PipeHelper('http://localhost:3000', done, makeOptions({
			customRoutes: {
				'/big_post': {
					method: 'get',
					handler: function(req, res) {
						return res.json({id: 1, title: 'Big post'});
					}
				}
			}
		}));

		helper
			.pipeContent(makeCopy(db))
			.request(function(req){
				return req
					.get('/big_post')
					.expect(200, {id: 1, title: 'Big post'});
			});

		helper.go();
	});
});