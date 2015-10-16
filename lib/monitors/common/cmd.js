var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var constants = require('../../util/constants');
var Command = module.exports;
var vm = require('vm');
var util = require('util');

Command.init = function(client, data) {
	logger.debug('server: %s receive command, with data: %j', client.app.serverId, data);
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
		case 6:
		    set(client, data);
		    break;
		case 7:
			get(client, data);
			break;
		case 8:
			enable(client, data);
			break;
		case 9:
			disable(client, data);
			break;
		case 10:
			run(client, data);
			break;
		case 11:
			exec(client, data);
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
	logger.info('addCron %s to server %s', msg.cron, client.app.serverId);
	client.app.addCrons([msg.cron]);
};

var removeCron = function(client, msg) {
	logger.info('removeCron %s to server %s', msg.cron, client.app.serverId);
	client.app.removeCrons([msg.cron]);
};

var addBlacklist = function(client, msg) {
	if(client.app.isFrontend()) {
		logger.info('addBlacklist %s to server %s', msg.blacklist, client.app.serverId);
		var connector = client.app.components.__connector__;
		connector.blacklist = connector.blacklist.concat(msg.blacklist);
	}
};

var set = function(client, msg) {
	var key = msg.param['key'];
	var value = msg.param['value'];
	logger.info('set %s to value %s in server %s', key, value, client.app.serverId);
	client.app.set(key, value);
}

var get = function(zk, msg) {
	var value = zk.app.get(msg.param);
	if (!checkJSON(value)) {
		value = 'object';
	}

	logger.info('get %s the value is %s in server %s', msg.param, value, zk.app.serverId);
	if (!value) value = 'undefined';
	sendCommandResult(zk, value);
}

var enable = function(client, msg) {
	logger.info('enable %s in server %s', msg.param, client.app.serverId);
	client.app.enable(msg.param);
}

var disable = function(client, msg) {
	logger.info('disable %s in server %s', msg.param, client.app.serverId);
	client.app.disable(msg.param);
}

var run = function(zk, msg) {
	var ctx = {
			app: zk.app,
			result: null
	};
	try {
		vm.runInNewContext('result = ' + msg.param, ctx, 'myApp.vm');
		logger.info('run %s in server %s with result %s', msg.param, zk.app.serverId, util.inspect(ctx.result));
		sendCommandResult(zk, util.inspect(ctx.result));
	} catch(e) {
		logger.error('run %s in server %s with err %s', msg.param, zk.app.serverId, e.toString());
		sendCommandResult(zk, e.toString());
	}
}

var exec = function(zk, msg) {
	var context = {
        app: zk.app,
        require: require,
        os: require('os'),
        fs: require('fs'),
        process: process,
        util: util
    };
    try {
        vm.runInNewContext(msg.script, context);
		logger.info('exec %s in server %s with result %s', msg.script, zk.app.serverId, context.result);
        var result = context.result;
        if (!result) {
        	sendCommandResult(zk, "script result should be assigned to result value to script module context");
        } else {
        	sendCommandResult(zk, result.toString());
        }
    } catch (e) {
		logger.error('exec %s in server %s with err %s', msg.script, zk.app.serverId, e.toString());
        sendCommandResult(zk, e.toString())
    }
}

function sendCommandResult(zk, result) {
	var buffer = new Buffer(result);
		zk.client.setData(zk.cmdPath, buffer, function(err, stat) {
			if (err) {
				logger.error('send result to zookeeper failed with err:%j', err);
			}
	});
}
function checkJSON(obj) {
	if (!obj) {
		return true;
	}
	try {
		JSON.stringify(obj);
	} catch (e) {
		return false;
	}
	return true;
}