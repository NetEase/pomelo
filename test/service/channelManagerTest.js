var channelManager = require('../../lib/common/service/channelManager');
var should = require('should');
var pomelo = require('../../lib/pomelo');
var utils = require('../../lib/util/utils');

var mailRouterCreator = (function(){
    var count = 0;
    var uid;
    var type;
    var serverId;
    var name;
    
    var routeFunc = function(params, cb){
        process.nextTick(function(){
            count++;
        	type = params.type;
            uid = params.uid;
            serverId = Math.floor(uid / 10);
            utils.invokeCallback(cb, null, serverId);
        });
    };

    return { 
    	create: function(curName){
            name = curName;
        	return {name: curName, route:routeFunc};
        }, 
        info: function(){
        	return {uid: uid, type: type, serverId: serverId, count: count};
        }
    };
})();

var mailBoxCreator = (function(){
	var count = 0;
    var params;
    var serverId;
    var serverIds = {};
    
    
    var dispatchFunc = function(curServerId, curParams, opts, cb){
        process.nextTick( function(){
            if (!serverIds[curServerId]) serverIds[curServerId]=0;
            serverIds[curServerId]+=1;
            count++;	
            params = curParams;
            serverId = curServerId;
            utils.invokeCallback(cb, null);
        });
    };
    
    return {
    	create: function(curName){
        	return {name:curName, dispatch:dispatchFunc};
    	},
    	info: function(){
        	return {serverId: serverId, params:params, count:count, serverIds: serverIds};
        }
    };
})();

describe('channelManagerTest', function(){
    var channel1 = channelManager.createChannel('channel1');
    var channel2 = channelManager.createChannel('channel2');
    var app = pomelo.createApp();
    
    before(function(done){
        app.set('mailBox', mailBoxCreator.create('mailbox1'));
        app.set('mailRouter', mailRouterCreator.create('route1'));
        var uid = 1000;
        for (var i = 0; i<200; i++) {
        	channel1.add(uid+i);
        }
        done();
    });
    
    describe('channel operation test!', function(){
        it('channel get be ok!', function(done){
            var getChannel1 = channelManager.getChannel('channel1');
            should.strictEqual(getChannel1, channel1);
            var getChannel2 = channelManager.getChannel('channel2');
            should.strictEqual(getChannel2, channel2);
            done();
        });
        it('add、delete、should be ok!', function(done){
            channel1.add(2001);
            channel1.contains(2001).should.be.ok;
            channel1.leave(2001);
            channel1.contains(2001).should.not.be.ok;
            done();
        });
    });
    describe('push message Test!', function(){
        it('push Message should be ok!', function(done){
            channel1.pushMessage({msg:'good'}, function(){
                should.equal(mailBoxCreator.info().count, 20);
                should.equal(mailRouterCreator.info().count, 200);
                should.equal(mailBoxCreator.info().serverIds[101], 1);
            });
            done();
        });
        it('send message by uids!', function(done){
            channel1.pushMessageByUids({msg:'good'},[1001, 1003, 1201], function(){
                should.equal(mailBoxCreator.info().count, 22);
                should.equal(mailRouterCreator.info().count, 203);
                should.equal(mailBoxCreator.info().serverIds[101], 1);
            });
            done();
        });
    });
});
