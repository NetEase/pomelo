const logger = require('pomelo-logger');

/**
 * Configure pomelo logger
 */
module.exports.configure = function(app, filename)
{
	const serverId = app.ServerId;
	const base = app.Base;
	logger.configure(filename, {
		serverId : serverId,
		base     : base
	});
};
