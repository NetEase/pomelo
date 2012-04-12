var handlerManager = require('../lib/handlerManager');
var utils = require('../lib/util/utils');
var should = require('should');
var pomelo = require('../lib/pomelo');

describe('handlerManagerTest', function(){
    var app = pomelo.createApp();
    
    
    before(function(done){
        app.set('serverType', 'area');
        app.genHandler('area',  __dirname + '/config/area/handler');
        app.genRemote('area',  __dirname + '/config/area/remote');
        app.genProxy('area',  __dirname + '/config/area/remote');
        done();
    });
    
    it('local handler should be ok!', function(done){
        app.serverType = 'all';
        var msg = {route: 'area.userHandler.move', params:{uid: 1, x:1, y:2}};
        var session = {uid:1, sessionId:1};
        
        handlerManager.handle(msg, session, function(error, msg){
            if (!!error){
            	console.log('[handlerManagerTest] error: ' + error.message);
            }
            should.not.exist(error);
        });
        done();
    });
});