'use strict';

var jsonServer = require('../../');
var request = require('supertest');


var chainedRun = function(server, url, asserts, currentIndex, done){
    var assert = asserts[currentIndex];
    var lastAssert = currentIndex == asserts.length - 1;

    var r = request(url || server.instance);
    var r2 = assert(r, server);

    r2.end(function(err, res){
        if(err) {
            server.kill(function(){
                return done(err);
            });
            return;
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

module.exports = startHelper;