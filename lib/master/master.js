const _ = require('lodash'),
	starter = require('./starter'),
	util = require('util'),
	utils = require('../util/utils'),
	admin = require('pomelo-admin-upgrade'),
	moduleUtil = require('../util/moduleUtil'),
	Constants = require('../util/constants'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	crashLogger = require('pomelo-logger').getLogger('crash-log', __filename),
	adminLogger = require('pomelo-logger').getLogger('admin-log', __filename);

class Master
{
	constructor(app, opts)
	{
		this.app = app;
		this.masterInfo = app.getMaster();
		this.registered = {};
		this.modules = [];
		opts = opts || {};

		opts.port = this.masterInfo.port;
		opts.env = this.app.get(Constants.RESERVED.ENV);
		this.closeWatcher = opts.closeWatcher;
		this.masterConsole = admin.createMasterConsole(opts);
	}

	start(cb)
	{
		moduleUtil.registerDefaultModules(true, this.app, this.closeWatcher);
		moduleUtil.loadModules(this, this.masterConsole);

		// start master console
		this.masterConsole.start((err) =>
		{
			if (err)
			{
				process.exit(0);
			}
			moduleUtil.startModules(this.modules, err =>
			{
				if (err)
				{
					utils.invokeCallback(cb, err);
					return;
				}

				if (this.app.get(Constants.RESERVED.MODE) !== Constants.RESERVED.STAND_ALONE)
				{
					starter.runServers(this.app);
				}
				utils.invokeCallback(cb);
			});
		});

		this.masterConsole.on('error', (err) =>
		{
			if (err)
			{
				logger.error(`masterConsole encounters with error: ${err.stack}`);
				return;
			}
		});

		this.masterConsole.on('reconnect', (info) =>
		{
			this.app.addServers([info]);
		});

		// monitor servers disconnect event
		this.masterConsole.on('disconnect', (id, type, info, reason) =>
		{
			crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
			let count = 0;
			const time = 0;
			let pingTimer = null;
			const server = this.app.getServerById(id);
			const stopFlags = this.app.get(Constants.RESERVED.STOP_SERVERS) || [];
			if (!_.isNil(server)
				&& (server[Constants.RESERVED.AUTO_RESTART] === 'true' || server[Constants.RESERVED.RESTART_FORCE] === 'true')
				&& stopFlags.indexOf(id) < 0)
			{
				const setTimer = time =>
				{
					pingTimer = setTimeout(() =>
					{
						utils.ping(server.host, flag =>
						{
							if (flag)
							{
								clearTimeout(pingTimer);
								utils.checkPort(server, status =>
								{
									if (status === 'error')
									{
										utils.invokeCallback(cb, new Error('Check port command executed with error.'));
										return;
									}
									else if (status === 'busy')
									{
										if (server[Constants.RESERVED.RESTART_FORCE])
										{
											starter.kill([info.pid], [server]);
										}
										else
										{
											utils.invokeCallback(cb, new Error('Port occupied already, check your server to add.'));
											return;
										}
									}
									setTimeout(() =>
									{
										starter.run(this.app, server, null);
									}, Constants.TIME.TIME_WAIT_STOP);
								});
							}
							else
							{
								count++;
								if (count > 3)
								{
									time = Constants.TIME.TIME_WAIT_MAX_PING;
								}
								else
								{
									time = Constants.TIME.TIME_WAIT_PING * count;
								}
								setTimer(time);
							}
						});
					}, time);
				};
				setTimer(time);
			}
		});

		// monitor servers register event
		this.masterConsole.on('register', function(record)
		{
			starter.bindCpu(record.id, record.pid, record.host);
		});

		this.masterConsole.on('admin-log', function(log, error)
		{
			if (error)
			{
				adminLogger.error(JSON.stringify(log));
			}
			else
			{
				adminLogger.info(JSON.stringify(log));
			}
		});
	}

	stop(cb)
	{
		this.masterConsole.stop();
		process.nextTick(cb);
	}
}

module.exports = Master;