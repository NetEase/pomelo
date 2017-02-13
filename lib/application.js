'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const utils = require('./util/utils');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const events = require('./util/events');
const appUtil = require('./util/appUtil');
const Constants = require('./util/constants');
const appManager = require('./common/manager/appManager');
const PomeloError = require('./errors').PomeloError;

/**
 * Application prototype.
 *
 * @module
 */
const Application = module.exports;

/**
 * Application states
 */
const STATE_INITED = 1; // app has inited
const STATE_START = 2; // app is starting
const STATE_STARTED = 3; // app has started
const STATE_STOPED = 4; // app has stoped

/**
 * Initialize the server.
 *
 *   - setup default configuration
 */
Application.init = function(opts) {
  opts = opts || {};

  this.loaded = []; // loaded component list
  this.components = {}; // name -> component map
  this.settings = {}; // collection keep set/get

  const base = opts.base || path.dirname(require.main.filename);
  this.set(Constants.RESERVED.BASE, base, true);
  this.eventObj = new EventEmitter();  // event object to sub/pub events

  // current server info
  this.serverId = null;   // current server id
  this.serverType = null; // current server type
  this.curServer = null;  // current server info
  this.startTime = null; // current server start time

  // global server infos
  this.servers = {}; // current global server info maps, id -> info
  this.serverTypeMaps = {}; // current global type maps, type -> [info]
  this.serverTypes = []; // current global server type list
  this.lifecycleCbs = {}; // current server custom lifecycle callbacks
  this.clusterSeq = {}; // cluster id seqence

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
  return this.get(Constants.RESERVED.BASE);
};

/**
 * Override require method in application
 *
 * @param {String} relative path of file
 *
 * @memberOf Application
 */
Application.require = function(ph) {
  return require(path.join(Application.getBase(), ph));
};

/**
 * Configure logger with {$base}/config/log4js.json
 *
 * @param {Object} logger pomelo-logger instance without configuration
 *
 * @memberOf Application
 */
Application.configureLogger = function(logger) {
  if (process.env.POMELO_LOGGER !== 'off') {
    const base = this.getBase();
    const env = this.get(Constants.RESERVED.ENV);
    const originPath = path.join(base, Constants.FILEPATH.LOG);
    const presentPath = path.join(base, Constants.FILEPATH.CONFIG_DIR, env,
                                  path.basename(Constants.FILEPATH.LOG));

    if (fs.existsSync(originPath)) {
      logger.configure(originPath, {serverId: this.serverId, base: base});
    } else if (fs.existsSync(presentPath)) {
      logger.configure(presentPath, {serverId: this.serverId, base: base});
    } else {
      logger.error('logger file path configuration is error.');
    }
  }
};

/**
 * add a filter to before and after filter
 *
 * @param {Object} filter provide before and after filter method.
 *                        A filter should have two methods: before and after.
 * @memberOf Application
 */
Application.filter = function(filter) {
  this.before(filter);
  this.after(filter);
};

/**
 * Add before filter.
 *
 * @param {Object|Function} bf before fileter, bf(msg, session, next)
 * @memberOf Application
 */
Application.before = function(bf) {
  _addFilter(this, Constants.KEYWORDS.BEFORE_FILTER, bf);
};

/**
 * Add after filter.
 *
 * @param {Object|Function} af after filter, `af(err, msg, session, resp, next)`
 * @memberOf Application
 */
Application.after = function(af) {
  _addFilter(this, Constants.KEYWORDS.AFTER_FILTER, af);
};

/**
 * add a global filter to before and after global filter
 *
 * @param {Object} filter provide before and after filter method.
 *                        A filter should have two methods: before and after.
 * @memberOf Application
 */
Application.globalFilter = function(filter) {
  this.globalBefore(filter);
  this.globalAfter(filter);
};

/**
 * Add global before filter.
 *
 * @param {Object|Function} bf before fileter, bf(msg, session, next)
 * @memberOf Application
 */
Application.globalBefore = function(bf) {
  _addFilter(this, Constants.KEYWORDS.GLOBAL_BEFORE_FILTER, bf);
};

/**
 * Add global after filter.
 *
 * @param {Object|Function} af after filter, `af(err, msg, session, resp, next)`
 * @memberOf Application
 */
Application.globalAfter = function(af) {
  _addFilter(this, Constants.KEYWORDS.GLOBAL_AFTER_FILTER, af);
};

/**
 * Add rpc before filter.
 *
 * @param {Object|Function} bf before fileter, bf(serverId, msg, opts, next)
 * @memberOf Application
 */
Application.rpcBefore = function(bf) {
  _addFilter(this, Constants.KEYWORDS.RPC_BEFORE_FILTER, bf);
};

/**
 * Add rpc after filter.
 *
 * @param {Object|Function} af after filter, `af(serverId, msg, opts, next)`
 * @memberOf Application
 */
Application.rpcAfter = function(af) {
  _addFilter(this, Constants.KEYWORDS.RPC_AFTER_FILTER, af);
};

/**
 * add a rpc filter to before and after rpc filter
 *
 * @param {Object} filter provide before and after filter method.
 *                        A filter should have two methods: before and after.
 * @memberOf Application
 */
Application.rpcFilter = function(filter) {
  this.rpcBefore(filter);
  this.rpcAfter(filter);
};

/**
 * Load component
 *
 * @param  {String} name    (optional) name of the component
 * @param  {Object} component component instance or
 *                            factory function of the component
 * @param  {[type]} opts    (optional) construct parameters
 *                            for the factory function
 * @return {Object}     app instance for chain invoke
 * @memberOf Application
 */
Application.load = function(name, component, opts) {
  if (typeof name !== 'string') {
    opts = component;
    component = name;
    name = null;

    if (typeof component.name === 'string') {
      name = component.name;
    }
  }

  if (typeof component === 'function') {
    component = component(this, opts);
  }

  if (!name && typeof component.name === 'string') {
    name = component.name;
  }

  if (name && this.components[name]) {
    // ignore duplicat component
    logger.warn('ignore duplicate component: %j', name);
    return;
  }

  this.loaded.push(component);
  if (name) {
    // components with a name would get by name throught app.components later.
    this.components[name] = component;
  }

  return this;
};

/**
 * Load Configure json file to settings.
 * (support different enviroment directory & compatible for old path)
 *
 * @param {String} key environment key
 * @param {String} val environment value
 * @param {Boolean} reload whether reload after change default false
 * @return {Server|Mixed} for chaining, or the setting value
 * @memberOf Application
 */
Application.loadConfigBaseApp = function(key, val, reload) {
  const self = this;
  const env = this.get(Constants.RESERVED.ENV);
  const originPath = path.join(Application.getBase(), val);
  const presentPath = path.join(Application.getBase(),
                                Constants.FILEPATH.CONFIG_DIR,
                                env, path.basename(val));

  let realPath;
  if (fs.existsSync(originPath)) {
    realPath = originPath;
    let file = require(originPath);
    if (file[env]) {
      file = file[env];
    }
    this.set(key, file);
  } else if (fs.existsSync(presentPath)) {
    realPath = presentPath;
    const pfile = require(presentPath);
    this.set(key, pfile);
  } else {
    logger.error('invalid configuration with file path: %s', key);
  }

  if (!!realPath && !!reload) {
    fs.watch(realPath, (event, filename) => {
      if (event === 'change') {
        delete require.cache[require.resolve(realPath)];
        self.loadConfigBaseApp(key, val);
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
 * @memberOf Application
 */
Application.loadConfig = function(key, val) {
  const env = this.get(Constants.RESERVED.ENV);
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
 *  const routeFunc = function(session, msg, app, cb) {
 *    // all request to area would be route to the first area server
 *    const areas = app.getServersByType('area');
 *    cb(null, areas[0].id);
 *  };
 *
 * @param  {String} serverType server type string
 * @param  {Function} routeFunc  route function.
 *                               routeFunc(session, msg, app, cb)
 * @return {Object}     current application instance for chain invoking
 * @memberOf Application
 */
Application.route = function(serverType, routeFunc) {
  let routes = this.get(Constants.KEYWORDS.ROUTE);
  if (!routes) {
    routes = {};
    this.set(Constants.KEYWORDS.ROUTE, routes);
  }
  routes[serverType] = routeFunc;
  return this;
};

/**
 * Start application.
 * It would load the default components and start all the loaded components.
 *
 * @param  {Function} cb callback function
 * @memberOf Application
 */
Application.start = function(cb) {
  this.startTime = Date.now();
  if (this.state > STATE_INITED) {
    utils.invokeCallback(cb, new Error('application has already start.'));
    return;
  }

  const self = this;
  appUtil.loadDefaultComponents(self);

  const startUp = () => {
    appUtil.optComponents(self.loaded, Constants.RESERVED.START, (err) => {
      self.state = STATE_START;

      if (err) {
        utils.invokeCallback(cb, err);
      } else {
        logger.info('%j enter after start...', self.getServerId());
        self.afterStart(cb);
      }
    });
  };

  const beforeFun = self.lifecycleCbs[Constants.LIFECYCLE.BEFORE_STARTUP];

  if (typeof beforeFun === 'function') {
    beforeFun(self, startUp);
  } else {
    startUp();
  }
};

/**
 * Lifecycle callback for after start.
 *
 * @param  {Function} cb callback function
 * @return {Void}
 */
Application.afterStart = function(cb) {
  if (this.state !== STATE_START) {
    utils.invokeCallback(cb,
                         new PomeloError('application is not running now.'));
    return;
  }

  const afterFun = this.lifecycleCbs[Constants.LIFECYCLE.AFTER_STARTUP];
  const self = this;
  const afterStart = Constants.RESERVED.AFTER_START;

  appUtil.optComponents(this.loaded, afterStart, (err) => {
    self.state = STATE_STARTED;
    const id = self.getServerId();
    if (!err) {
      logger.info('%j finish start', id);
    }

    if (typeof afterFun === 'function') {
      afterFun(self, () => {
        utils.invokeCallback(cb, err);
      });
    } else {
      utils.invokeCallback(cb, err);
    }

    const usedTime = Date.now() - self.startTime;
    logger.info('%j startup in %s ms', id, usedTime);
    self.event.emit(events.START_SERVER, id);
  });
};

/**
 * Stop components.
 *
 * @param  {Boolean} force whether stop the app immediately
 */
Application.stop = function(force) {
  if (this.state > STATE_STARTED) {
    logger.warn('[pomelo application] application is not running now.');
    return;
  }

  this.state = STATE_STOPED;
  const self = this;

  this.stopTimer = setTimeout(() => {
    process.exit(0);
  }, Constants.TIME.TIME_WAIT_STOP);

  const cancelShutDownTimer = () => {
    if (self.stopTimer !== undefined) {
      clearTimeout(self.stopTimer);
    }
  };

  const shutDown = () => {
    appUtil.stopComps(self.loaded, 0, force, () => {
      cancelShutDownTimer();
      if (force) {
        process.exit(0);
      }
    });
  };

  const fun = this.get(Constants.KEYWORDS.BEFORE_STOP_HOOK);
  const stopFun = this.lifecycleCbs[Constants.LIFECYCLE.BEFORE_SHUTDOWN];

  if (typeof stopFun === 'function') {
    stopFun(this, shutDown, cancelShutDownTimer);
  } else if (typeof fun === 'function') {
    utils.invokeCallback(fun, self, shutDown, cancelShutDownTimer);
  } else {
    shutDown();
  }
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
Application.set = function(setting, val, attach) {
  if (arguments.length === 1) {
    return this.settings[setting];
  }

  this.settings[setting] = val;
  if (attach) {
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
Application.get = function(setting) {
  return this.settings[setting];
};

/**
 * Check if `setting` is enabled.
 *
 * @param {String} setting application setting
 * @return {Boolean}
 * @memberOf Application
 */
Application.enabled = function(setting) {
  return !!this.get(setting);
};

/**
 * Check if `setting` is disabled.
 *
 * @param {String} setting application setting
 * @return {Boolean}
 * @memberOf Application
 */
Application.disabled = function(setting) {
  return !this.get(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting application setting
 * @return {app} for chaining
 * @memberOf Application
 */
Application.enable = function(setting) {
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting application setting
 * @return {app} for chaining
 * @memberOf Application
 */
Application.disable = function(setting) {
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
Application.configure = function(env, type, fn) {
  const args = [].slice.call(arguments);
  fn = args.pop();
  env = type = Constants.RESERVED.ALL;

  if (args.length > 0) {
    env = args[0];
  }
  if (args.length > 1) {
    type = args[1];
  }

  if (env === Constants.RESERVED.ALL || _contains(this.settings.env, env)) {
    if (type === Constants.RESERVED.ALL ||
        _contains(this.settings.serverType, type)) {
      fn.call(this);
    }
  }
  return this;
};

/**
 * Use plugin.
 *
 * @param  {Object} plugin plugin instance
 * @param  {[type]} opts    (optional) construct parameters
 *                                     for the factory function
 * @memberOf Application
 */
Application.use = function(plugin, opts) {
  if (!plugin.components) {
    logger.error('invalid components, no components exist');
    return;
  }

  const self = this;
  opts = opts || {};
  const dir = path.dirname(plugin.components);

  if (!fs.existsSync(plugin.components)) {
    logger.error('fail to find components, find path: %s', plugin.components);
    return;
  }

  fs.readdirSync(plugin.components).forEach((filename) => {
    if (!/\.js$/.test(filename)) {
      return;
    }
    const name = path.basename(filename, '.js');
    const param = opts[name] || {};
    const absolutePath = path.join(dir, Constants.DIR.COMPONENT, filename);

    if (!fs.existsSync(absolutePath)) {
      logger.error('component %s not exist at %s', name, absolutePath);
    } else {
      self.load(require(absolutePath), param);
    }
  });

  // load events
  if (!plugin.events) {
    return;
  } else {
    if (!fs.existsSync(plugin.events)) {
      logger.error('fail to find events, find path: %s', plugin.events);
      return;
    }

    fs.readdirSync(plugin.events).forEach((filename) => {
      if (!/\.js$/.test(filename)) {
        return;
      }
      const absolutePath = path.join(dir, Constants.DIR.EVENT, filename);
      if (!fs.existsSync(absolutePath)) {
        logger.error('events %s not exist at %s', filename, absolutePath);
      } else {
        _bindEvents(require(absolutePath), self);
      }
    });
  }
};

/**
 * Application transaction. Transcation includes conditions and handlers,
 * if conditions are satisfied, handlers would be executed.
 * And you can set retry times to execute handlers.
 * The transaction log is in file logs/transaction.log.
 *
 * @param {String} name transaction name
 * @param {Object} conditions functions which are called before transaction
 * @param {Object} handlers functions which are called during transaction
 * @param {Number} retry retry times to execute handlers
 *                 if conditions are successfully executed
 * @memberOf Application
 */
Application.transaction = function(name, conditions, handlers, retry) {
  appManager.transaction(name, conditions, handlers, retry);
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
  return this.get(Constants.KEYWORDS.SERVER_MAP);
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
  return this.get(Constants.KEYWORDS.SERVER_MAP)[serverId];
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
  return !!server && server.frontend === 'true';
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
 * Replace server info from current application at runtime.
 *
 * @param  {Object} server id map
 * @memberOf Application
 */
Application.replaceServers = function(servers) {
  if (!servers) {
    return;
  }

  this.servers = servers;
  this.serverTypeMaps = {};
  this.serverTypes = [];
  const serverArray = [];

  let server;
  let serverType;
  let slist;

  let id;
  for (id in servers) {
    server = servers[id];
    serverType = server[Constants.RESERVED.SERVER_TYPE];
    slist = this.serverTypeMaps[serverType];
    if (!slist) {
      this.serverTypeMaps[serverType] = slist = [];
    }
    this.serverTypeMaps[serverType].push(server);
    // update global server type list
    if (this.serverTypes.indexOf(serverType) < 0) {
      this.serverTypes.push(serverType);
    }
    serverArray.push(server);
  }
  this.event.emit(events.REPLACE_SERVERS, serverArray);
};

/**
 * Add crons from current application at runtime.
 *
 * @param  {Array} crons new crons would be added in application
 * @memberOf Application
 */
Application.addCrons = function(crons) {
  if (!crons || !crons.length) {
    logger.warn('crons is not defined.');
    return;
  }
  this.event.emit(events.ADD_CRONS, crons);
};

/**
 * Remove crons from current application at runtime.
 *
 * @param  {Array} crons old crons would be removed in application
 * @memberOf Application
 */
Application.removeCrons = function(crons) {
  if (!crons || !crons.length) {
    logger.warn('ids is not defined.');
    return;
  }
  this.event.emit(events.REMOVE_CRONS, crons);
};

function _contains(str, settings) {
  if (!settings) {
    return false;
  }

  const ts = settings.split('|');
  let i;
  for (i = 0; i < ts.length; i++) {
    if (str === ts[i]) {
      return true;
    }
  }
  return false;
}

function _bindEvents(Event, app) {
  const emethods = new Event(app);
  let m;
  for (m in emethods) {
    if (typeof emethods[m] === 'function') {
      app.event.on(m, emethods[m].bind(emethods));
    }
  }
}

function _addFilter(app, type, filter) {
  let filters = app.get(type);
  if (!filters) {
    filters = [];
    app.set(type, filters);
  }
  filters.push(filter);
}
