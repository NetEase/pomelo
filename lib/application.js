/*!
 * Pomelo -- proto
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var connect = require('connect');
var path = require('path');
var fs = require('fs');
var filterManager = require('./filterManager');
var debug = require('debug')('pomelo:application');
var utils = require('./util/utils');
var starter = require('./master/starter');
var Loader = require('module-loader');
var Proxy = require('local-proxy');
var log = require('./util/log/log');
var logger = log.getLogger(__filename);
var path = require('path');

/**
 * Application prototype.
 */

var app = exports = module.exports = {};
var serverInstances = [];	//just for test. chang

/**
 * Initialize the server.
 *
 *   - setup default configuration
 *   - setup default middleware
 *   - setup route reflection methods
 *
 * @api private
 */
app.init = function(){
  logger.info('app.init invoked');
  var self = this;
  this.cache = {};
  this.settings = {};
  this.engines = {};
  this.defaultConfiguration();
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
    for (var key in obj) self.locals[key] = obj[key];
    return self;
  };
  // default locals
  this.locals.settings = this.settings;

  this.set('channelManager', require('./common/service/channelManager'));
};

/**
 * Proxy `connect#use()` to apply settings to
 * mounted applications.
 *
 * @param {String|Function|Server} route
 * @param {Function|Server} fn
 * @return {app} for chaining
 * @api public
 */
app.use = function(route, fn){
  filterManager.use.call(this, route, fn);

  return this;
};

/**
 * load and init component
 */
app.load = function(componentName) {
  var module = require('./components/' + componentName);
  module(this);
  this.settings[componentName] = true;
};

app.handle = function(msg, session, fn) {
  filterManager.filter(msg, session, fn);
}

app.engine = function(ext, fn){
  if ('.' != ext[0]) ext = '.' + ext;
  this.engines[ext] = fn;
  return this;
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
    val = require(val);  // read from jason file
    // get from env value, should not use jason contains production, development or localpro
    if (!!val[env]){
      val = val[env];
    }
  }
  if (1 == arguments.length) {
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

app.getServers = function(val){
  if (utils.endsWith(val, '.json')){
    val = require(val);  // read from jason file
  }
  var servers = val[app.env];
  return servers;
};

app.configAreas = function(val){
  var result = app.get('areas');
  var servers = app.get('areasMap');
  var map = {};
  for(var key in servers){
    var areas = servers[key];
    for(var id in areas){
      result[areas[id]].server = key;
    }
  }

  app.set('areas', result);
}

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
  return this.parent
    ? this.parent.path() + this.route
    : '';
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
  if (runEnv =='all' || runEnv.indexOf(this.settings.env)>=0 ) {
    if (serverType == 'all' || this.settings.serverType == 'all' || serverType.indexOf(this.settings.serverType)>=0){
      fn.call(this);
    }
  }
  return this;
};

app.configLog = function(logConfFile) {
  log.configure(logConfFile);
};

/**
 * Listen for connections.
 *
 * This method takes the same arguments
 * as node's `http.Server#listen()`.
 *
 * @return {http.Server}
 * @api public
 */
app.listen = function(serverType, serverId){
  var server = app.findServer(serverType, serverId);
  this.listenOnServer(server);
};

app.masterlisten = function() {
  var master = app.master;
  app.set('serverId',master.id);
  var serverInst = require('./master/server.js');
  serverInst.listen(master);
  app.set('currentServer', serverInst);
}

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
  throw new Error('[findServer] can not find server with serverType:'+serverType+' serverId:'+ serverId);
}

app.listenOnServer = function(server) {
  app.set('curServer', server);
  var serverInst = require('./server/server.js').createServer(server);
  serverInst.start();
  app.set('currentServer', serverInst);
  serverInstances.push(serverInst);
};

/**
 * check a server config whether is a front end server
 */
var isFrontEndServer = function(server) {
  return !!server && !!server.wsPort;
};

app.run = function(server){
  var cmd = 'cd '+ process.cwd()+ ' && node '+app.main+'  ' + app.env + '  ' + server.serverType + ' ' + server.id;
  if (server.host =='127.0.0.1' || server.host == 'localhost') {
    cmd =  'cd '+ process.cwd()+ ' && node ' +app.main +'  '+ app.env + '  ' + server.serverType + ' ' + server.id;
    starter.run(cmd);
  } else {
    starter.sshrun(cmd,server.host);
  }
};

app.quit = function(){
  var servers = this.servers;
  for (var serverType in servers){
    if (serverType == 'master' || serverType == 'connector') continue;
    var typeServers = servers[serverType];
    for (var i=0; i < typeServers.length; i++) {
      var server = typeServers[i];
      if (server.host=='127.0.0.1' || server.host == 'localhost') {
        process.exit(1);
      } else {
        var cmd = "kill   -9   `ps   -ef | grep node|awk   '{print   $2}'`";
        starter.sshrun(cmd,server.host);
      }
    }
  }
  try {
    var cmd = "kill   -9   `ps   -ef | grep node|awk   '{print   $2}'`";
    starter.run(cmd);
    process.exit(1);
  } catch(ex) {
    console.error('quit get error ' + ex);
  }
};

app.runAll = function(servers,except){
  for (var serverType in servers){
    var typeServers = servers[serverType];
    for (var i=0; i<typeServers.length; i++) {
      var curServer = typeServers[i];
      curServer.serverType = serverType;
      this.run(curServer);
    }
  }
};

app.listenAll = function(servers) {
  for (serverType in servers){
    var typeServers = servers[serverType];
    for (var i=0; i<typeServers.length; i++){
      var server = typeServers[i];
      server.serverType = serverType;
      app.listenOnServer(server);
    }
  }

  afterListen(servers);
};

var afterListen = function(servers) {
  for(var i=0, l=serverInstances.length; i<l; i++) {
    serverInstances[i].afterStart();
  }
};

/**
 *
 * start node monitor client
 *
 */
app.startMonitor = function() {
  var master = this.master;
  logger.info('monitor connect to master ' + JSON.stringify(master));
  var monitorClient = require('./monitor/monitorClient.js');
  monitorClient.start(this,master);
};
