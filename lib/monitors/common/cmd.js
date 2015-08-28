var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var constants = require('../../util/constants');
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
		case 3:
			addCron(client, data);
			break;
		case 4:
			removeCron(client, data);
			break;
		case 5:
			addBlacklist(client, data);
			break;
		default:
			break;
	}
};

var stop = function(client) {
	logger.info('server : %s is stopped', client.app.serverId);
	client.app.set(constants.RESERVED.STOP_FLAG, true);
	client.app.stop();
};

var kill = function(client) {
	logger.info('server: %s is forced killed.', client.app.serverId);
	process.exit(0);
};

var addCron = function(client, msg) {
	client.app.addCrons([msg.cron]);
};

var removeCron = function(client, msg) {
	client.app.removeCrons([msg.cron]);
};

var addBlacklist = function(client, msg) {
	if(client.app.isFrontend()) {
		var connector = client.app.components.__connector__;
		connector.blacklist = connector.blacklist.concat(msg.blacklist);
	}
};