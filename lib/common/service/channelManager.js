var pomelo = require('../../pomelo');
var msgUtils = require('../../util/msg/msgUtils');
var countDownLatch = require('../../util/countDownLatch');
var utils = require('../../util/utils');
var logger = require('../../util/log/log').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var exp = module.exports;

var channels = {};

var Channel = function(name) {
	this.groups = {};			//group map for uids. key: sid, value: [uid]
	this.defaultGroup = [];		//default group for uids that not specified sid
};

var pro = Channel.prototype;

/**
 * add user to channel
 *
 * @param uid user id
 * @param sid frontend server id which user has connected to
 */
pro.add = function(uid, sid, cb) {
  var err = null;
  if(!!this._destroy) {
    err = new Error('channel ' + this.name + ' has been destroyed');
  } else {
  	add(uid, sid, this.groups, this.defaultGroup);
  }

  process.nextTick(function() {
    utils.invokeCallback(cb, err);
  });
};

/**
 * remove user from channel
 *
 * @param uid user id
 * @param sid frontend server id which user has connected to. remove uid for all groups if sid not specified.
 * @return [Boolean] true if success or false if fail
 */
pro.leave = function(uid, sid, cb) {
	if(!sid) {
		removeUid(uid, this.groups, this.defaultGroup);
	} else {
    var group = this.groups[sid];
    var idx = _.indexOf(group, uid);
    if(idx >= 0) {
      group.splice(idx, 1);
    }
  }

  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

/**
 * destroy channel
 */
pro.destroy = function(force, cb) {
  this.__destroy = true;
  exp.destroyChannel(this.name, force);

  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

/**
 * push message to all the members in the channel
 *
 * @param msg {Object} message that would be sent to client
 * @param cb {Functioin} cb(err)
 */
pro.pushMessage = function(msg, cb) {
	var self = this;
	regroup(this.groups, this.defaultGroup, function(err, miss) {
		if(!!err) {
			utils.invokeCallback(cb, err);
			return;
		}

		if(_.size(self.groups) === 0) {
			logger.warn('[pushMessage] members is empty.');
			utils.invokeCallback(null);
			return;
		}
		sendMessageByGroup(msg, self.groups, cb);
	});
};

/**
 * create channel with name
 */
exp.createChannel = function(name) {
	if(!!channels[name]) {
		return channels[name];
	}
	
	var c = new Channel(name);
	channels[name] = c;
	return c;
};

/**
 * get channel by name
 */
exp.getChannel = function(name, create) {
  var channel = channels[name];
  if(!channel && !!create) {
    channel = channels[name] = new Channel(name);
  }
	return channel;
};

/**
 * destroy channel
 */
exp.destroyChannel = function(name, force) {
  delete channels[name];
};

/**
 * push message by uids
 * group the uids by group. query status server for sid if sid not specified.
 * 
 * @param msg {Object} message that would be sent to client
 * @param uids {Array} [{uid: userId, sid: serverId}] or [uids]
 * @param cb {Function} cb(err)
 */
exp.pushMessageByUids = function(msg, uids, cb) {
	if(!uids || uids.length === 0) {
		utils.invokeCallback(cb, new Error('uids should not be empty'));
		return;
	}
	var groups = {};
	var defGroup = [];
	for(var i=0, l=uids.length; i<l; i++) {
		if(!!uids[i].uid) {
			add(uids[i].uid, uids[i].sid, groups, defGroup);
		} else {
			add(uids[i], null, groups, defGroup);
		}
	}

	regroup(groups, defGroup, function(err, miss) {
		if(!!err) {
			utils.invokeCallback(cb, err);
			return;
		}

		if(_.size(groups) === 0) {
			logger.warn('[pushMessage] group is empty.');
			utils.invokeCallback(null);
			return;
		}
		sendMessageByGroup(msg, groups, cb);
	});
};

/**
 * query connection status of the ungroup uids from status server and then merge them into groups
 *
 * @param groups [Object] grouped uids, key: sid, value: [uid]
 * @param defGroup [Array] ungroup uids
 * @param cb [Function] cb(err, miss). miss: array of miss uids
 */
var regroup = function(groups, defGroup, cb) {
	if(defGroup.length === 0) {
		utils.invokeCallback(cb);
		return;
	}

	var self = this;
	var proxy = pomelo.getApp().get('proxyMap');
	proxy.user.status.statusRemote.queryStatusBatch(defGroup, function(err, res, miss) {
		if(!!err) {
			logger.error('fail to query status, err:' + err.stack);
			utils.invokeCallback(cb, err);
			return;
		}

		if(!!res) {
			var uids, uid;
			for(var sid in res) {
				uids = res[sid];
				for(var i=0, l=uids.length; i<l; i++) {
					uid = uids[i];
					deleteFrom(uid, defGroup);
					add(uid, sid, groups);
				}
			}
		}

		if(!!miss && miss.length > 0) {
			logger.warn('fail to group uids:' + miss);
		}

		utils.invokeCallback(cb, null, miss);
	});	//end of proxy
};

/**
 * add uid and sid into group. add the uid into defGroup if the sid not specified
 *
 * @param uid user id
 * @param sid server id
 * @param groups {Object} grouped uids, , key: sid, value: [uid]
 * @param defGroup {Array} ungroup uids
 */
var add = function(uid, sid, groups, defGroup) {
	if(!sid) {
		if(_.indexOf(defGroup, uid) >= 0) {
			return false;
		}
		defGroup.push(uid);
		return true;
	}

	var group = groups[sid];
	if(!group) {
		group = [];
		groups[sid] = group;
	} else {
		if(_.indexOf(group, uid) >= 0) {
			return false;
		}
	}
	group.push(uid);
	return true;
};

/**
 * delete element from array
 */
var deleteFrom = function(uid, group) {
	for(var i=0, l=group.length; i<l; i++) {
		if(group[i] === uid) {
			group.splice(i, 1);
			break;
		}
	}
};

/**
 * push message by group
 * 
 * @param msg {Object} message that would be sent to client
 * @param groups {Object} grouped uids, , key: sid, value: [uid]
 * @param cb {Function} cb(err)
 */
var sendMessageByGroup = function(msg, groups, cb) {
	var app = pomelo.getApp();
	var mailBox = app.get('mailBox');
	var service = 'sys.channelRemote';
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

/**
 * remove uid from all groups
 */
var removeUid = function(uid, groups, defGroup) {
	var group, idx;
	for(var sid in groups) {
		group = groups[sid];
		idx = group.indexOf(uid);
		if(idx >= 0) {
			group.splice(idx, 1);
		}
	}

	idx = defGroup.indexOf(uid);
	if(idx >= 0) {
		defGroup.splice(idx, 1);
	}
};
