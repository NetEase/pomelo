var countDownLatch = require('../../util/countDownLatch');
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var async = require('async');

/**
 * constant
 */
var DEFAULT_GROUP_ID = 'default';

var ST_INITED = 0;
var ST_DESTROYED = 1;

/**
 * Create and maintain channels for server local. 
 *
 * ChannelService is created by channel component which is a default loaded 
 * component of pomelo and channel service would be accessed by `app.get('channelService')`.
 *
 * @class
 * @constructor
 */
var ChannelService = function(app) {
	this.app = app;
	this.channels = {};
};

module.exports = ChannelService;

/**
 * Create channel with name.
 *
 * @param {String} name channel's name
 * @memberOf ChannelService
 */
ChannelService.prototype.createChannel = function(name) {
	if(this.channels[name]) {
		return this.channels[name];
	}

	var c = new Channel(name, this);
	this.channels[name] = c;
	return c;
};

/**
 * Get channel by name.
 *
 * @param {String} name channel's name
 * @param {Boolean} create if true, create channel
 * @return {Channel} 
 * @memberOf ChannelService
 */
ChannelService.prototype.getChannel = function(name, create) {
	var channel = this.channels[name];
	if(!channel && !!create) {
		channel = this.channels[name] = new Channel(name, this);
	}
	return channel;
};

/**
 * Destroy channel by name.
 * 
 * @param {String} name channel name
 * @memberOf ChannelService
 */
ChannelService.prototype.destroyChannel = function(name) {
	delete this.channels[name];
};

/**
 * Push message by uids.
 * Group the uids by group. ignore any uid if sid not specified.
 *
 * @param {Object} msg message that would be sent to client
 * @param {Array} uids the receiver info list, [{uid: userId, sid: frontendServerId}]
 * @param {Function} cb cb(err)
 * @memberOf ChannelService
 */
ChannelService.prototype.pushMessageByUids = function(msg, uids, cb) {
	if(!uids || uids.length === 0) {
		utils.invokeCallback(cb, new Error('uids should not be empty'));
		return;
	}
	var groups = {}, record;
	for(var i=0, l=uids.length; i<l; i++) {
		record = uids[i];
		add(record.uid, record.sid, groups);
	}

	sendMessageByGroup(this, msg, groups, cb);
};

/**
 * Channel maintains the receiver collection for a subject. You can 
 * add users into a channel and then broadcast message to them by channel.
 *
 * @class channel
 * @constructor 
 */
var Channel = function(name, service) {
	this.name = name;
	this.groups = {};			// group map for uids. key: sid, value: [uid]
	this.records = {};			// member records. key: uid
	this.__channelService__ = service;
	this.state = ST_INITED;
};

/**
 * Add user to channel.
 *
 * @param {Number} uid user id
 * @param {String} sid frontend server id which user has connected to
 */
Channel.prototype.add = function(uid, sid) {
	if(this.state > ST_INITED) {
		return false;
	} else {
		var res = add(uid, sid, this.groups);
		if(res) {
			this.records[uid] = {sid: sid, uid: uid};
		}
		return res;
	}
};

/**
 * Remove user from channel.
 *
 * @param {Number} uid user id
 * @param {String} sid frontend server id which user has connected to. 
 * @return [Boolean] true if success or false if fail
 */
Channel.prototype.leave = function(uid, sid) {
	delete this.records[uid];
	return deleteFrom(uid, sid, this.groups[sid]);
};

/**
 * Get channel members.
 * 
 * <b>Notice:</b> Heavy operation.
 * 
 * @return {Array} channel member uid list
 */
Channel.prototype.getMembers = function() {
	var res = [];
	if(!this.groups) {
		return res;
	}

	var group, i, l;
	for(var sid in this.groups) {
		group = this.groups[sid];
		for(i=0, l=group.length; i<l; i++) {
			res.push(group[i]);
		}
	}
	return res;
};

/**
 * Get Member info.
 * 
 * @param  {String} uid user id
 * @return {Object}     member info
 */
Channel.prototype.getMember = function(uid) {
	return this.records[uid];
};

/**
 * Destroy channel.
 */
Channel.prototype.destroy = function() {
	this.state = ST_DESTROYED;
	this.__channelService__.destroyChannel(this.name);
};

/**
 * Push message to all the members in the channel
 *
 * @param {Object} msg message that would be sent to client
 * @param {Functioin} cb callback function
 */
Channel.prototype.pushMessage = function(msg, cb) {
	if(this.state !== ST_INITED) {
		utils.invokeCallback(new Error('channel not init'));
		return;
	}
	sendMessageByGroup(this.__channelService__, msg, this.groups, cb);
};

/**
 * add uid and sid into group. ignore any uid that uid not specified.
 *
 * @param uid user id
 * @param sid server id
 * @param groups {Object} grouped uids, , key: sid, value: [uid]
 */
var add = function(uid, sid, groups) {
	if(!sid) {
		logger.warn('ignore uid %j for sid not specified.', uid);
		return false;
	}

	var group = groups[sid];
	if(!group) {
		group = [];
		groups[sid] = group;
	}

	group.push(uid);
	return true;
};

/**
 * delete element from array
 */
var deleteFrom = function(uid, sid, group) {
	if(!group) {
		return true;
	}
	
	for(var i=0, l=group.length; i<l; i++) {
		if(group[i] === uid) {
			group.splice(i, 1);
			return true;
		}
	}

	return false;
};

/**
 * push message by group
 *
 * @param msg {Object} message that would be sent to client
 * @param groups {Object} grouped uids, , key: sid, value: [uid]
 * @param cb {Function} cb(err)
 *
 * @api private
 */
var sendMessageByGroup = function(channelService, msg, groups, cb) {
	var app = channelService.app;
	var namespace = 'sys';
	var service = 'channelRemote';
	var method = 'pushMessage';
	var count = utils.size(groups);
	var successFlag = false;
	msg = JSON.stringify(msg);

	if(count === 0) {
		// group is empty
		utils.invokeCallback(cb);
		return;
	}

	var latch = countDownLatch.createCountDownLatch(count, function(){
		if(!successFlag) {
			utils.invokeCallback(cb, new Error('all uids push message fail'));
			return;
		}
		utils.invokeCallback(cb);
	});

	for(var sid in groups) {
		var uids = groups[sid];
		app.rpcInvoke(sid, {namespace: namespace, service: service, method: method, args: [msg, uids]}, function(err) {
			if(err) {
				logger.error('[pushMessage] fail to dispatch msg, err:' + err.stack);
				latch.done();
				return;
			}
			successFlag = true;
			latch.done();
		});
	}

}; 
