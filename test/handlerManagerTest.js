var handlerManager = require('../lib/handlerManager');
var utils = require('../lib/util/utils');
var should = require('should');
var pomelo = require('../lib/pomelo');

describe('handlerManagerTest', function(){
    var app = pomelo.createApp();


    before(function(done){
        app.set('serverType', 'area');
        app.set('dirname', __dirname + '/test');
        app.load(pomelo.handler);
        app.load(pomelo.proxy);
        app.load(pomelo.remote);

        app.set('proxyMap', {
					sys: {
						'area':
							{
							msgRemote: {
								forwardMessage: function(params, msg, session,cb) {
									console.log('forwardmessage');
									utils.invokeCallback(cb,null);
								}
							}
						}
					}
				});
        //app.genHandler('area',  __dirname + '/config/area/handler');
        //app.genRemote('area',  __dirname + '/config/area/remote');
        //app.genProxy('area',  __dirname + '/config/area/remote');
        done();
    });

    it('local handler should be ok!', function(done){
        app.serverType = 'all';
        var msg = {route: 'area.userHandler.move', params:{uid: 1, x:1, y:2}};
        var session = {uid:1, sessionId:1, exportSession: function(){
					console.log('exportSession func');
					return this;
				},
				response: function(){
					console.log('response func');
				}};

        handlerManager.handle(msg, session, function(error, msg){
            if (!!error){
							console.log('[handlerManagerTest] error: ' + error.message);
            }
            should.not.exist(error);
        });
        done();
    });
});
