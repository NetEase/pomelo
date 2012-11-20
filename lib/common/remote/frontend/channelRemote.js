/**
 * Remote channel service for frontend server.
 * Receive push request from backend servers and push it to clients.
 */
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
	return new Remote(app);
};

var Remote = function(app) {
	this.app = app;
};

/**
 * Push message to client by uids
 *
 * @param msg {Object} message that would be push to clients
 * @param uids {Array} user ids that would receive the message
 * @param cb {Function} callback function
 */
Remote.prototype.pushMessage = function(msg, uids, cb) {
	var sessionService = this.app.get('sessionService');
	for(var i=0, l=uids.length; i<l; i++) {
		sessionService.sendMessageByUid(uids[i], msg);
	}
	cb();
};
