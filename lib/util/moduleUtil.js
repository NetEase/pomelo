const _ = require('lodash'),
	os = require('os'),
	admin = require('pomelo-admin-upgrade'),
	Constants = require('./constants'),
	pathUtil = require('./pathUtil'),
	starter = require('../master/starter'),
	isFunction = _.isFunction,
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class ModuleUtil
{

	/**
	 * Load admin modules
	 */
	static loadModules(parent, consoleService)
	{
		// load app register modules
		const _modules = parent.app.get(Constants.KEYWORDS.MODULE);

		if (!_modules)
		{
			return;
		}

		const modules = _.values(_modules);

		let record, moduleId, module;
		for (let i = 0, l = modules.length; i < l; i++)
		{
			record = modules[i];
			if (isFunction(record.module))
			{
				try
				{
					module = record.module(record.opts, consoleService);
				}
				catch (err)
				{
					module = new record.module(record.opts, consoleService);
				}
			}
			else
			{
				module = record.module;
			}

			moduleId = record.moduleId || module.moduleId;

			if (!moduleId)
			{
				logger.warn('ignore an unknown module.');
				continue;
			}

			consoleService.register(moduleId, module);
			parent.modules.push(module);
		}
	}

	static startModules(modules, cb)
	{
		// invoke the start lifecycle method of modules

		if (!modules)
		{
			return;
		}
		ModuleUtilUtility.startModule(null, modules, 0, cb);
	}

	/**
	 * Append the default system admin modules
	 */
	static registerDefaultModules(isMaster, app, closeWatcher)
	{
		if (!closeWatcher)
		{
			if (isMaster)
			{
				app.registerAdmin(require('../modules/masterwatcher'), {app: app});
			}
			else
			{
				app.registerAdmin(require('../modules/monitorwatcher'), {app: app});
			}
		}
		app.registerAdmin(admin.modules.watchServer, {app: app});
		app.registerAdmin(require('../modules/console'), {
			app     : app,
			starter : starter});
		if (app.enabled('systemMonitor'))
		{
			if (os.platform() !== Constants.PLATFORM.WIN)
			{
				app.registerAdmin(admin.modules.systemInfo);
				app.registerAdmin(admin.modules.nodeInfo);
			}
			app.registerAdmin(admin.modules.monitorLog, {path: pathUtil.getLogPath(app.getBase())});
			app.registerAdmin(admin.modules.scripts, {
				app  : app,
				path : pathUtil.getScriptPath(app.getBase())});
			if (os.platform() !== Constants.PLATFORM.WIN)
			{
				app.registerAdmin(admin.modules.profiler);
			}
		}
	}
}

class ModuleUtilUtility
{
	static startModule(err, modules, index, cb)
	{
		if (err || index >= modules.length)
		{
			// utils.invokeCallback(cb, err);
			cb(err);
			return;
		}

		const module = modules[index];
		if (module && isFunction(module.start))
		{
			module.start(function(err)
			{
				ModuleUtilUtility.startModule(err, modules, index + 1, cb);
			});
		}
		else
		{
			ModuleUtilUtility.startModule(err, modules, index + 1, cb);
		}
	}
}

module.exports = ModuleUtil;