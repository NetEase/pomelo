/**
 * Component for monitor.
 * Load and start monitor client.
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const admin = require('pomelo-admin');
const moduleUtil = require('../util/moduleUtil');
const Constants = require('../util/constants');

class Monitor
{
	constructor(app, opts)
    {
		opts = opts || {};
		this.app = app;
		this.serverInfo = app.CurServer;
		this.masterInfo = app.Master;
		this.modules = [];
		this.closeWatcher = opts.closeWatcher;

		this.monitorConsole = admin.createMonitorConsole({
			id         : this.serverInfo.id,
			type       : this.app.ServerType,
			host       : this.masterInfo.host,
			port       : this.masterInfo.port,
			info       : this.serverInfo,
			env        : this.app.get(Constants.RESERVED.ENV),
			authServer : app.get('adminAuthServerMonitor') // auth server function
		});
	}

	start(cb)
    {
		moduleUtil.registerDefaultModules(false, this.app, this.closeWatcher);
		this.startConsole(cb);
	}

	startConsole(cb)
    {
        const utils = require('../util/utils');
		moduleUtil.loadModules(this, this.monitorConsole);
		const self = this;
		this.monitorConsole.start(function(err)
        {
			if (err)
            {
				utils.invokeCallback(cb, err);
				return;
			}
			moduleUtil.startModules(self.modules, function(err)
            {
				utils.invokeCallback(cb, err);
				return;
			});
		});

		this.monitorConsole.on('error', function(err)
        {
			if (err)
            {
				logger.error('monitorConsole encounters with error: %j', err.stack);
				return;
			}
		});
	}

	stop(cb)
    {
        const utils = require('../util/utils');
		this.monitorConsole.stop();
		this.modules = [];
		process.nextTick(function()
        {
			utils.invokeCallback(cb);
		});
	}

// monitor reconnect to master
	reconnect(masterInfo)
    {
		const self = this;
		this.stop(function()
        {
			self.monitorConsole = admin.createMonitorConsole({
				id   : self.serverInfo.id,
				type : self.app.ServerType,
				host : masterInfo.host,
				port : masterInfo.port,
				info : self.serverInfo,
				env  : self.app.get(Constants.RESERVED.ENV)
			});
			self.startConsole(() =>
            {
				logger.info('restart modules for server : %j finish.', self.app.serverId);
			});
		});
	}
    
}
module.exports = Monitor;