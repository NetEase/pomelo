exports = module.exports;

var areaManager = require('../area/areaManager');

exports.map = function(userId, servers) {
	var serverId = areaManager.getUserServer(userId);
    var server = findServer(servers, serverId);
	return server;
}
