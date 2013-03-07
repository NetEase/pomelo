/*!
 * Pomelo -- proto
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var utils = require('./util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var EventEmitter = require('events').EventEmitter;
var events = require('./util/events');
var appUtil = require('./util/appUtil');

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
var STATE_START = 2;  // app start
var STATE_STARTED = 3;  // app has started
var STATE_STOPED  = 4;  // app has stoped

/**
 * Initialize the server.
 *
 *   - setup default configuration
 */
Application.init = function(opts) {
  opts = opts || {};
  this.loaded = [];       // loaded component list
  this.components = {};   // name -> component map
  this.settings = {};     // collection keep set/get
  this.set('base', opts.base);
  this.event = new EventEmitter();  // event object to sub/pub events

  // current server info
  this.serverId = null;   // current server id
  this.serverType = null; // current server type
  this.curServer = null;  // current server info

  // global server infos
  this.master = null;         // master server info
  this.servers = {};          // current global server info maps, id -> info
  this.serverTypeMaps = {};   // current global type maps, type -> [info]
  this.serverTypes = [];      // current global server type list

  appUtil.defaultConfiguration(this);

  this.state = STATE_INITED;
  logger.info('application inited: %j', this.getServerId());
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
 * @memberOf Application
 */
Application.getBase = function() {
  return this.get('base') || process.cwd();
};

/**
 * add a filter to before and after filter
 *
 * @param {Object} filter provide before and after filter method.
 *                        A filter should have two methods: before and after.
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
 * @return {Object}     app instance for chain invoke
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
 * Load Configure json file to settings.
 *
 * @param {String} key environment key
 * @param {String} val environment value
 * @return {Server|Mixed} for chaining, or the setting value
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
 * @memberOf Application
 */
Application.start = function(cb) {
  if(this.state > STATE_INITED) {
    utils.invokeCallback(cb, new Error('application has already start.'));
    return;
  }
  appUtil.loadDefaultComponents(this);
  var self = this;
  appUtil.optComponents(this.loaded, 'start', function(err) {
    self.state = STATE_START;
    if(err) {
      utils.invokeCallback(cb, err);
    } else {
      logger.info('%j enter after start...', self.getServerId());
      self.afterStart(cb);
    }
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
  appUtil.optComponents(this.loaded, 'afterStart', function(err) {
    self.state = STATE_STARTED;
    if(!err) {
      logger.info('%j finish start', self.getServerId());
    }
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
  appUtil.stopComps(this.loaded, 0, force, function() {
    if(force) {
      process.exit(0);
    }
  });
};

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
 * @return {Server|Mixed} for chaining, or the setting value
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
 * @memberOf Application
 */
Application.get = function (setting) {
  return this.settings[setting];
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
 * Register admin modules. Admin modules is the extends point of the monitor system.
 *
 * @param {String} module (optional) module id or provoided by module.moduleId
 * @param {Object} module module object or factory function for module
 * @param {Object} opts construct parameter for module
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

/**
 * Get master server info.
 *
 * @return {Object} master server info, {id, host, port}
 * @memberOf Application
 */
Application.getMaster = function() {
  return this.master;
};

/**
 * Get current server info.
 *
 * @return {Object} current server info, {id, serverType, host, port}
 * @memberOf Application
 */
Application.getCurServer = function() {
  return this.curServer;
};

/**
 * Get current server id.
 *
 * @return {String|Number} current server id from servers.json
 * @memberOf Application
 */
Application.getServerId = function() {
  return this.serverId;
};

/**
 * Get current server type.
 *
 * @return {String|Number} current server type from servers.json
 * @memberOf Application
 */
Application.getServerType = function() {
  return this.serverType;
};

/**
 * Get all the current server infos.
 *
 * @return {Object} server info map, key: server id, value: server info
 * @memberOf Application
 */
Application.getServers = function() {
  return this.servers;
};

/**
 * Get all server infos from servers.json.
 *
 * @return {Object} server info map, key: server id, value: server info
 * @memberOf Application
 */
Application.getServersFromConfig = function() {
  return this.get('__serverMap__');
};

/**
 * Get all the server type.
 *
 * @return {Array} server type list
 * @memberOf Application
 */
Application.getServerTypes = function() {
  return this.serverTypes;
};

/**
 * Get server info by server id from current server cluster.
 *
 * @param  {String} serverId server id
 * @return {Object} server info or undefined
 * @memberOf Application
 */
Application.getServerById = function(serverId) {
  return this.servers[serverId];
};

/**
 * Get server info by server id from servers.json.
 *
 * @param  {String} serverId server id
 * @return {Object} server info or undefined
 * @memberOf Application
 */

Application.getServerFromConfig = function(serverId) {
  return this.get('__serverMap__')[serverId];
};

/**
 * Get server infos by server type.
 *
 * @param  {String} serverType server type
 * @return {Array}      server info list
 * @memberOf Application
 */
Application.getServersByType = function(serverType) {
  return this.serverTypeMaps[serverType];
};

/**
 * Check the server whether is a frontend server
 *
 * @param  {server}  server server info. it would check current server
 *            if server not specified
 * @return {Boolean}
 *
 * @memberOf Application
 */
Application.isFrontend = function(server) {
  server = server || this.getCurServer();
  return !!server && !!server.frontend;
};

/**
 * Check the server whether is a backend server
 *
 * @param  {server}  server server info. it would check current server
 *            if server not specified
 * @return {Boolean}
 * @memberOf Application
 */
Application.isBackend = function(server) {
  server = server || this.getCurServer();
  return !!server && !server.frontend;
};

/**
 * Check whether current server is a master server
 *
 * @return {Boolean}
 * @memberOf Application
 */
Application.isMaster = function() {
  return this.serverType === 'master';
};

/**
 * Add new server info to current application in runtime.
 *
 * @param {Array} servers new server info list
 * @memberOf Application
 */
Application.addServers = function(servers) {
  if(!servers || !servers.length) {
    return;
  }

  var item, slist;
  for(var i=0, l=servers.length; i<l; i++) {
    item = servers[i];
    // update global server map
    this.servers[item.id] = item;

    // update global server type map
    slist = this.serverTypeMaps[item.serverType];
    if(!slist) {
      this.serverTypeMaps[item.serverType] = slist = [];
    }
    replaceServer(slist, item);

    // update global server type list
    if(this.serverTypes.indexOf(item.serverType) < 0) {
      this.serverTypes.push(item.serverType);
    }
  }
  this.event.emit(events.ADD_SERVERS, servers);
};

/**
 * Remote server info from current application at runtime.
 *
 * @param  {Array} ids server id list
 * @memberOf Application
 */
Application.removeServers = function(ids) {
  if(!ids || !ids.length) {
    return;
  }

  var id, item, slist;
  for(var i=0, l=ids.length; i<l; i++) {
    id = ids[i];
    item = this.servers[id];
    if(!item) {
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
};

var replaceServer = function(slist, serverInfo) {
  for(var i=0, l=slist.length; i<l; i++) {
    if(slist[i].id === serverInfo.id) {
      slist[i] = serverInfo;
      return;
    }
  }
  slist.push(serverInfo);
};

var removeServer = function(slist, id) {
  if(!slist || !slist.length) {
    return;
  }

  for(var i=0, l=slist.length; i<l; i++) {
    if(slist[i].id === id) {
      slist.splice(i, 1);
      return;
    }
  }
};