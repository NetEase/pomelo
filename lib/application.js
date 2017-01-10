/**
 * Pomelo -- proto
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
const _ = require('lodash'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	events = require('./util/events'),
	log = require('./util/log'),
	utils = require('./util/utils'),
	Constants = require('./util/constants'),
	starter = require('./master/starter'),
	path = require('path'),
	fs = require('fs'),
	async = require('async'),
	appManager = require('./common/manager/appManager'),
	EventEmitter = require('events').EventEmitter;

/**
 * application states
 */
const STATE_INITED = 1;  // app has inited
const STATE_START = 2;  // app start
const STATE_STARTED = 3;  // app has started
const STATE_STOPED = 4;  // app has stoped

const application = {};

/**
 *  Initialize the server.
 *  - setup default configuration
 * @param opts
 */
application.init = function(opts)
{
	opts = opts || {};
	application.loaded = [];       // loaded component list
	application.components = {};   // name -> component map
	application.settings = {};     // collection keep set/get

	const base = opts.base || path.dirname(require.main.filename);
	application.set(Constants.RESERVED.BASE, base, true);
	application.event = new EventEmitter(); // event object to sub/pub events

	// current server info
	application.serverId = null;   // current server id
	application.serverType = null; // current server type
	application.curServer = null;  // current server info
	application.startTime = null; // current server start time

	// global server infos
	application.master = null;         // master server info
	application.servers = {};          // current global server info maps, id -> info
	application.serverTypeMaps = {};   // current global type maps, type -> [info]
	application.serverTypes = [];      // current global server type list
	application.lifecycleCbs = {};     // current server custom lifecycle callbacks
	application.clusterSeq = {};       // cluster id seqence

	ApplicationUtility.DefaultConfiguration(application);
	application.state = STATE_INITED;
	logger.info(`application inited: ${application.getServerId()}`);
};

/**
 * Get application base path
 *
 *  // cwd: /home/game/
 *  pomelo start
 *  // app.getBase() -> /home/game
 *
 * @return {String} application base path
 *
 * @memberOf application
 */
application.getBase = function()
{
	return application.get(Constants.RESERVED.BASE);
};

/**
 * Override require method in application
 *
 * @param {String} relative path of file
 */
application.require = (path) =>
{
	return require(path.join(application.getBase(), path));
};

/**
 * Configure logger with {$base}/config/log4js.json
 *
 * @param {Object} logger pomelo-logger instance without configuration
 *
 * @memberOf application
 */
application.configureLogger = (logger) =>
{
	if (process.env.POMELO_LOGGER !== 'off')
	{
		const base = application.getBase();
		const env = application.get(Constants.RESERVED.ENV);
		const originPath = path.join(base, Constants.FILEPATH.LOG);
		const presentPath = path.join(base, Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.LOG));
		const loggerOpts = {
			serverId : application.serverId,
			base     : base
		};
		if (fs.existsSync(originPath))
		{
			logger.configure(originPath, loggerOpts);
		}
		else if (fs.existsSync(presentPath))
		{
			logger.configure(presentPath, loggerOpts);
		}
		else
		{
			logger.error('logger file path configuration is error.');
		}
	}
};

/**
 * add a filter to before and after filter
 *
 * @param {Object} filter provide before and after filter method.
 *                        A filter should have two methods: before and after.
 * @memberOf application
 */
application.filter = (filter) =>
{
	application.before(filter);
	application.after(filter);
};

/**
 * Add before filter.
 * @param {Object|Function} beforeFilter before filter, bf(msg, session, next)
 */
application.before = beforeFilter =>
{
	ApplicationUtility.AddFilter(application, Constants.KEYWORDS.BEFORE_FILTER, beforeFilter);
};

/**
 * Add after filter.
 *
 * @param {Object|Function} afterFilter after filter, `af(err, msg, session, resp, next)`
 * @memberOf application
 */
application.after = afterFilter =>
{
	ApplicationUtility.AddFilter(application, Constants.KEYWORDS.AFTER_FILTER, afterFilter);
};

/**
 * add a global filter to before and after global filter
 *
 * @param {Object} globalFilter provide before and after filter method.
 *                        A filter should have two methods: globalBefore and globalAfter.
 * @memberOf application
 */
application.globalFilter = globalFilter =>
{
	application.globalBefore(globalFilter);
	application.globalAfter(globalFilter);
};

/**
 * Add global before filter.
 *
 * @param {Object|Function} globalBeforeFilter global before filter, globalBeforeFilter(msg, session, next)
 * @memberOf application
 */
application.globalBefore = globalBeforeFilter =>
{
	ApplicationUtility.AddFilter(application, Constants.KEYWORDS.GLOBAL_BEFORE_FILTER, globalBeforeFilter);
};

/**
 * Add global after filter.
 *
 * @param {Object|Function} globalAfterFilter after filter, `globalAfterFilter(err, msg, session, resp, next)`
 * @memberOf application
 */
application.globalAfter = globalAfterFilter =>
{
	ApplicationUtility.AddFilter(application, Constants.KEYWORDS.GLOBAL_AFTER_FILTER, globalAfterFilter);
};

/**
 * add a rpc filter to before and after rpc filter
 *
 * @param {Object | Function} filter provide before and after filter method.
 *                        A filter should have two methods: rpcBefore and rpcAfter.
 * @memberOf application
 */
application.rpcFilter = filter =>
{
	application.rpcBefore(filter);
	application.rpcAfter(filter);
};

/**
 * Add rpc before filter.
 *
 * @param {Object|Function} rpcBeforeFilter: rpc before filter, rpcBeforeFilter(serverId, msg, opts, next)
 * @memberOf application
 */
application.rpcBefore = rpcBeforeFilter =>
{
	ApplicationUtility.AddFilter(application, Constants.KEYWORDS.RPC_BEFORE_FILTER, rpcBeforeFilter);
};

/**
 * Add rpc after filter.
 *
 * @param {Object|Function} rpcAfterFilter: rpc after filter, `rpcAfterFilter(serverId, msg, opts, next)`
 * @memberOf application
 */
application.rpcAfter = rpcAfterFilter =>
{
	ApplicationUtility.AddFilter(application, Constants.KEYWORDS.RPC_AFTER_FILTER, rpcAfterFilter);
};

/**
 * Load component 添加一个 component
 * @param  {String} fileName (optional) name of the component
 * @param  {Object|Function} componentModule component instance or factory function of the component (单例 或者是 工厂模式的方法)
 * @param {*} opts (optional) construct parameters for the factory function
 * @returns {{}}
 */
application.load = (fileName, componentModule, opts) =>
{
	if (!_.isString(fileName))
	{
		opts = componentModule;
		componentModule = fileName;
		fileName = null;
		if (_.isString(componentModule.name) && !_.isFunction(componentModule))
		{
			fileName = componentModule.name;
		}
	}
	let component = null;
	if (_.isFunction(componentModule))
	{
		component = componentModule(application, opts);
	}
	else
	{
		component = componentModule;
	}

	if (!fileName && _.isString(component.name))
	{
		fileName = component.name;
	}

	if (fileName && application.components[fileName])
	{
		// ignore duplicat component
		logger.warn('ignore duplicate component: %j', fileName);
		return;
	}

	application.loaded.push(component);
	if (fileName)
	{
		// components with a name would get by name throught app.components later.
		application.components[fileName] = component;
	}

	return application;
};

/**
 * Load Configure json file to settings.(support different enviroment directory & compatible for old path)
 *
 * @param {String} key environment key
 * @param {String} val environment value
 * @param {Boolean} reload whether reload after change default false
 * @return {Server|Mixed} for chaining, or the setting value
 * @memberOf application
 */
application.loadConfigBaseApp = (key, val, reload = null) =>
{
	const env = application.get(Constants.RESERVED.ENV);
	const originPath = path.join(application.getBase(), val);
	const presentPath = path.join(application.getBase(), Constants.FILEPATH.CONFIG_DIR, env, path.basename(val));
	let realPath;
	if (fs.existsSync(originPath))
	{
		realPath = originPath;
		let file = require(originPath);
		if (file[env])
		{
			file = file[env];
		}
		application.set(key, file);
	}
	else if (fs.existsSync(presentPath))
	{
		realPath = presentPath;
		const pFile = require(presentPath);
		application.set(key, pFile);
	}
	else
	{
		logger.error('invalid configuration with file path: %s', key);
	}

	if (realPath && reload)
	{
		fs.watch(realPath, (event, filename) =>
		{
			if (event === 'change')
			{
				delete require.cache[require.resolve(realPath)];
				application.loadConfigBaseApp(key, val);
			}
		});
	}
};

/**
 * Load Configure json file to settings.
 *
 * @param {String} key environment key
 * @param {String} val environment value
 * @return {Server|Mixed} for chaining, or the setting value
 * @memberOf application
 */
application.loadConfig = (key, val) =>
{
	const env = application.get(Constants.RESERVED.ENV);
	val = require(val);
	if (val[env])
	{
		val = val[env];
	}
	application.set(key, val);
};

/**
 * Set the route function for the specified server type.
 *
 * Examples:
 *
 *  app.route('area', routeFunc);
 *
 *  var routeFunc = function(session, msg, app, cb) {
 *    // all request to area would be route to the first area server
 *    var areas = app.getServersByType('area');
 *    cb(null, areas[0].id);
 *  };
 *
 * @param  {String} serverType server type string
 * @param  {Function} routeFunc  route function. routeFunc(session, msg, app, cb)
 * @return {Object}     current application instance for chain invoking
 * @memberOf application
 */
application.route = function(serverType, routeFunc)
{
	let routes = application.get(Constants.KEYWORDS.ROUTE);
	if (!routes)
	{
		routes = {};
		application.set(Constants.KEYWORDS.ROUTE, routes);
	}
	routes[serverType] = routeFunc;
	return application;
};

/**
 * Set before stop function. It would perform before servers stop.
 *
 * @param  {Function} fun before close function
 * @return {Void}
 * @memberOf application
 */
application.beforeStopHook = (fun) =>
{
	if (_.isFunction(fun))
	{
		application.set(Constants.KEYWORDS.BEFORE_STOP_HOOK, fun);
	}
};

/**
 * Start application. It would load the default components and start all the loaded components.
 *
 * @param  {Function} callBack callback function
 * @memberOf application
 */
application.start = function(callBack)
{
	application.startTime = Date.now();
	if (application.state > STATE_INITED)
	{
		utils.invokeCallback(callBack, new Error('application has already start.'));
		return;
	}
	ApplicationUtility.StartByType(application, () =>
	{
		ApplicationUtility.LoadDefaultComponents(application);
		const startUp = () =>
		{
			ApplicationUtility.OptComponents(application.loaded, Constants.RESERVED.START, (err) =>
			{
				application.state = STATE_START;
				if (err)
				{
					utils.invokeCallback(callBack, err);
				}
				else
				{
					logger.info('%j enter after start...', application.getServerId());
					application.afterStart(callBack);
				}
			});
		};
		const beforeFun = application.lifecycleCbs[Constants.LIFECYCLE.BEFORE_STARTUP];
		if (_.isFunction(beforeFun))
		{
			// utils.invokeCallback(beforeFun, application, startUp);
			beforeFun(application, startUp);
		}
		else
		{
			startUp();
		}
	});
};

/**
 * Lifecycle callback for after start.
 *
 * @param  {Function} callback callback function
 * @return {Void}
 */
application.afterStart = function(callback)
{
	if (application.state !== STATE_START)
	{
		utils.invokeCallback(callback, new Error('application is not running now.'));
		return;
	}

	const afterFun = application.lifecycleCbs[Constants.LIFECYCLE.AFTER_STARTUP];
	ApplicationUtility.OptComponents(application.loaded, Constants.RESERVED.AFTER_START, (err) =>
	{
		application.state = STATE_STARTED;
		const serverId = application.getServerId();
		if (!err)
		{
			logger.info('%j finish start', serverId);
		}
		if (_.isFunction(afterFun))
		{
			afterFun(application, () =>
			{
				utils.invokeCallback(callback, err);
			});
		}
		else
		{
			utils.invokeCallback(callback, err);
		}
		const usedTime = Date.now() - application.startTime;
		logger.info('%j startup in %s ms', serverId, usedTime);
		application.event.emit(events.START_SERVER, serverId);
	});
};

/**
 * Stop components.
 *
 * @param  {Boolean} force whether stop the app immediately
 */
application.stop = (force) =>
{
	if (application.state > STATE_STARTED)
	{
		logger.warn('[pomelo application] application is not running now.');
		return;
	}
	application.state = STATE_STOPED;
	application.stopTimer = setTimeout(() =>
	{
		process.exit(0);
	}, Constants.TIME.TIME_WAIT_STOP);

	const cancelShutDownTimer = () =>
	{
		if (application.stopTimer)
		{
			clearTimeout(application.stopTimer);
		}
	};
	const shutDown = () =>
	{
		ApplicationUtility.StopComps(application.loaded, 0, force, () =>
		{
			cancelShutDownTimer();
			if (force)
			{
				process.exit(0);
			}
		});
	};
	const beforeStopFun = application.get(Constants.KEYWORDS.BEFORE_STOP_HOOK);
	const stopFun = application.lifecycleCbs[Constants.LIFECYCLE.BEFORE_SHUTDOWN];
	if (_.isFunction(stopFun))
	{
		utils.invokeCallback(stopFun, application, shutDown, cancelShutDownTimer);
	}
	else if (_.isFunction(beforeStopFun))
	{
		utils.invokeCallback(beforeStopFun, application, shutDown, cancelShutDownTimer);
	}
	else
	{
		shutDown();
	}
};

/**
 *  Assign `setting` to `val`, or return `setting`'s value.
 * @param  {String}  setting the setting of application
 * @param  {*}  value the setting's value
 * @param {Boolean}  attach whether attach the settings to application
 * @return {Server|Object} for chaining, or the setting value
 */
application.set = function(setting, value = null, attach = false)
{
	if (_.isNil(value) && !attach)
	{
		return application.settings[setting];
	}
	application.settings[setting] = value;
	if (attach)
	{
		application[setting] = value;
	}
	return application;
};

/**
 * Get property from setting
 * @param {String} setting application setting
 * @returns {*} value
 */
application.get = function(setting)
{
	return application.settings[setting];
};

/**
 * Check if `setting` is enabled.
 *
 * @param {String} setting application setting
 * @return {Boolean}
 * @memberOf application
 */
application.enabled = function(setting)
{
	const result = application.get(setting);
	return _.isNil(result) ? false : result;
};

/**
 * Check if `setting` is disabled.
 *
 * @param {String} setting application setting
 * @return {Boolean}
 * @memberOf application
 */
application.disabled = function(setting)
{
	return !application.get(setting);
};

/**
 *  Enable `setting`.
 * @param {String} setting application setting
 * @returns {Server|Object}
 */
application.enable = function(setting)
{
	return application.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting application setting
 * @return {Server|Object} for chaining
 * @memberOf application
 */
application.disable = function(setting)
{
	return application.set(setting, false);
};

/**
 * Configure callback for the specified env and server type.
 * When no env is specified that callback will
 * be invoked for all environments and when no type is specified
 * that callback will be invoked for all server types.
 *
 * Examples:
 *
 *  app.configure(function(){
 *    // executed for all envs and server types
 *  });
 *
 *  app.configure('development', function(){
 *    // executed development env
 *  });
 *
 *  app.configure('development', 'connector', function(){
 *    // executed for development env and connector server type
 *  });
 *
 * @param {String} env application environment
 * @param {String} type server type
 * @param {Function} fn callback function
 * @return {Object} for chaining
 * @memberOf application
 */
application.configure = function(env, type, fn)
{
	const args = Array.from(arguments);
	fn = args.pop();
	env = type = Constants.RESERVED.ALL;

	if (args.length > 0)
	{
		env = args[0];
	}
	if (args.length > 1)
	{
		type = args[1];
	}

	if (env === Constants.RESERVED.ALL || ApplicationUtility.Contains(application.settings.env, env))
	{
		if (type === Constants.RESERVED.ALL || ApplicationUtility.Contains(application.settings.serverType, type))
		{
			fn.call(application);
		}
	}
	return application;
};

/**
 * Register admin modules. Admin modules is the extends point of the monitor system.
 *
 * @param {String} moduleId (optional) module id or provoided by module.moduleId
 * @param {Object} module module object or factory function for module
 * @param {Object} opts construct parameter for module
 * @memberOf application
 */
application.registerAdmin = function(moduleId, module = null, opts = null)
{
	let modules = application.get(Constants.KEYWORDS.MODULE);
	if (!modules)
	{
		modules = {};
		application.set(Constants.KEYWORDS.MODULE, modules);
	}

	if (!_.isString(moduleId))
	{
		opts = module;
		module = moduleId;
		if (module)
		{
			moduleId = module.moduleId;
		}
	}

	if (!moduleId)
	{
		return;
	}

	modules[moduleId] = {
		moduleId : moduleId,
		module   : module,
		opts     : opts
	};
};

/**
 * Use plugin.
 *
 * @param  {Object} plugin plugin instance
 * @param  {[type]} opts    (optional) construct parameters for the factory function
 * @memberOf application
 */
application.use = function(plugin, opts)
{
	if (!plugin.components)
	{
		logger.error('invalid components, no components exist');
		return;
	}

	opts = opts || {};
	const dir = path.dirname(plugin.components);

	if (!fs.existsSync(plugin.components))
	{
		logger.error('fail to find components, find path: %s', plugin.components);
		return;
	}

	const readFiles = fs.readdirSync(plugin.components);
	_.forEach(readFiles, filename =>
	{
		if (!/\.js$/.test(filename))
		{
			return;
		}
		const jsName = path.basename(filename, '.js');
		const param = opts[jsName] || {};
		const absolutePath = path.join(dir, Constants.DIR.COMPONENT, filename);
		if (!fs.existsSync(absolutePath))
		{
			logger.error('component %s not exist at %s', jsName, absolutePath);
		}
		else
		{
			application.load(require(absolutePath), param);
		}
	});

	// load events
	if (!plugin.events)
	{
		return;
	}
	if (!fs.existsSync(plugin.events))
	{
		logger.error('fail to find events, find path: %s', plugin.events);
		return;
	}

	fs.readdirSync(plugin.events).forEach((filename) =>
	{
		if (!/\.js$/.test(filename))
		{
			return;
		}
		const absolutePath = path.join(dir, Constants.DIR.EVENT, filename);
		if (!fs.existsSync(absolutePath))
		{
			logger.error('events %s not exist at %s', filename, absolutePath);
		}
		else
		{
			ApplicationUtility.BindEvents(require(absolutePath), application);
		}
	});
};

/**
 * application transaction. Transcation includes conditions and handlers, if conditions are satisfied, handlers would be executed.
 * And you can set retry times to execute handlers. The transaction log is in file logs/transaction.log.
 *
 * @param {String} name transaction name
 * @param {Object} conditions functions which are called before transaction
 * @param {Object} handlers functions which are called during transaction
 * @param {Number} retry retry times to execute handlers if conditions are successfully executed
 * @memberOf application
 */
application.transaction = function(name, conditions, handlers, retry)
{
	appManager.transaction(name, conditions, handlers, retry);
};

/**
 * Get master server info.
 *
 * @return {Object} master server info, {id, host, port}
 * @memberOf application
 */
application.getMaster = function()
{
	return application.master;
};

/**
 * Get current server info.
 *
 * @return {Object} current server info, {id, serverType, host, port}
 * @memberOf application
 */
application.getCurServer = function()
{
	return application.curServer;
};

application.getServerId = function()
{
	return application.serverId;
};

/**
 * Get current server id.
 *
 * @return {String|Number} current server id from servers.json
 * @memberOf application
 */
application.getServerId = function()
{
	return application.serverId;
};

/**
 * Get current server type.
 *
 * @return {String|Number} current server type from servers.json
 * @memberOf application
 */
application.getServerType = function()
{
	return application.serverType;
};

/**
 * Get all server infos from servers.json.
 *
 * @return {Object} server info map, key: server id, value: server info
 * @memberOf application
 */
application.getServersFromConfig = function()
{
	return application.get(Constants.KEYWORDS.SERVER_MAP);
};

/**
 * Get all the server type.
 *
 * @return {Array} server type list
 * @memberOf application
 */
application.getServerTypes = function()
{
	return application.serverTypes;
};

/**
 * Get server info by server id from current server cluster.
 *
 * @param  {String} serverId server id
 * @return {Object} server info or undefined
 * @memberOf application
 */
application.getServerById = function(serverId)
{
	return application.servers[serverId];
};

/**
 * Get server info by server id from servers.json.
 *
 * @param  {String} serverId server id
 * @return {Object} server info or undefined
 * @memberOf application
 */

application.getServerFromConfig = function(serverId)
{
	return application.get(Constants.KEYWORDS.SERVER_MAP)[serverId];
};
/**
 * Get all the current server infos.
 *
 * @return {Object} server info map, key: server id, value: server info
 * @memberOf application
 */
application.getServers = function()
{
	return application.servers;
};

/**
 * Get server infos by server type.
 *
 * @param  {String} serverType server type
 * @return {Array}      server info list
 * @memberOf application
 */
application.getServersByType = function(serverType)
{
	return application.serverTypeMaps[serverType];
};

/**
 * Check the server whether is a frontend server
 *
 * @param  {server}  server server info. it would check current server
 *            if server not specified
 * @return {Boolean}
 *
 * @memberOf application
 */
application.isFrontend = function(server)
{
	server = server || application.getCurServer();
	return server && server.frontend === 'true';
};

/**
 * Check the server whether is a backend server
 *
 * @param  {server}  server server info. it would check current server
 *            if server not specified
 * @return {Boolean}
 * @memberOf application
 */
application.isBackend = function(server)
{
	server = server || application.getCurServer();
	return server && !server.frontend;
};

/**
 * Check whether current server is a master server
 *
 * @return {Boolean}
 * @memberOf application
 */
application.isMaster = function()
{
	return application.serverType === Constants.RESERVED.MASTER;
};

/**
 * Add new server info to current application in runtime.
 *
 * @param {Array} servers new server info list
 * @memberOf application
 */
application.addServers = function(servers)
{
	if (!servers || !servers.length)
	{
		return;
	}

	_.forEach(servers, (server, serverId) =>
	{
		// update global server map
		application.servers[server.id] = server;
		// update global server type map
		let serverList = application.serverTypeMaps[server.serverType];
		if (!serverList)
		{
			application.serverTypeMaps[server.serverType] = serverList = [];
		}
		ApplicationUtility.ReplaceServer(serverList, server);

		// update global server type list
		if (!_.includes(application.serverTypes, server.serverType))
		{
			application.serverTypes.push(server.serverType);
		}
	});
	application.event.emit(events.ADD_SERVERS, servers);
};

/**
 * Remove server info from current application at runtime.
 *
 * @param  {Array} ids server id list
 * @memberOf application
 */
application.removeServers = function(ids)
{
	if (!ids || !ids.length)
	{
		return;
	}

	_.forEach(ids, id =>
	{
		const item = application.servers[id];
		if (item)
		{
			// clean global server map
			delete application.servers[id];

			// clean global server type map
			const serverList = application.serverTypeMaps[item.serverType];
			ApplicationUtility.RemoveServer(serverList, id);
			// TODO: should remove the server type if the slist is empty?
		}
	});
	application.event.emit(events.REMOVE_SERVERS, ids);
};

/**
 * Replace server info from current application at runtime.
 *
 * @param  {Object} servers id map
 * @memberOf application
 */
application.replaceServers = function(servers)
{
	if (!servers)
	{
		return;
	}

	application.servers = servers;
	application.serverTypeMaps = {};
	application.serverTypes = [];
	const serverArray = [];
	_.forEach(servers, (server, serverId) =>
	{
		const serverType = server[Constants.RESERVED.SERVER_TYPE];
		const serverList = application.serverTypeMaps[serverType];
		if (!serverList)
		{
			application.serverTypeMaps[serverType] = [];
		}
		application.serverTypeMaps[serverType].push(server);
		// update global server type list
		if (!_.includes(application.serverTypes, serverType))
		{
			application.serverTypes.push(serverType);
		}
		serverArray.push(server);
	});
	application.event.emit(events.REPLACE_SERVERS, serverArray);
};

/**
 * Add crons from current application at runtime.
 *
 * @param  {Array} crons new crons would be added in application
 * @memberOf application
 */
application.addCrons = function(crons)
{
	if (!crons || !crons.length)
	{
		logger.warn('crons is not defined.');
		return;
	}
	application.event.emit(events.ADD_CRONS, crons);
};

/**
 * Remove crons from current application at runtime.
 *
 * @param  {Array} crons old crons would be removed in application
 * @memberOf application
 */
application.removeCrons = crons =>
{
	if (!crons || !crons.length)
	{
		logger.warn('ids is not defined.');
		return;
	}
	application.event.emit(events.REMOVE_CRONS, crons);
};

class ApplicationUtility
{

	static ReplaceServer(sList, serverInfo)
	{
		const l = sList.length;
		for (let i = 0; i < l; i++)
		{
			if (sList[i].id === serverInfo.id)
			{
				sList[i] = serverInfo;
				return;
			}
		}
		sList.push(serverInfo);
	}

	static RemoveServer(sList, id)
	{

		if (!sList || !sList.length)
		{
			return;
		}
		const l = sList.length;
		for (let i = 0; i < l; i++)
		{
			if (sList[i].id === id)
			{
				sList.splice(i, 1);
				return;
			}
		}
	}

	static DefaultConfiguration(app)
	{
		const args = ApplicationUtility.ParseArgs(process.argv);
		ApplicationUtility.SetupEnv(app, args);
		ApplicationUtility.LoadMaster(app);
		ApplicationUtility.LoadServers(app);
		ApplicationUtility.ProcessArgs(app, args);
		ApplicationUtility.ConfigLogger(app);
		ApplicationUtility.LoadLifecycle(app);
	}

	/**
	 * Stop components.
	 * @param {Array}  comps component list
	 * @param {Number}   index current component index
	 * @param {Boolean}  force whether stop component immediately
	 * @param {Function} callBack
	 * @constructor
	 */
	static StopComps(comps, index, force, callBack)
	{
		if (index >= comps.length)
		{
			utils.invokeCallback(callBack);
			return;
		}
		const comp = comps[index];
		if (_.isFunction(comp.stop))
		{
			comp.stop(force, () =>
			{
				// ignore any error
				ApplicationUtility.StopComps(comps, index + 1, force, callBack);
			});
		}
		else
		{
			ApplicationUtility.StopComps(comps, index + 1, force, callBack);
		}
	}

	static SetupEnv(app, args)
	{
		app.set(Constants.RESERVED.ENV, args.env || process.env.NODE_ENV || Constants.RESERVED.ENV_DEV, true);
	}

	static LoadServers(app)
	{
		app.loadConfigBaseApp(Constants.RESERVED.SERVERS, Constants.FILEPATH.SERVER);
		const servers = app.get(Constants.RESERVED.SERVERS);
		const serverMap = {};
		_.forEach(servers, (serverList, serverType) =>
		{
			_.forEach(serverList, server =>
			{
				server.serverType = serverType;
				if (server[Constants.RESERVED.CLUSTER_COUNT])
				{
					utils.loadCluster(app, server, serverMap);
				}
				else
				{
					serverMap[server.id] = server;
					if (server.wsPort)
					{
						logger.warn('wsPort is deprecated, use clientPort in frontend server instead, server: %j', server);
					}
				}
			});
		});
		app.set(Constants.KEYWORDS.SERVER_MAP, serverMap);
	}

	static LoadMaster(app)
	{
		app.loadConfigBaseApp(Constants.RESERVED.MASTER, Constants.FILEPATH.MASTER);
		app.master = app.get(Constants.RESERVED.MASTER);
	}

	static ProcessArgs(app, args)
	{
		const serverType = args.serverType || Constants.RESERVED.MASTER;
		const serverId = args.id || app.getMaster().id;
		const mode = args.mode || Constants.RESERVED.CLUSTER;
		const masterha = args.masterha || 'false';
		const type = args.type || Constants.RESERVED.ALL;
		const startId = args.startId;

		app.set(Constants.RESERVED.MAIN, args.main, true);
		app.set(Constants.RESERVED.SERVER_TYPE, serverType, true);
		app.set(Constants.RESERVED.SERVER_ID, serverId, true);
		app.set(Constants.RESERVED.MODE, mode, true);
		app.set(Constants.RESERVED.TYPE, type, true);
		if (startId)
		{
			app.set(Constants.RESERVED.STARTID, startId, true);
		}

		if (masterha === 'true')
		{
			app.master = args;
			app.set(Constants.RESERVED.CURRENT_SERVER, args, true);
		}
		else if (serverType !== Constants.RESERVED.MASTER)
		{
			app.set(Constants.RESERVED.CURRENT_SERVER, args, true);
		}
		else
		{
			app.set(Constants.RESERVED.CURRENT_SERVER, app.getMaster(), true);
		}
	}

	static ConfigLogger(app)
	{
		if (process.env.POMELO_LOGGER !== 'off')
		{
			const env = app.get(Constants.RESERVED.ENV);
			const originPath = path.join(app.getBase(), Constants.FILEPATH.LOG);
			const presentPath = path.join(app.getBase(), Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.LOG));
			if (fs.existsSync(originPath))
			{
				log.configure(app, originPath);
			}
			else if (fs.existsSync(presentPath))
			{
				log.configure(app, presentPath);
			}
			else
			{
				logger.error('logger file path configuration is error.');
			}
		}
	}

	static LoadLifecycle(app)
	{
		const filePath = path.join(app.getBase(), Constants.FILEPATH.SERVER_DIR, app.serverType, Constants.FILEPATH.LIFECYCLE);
		if (!fs.existsSync(filePath))
		{
			return;
		}
		const lifecycle = require(filePath);
		// todo : 待验证 for in 循环修改为 for each
		_.forEach(lifecycle, (lifeFunction, key) =>
		{
			if (_.isFunction(lifeFunction))
			{
				app.lifecycleCbs[key] = lifeFunction;
			}
			else
			{
				logger.warn('lifecycle.js in %s is error format.', filePath);
			}
		});
	}

	/**
	 * Start servers by type.
	 */
	static StartByType(app, callback)
	{
		if (!_.isNil(app.startId))
		{
			if (app.startId === Constants.RESERVED.MASTER)
			{
				utils.invokeCallback(callback);
			}
			else
			{
				starter.runServers(app);
			}
		}
		else
		{
			if (app.type && app.type !== Constants.RESERVED.ALL && app.type !== Constants.RESERVED.MASTER)
			{
				starter.runServers(app);
			}
			else
			{
				utils.invokeCallback(callback);
			}
		}
	}

	static LoadDefaultComponents(app)
	{
		const pomelo = require('./pomelo');
		// load system default components
		if (app.serverType === Constants.RESERVED.MASTER)
		{
			app.load(pomelo.master, app.get('masterConfig'));
		}
		else
		{
			app.load(pomelo.proxy, app.get('proxyConfig'));
			if (app.getCurServer().port)
			{
				app.load(pomelo.remote, app.get('remoteConfig'));
			}
			if (app.isFrontend())
			{
				app.load(pomelo.connection, app.get('connectionConfig'));
				app.load(pomelo.connector, app.get('connectorConfig'));
				app.load(pomelo.session, app.get('sessionConfig'));
				// compatible for schedulerConfig
				if (app.get('schedulerConfig'))
				{
					app.load(pomelo.pushScheduler, app.get('schedulerConfig'));
				}
				else
				{
					app.load(pomelo.pushScheduler, app.get('pushSchedulerConfig'));
				}
			}

			app.load(pomelo.backendSession, app.get('backendSessionConfig'));
			app.load(pomelo.channel, app.get('channelConfig'));
			app.load(pomelo.server, app.get('serverConfig'));
		}

		app.load(pomelo.monitor, app.get('monitorConfig'));
	}

	/**
	 *  Apply command to loaded components.
	 *  This method would invoke the component {method} in series.
	 *  Any component {method} return err, it would return err directly.
	 *
	 * @param {Array} comps loaded component list
	 * @param {String} method component lifecycle method name, such as: start, stop
	 * @param {Function} callBack
	 * @constructor
	 */
	static OptComponents(comps, method, callBack)
	{
		let i = 0;
		async.forEachSeries(comps, (comp, done) =>
		{
			i++;
			if (_.isFunction(comp[method]))
			{
				comp[method](done);
			}
			else
			{
				done();
			}
		}, (err) =>
		{
			if (err)
			{
				if (_.isString(err))
				{
					logger.error('fail to operate component, method: %s, err: %j', method, err);
				}
				else
				{
					logger.error('fail to operate component, method: %s, err: %j', method, err.stack);
				}
			}
			utils.invokeCallback(callBack, err);
		});
	}

	/**
	 * Parse command line arguments.
	 *
	 * @param args command line arguments
	 *
	 * @return Object argsMap map of arguments
	 */
	static ParseArgs(args)
	{
		const argsMap = {};

		let mainPos = 1;
		while (args[mainPos].indexOf('--') > 0)
		{
			mainPos++;
		}
		argsMap.main = args[mainPos];

		for (let i = (mainPos + 1); i < args.length; i++)
		{
			const arg = args[i];
			const sep = arg.indexOf('=');
			const key = arg.slice(0, sep);
			let value = arg.slice(sep + 1);
			if (!isNaN(Number(value)) && (value.indexOf('.') < 0))
			{
				value = Number(value);
			}
			argsMap[key] = value;
		}
		return argsMap;
	}

	static AddFilter(app, type, filter)
	{
		let filters = app.get(type);
		if (!filters)
		{
			filters = [];
			app.set(type, filters);
		}
		filters.push(filter);
	}

	static Contains(str, settings)
	{
		if (!settings)
		{
			return false;
		}
		const ts = settings.split('|');
		return _.includes(ts, str);
	}

	static BindEvents(Event, app)
	{
		const methods = new Event(app);
		_.forEach(methods, (method, eventName) =>
		{
			if (_.isFunction(method))
			{
				app.event.on(eventName, method.bind(methods));
			}
		});
	}

}

module.exports = application;