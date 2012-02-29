exports = module.exports;

exports.map = function(userId, servers) {
	var num = userId % servers.length;
	return servers[num];
}
