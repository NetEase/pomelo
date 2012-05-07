var utils = require('../../util/utils');
var pomelo = require('../../pomelo');
var logger = require('../../util/log/log').getLogger(__filename);

var exp = module.exports;

/**
 * status service
 * keep all connection infos in memory.
 * only one connection at the same time for each account. latest login will kick the old one off.
 */
var uidMap = {};

/**
 * add uid and serverId pair into status records
 * kick the old login if any.
 * 
 * @param uid user id
 * @param sid server id
 * @param cb(err)
 */
exp.addStatus = function(uid, sid, cb) {
	logger.debug('add satus:' + uid + ', ' + sid);
	var oldSid = uidMap[uid];

	function addNewStatus(err) {
		if(!err) {
			uidMap[uid] = sid;
		}
		utils.invokeCallback(cb, err);
	}

	if(!!oldSid) {
		kick(uid, oldSid, addNewStatus);
	} else {
		addNewStatus();
	}

};

/**
 * remove status record by uid
 *
 * @param uid user id
 * @param cb(err)
 */
exp.removeStatus = function(uid, cb) {
	delete uidMap[uid];

	utils.invokeCallback(cb);
};

/**
 * query status by uid
 * 
 * @param {String} uid user id
 * @param {Function} cb(err, sid) sid: server id corresponsed with the uid or null/undefined for none
 */
exp.queryStatus = function(uid, cb) {
	utils.invokeCallback(cb, null, uidMap[uid]);
};

/**
 * query status by uids
 *
 * @param {Array} uids list of uid
 * @param {Function} cb(err, result, missing) result:{sid:[uid]}, missing:[missingUid]
 */
exp.queryStatusBatch = function(uids, cb) {
	var result = {};
	var missing = [];

	var sid, list;
	for(var i=0, l=uids.length; i<l; i++) {
		sid = uidMap[uids[i]];
		if(!sid) {
			missing.push(uids[i]);
			continue;
		}

		list = result[sid];
		if(!list) {
			list = [];
			result[sid] = list;
		}
		list.push(uids[i]);
	}

	utils.invokeCallback(cb, null, result, missing);
};

var kick = function(uid, sid, cb) {
	logger.debug('try to kick off uid:' + uid + ', sid:' + sid);
	var app = pomelo.getApp();
	var mailbox = app.get('mailBox');
	mailbox.dispatch(sid, {service: 'sys.connector.sessionService', method: 'kick', args: [uid]}, null, function(err) {
		if(!!err) {
			logger.error('fail to kick user, uid:' + uid + ', sid:' + sid + ', err:' + err.stack);
		}
		utils.invokeCallback(cb, err);
	});
};
