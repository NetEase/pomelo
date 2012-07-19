var connect = require('connect');
var path = require('path');
var fs = require('fs');
var filterManager = require('./filterManager');
var debug = require('debug')('pomelo:application');
var utils = require('./util/utils');
var starter = require('./master/starter');
var logger = require('./util/log/log').getLogger(__filename);
var async = require('async');

var app = module.exports = {};
var serverInstances = [];	//just for test. chang

/**
 * Initialize the server.
 *
 *   - setup default configuration
 *   - setup default components
 *   - setup route reflection methods
 *
 * @api private
 */
app.init = function(){
  logger.info('app.init invoked');
  this.cache = {};
  this.loaded = [];
  this.settings = {};
  this.defaultConfiguration();
  this.set('filterManager', filterManager);
};

/**
 * Initialize application configuration.
 *
 * @api private
 */
app.defaultConfiguration = function(){
  var self = this;

  // default settings
  this.set('env', process.env.NODE_ENV || 'development');
  debug('booting in %s mode', this.get('env'));

  // app locals
  this.locals = function(obj){
    for (var key in obj) {
      self.locals[key] = obj[key];
    }
    return self;
  };
  // default locals
  this.locals.settings = this.settings;

  this.set('channelService', require('./common/service/channelService'));
};

/**
 * Add a filter instance to before and after filter
 *
 * @param filter {Object} provide before and after filter method.
 *    For example {before: function, after: function}
 */
app.filter = function(filter) {
  filterManager.before(filter);
  filterManager.after(filter);
};

/**
 * Add a before filter
 *
 * @param bf {Object|Function} filter instance or filter function
 */
app.before = function(bf) {
  filterManager.before(bf);
};

/**
 * Add a after filter
 *
 * @param bf {Object|Function} filter instance or filter function
 */
app.after = function(fn) {
  filterManager.after(fn);
};

/**
 * Load component
 *
 * @param component {Object} component instance
 * @param opts {Object} component init params
 * @return {Object} current manager instance for chain invoke
 */
app.load = function(component, opts) {
  if(!component) {
    logger.error('load empty component');
    return this;
  }

  this.loaded.push({component: component, opts: opts});
  if(!!component.name) {
    this.settings[component.name] = true;
  }

  return this;
};

/**
 * Init and start loaded components.
 *
 * @param opts {Object} start parameters
 */
app.start = function(opts) {
  if(!!this.__started) {
    logger.error('application has already started.');
    return;
  }

  var commands = ['init', 'start'];
  var self = this;
  async.forEachSeries(commands, function(command, cb) {
    self._optComponents(opts, command, cb);
  }, function(err) {
    if(!!err) {
      logger.error('fail to start components for err:' + err.stack);
      process.exit(1);
      return;
    }
  });
};

/**
 * Apply command to component
 *
 * @param opts {Object} component invoke paramerters
 * @param method {String} component invoke method name
 * @param cb {Function} callback function for component invoke
 * @return {Void}
 */
app._optComponents = function(opts, method, cb) {
  var self = this;
  async.forEachSeries(this.loaded, function(item, cb) {
    var comp = item.component;
    var lopts = item.opts||{};
    utils.merge(lopts, opts);
    if(typeof comp[method] === 'function') {
      comp[method](self, lopts, cb);
    } else {
      logger.warn('ignore component not with %s function, name: %s', method, comp.name);
      cb();
    }
  }, function(err) {
    if(!!err) {
      logger.error('fail to operate component, method:%s, err:' + err.stack, method);
    }
    utils.invokeCallback(cb, err);
  });
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {String} val
 * @return {Server|Mixed} for chaining, or the setting value
 * @api public
 */
app.set = function(setting, val){
  var env = app.get('env');
  if (utils.endsWith(val, '.json')){
    console.log(val);
    val = require(val);  // read from jason file
    // get from env value, should not use jason contains production, development or localpro
    if (!!val[env]){
      val = val[env];
    }
  }
  if (1 === arguments.length) {
    if (this.settings.hasOwnProperty(setting)) {
      return this.settings[setting];
    } else if (this.parent) {
      return this.parent.set(setting);
    }
  } else {
    this.settings[setting] = val;
    this[setting] = val;
    return this;
  }
};

/**
 * Get server info list for current enviroment.
 *
 * @param val {Object|String} server info map or server info map file name
 * @return {Object} current server info list
 */
app.getServers = function(val){
  if (utils.endsWith(val, '.json')){
    val = require(val);  // read from jason file
  }
  var servers = val[app.env];
  return servers;
};

/**
 * Get setting value.
 *
 * @param setting {String} setting key
 * @return {Object} setting value
 */
app.get = function(setting){
  var val = this.settings[setting];
  return val;
};

/**
 * Return the app's absolute pathname
 * based on the parent(s) that have
 * mounted it.
 *
 * @return {String}
 * @api private
 */
app.path = function(){
  return this.parent ? this.parent.path() + this.route : '';
};

/**
 * Check if `setting` is enabled.
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */
app.enabled = function(setting){
  return !!this.set(setting);
};

/**
 * Check if `setting` is disabled.
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */
app.disabled = function(setting){
  return !this.set(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */
app.enable = function(setting){
  var settingPath = __dirname + '/common/service/' + setting + '.js';
  //console.log('enable');

  var exists = path.existsSync(settingPath);
  if (exists) {
  	//console.log('config: ' + setting + 'Config');
    require(settingPath).run(app.get(setting + 'Config'));
  }
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */
app.disable = function(setting){
  return this.set(setting, false);
};

/**
 * Configure callback for zero or more envs,
 * when no env is specified that callback will
 * be invoked for all environments. Any combination
 * can be used multiple times, in any order desired.
 *
 * Examples:
 *
 *    app.configure(function(){
 *      // executed for all envs
 *    });
 *
 *    app.configure('stage', function(){
 *      // executed staging env
 *    });
 *
 *    app.configure('stage', 'production', function(){
 *      // executed for stage and production
 *    });
 *
 * @param {String} env...
 * @param {Function} fn
 * @return {app} for chaining
 * @api public
 */
app.configure = function(env, fn){
  var args = [].slice.call(arguments);
  fn = args.pop();

  var runEnv = 'all';
  if (args.length > 0){
    runEnv = args[0];
  }
  var serverType = 'all';
  if (args.length > 1) {
    serverType = args[1];
  }
  if (runEnv === 'all' || runEnv.indexOf(this.settings.env) >= 0 ) {
    if (serverType === 'all' || this.settings.serverType === 'all' || serverType.indexOf(this.settings.serverType) >= 0){
      fn.call(this);
    }
  }
  return this;
};

/**
 * Find server info for specified server type and server id.
 *
 * @param serverType {String} server type
 * @param serverId {String} server id
 * @return {Object} server info if any
 */
app.findServer = function(serverType, serverId){
  var servers = app.get('servers');//[app.env];
  var typeServers = servers[serverType];
  for (var i=0; i<typeServers.length; i++) {
    var curServer = typeServers[i];
    if (curServer.id === serverId){
      curServer.serverType = serverType;
      return curServer;
    }
  }
};

/**
 * Close server and kill all server processes.
 */
app.quit = function(){
  var servers = this.servers;
  var cmd;
  for (var serverType in servers){
    if (serverType === 'master' || serverType === 'connector') {
      continue;
    }
    var typeServers = servers[serverType];
    for (var i=0; i < typeServers.length; i++) {
      var server = typeServers[i];
      if (server.host === '127.0.0.1' || server.host === 'localhost') {
        process.exit(1);
      } else {
        cmd = "kill   -9   `ps   -ef | grep node|awk   '{print   $2}'`";
        starter.sshrun(cmd,server.host);
      }
    }
  }
  try {
    cmd = "kill   -9   `ps   -ef | grep node|awk   '{print   $2}'`";
    starter.run(cmd);
    process.exit(1);
  } catch(ex) {
    console.error('quit get error ' + ex);
  }
};

/**
 * start node monitor client
 */
app.startMonitor = function() {
  var master = this.master;
  logger.info('monitor connect to master ' + JSON.stringify(master));
  var monitorClient = require('./monitor/monitorClient.js');
  monitorClient.start(this,master);
};

/**
 * start admin console
 */
app.startConsole = function(){
	if (app.serverType==='master' || app.serverType==='all') {
		require('../adminConsole/appCon');
	}
};
