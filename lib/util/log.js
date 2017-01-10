const logger = require('pomelo-logger');

class Log
{
	static Configure(app, filename)
	{
		const serverId = app.getServerId();
		const base = app.getBase();
		logger.configure(filename, {
			serverId : serverId,
			base     : base});
	}
}

module.exports.configure = Log.Configure;