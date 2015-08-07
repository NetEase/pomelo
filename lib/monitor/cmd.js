var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var Command = module.exports;

Command.init = function(client, event, data) {
	logger.debug('server: %s receive command, with event: %j, with data: %j', client.app.serverId, event, data);
	if(event.type !== 3) {
		logger.info('event ignore.');
		return;
	}
	if(!data) {
		logger.warn('server: %s command data is null.', client.app.serverId);
		return;
	}
	data = JSON.parse(data);
	switch(data.command) {
		case 1:
			stop(client);
			break;
		case 2:
			kill(client);
			break;
		default:
			break;
	}
};

var stop = function(client) {
	logger.info('server : %s is stopped', client.app.serverId);
	client.app.stop();
};

var kill = function(client) {
	logger.info('server: %s is forced stopped.', client.app.serverId);
	process.exit(0);
};