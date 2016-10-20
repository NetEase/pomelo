const starter = require('./starter');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const crashLogger = require('pomelo-logger').getLogger('crash-log', __filename);
const adminLogger = require('pomelo-logger').getLogger('admin-log', __filename);
const admin = require('pomelo-admin');
const util = require('util');
const utils = require('../util/utils');
const moduleUtil = require('../util/moduleUtil');
const Constants = require('../util/constants');

class Master
{
	constructor(app, opts)
    {
		this.app = app;
		this.masterInfo = app.Master;
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

		const self = this;
        // start master console
		this.masterConsole.start( function(err)
        {
			if (err)
            {
				process.exit(0);
			}
			moduleUtil.startModules(self.modules, function(err)
            {
				if (err)
                {
					utils.invokeCallback(cb, err);
					return;
				}

				if (self.app.get(Constants.RESERVED.MODE) !== Constants.RESERVED.STAND_ALONE)
                {
					starter.runServers(self.app);
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
			self.app.addServers([info]);
		});

        // monitor servers disconnect event
		this.masterConsole.on('disconnect', (id, type, info, reason) =>
        {
			crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
			let count = 0;
			const time = 0;
			let pingTimer = null;
			const server = self.app.getServerById(id);
			const stopFlags = self.app.get(Constants.RESERVED.STOP_SERVERS) || [];
			if (Boolean(server) && (server[Constants.RESERVED.AUTO_RESTART] === 'true' ||
                server[Constants.RESERVED.RESTART_FORCE] === 'true') &&
                stopFlags.indexOf(id) < 0)
            {
				const setTimer = time =>
                {
					pingTimer = setTimeout(() =>
                    {
						utils.ping(server.host, flag =>
                        {
							if (flag)
                            {
								handle();
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
				const handle = () =>
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
							starter.run(self.app, server, null);
						}, Constants.TIME.TIME_WAIT_STOP);
					});
				};
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