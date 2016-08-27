'use strict';

var jsonServer = require('../../');
var request = require('supertest');

var pipeHelper = function(url, done, options){
    this.url = url;
    this.done = done;
    this.options = options || {};

    var ActionName = {
        Request: "request",
        PipeContent: "pipeContent"
    };

    this.actions = [];
    this.lastActionIndex = -1;

    var addAction = function(actionName, fn){
        this.actions.push({
            name: actionName,
            info: fn
        });
    }.bind(this);

    this.request = function(fn){
        addAction(ActionName.Request, fn);
        this.lastActionIndex = this.actions.length - 1;
        return this;
    };

    this.pipeContent = function(content){
        addAction(ActionName.PipeContent, content);
        return this;
    };

    var chainedRun = function(server, url, actions, currentIndex, done){
        var action = actions[currentIndex];
        var isLastAction = currentIndex === this.lastActionIndex;

        var r = request(url || server.instance);

        switch(action.name){
            case ActionName.PipeContent:
                server.pipe().write({
                    isNull: function(){return false;},
                    isStream: function(){return false;},
                    contents: JSON.stringify(action.info)
                });

                chainedRun(server, url, actions, currentIndex + 1, done);

                break;

            case ActionName.Request:
                var r2 = action.info(r);

                r2.end(function(err, res){
                    if(err) {
                        server.kill();
                        return done(err);
                    }

                    if(isLastAction){
                        server.kill();
                        done();
                    }
                    else {
                        chainedRun(server, url, actions, currentIndex + 1, done);
                    }
                });
                break;

            default:
                throw "Unknown test action type."
        }

        
    }.bind(this);

    this.go = function(){
        var server = jsonServer.create(this.options);

        if(this.actions.length === 0){
            throw "No actions specified in test."
        }

        if(this.lastActionIndex === -1){
            throw "No request actions specified in test."
        }

        chainedRun(server, this.url, this.actions, 0, this.done);
    };
};

module.exports = pipeHelper;