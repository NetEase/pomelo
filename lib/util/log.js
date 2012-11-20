var logger = require('pomelo-logger');

/**
 * Configure pomelo logger
 */
module.exports.configure = function(app, filename) {
	var serverId = app.get('serverId');
	var serverType = app.get('serverType');
	logger.configure(filename, {serverId: serverId, pattern: serverType});
};
