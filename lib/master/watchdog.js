const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const utils = require('../util/utils');
const Constants = require('../util/constants');
const countDownLatch = require('../util/countDownLatch');
const EventEmitter = require('events').EventEmitter;

class Watchdog extends EventEmitter
{
	constructor(app, service)
    {
		super();
		this.app = app;
		this.service = service;
		this.isStarted = false;
		this.count = utils.size(app.ServersFromConfig);

		this.servers = {};
		this.listeners = {};
	}

	addServer(server)
    {
		if (!server)
        {
			return;
		}
		this.servers[server.id] = server;
		this.notify({
			action : 'addServer',
			server : server});
	}

	removeServer(id)
    {
		if (!id)
        {
			return;
		}
		this.unsubscribe(id);
		delete this.servers[id];
		this.notify({
			action : 'removeServer',
			id     : id});
	}

	reconnectServer(server)
    {
		const self = this;
		if (!server)
        {
			return;
		}
		if (!this.servers[server.id])
        {
			this.servers[server.id] = server;
		}
        // replace server in reconnect server
		this.notifyById(server.id, {
			action  : 'replaceServer',
			servers : self.servers});
        // notify other server to add server
		this.notify({
			action : 'addServer',
			server : server});
        // add server in listener
		this.subscribe(server.id);
	}

	subscribe(id)
    {
		this.listeners[id] = 1;
	}

	unsubscribe(id)
    {
		delete this.listeners[id];
	}

	query()
    {
		return this.servers;
	}

	record(id)
    {
		if (!this.isStarted && --this.count < 0)
        {
			const usedTime = Date.now() - this.app.startTime;
			logger.info('all servers startup in %s ms', usedTime);
			this.notify({action: 'startOver'});
			this.isStarted = true;
		}
	}

	notifyById(id, msg)
    {
		this.service.agent.request(id, Constants.KEYWORDS.MONITOR_WATCHER, msg, function(signal)
        {
			if (signal !== Constants.SIGNAL.OK)
            {
				logger.error('master watchdog fail to notify to monitor, id: %s, msg: %j', id, msg);
			}
			else
            {
				logger.debug('master watchdog notify to monitor success, id: %s, msg: %j', id, msg);
			}
		});
	}

	notify(msg)
    {
		const listeners = this.listeners;
		let success = true;
		const fails = [];
		const timeouts = [];
		const requests = {};
		const count = utils.size(listeners);
		if (count === 0)
        {
			logger.warn('master watchdog listeners is none, msg: %j', msg);
			return;
		}
		const latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_COUNTDOWN}, isTimeout =>
        {
			if (isTimeout)
            {
				for (const key in requests)
                {
					if (!requests[key])
                    {
						timeouts.push(key);
					}
				}
				logger.error('master watchdog request timeout message: %j, timeouts: %j, fails: %j', msg, timeouts, fails);
			}
			if (!success)
            {
				logger.error('master watchdog request fail message: %j, fails: %j', msg, fails);
			}
		});

		const moduleRequest = (self, id) =>
        {
			return (() =>
            {
				self.service.agent.request(id, Constants.KEYWORDS.MONITOR_WATCHER, msg, (signal) =>
                {
					if (signal !== Constants.SIGNAL.OK)
                    {
						fails.push(id);
						success = false;
					}
					requests[id] = 1;
					latch.done();
				});
			})();
		};

		for (const id in listeners)
        {
			requests[id] = 0;
			moduleRequest(this, id);
		}
	}
}
module.exports = Watchdog;