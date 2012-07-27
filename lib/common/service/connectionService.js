var pomelo = require('../../pomelo');

/**
 * connection statistics service
 * record connection, login count and list
 */
var exp = module.exports;

var connCount = 0;
var loginedCount = 0;
var logined = {};

/**
 * Add logined user.
 *
 * @param uid {String} user id
 * @param info {Object} record for logined user
 */
exp.addLoginedUser = function(uid, info) {
	if(!logined[uid]) {
		loginedCount++;
	}
	logined[uid] = info;
};

/**
 * Increase connection count
 */
exp.increaseConnectionCount = function() {
	connCount++;
};

/**
 * Remote logined user
 *
 * @param uid {String} user id
 */
exp.removeLoginedUser = function(uid) {
	if(!!logined[uid]) {
		loginedCount--;
	}
	delete logined[uid];
};

/**
 * Decrease connection count
 *
 * @param uid {String} uid
 */
exp.decreaseConnectionCount = function(uid) {
	connCount--;
	if(!!uid) {
		exp.removeLoginedUser(uid);
	}
};

/**
 * Get statistics info
 *
 * @return {Object} statistics info
 */
exp.getStatisticsInfo = function() {
	var list = [];
	for(var uid in logined) {
		list.push(logined[uid]);
	}

	return {serverId: pomelo.app.get('serverId'), totalConnCount: connCount, loginedCount: loginedCount, loginedList: list};
};
