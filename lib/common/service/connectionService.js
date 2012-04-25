var pomelo = require('../../pomelo');

/**
 * connection statistics service
 * record connection, login count and list
 */
var exp = module.exports;

var connCount = 0;
var loginedCount = 0;
var logined = {};

exp.addLoginedUser = function(uid, info) {
	if(!logined[uid]) {
		loginedCount++;
	}
	logined[uid] = info;
};

exp.increaseConnectionCount = function() {
	connCount++;
};

exp.removeLoginedUser = function(uid) {
	if(!!logined[uid]) {
		loginedCount--;
	}
	delete logined[uid];
};

exp.decreaseConnectionCount = function() {
	connCount--;
};

exp.getStatisticsInfo = function() {
	var list = [];
	for(var uid in logined) {
		list.push(logined[uid]);
	}

	return {serverId: pomelo.getApp().get('serverId'), totalConnCount: connCount, loginedCount: loginedCount, loginedList: list};
};