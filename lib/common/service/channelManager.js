var pomelo = require('../../pomelo');
var msgUtils = require('../../util/msg/msgUtils');
var countDownLatch = require('../../util/countDownLatch');
var utils = require('../../util/utils');
var logger = require('../../util/log/log').getLogger(__filename);
var async = require('async');

var exp = module.exports;

var channels = {};

var Channel = function(name) {
	this.members = [];
};

var pro = Channel.prototype;

pro.contains = function(uid) {
	for(var i=0, l=this.members.length; i<l; i++) {
		if(this.members[i] === uid) {
			return true;
		}
	}
	return false;
};

pro.add = function(uid) {
	if(this.contains(uid)) {
		return false;
	}
	
	this.members.push(uid);
	return true;
};

pro.leave = function(uid) {
	var idx = -1;
	for(var i=0, l=this.members.length; i<l; i++) {
		if(this.members[i] === uid) {
			idx = i;
			break;
		}
	}
	if(idx < 0) return false;
	this.members.splice(idx, 1);
	return false;
}

pro.pushMessage = function(msg, cb) {
	if(this.members.length == 0) {
		logger.warn('[pushMessage] members is empty.');
		utils.invokeCallback(null);
		return;
	}
	
	var type = msgUtils.checkServerType(msg);
	if(!type) {
		logger.error('[pushMessage] invalid server type:' + JSON.stringify(msg));
		utils.invokeCallback(cb, new Error('invalid server type:' + JSON.stringify(msg)));
		return;
	}
	var app = pomelo.getApp();
	var mailRouter = app.get('mailRouter');
	var failUids = [];
	var groups = {};
	var successFlag = false;
	async.map(this.members, function(uid, cb) {
		mailRouter.route({type: type, uid: uid}, function(err, serverId){
			if(!!err) {
				logger.error('[pushMessage] fail to get route for type:' + type + ', uid:' + uid + ', err:' + err.stack);
				failUids.push(uid);
				cb();
				return;
			}
			
			var group = groups[serverId];
			if(!group) {
				group = [];
				groups[serverId] = group;
			}
			group.push(uid);
			successFlag = true;
			cb();
		});
	}, function(err) {
		if(!successFlag) {
			utils.invokeCallback(new Error('all uids route fail'));
			return;
		}
		sendMessageByGroup(msg, groups, cb);
	});
};

var sendMessageByGroup = function(msg, groups, cb) {
	var app = pomelo.getApp();
	var mailBox = app.get('mailBox');
	var service = 'sys.connector.channelService';
	var method = 'pushMessage';
	var count = 0;
	var successFlag = false;
	for(var key in groups) {
		count++;
		(function() {
			var serverId = key;
			var uids = groups[serverId];
			mailBox.dispatch(serverId, {service: service, method: method, args: [msg, uids]}, null, function(err) {
				if(!!err) {
					logger.error('[pushMessage] fail to dispatch msg, serverId:' + serverId + ', uids:' + uids + ', err:' + err.stack);
					failUids.push(uid);
					latch.done();
					return;
				}
				successFlag = true;
				latch.done();
			});
		})();
	}
	var latch = countDownLatch.createCountDownLatch(count, function(){
		if(!successFlag) {
			utils.invokeCallback(cb, new Error('all uids push message fail'));
			return;
		}
		utils.invokeCallback(cb);
	});
};

exp.createChannel = function(name) {
	if(!!channels[name]) {
		return null;
	}
	
	var c = new Channel(name);
	channels[name] = c;
	return c;
};

exp.getChannel = function(name) {
	return channels[name];
};