'use strict';
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
		case 'stop':
			stop(client);
			break;
		case 'kill':
			kill(client);
			break;
		case 'addCron':
			addCron(client, data);
			break;
		case 'removeCron':
			removeCron(client, data);
			break;
		case 'blacklist':
			addBlacklist(client, data);
			break;
		case 'set':
		    set(client, data);
		    break;
		case 'get':
			get(client, data);
			break;
		case 'enable':
			enable(client, data);
			break;
		case 'disable':
			disable(client, data);
			break;
		case 'run':
			run(client, data);
			break;
		case 'exec':
			exec(client, data);
			break;
		default:
			logger.debug('server: %s receive unknown command, with data: %j', client.app.serverId, data);
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
};

var get = function(client, msg) {
	var value = client.app.get(msg.param);
	if (!checkJSON(value)) {
		value = 'object';
	}

	logger.info('get %s the value is %s in server %s', msg.param, value, client.app.serverId);
	if (!value) value = 'undefined';
	client.sendCommandResult(value);
};

var enable = function(client, msg) {
	logger.info('enable %s in server %s', msg.param, client.app.serverId);
	client.app.enable(msg.param);
};

var disable = function(client, msg) {
	logger.info('disable %s in server %s', msg.param, client.app.serverId);
	client.app.disable(msg.param);
};

var run = function(client, msg) {
	var ctx = {
			app: client.app,
			result: null
	};
	try {
		vm.runInNewContext('result = ' + msg.param, ctx, 'myApp.vm');
		logger.info('run %s in server %s with result %s', msg.param, client.app.serverId, util.inspect(ctx.result));
		client.sendCommandResult(util.inspect(ctx.result));
	} catch(e) {
		logger.error('run %s in server %s with err %s', msg.param, client.app.serverId, e.toString());
		client.sendCommandResult(e.toString());
	}
};

var exec = function(client, msg) {
	var context = {
        app: client.app,
        require: require,
        os: require('os'),
        fs: require('fs'),
        process: process,
        util: util
    };
    try {
        vm.runInNewContext(msg.script, context);
		logger.info('exec %s in server %s with result %s', msg.script, client.app.serverId, context.result);
        var result = context.result;
        if (!result) {
        	client.sendCommandResult("script result should be assigned to result value to script module context");
        } else {
        	client.sendCommandResult(result.toString());
        }
    } catch (e) {
		logger.error('exec %s in server %s with err %s', msg.script, client.app.serverId, e.toString());
        client.sendCommandResult(e.toString())
    }
};

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
};