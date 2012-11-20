/*!
 * Pomelo -- proto
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var fs = require('fs');
var utils = require('./util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var async = require('async');
var log = require('./util/log');

/**
 * Application prototype.
 *
 * @module
 */
var Application = module.exports = {};

/**
 * Application states
 */
var STATE_INITED  = 1;  // app has inited
var STATE_START = 2;	// app start
var STATE_STARTED = 3;	// app has started
var STATE_STOPED  = 4;  // app has stoped

/**
 * Initialize the server.
 *
 *   - setup default configuration
 *
 * @api private
 */
Application.init = function(opts) {
	opts = opts || {};
	logger.info('app.init invoked');
	this.loaded = [];
	this.components = {};
	this.settings = {};
	this.set('base', opts.base);
	this.defaultConfiguration();
	this.state = STATE_INITED;
	logger.info('application inited: %j', this.get('serverId'));
};

/**
 * Get application base path
 *
 *	// cwd: /home/game/
 *	pomelo start
 *	// app.getBase() -> /home/game
 * 
 * @return {String} application base path
 *
 * @memberOf Application
 */
Application.getBase = function() {
	return this.get('base') || process.cwd();
};

/**
 * Initialize application configuration.
 *
 * @api private
 */
Application.defaultConfiguration = function () {
	var args = utils.argsInfo(process.argv);
	this.setupEnv(args);
	this.loadServers();
	this.loadConfig('master', this.getBase() + '/config/master.json');
	this.processArgs(args);
	this.configLogger();
};

/**
 * Setup enviroment.
 * @api private
 */
Application.setupEnv = function(args) {
	this.set('env', args.env || process.env.NODE_ENV || 'development', true);
};

/**
 * Load server info from configure file.
 * 
 * @api private
 */
Application.loadServers = function() {
	this.loadConfig('servers', this.getBase() + '/config/servers.json');
	var servers = this.get('servers');
	var serverMap = {}, slist, i, l, server;
	for(var serverType in servers) {
		slist = servers[serverType];
		for(i=0, l=slist.length; i<l; i++) {
			server = slist[i];
			server.serverType = serverType;
			serverMap[server.id] = server;
		}
	}

	this.set('__serverMap__', serverMap);
};

/**
 * Process server start command
 *
 * @return {Void}
 *
 * @api private
 */
Application.processArgs = function(args){
	var serverType = args.serverType || 'master';
	var serverId = args.serverId || this.get('master').id;
	this.set('main', args.main, true);
	this.set('serverType', serverType, true);
	this.set('serverId', serverId, true);
	if(serverType !== 'master') {
		this.set('curServer', this.getServerById(serverId), true);
	} else {
		this.set('curServer', this.get('master'), true);
	}
};

/**
 * Load default components for application.
 * 
 * @api private
 */
Application.loadDefaultComponents = function(){
	var pomelo = require('./pomelo');
	// load system default components
	if (this.serverType === 'master') {
		this.load(pomelo.master, this.get('masterConfig'));
	} else {
		this.load(pomelo.proxy, this.get('proxyConfig'));
		if(this.getServerById(this.get('serverId')).port) {
			this.load(pomelo.remote, this.get('remoteConfig'));
		}
		if(this.isFrontend()) {
			this.load(pomelo.connection, this.get('connectionConfig'));
			this.load(pomelo.connector, this.get('connectorConfig'));
			this.load(pomelo.session, this.get('sessionConfig'));
		} else {
			this.load(pomelo.localSession, this.get('localSessionConfig'));
		}
		this.load(pomelo.channel, this.get('channelConfig'));
		this.load(pomelo.server, this.get('serverConfig'));
	}
	this.load(pomelo.monitor, this);
};

Application.configLogger = function() {
	if(process.env.POMELO_LOGGER !== 'off') {
		log.configure(this, this.getBase() + '/config/log4js.json');
	}
};

/**
 * add a filter to before and after filter
 *
 * @param {Object} filter provide before and after filter method. A filter should have two methods: before and after
 *
 * @memberOf Application
 */
Application.filter = function (filter) {
	this.before(filter);
	this.after(filter);
	return this;
};

/**
 * Add before filter. 
 *
 * @param {Object|Function} bf before fileter, bf(msg, session, next)
 *
 * @memberOf Application
 */
Application.before = function (bf) {
	var befores = this.get('__befores__');
	if(!befores) {
		befores = [];
		this.set('__befores__', befores);
	}
	befores.push(bf);
	return this;
};

/**
 * Add after filter.
 *
 * @param {Object|Function} af after filter, `af(err, msg, session, resp, next)`
 *
 * @memberOf Application
 */
Application.after = function (af) {
	var afters = this.get('__afters__');
	if(!afters) {
		afters = [];
		this.set('__afters__', afters);
	}
	afters.push(af);
	return this;
};

/**
 * Load component
 *
 * @param  {String} name    (optional) name of the component
 * @param  {Object} component component instance or factory function of the component
 * @param  {[type]} opts    (optional) construct parameters for the factory function
 * @return {Object}			app instance for chain invoke
 *
 * @memberOf Application
 */
Application.load = function(name, component, opts) {
	if(typeof name !== 'string') {
		opts = component;
		component = name;
		name = null;
		if(typeof component.name === 'string') {
			name = component.name;
		}
	}

	if(typeof component === 'function') {
		component = component(this, opts);
	}

	if(!component) {
		// maybe some component no need to join the components management
		logger.info('load empty component');
		return this;
	}

	if(!name && typeof component.name === 'string') {
		name = component.name;
	}

	if(name && this.components[name]) {
		// ignore duplicat component
		logger.warn('ignore duplicate component: %j', name);
		return;
	}

	this.loaded.push(component);
	if(name) {
		// components with a name would get by name throught app.components later.
		this.components[name] = component;
	}

	return this;
};

/**
 * Set the route function for the specified server type.
 *
 * Examples:
 * 
 *	app.route('area', routeFunc);
 *
 *	var routeFunc = function(session, msg, app, cb) {
 *		// all request to area would be route to the first area server
 *		var areas = app.getServersByType('area');
 *		cb(null, areas[0].id);
 *	};
 * 
 * @param  {String} serverType server type string
 * @param  {Function} routeFunc  route function. routeFunc(session, msg, app, cb)
 * @return {Object}			current application instance for chain invoking
 *
 * @memberOf Application
 */
Application.route = function(serverType, routeFunc) {
	var routes = this.get('__routes__');
	if(!routes) {
		routes = {};
		this.set('__routes__', routes);
	}
	routes[serverType] = routeFunc;
	return this;
};

/**
 * Start application. It would load the default components and start all the loaded components.
 *
 * @param  {Function} cb callback function
 *
 * @memberOf Application
 */
Application.start = function(cb) {
	if(this.state > STATE_INITED) {
		utils.invokeCallback(cb, new Error('application has already start.'));
		return;
	}
	this.loadDefaultComponents();
	var self = this;
	this._optComponents('start', function(err) {
		self.state = STATE_START;
		utils.invokeCallback(cb, err);
	});
};

/**
 * Lifecycle callback for after start.
 *
 * @param  {Function} cb callback function
 * @return {Void}
 */
Application.afterStart = function(cb) {
	if(this.state !== STATE_START) {
		utils.invokeCallback(cb, new Error('application is not running now.'));
		return;
	}

	var self = this;
	this._optComponents('afterStart', function(err) {
		self.state = STATE_STARTED;
		utils.invokeCallback(cb, err);
	});
};

/**
 * Stop components.
 *
 * @param  {Boolean} force whether stop the app immediately
 */
Application.stop = function(force) {
	if(this.state > STATE_STARTED) {
		logger.warn('[pomelo application] application is not running now.');
		return;
	}
	this.state = STATE_STOPED;
	stopComps(this.loaded, 0, force, function() {
		if(force) {
			process.exit(0);
		}
	});

};

/**
 * Stop components.
 *
 * @param  {Array}	comps component list
 * @param  {Number}   index current component index
 * @param  {Boolean}  force whether stop component immediately
 * @param  {Function} cb
 */
var stopComps = function(comps, index, force, cb) {
	if(index >= comps.length) {
		cb();
		return;
	}
	var comp = comps[index];
	if(typeof comp.stop === 'function') {
		comp.stop(force, function() {
			// ignore any error
			stopComps(comps, index +1, force, cb);
		});
	} else {
		stopComps(comps, index +1, force, cb);
	}
};

/**
 * Apply command to loaded components.
 * This method would invoke the component {method} in series.
 * Any component {method} return err, it would return err directly.
 *
 * @param  {String}   method component lifecycle method name, such as: start, afterStart, stop
 * @param  {Function} cb
 * @api private
 */
Application._optComponents = function(method, cb) {
	var i = 0;
	async.forEachSeries(this.loaded, function(comp, done) {
		i++;
		if(typeof comp[method] === 'function') {
			comp[method](done);
		} else {
			done();
		}
	}, function(err) {
		if(err) {
			logger.error('[pomelo application] fail to operate component, method:%s, err:' + err.stack, method);
		}
		cb(err);
	});
};

/**
 * Assign `setting` to `val`, or return `setting`'s value. 
 *
 * Example:
 *
 *	app.set('key1', 'value1');
 *	app.get('key1');	// 'value1'
 *	app.key1;			// undefined
 *
 *	app.set('key2', 'value2', true);
 *	app.get('key2');	// 'value2'
 *	app.key2;			// 'value2'
 *
 * @param {String} setting the setting of application
 * @param {String} val the setting's value
 * @param {Boolean} attach whether attach the settings to application
 * @return {Server|Mixed} for chaining, or the setting value
 * 
 * @memberOf Application
 */
Application.set = function (setting, val, attach) {
	if (arguments.length === 1) {
		return this.settings[setting];
	}
	this.settings[setting] = val;
	if(attach) {
		this[setting] = val;
	}
	return this;
};

/**
 * Get property from setting
 * 
 * @param {String} setting application setting
 * @return {String} val
 * 
 * @memberOf Application
 */
Application.get = function (setting) {
	return this.settings[setting];
};

/**
 * Load Configure json file to settings.
 *
 * @param {String} key environment key
 * @param {String} val environment value
 * @return {Server|Mixed} for chaining, or the setting value
 * 
 * @memberOf Application
 */
Application.loadConfig = function (key, val) {
	var env = this.get('env');
	val = require(val); 
	if (val[env]) {
		val = val[env];
	}
	this.set(key, val);
};

/**
 * Check if `setting` is enabled.
 *
 * @param {String} setting application setting
 * @return {Boolean}
 * @memberOf Application
 */
Application.enabled = function (setting) {
	return !!this.get(setting);
};

/**
 * Check if `setting` is disabled.
 *
 * @param {String} setting application setting
 * @return {Boolean}
 * @memberOf Application
 */
Application.disabled = function (setting) {
	return !this.get(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting application setting
 * @return {app} for chaining
 * @memberOf Application
 */
Application.enable = function (setting) {
	return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting application setting
 * @return {app} for chaining
 * @memberOf Application
 */
Application.disable = function (setting) {
	return this.set(setting, false);
};

/**
 * Configure callback for the specified env and server type. 
 * When no env is specified that callback will
 * be invoked for all environments and when no type is specified 
 * that callback will be invoked for all server types. 
 *
 * Examples:
 *
 *	app.configure(function(){
 *		// executed for all envs and server types
 *	});
 *
 *	app.configure('development', function(){
 *		// executed development env
 *	});
 *
 *	app.configure('development', 'connector', function(){
 *		// executed for development env and connector server type
 *	});
 * 
 * @param {String} env application environment 
 * @param {Function} fn callback function
 * @param {String} type server type
 * @return {Application} for chaining
 * @memberOf Application
 */
Application.configure = function (env, type, fn) {
	var args = [].slice.call(arguments);
	fn = args.pop();
	env = 'all'; 
	type = 'all';

	if(args.length > 0) {
		env = args[0];
	}
	if(args.length > 1) {
		type = args[1];
	}

	if (env === 'all' || env.indexOf(this.settings.env) >= 0) {
		if (type === 'all' || type.indexOf(this.settings.serverType) >= 0) {
			fn.call(this);
		}
	}
	return this;
};

/**
 * Get all the server infos.
 * 
 * @return {Object} server info map, key: server id, value: server info
 *
 * @memberOf Application
 */
Application.getServers = function() {
	return this.get('__serverMap__');
};

/**
 * Get server info by server id.
 * 
 * @param  {String} serverId server id
 * @return {Object} server info or undefined
 *
 * @memberOf Application
 */
Application.getServerById = function(serverId) {
	return this.get('__serverMap__')[serverId];
};

/**
 * Get server infos by server type.
 * 
 * @param  {String} serverType server type
 * @return {Array}			server info list
 *
 * @memberOf Application
 */
Application.getServersByType = function(serverType) {
	return this.get('servers')[serverType];
};

/**
 * Check the server whether is a frontend server
 *
 * @param  {server}  server server info. it would check current server
 *						if server not specified
 * @return {Boolean}
 *
 * @memberOf Application
 */
Application.isFrontend = function(server) {
	server = server || Application.get('curServer');
	return !!server && !!server.wsPort;
};

/**
 * Check the server whether is a backend server
 *
 * @param  {server}  server server info. it would check current server
 *						if server not specified
 * @return {Boolean}
 *
 * @memberOf Application
 */
Application.isBackend = function(server) {
	server = server || Application.get('curServer');
	return !!server && !server.wsPort;
};

/**
 * Check whether current server is a master server
 *
 * @return {Boolean}
 *
 * @memberOf Application
 */
Application.isMaster = function() {
	return Application.serverType === 'master';
};

/**
 * Register admin modules. Admin modules is the extends point of the monitor system.
 * 
 * @param {String} module (optional) module id or provoided by module.moduleId
 * @param {Object} module module object or factory function for module
 * @param {Object} opts construct parameter for module
 *
 * @memberOf Application
 */
Application.registerAdmin = function(moduleId, module, opts){
	var modules = this.get('__modules__');
	if(!modules) {
		modules = [];
		this.set('__modules__', modules);
	}

	if(typeof moduleId !== 'string') {
		opts = module;
		module = moduleId;
		moduleId = module.moduleId;
	}

	modules.push({moduleId: moduleId, module: module, opts: opts});
};
