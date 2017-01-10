const utils = require('../util/utils'),
	Constants = require('../util/constants'),
	MasterWatchdog = require('../master/watchdog'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class MasterWatcher
{
	constructor(opts, consoleService)
	{
		this.app = opts.app;
		this.service = consoleService;
		this.id = this.app.getServerId();

		this.watchdog = new MasterWatchdog(this.app, this.service);
		this.service.on('register', MasterWatcherUtility.onServerAdd.bind(null, this));
		this.service.on('disconnect', MasterWatcherUtility.onServerLeave.bind(null, this));
		this.service.on('reconnect', MasterWatcherUtility.onServerReconnect.bind(null, this));
	}

	static get moduleId()
	{
		return Constants.KEYWORDS.MASTER_WATCHER;
	}

	// ----------------- module methods -------------------------

	start(cb)
	{
		utils.invokeCallback(cb);
	}

	masterHandler(agent, msg, cb)
	{
		if (!msg)
		{
			logger.warn('masterwatcher receive empty message.');
			return;
		}
		const func = masterMethods[msg.action];
		if (!func)
		{
			logger.info('masterwatcher unknown action: %j', msg.action);
			return;
		}
		func(this, agent, msg, cb);
	}
}

class MasterWatcherUtility
{
	// ----------------- bind methods -------------------------

	static onServerAdd(module, record)
	{
		logger.debug(`masterwatcher receive add server event, with server: ${record}`);
		if (!record || record.type === 'client' || !record.serverType)
		{
			return;
		}
		module.watchdog.addServer(record);
	}

	static onServerReconnect(module, record)
	{
		logger.debug(`masterwatcher receive reconnect server event, with server: ${record}`);
		if (!record || record.type === 'client' || !record.serverType)
		{
			logger.warn('onServerReconnect receive wrong message: %j', record);
			return;
		}
		module.watchdog.reconnectServer(record);
	}

	static onServerLeave(module, id, type)
	{
		logger.debug('masterwatcher receive remove server event, with server: %s, type: %s', id, type);
		if (!id)
		{
			logger.warn('onServerLeave receive server id is empty.');
			return;
		}
		if (type !== 'client')
		{
			module.watchdog.removeServer(id);
		}
	}

	// ----------------- monitor request methods -------------------------

	static subscribe(module, agent, msg, cb)
	{
		if (!msg)
		{
			utils.invokeCallback(cb, new Error('masterwatcher subscribe empty message.'));
			return;
		}

		module.watchdog.subscribe(msg.id);
		utils.invokeCallback(cb, null, module.watchdog.query());
	}

	static unsubscribe(module, agent, msg, cb)
	{
		if (!msg)
		{
			utils.invokeCallback(cb, new Error('masterwatcher unsubscribe empty message.'));
			return;
		}
		module.watchdog.unsubscribe(msg.id);
		utils.invokeCallback(cb);
	}

	static query(module, agent, msg, cb)
	{
		utils.invokeCallback(cb, null, module.watchdog.query());
	}

	static record(module, agent, msg, cb)
	{
		if (!msg)
		{
			utils.invokeCallback(cb, new Error('masterwatcher record empty message.'));
			return;
		}
		module.watchdog.record(msg.id);
	}
}

const masterMethods = {
	'subscribe'   : MasterWatcherUtility.subscribe,
	'unsubscribe' : MasterWatcherUtility.unsubscribe,
	'query'       : MasterWatcherUtility.query,
	'record'      : MasterWatcherUtility.record
};

module.exports = function(opts, consoleService)
{
	if (!(this instanceof MasterWatcher))
	{
		return new MasterWatcher(opts, consoleService);
	}
};

module.exports.moduleId = Constants.KEYWORDS.MASTER_WATCHER;