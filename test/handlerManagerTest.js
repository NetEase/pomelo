var handlerManager = require('../lib/handlerManager');
var utils = require('../lib/util/utils');
var should = require('should');
var pomelo = require('../lib/pomelo');

describe('handlerManagerTest', function(){
    var app = pomelo.createApp();
      app.genHandler('area',  __dirname + '/config/area/handler');
        app.genRemote('area',  __dirname + '/config/area/remote');
        app.genProxy('area',  __dirname + '/config/area/remote');
    
//    before(function(done){
//        app.genHandler('area',  __dirname + '/config/area/handler');
//        app.genRemote('area',  __dirname + '/config/area/remote');
//        app.genProxy('area',  __dirname + '/config/area/remote');
//        done();
//    });
    
    it('local handler should be ok!', function(done){
        app.serverType = 'all';
        var msg = {route: 'area.userHandler.move', params:{}};
        var session = {};
        
        handlerManager.handle(msg, session);
        done();
    });
});