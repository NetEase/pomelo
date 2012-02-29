exports = module.exports;

var areaManager = require('../master/areaManager');

exports.map = function(userId, servers) {
	var serverId = areaManager.getUserServer(userId);
    var server = findServer(servers, serverId);
	return server;
}
