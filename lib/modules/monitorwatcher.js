const _ = require('lodash'),
	utils = require('../util/utils'),
	events = require('../util/events'),
	Constants = require('../util/constants'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class MonitorWatcher
{
	constructor(opts, consoleService)
	{
		this.app = opts.app;
		this.service = consoleService;
		this.id = this.app.getServerId();

		this.app.event.on(events.START_SERVER, MonitorWatcherUtility.finishStart.bind(null, this));
	}

	static get moduleId()
	{
		return Constants.KEYWORDS.MONITOR_WATCHER;
	}

	start(cb)
	{
		MonitorWatcherUtility.subscribeRequest(this, this.service.agent, this.id, cb);
	}

	monitorHandler(agent, msg, cb)
	{
		if (!msg || !msg.action)
		{
			return;
		}
		const func = monitorMethods[msg.action];
		if (!func)
		{
			logger.info('monitorwatcher unknown action: %j', msg.action);
			return;
		}
		func(this, agent, msg, cb);
	}
}

class MonitorWatcherUtility
{
	// ----------------- monitor start method -------------------------

	static subscribeRequest(monitorWatcher, agent, id, cb)
	{
		const msg = {
			action : 'subscribe',
			id     : id};
		agent.request(Constants.KEYWORDS.MASTER_WATCHER, msg, (err, servers) =>
		{
			if (err)
			{
				logger.error(`subscribeRequest request to master with error: ${err.stack}`);
				utils.invokeCallback(cb, err);
			}
			const res = _.values(servers);
			MonitorWatcherUtility.addServers(monitorWatcher, res);
			utils.invokeCallback(cb);
		});
	}

	// ----------------- monitor request methods -------------------------

	static addServer(monitorWatcher, agent, msg, cb)
	{
		logger.debug('[%s] receive addServer signal: %j', monitorWatcher.app.serverId, msg);
		if (!msg || !msg.server)
		{
			logger.warn('monitorwatcher addServer receive empty message: %j', msg);
			utils.invokeCallback(cb, Constants.SIGNAL.FAIL);
			return;
		}
		MonitorWatcherUtility.addServers(monitorWatcher, [msg.server]);
		utils.invokeCallback(cb, Constants.SIGNAL.OK);
	}

	static removeServer(monitorWatcher, agent, msg, cb)
	{
		logger.debug('%s receive removeServer signal: %j', monitorWatcher.app.serverId, msg);
		if (!msg || !msg.id)
		{
			logger.warn('monitorwatcher removeServer receive empty message: %j', msg);
			utils.invokeCallback(cb, Constants.SIGNAL.FAIL);
			return;
		}
		MonitorWatcherUtility.removeServers(monitorWatcher, [msg.id]);
		utils.invokeCallback(cb, Constants.SIGNAL.OK);
	}

	static replaceServer(monitorWatcher, agent, msg, cb)
	{
		logger.debug('%s receive replaceServer signal: %j', monitorWatcher.app.serverId, msg);
		if (!msg || !msg.servers)
		{
			logger.warn('monitorwatcher replaceServer receive empty message: %j', msg);
			utils.invokeCallback(cb, Constants.SIGNAL.FAIL);
			return;
		}
		MonitorWatcherUtility.replaceServers(monitorWatcher, msg.servers);
		utils.invokeCallback(cb, Constants.SIGNAL.OK);
	}

	static startOver(monitorWatcher, agent, msg, cb)
	{
		const fun = monitorWatcher.app.lifecycleCbs[Constants.LIFECYCLE.AFTER_STARTALL];
		if (fun)
		{
			utils.invokeCallback(fun, monitorWatcher.app);
		}
		monitorWatcher.app.event.emit(events.START_ALL);
		utils.invokeCallback(cb, Constants.SIGNAL.OK);
	}

// ----------------- common methods -------------------------

	static addServers(monitorWatcher, servers)
	{
		if (!servers || !servers.length)
		{
			return;
		}
		monitorWatcher.app.addServers(servers);
	}

	static removeServers(monitorWatcher, ids)
	{
		if (!ids || !ids.length)
		{
			return;
		}
		monitorWatcher.app.removeServers(ids);
	}

	static replaceServers(monitorWatcher, servers)
	{
		monitorWatcher.app.replaceServers(servers);
	}

// ----------------- bind methods -------------------------

	static finishStart(monitorWatcher, id)
	{
		const msg = {
			action : 'record',
			id     : id};
		monitorWatcher.service.agent.notify(Constants.KEYWORDS.MASTER_WATCHER, msg);
	}
}

const monitorMethods = {
	'addServer'     : MonitorWatcherUtility.addServer,
	'removeServer'  : MonitorWatcherUtility.removeServer,
	'replaceServer' : MonitorWatcherUtility.replaceServer,
	'startOver'     : MonitorWatcherUtility.startOver
};

module.exports = function(opts, consoleService)
{
	return new MonitorWatcher(opts, consoleService);
};
module.exports.moduleId = Constants.KEYWORDS.MONITOR_WATCHER;