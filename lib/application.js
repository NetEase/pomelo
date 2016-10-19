/**
 * Pomelo -- proto
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
const utils = require('./util/utils');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const EventEmitter = require('events').EventEmitter;
const events = require('./util/events');
const appUtil = require('./util/appUtil');
const Constants = require('./util/constants');
const appManager = require('./common/manager/appManager');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
// const config = require('./config');

/**
 * Application states
 */
const STATE_INITED = 1;  // app has inited
const STATE_START = 2;  // app start
const STATE_STARTED = 3;  // app has started
const STATE_STOPED = 4;  // app has stoped

/**
 * Application prototype.
 *
 * @module
 */
class Application
{
    /**
     *  Initialize the server.
     *  - setup default configuration
     * @param opts
     */
	constructor(opts)
    {
		opts = opts || {};
		this.loaded = [];       // loaded component list
		this.components = {};   // name -> component map
		this.settings = {};     // collection keep set/get
		const base = opts.base || path.dirname(require.main.filename);
		this.set(Constants.RESERVED.BASE, base, true);
		this.event = new EventEmitter();  // event object to sub/pub events

        // current server info
		this.serverId = null;   // current server id
		this.serverType = null; // current server type
		this.curServer = null;  // current server info
		this.startTime = null; // current server start time

        // global server infos
		this.master = null;         // master server info
		this.servers = {};          // current global server info maps, id -> info
		this.serverTypeMaps = {};   // current global type maps, type -> [info]
		this.serverTypes = [];      // current global server type list
		this.lifecycleCbs = {};     // current server custom lifecycle callbacks
		this.clusterSeq = {};       // cluster id seqence

		appUtil.defaultConfiguration(this);

		this.state = STATE_INITED;
		logger.info('application inited: %j', this.ServerId);
	}

    /**
     * Get application base path
     * cwd: /home/game/
     * pomelo start
     * app.getBase() -> /home/game
     * @returns {String} application base path
     * @memberOf Application
     */
	get Base()
    {
		return this.get(Constants.RESERVED.BASE);
	}

    /**
     * Override require method in application
     * @param {String} ph relative path of file
     * @returns {*}
     * @memberOf Application
     */
	require(ph)
    {
		return require(path.join(this.getBase(), ph));
	}

    /**
     * Configure logger with {$base}/config/log4js.json
     * @param {Object} logger pomelo-logger instance without configuration
     * @memberOf Application
     */
	configureLogger(logger)
    {
		if (process.env.POMELO_LOGGER !== 'off')
        {
			const base = this.getBase();
			const env = this.get(Constants.RESERVED.ENV);
			const originPath = path.join(base, Constants.FILEPATH.LOG);
			const presentPath = path.join(base, Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.LOG));
			if (fs.existsSync(originPath))
			{
				logger.configure(originPath, {
					serverId : this.serverId,
					base     : base
				});
			}
			else if (fs.existsSync(presentPath))
			{
				logger.configure(presentPath, {
					serverId : this.serverId,
					base     : base});
			}
			else
            {
				logger.error('logger file path configuration is error.');
			}
		}
	}

    /**
     * add a filter to before and after filter
     * @param {Object} filter provide before and after filter method.
     *                        A filter should have two methods: before and after.
     * @memberOf Application
     */
	filter(filter)
    {
		this.before(filter);
		this.after(filter);
	}

    /**
     * Add before filter.
     * @param {Object|Function} beforeFilter before fileter, beforeFilter(msg, session, next)
     * @memberOf Application
     */
	before(beforeFilter)
    {
		addFilter(this, Constants.KEYWORDS.BEFORE_FILTER, beforeFilter);
	}

    /**
     * Add after filter.
     * @param {Object|Function} afterFilter after filter, `afterFilter(err, msg, session, resp, next)`
     * @memberOf Application
     */
	after(afterFilter)
    {
		addFilter(this, Constants.KEYWORDS.AFTER_FILTER, afterFilter);
	}

    /**
     * add a global filter to before and after global filter
     * @param {Object} filter provide before and after filter method.
     *                        A filter should have two methods: before and after.
     * @memberOf Application
     */
	globalFilter(filter)
    {
		this.globalBefore(filter);
		this.globalAfter(filter);
	}

    /**
     * Add global before filter.
     * @param {Object|Function} bf before fileter, bf(msg, session, next)
     * @memberOf Application
     */
	globalBefore(bf)
    {
		addFilter(this, Constants.KEYWORDS.GLOBAL_BEFORE_FILTER, bf);
	}

    /**
     * Add global after filter.
     * @param {Object|Function} af after filter, `af(err, msg, session, resp, next)`
     * @memberOf Application
     */
	globalAfter(af)
    {
		addFilter(this, Constants.KEYWORDS.GLOBAL_AFTER_FILTER, af);
	}

    /**
     * Add rpc before filter.
     * @param {Object|Function} bf before fileter, bf(serverId, msg, opts, next)
     * @memberOf Application
     */
	rpcBefore(bf)
    {
		addFilter(this, Constants.KEYWORDS.RPC_BEFORE_FILTER, bf);
	}

    /**
     * Add rpc after filter.
     *
     * @param {Object|Function} af after filter, `af(serverId, msg, opts, next)`
     * @memberOf Application
     */
	rpcAfter(af)
    {
		addFilter(this, Constants.KEYWORDS.RPC_AFTER_FILTER, af);
	}

    /**
     * add a rpc filter to before and after rpc filter
     *
     * @param {Object} filter provide before and after filter method.
     *                        A filter should have two methods: before and after.
     * @memberOf Application
     */
	rpcFilter(filter)
    {
		this.rpcBefore(filter);
		this.rpcAfter(filter);
	}

    /**
     * Load component
     *
     * @param  {String} name    (optional) name of the component
     * @param  {Object} component component instance or factory function of the component
     * @param  {[type]} opts    (optional) construct parameters for the factory function
     * @return {Object}     app instance for chain invoke
     * @memberOf Application
     */
	load(name, component, opts)
    {
		if (!_.isString(name))
        {
			opts = component;
			component = name;
			name = null;
			if (_.isString(component.name))
            {
				name = component.name;
			}
		}

		if (_.isFunction(component))
        {
			component = component(this, opts);
		}

		if (!name && _.isString(component.name))
        {
			name = component.name;
		}

		if (name && this.components[name])
        {
            // ignore duplicat component
			logger.warn('ignore duplicate component: %j', name);
			return;
		}

		this.loaded.push(component);
		if (name)
        {
            // components with a name would get by name throught app.components later.
			this.components[name] = component;
		}

		return this;
	}

    /**
     * Load Configure json file to settings.(support different enviroment directory & compatible for old path)
     *
     * @param {String} key environment key
     * @param {String} val environment value
     * @param {Boolean} reload whether reload after change default false
     * @return {Server|Mixed} for chaining, or the setting value
     * @memberOf Application
     */
	loadConfigBaseApp(key, val, reload)
    {
		const self = this;
		const env = this.get(Constants.RESERVED.ENV);
		const originPath = path.join(this.getBase(), val);
		const presentPath = path.join(this.getBase(), Constants.FILEPATH.CONFIG_DIR, env, path.basename(val));
		let realPath;
		if (fs.existsSync(originPath))
		{
			realPath = originPath;
			let file = require(originPath);
			if (file[env])
			{
				file = file[env];
			}
			this.set(key, file);
		}
		else if (fs.existsSync(presentPath))
		{
			realPath = presentPath;
			const pfile = require(presentPath);
			this.set(key, pfile);
		}
		else
        {
			logger.error('invalid configuration with file path: %s', key);
		}

		if (Boolean(realPath) && Boolean(reload))
		{
			fs.watch(realPath, (event, filename) =>
            {
				if (event === 'change')
				{
					delete require.cache[require.resolve(realPath)];
					self.loadConfigBaseApp(key, val);
				}
			});
		}
	}

    /**
     * Load Configure json file to settings.
     *
     * @param {String} key environment key
     * @param {String} val environment value
     * @return {Server|Mixed} for chaining, or the setting value
     * @memberOf Application
     */
	loadConfig(key, val)
    {
		const env = this.get(Constants.RESERVED.ENV);
		val = require(val);
		if (val[env])
		{
			val = val[env];
		}
		this.set(key, val);
	}

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
     * @memberOf Application
     */
	route(serverType, routeFunc)
    {
		let routes = this.get(Constants.KEYWORDS.ROUTE);
		if (!routes)
		{
			routes = {};
			this.set(Constants.KEYWORDS.ROUTE, routes);
		}
		routes[serverType] = routeFunc;
		return this;
	}

    /**
     * Set before stop function. It would perform before servers stop.
     *
     * @param  {Function} fun before close function
     * @memberOf Application
     */
	beforeStopHook(fun)
    {
		logger.warn('this method was deprecated in pomelo 0.8');
		if (Boolean(fun) && _.isFunction(fun))
		{
			this.set(Constants.KEYWORDS.BEFORE_STOP_HOOK, fun);
		}
	}

    /**
     * Start  It would load the default components and start all the loaded components.
     *
     * @param  {Function} cb callback function
     * @memberOf Application
     */
	start(cb)
    {
		this.startTime = Date.now();
		if (this.state > STATE_INITED)
		{
			utils.invokeCallback(cb, new Error('application has already start.'));
			return;
		}

		const self = this;
		appUtil.startByType(self, () =>
        {
			appUtil.loadDefaultComponents(self);
			const startUp = () =>
            {
				appUtil.optComponents(self.loaded, Constants.RESERVED.START, err =>
                {
					self.state = STATE_START;
					if (err)
					{
						utils.invokeCallback(cb, err);
					}
					else
                    {
						logger.info('%j enter after start...', self.ServerId);
						self.afterStart(cb);
					}
				});
			};
			const beforeFun = self.lifecycleCbs[Constants.LIFECYCLE.BEFORE_STARTUP];
			if (_.isFunction(beforeFun))
			{
				beforeFun(null, self, startUp);
			}
			else
            {
				startUp();
			}
		});
	}

    /**
     * Lifecycle callback for after start.
     *
     * @param  {Function} cb callback function
     * @return {null}
     */
	afterStart(cb)
    {
		if (this.state !== STATE_START)
		{
			utils.invokeCallback(cb, new Error('application is not running now.'));
			return;
		}

		const afterFun = this.lifecycleCbs[Constants.LIFECYCLE.AFTER_STARTUP];
		const self = this;
		appUtil.optComponents(this.loaded, Constants.RESERVED.AFTER_START, err =>
        {
			self.state = STATE_STARTED;
			const id = self.ServerId;
			if (!err)
			{
				logger.info('%j finish start', id);
			}
			if (_.isFunction(afterFun))
			{
				afterFun(null, self, () =>
                {
					utils.invokeCallback(cb, err);
				});
			}
			else
            {
				utils.invokeCallback(cb, err);
			}
			const usedTime = Date.now() - self.startTime;
			logger.info('%j startup in %s ms', id, usedTime);
			self.event.emit(events.START_SERVER, id);
		});
	}

    /**
     * Stop components.
     *
     * @param  {Boolean} force whether stop the app immediately
     */
	stop(force)
    {
		if (this.state > STATE_STARTED)
		{
			logger.warn('[pomelo application] application is not running now.');
			return;
		}
		this.state = STATE_STOPED;
		const self = this;

		this.stopTimer = setTimeout(() =>
        {
			process.exit(0);
		}, Constants.TIME.TIME_WAIT_STOP);

		const cancelShutDownTimer = () =>
        {
			if (_.isFunction(self.stopTimer))
			{
				clearTimeout(self.stopTimer);
			}
		};
		const shutDown = () =>
        {
			appUtil.stopComps(self.loaded, 0, force, function()
            {
				cancelShutDownTimer();
				if (force)
                {
					process.exit(0);
				}
			});
		};
		const fun = this.get(Constants.KEYWORDS.BEFORE_STOP_HOOK);
		const stopFun = this.lifecycleCbs[Constants.LIFECYCLE.BEFORE_SHUTDOWN];
		if (_.isFunction(stopFun))
		{
			stopFun(null, this, shutDown, cancelShutDownTimer);
		}
		else if (_.isFunction(fun))
		{
			utils.invokeCallback(fun, self, shutDown, cancelShutDownTimer);
		}
		else
        {
			shutDown();
		}
	}

    /**
     * Assign `setting` to `val`, or return `setting`'s value.
     *
     * Example:
     *
     *  app.set('key1', 'value1');
     *  app.get('key1');  // 'value1'
     *  app.key1;         // undefined
     *
     *  app.set('key2', 'value2', true);
     *  app.get('key2');  // 'value2'
     *  app.key2;         // 'value2'
     *
     * @param {String} setting the setting of application
     * @param {String} val the setting's value
     * @param {Boolean} attach whether attach the settings to application
     * @param args
     * @return {Server|Mixed} for chaining, or the setting value
     * @memberOf Application
     */
	set(setting, val, attach, ...args)
    {
		if (args.length === 1)
		{
			return this.settings[setting];
		}
		this.settings[setting] = val;
		if (attach)
		{
			this[setting] = val;
		}
		return this;
	}

    /**
     * Get property from setting
     *
     * @param {String} setting application setting
     * @return {String} val
     * @memberOf Application
     */
	get(setting)
    {
		return this.settings[setting];
	}

    /**
     * Check if `setting` is enabled.
     *
     * @param {String} setting application setting
     * @return {Boolean}
     * @memberOf Application
     */
	enabled(setting)
    {
		return Boolean(this.get(setting));
	}

    /**
     * Check if `setting` is disabled.
     *
     * @param {String} setting application setting
     * @return {Boolean}
     * @memberOf Application
     */
	disabled(setting)
    {
		return !this.get(setting);
	}

    /**
     * Enable `setting`.
     *
     * @param {String} setting application setting
     * @return {app} for chaining
     * @memberOf Application
     */
	enable(setting)
    {
		return this.set(setting, true);
	}

    /**
     * Disable `setting`.
     *
     * @param {String} setting application setting
     * @return {app} for chaining
     * @memberOf Application
     */
	disable(setting)
    {
		return this.set(setting, false);
	}

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
     * @param {Function} fn callback function
     * @param {String} type server type
     * @param args
     * @return {Application} for chaining
     * @memberOf Application
     */
	configure(env, type, fn, ...args)
    {
        // todo 有修改,待测试
		// const args = Array.from(arguments);
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

		if (env === Constants.RESERVED.ALL || contains(this.settings.env, env))
		{
			if (type === Constants.RESERVED.ALL || contains(this.settings.serverType, type))
			{
				fn.call(this);
			}
		}
		return this;
	}

    /**
     * Register admin modules. Admin modules is the extends point of the monitor system.
     *
     * @param {String} module (optional) module id or provoided by module.moduleId
     * @param {Object} moduleId module object or factory function for module
     * @param {Object} opts construct parameter for module
     * @memberOf Application
     */
	registerAdmin(moduleId, module, opts)
    {
		let modules = this.get(Constants.KEYWORDS.MODULE);
		if (!modules)
		{
			modules = {};
			this.set(Constants.KEYWORDS.MODULE, modules);
		}

		if (typeof moduleId !== 'string')
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
	}

    /**
     * Use plugin.
     *
     * @param  {Object} plugin plugin instance
     * @param  {[type]} opts    (optional) construct parameters for the factory function
     * @memberOf Application
     */
	use(plugin, opts)
    {
		if (!plugin.components)
		{
			logger.error('invalid components, no components exist');
			return;
		}

		const self = this;
		opts = opts || {};
		const dir = path.dirname(plugin.components);

		if (!fs.existsSync(plugin.components))
		{
			logger.error('fail to find components, find path: %s', plugin.components);
			return;
		}

		fs.readdirSync(plugin.components).forEach(function(filename)
        {
			if (!/\.js$/.test(filename))
            {
				return;
			}
			const name = path.basename(filename, '.js');
			const param = opts[name] || {};
			const absolutePath = path.join(dir, Constants.DIR.COMPONENT, filename);
			if (!fs.existsSync(absolutePath))
            {
				logger.error('component %s not exist at %s', name, absolutePath);
			}
			else
            {
				self.load(require(absolutePath), param);
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
		fs.readdirSync(plugin.events).forEach(function(filename)
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
				bindEvents(require(absolutePath), self);
			}
		});
	}

    /**
     * Application transaction. Transcation includes conditions and handlers, if conditions are satisfied, handlers would be executed.
     * And you can set retry times to execute handlers. The transaction log is in file logs/transaction.log.
     *
     * @param {String} name transaction name
     * @param {Object} conditions functions which are called before transaction
     * @param {Object} handlers functions which are called during transaction
     * @param {Number} retry retry times to execute handlers if conditions are successfully executed
     * @memberOf Application
     */
	transaction(name, conditions, handlers, retry)
    {
		appManager.transaction(name, conditions, handlers, retry);
	}

    /**
     * Get master server info.
     *
     * @return {Object} master server info, {id, host, port}
     * @memberOf Application
     */
	get Master()
    {
		return this.master;
	}

    /**
     * Get current server info.
     *
     * @return {Object} current server info, {id, serverType, host, port}
     * @memberOf Application
     */
	get CurServer()
    {
		return this.curServer;
	}

    /**
     * Get current server id.
     *
     * @return {String|Number} current server id from servers.json
     * @memberOf Application
     */
	get ServerId()
    {
		return this.serverId;
	}

    /**
     * Get current server type.
     *
     * @return {String|Number} current server type from servers.json
     * @memberOf Application
     */
	get ServerType()
    {
		return this.serverType;
	}

    /**
     * Get all the current server infos.
     *
     * @return {Object} server info map, key: server id, value: server info
     * @memberOf Application
     */
	get Servers()
    {
		return this.servers;
	}

    /**
     * Get all server infos from servers.json.
     *
     * @return {Object} server info map, key: server id, value: server info
     * @memberOf Application
     */
	get ServersFromConfig()
    {
		return this.get(Constants.KEYWORDS.SERVER_MAP);
	}

    /**
     * Get all the server type.
     *
     * @return {Array} server type list
     * @memberOf Application
     */
	get ServerTypes()
    {
		return this.serverTypes;
	}

    /**
     * Get server info by server id from current server cluster.
     *
     * @param  {String} serverId server id
     * @return {Object} server info or undefined
     * @memberOf Application
     */
	getServerById(serverId)
    {
		return this.servers[serverId];
	}

    /**
     * Get server info by server id from servers.json.
     *
     * @param  {String} serverId server id
     * @return {Object} server info or undefined
     * @memberOf Application
     */

	getServerFromConfig(serverId)
    {
		return this.get(Constants.KEYWORDS.SERVER_MAP)[serverId];
	}

    /**
     * Get server infos by server type.
     *
     * @param  {String} serverType server type
     * @return {Array}      server info list
     * @memberOf Application
     */
	getServersByType(serverType)
    {
		return this.serverTypeMaps[serverType];
	}

    /**
     * Check the server whether is a frontend server
     *
     * @param  {server}  server server info. it would check current server
     *            if server not specified
     * @return {Boolean}
     *
     * @memberOf Application
     */
	isFrontend(server)
    {
		server = server || this.getCurServer();
		return Boolean(server) && server.frontend === 'true';
	}

    /**
     * Check the server whether is a backend server
     *
     * @param  {server}  server server info. it would check current server
     *            if server not specified
     * @return {Boolean}
     * @memberOf Application
     */
	isBackend(server)
    {
		server = server || this.getCurServer();
		return Boolean(server) && !server.frontend;
	}

    /**
     * Check whether current server is a master server
     *
     * @return {Boolean}
     * @memberOf Application
     */
	get isMaster()
    {
		return this.serverType === Constants.RESERVED.MASTER;
	}

    /**
     * Add new server info to current application in runtime.
     *
     * @param {Array} servers new server info list
     * @memberOf Application
     */
	addServers(servers)
    {
		if (!servers || !servers.length)
		{
			return;
		}

		let item, slist;
		for (let i = 0, l = servers.length; i < l; i++)
		{
			item = servers[i];
            // update global server map
			this.servers[item.id] = item;

            // update global server type map
			slist = this.serverTypeMaps[item.serverType];
			if (!slist)
			{
				this.serverTypeMaps[item.serverType] = slist = [];
			}
			replaceServer(slist, item);

            // update global server type list
			if (this.serverTypes.indexOf(item.serverType) < 0)
			{
				this.serverTypes.push(item.serverType);
			}
		}
		this.event.emit(events.ADD_SERVERS, servers);
	}

    /**
     * Remove server info from current application at runtime.
     *
     * @param  {Array} ids server id list
     * @memberOf Application
     */
	removeServers(ids)
    {
		if (!ids || !ids.length)
		{
			return;
		}

		let id, item, slist;
		for (let i = 0, l = ids.length; i < l; i++)
		{
			id = ids[i];
			item = this.servers[id];
			if (!item)
			{
				continue;
			}
            // clean global server map
			delete this.servers[id];

            // clean global server type map
			slist = this.serverTypeMaps[item.serverType];
			removeServer(slist, id);
            // TODO: should remove the server type if the slist is empty?
		}
		this.event.emit(events.REMOVE_SERVERS, ids);
	}

    /**
     * Replace server info from current application at runtime.
     *
     * @param  {Object} servers id map
     * @memberOf Application
     */
	replaceServers(servers)
    {
		if (!servers)
		{
			return;
		}

		this.servers = servers;
		this.serverTypeMaps = {};
		this.serverTypes = [];
		const serverArray = [];
		_.forEach(servers, (server, serverId) =>
		{
			const serverType = server[Constants.RESERVED.SERVER_TYPE];
			let sList = this.serverTypeMaps[serverType];
			if (!sList)
			{
				this.serverTypeMaps[serverType] = sList = [];
			}
			this.serverTypeMaps[serverType].push(server);
			// update global server type list
			if (this.serverTypes.indexOf(serverType) < 0)
			{
				this.serverTypes.push(serverType);
			}
			serverArray.push(server);
		});
		this.event.emit(events.REPLACE_SERVERS, serverArray);
	}

    /**
     * Add crones from current application at runtime.
     *  todo 名字由 addCrons 修改为 addCrones
     * @param  {Array} crones new crones would be added in application
     * @memberOf Application
     */
	addCrones(crones)
    {
		if (!crones || !crones.length)
		{
			logger.warn('crons is not defined.');
			return;
		}
		this.event.emit(events.ADD_CRONS, crones);
	}

    /**
     * Remove crones from current application at runtime.
     * todo 名字由 removeCrons 修改为 removeCrones
     * @param  {Array} crones old crones would be removed in application
     * @memberOf Application
     */
	removeCrones(crones)
	{
		if (!crones || !crones.length)
		{
			logger.warn('ids is not defined.');
			return;
		}
		this.event.emit(events.REMOVE_CRONS, crones);
	}
}

module.exports = Application;

const replaceServer = (sList, serverInfo) =>
{
	for (let i = 0, l = sList.length; i < l; i++)
	{
		if (sList[i].id === serverInfo.id)
		{
			sList[i] = serverInfo;
			return;
		}
	}
	sList.push(serverInfo);
};

const removeServer = (sList, id) =>
{
	if (!sList || !sList.length)
	{
		return;
	}

	for (let i = 0, l = sList.length; i < l; i++)
	{
		if (sList[i].id === id)
		{
			sList.splice(i, 1);
			return;
		}
	}
};

const contains = (str, settings) =>
{
	if (!settings) return false;

	const ts = settings.split('|');
	for (let i = 0, l = ts.length; i < l; i++)
	{
		if (str === ts[i])
		{
			return true;
		}
	}
	return false;
};

const bindEvents = (Event, app) =>
{
	const events = new Event(app);
	for (const key in events)
	{
		if (_.isFunction(events[key]))
		{
			app.event.on(key, events[key].bind(events));
		}
	}
};

const addFilter = (app, type, filter) =>
{
	let filters = app.get(type);
	if (!filters)
	{
		filters = [];
		app.set(type, filters);
	}
	filters.push(filter);
};
