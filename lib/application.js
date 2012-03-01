/*!
 * Pomelo -- proto
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var connect = require('connect')
  , path = require('path')
  , fs = require('fs')
  , filterManager = require('./filterManager')
  , debug = require('debug')('pomelo:application')
  , utils = require('./util/utils')
  , starter = require('./master/starter')
  , Router = require('./router')
  , handlerManager = require('./handlerManager');

/**
 * Application prototype.
 */

var app = exports = module.exports = {};

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
  var self = this;
  this.cache = {};
  this.settings = {};
  this.engines = {};
  this.defaultConfiguration();
  this.handlerManager = handlerManager;
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
  
  // router
  this._router = new Router(this);
  this.routes = this._router.routes;
  this.__defineGetter__('router', function(){
    this._usedRouter = true;
    this._router.caseSensitive = this.enabled('case sensitive routing');
    this._router.strict = this.enabled('strict routing');
    return this._router.middleware;
  });

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
  var app, home, handle;

  // default route to '/'
  if ('string' != typeof route) fn = route, route = '/';
  
  console.log('[app.use] route: '+route + ' func: '+fn);

  // express app
  if (fn.handle && fn.set) app = fn;
  // restore .app property on req and res
  if (app) {
    app.route = route;
    fn = function(session, next) {
      var orig = session.app;
      app.handle(session, function(err){
        session.app = session.app = orig;
        next(err);
      });
    };
  }

  filterManager.use.call(this, route, fn);

  return this;
};

app.handle = function(session, fn) {
    filterManager.filter(session, fn);	
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
  if (utils.endsWith(val, '.json')){
	  val = require(val);  // read from jason file
  }
  if (1 == arguments.length) {
    if (this.settings.hasOwnProperty(setting)) {
      return this.settings[setting];
    } else if (this.parent) {
      return this.parent.set(setting);
    }
  } else {
    this.settings[setting] = val;
    return this;
  }
};


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
  var envs = 'all'
    , args = [].slice.call(arguments);
  fn = args.pop();
  if (args.length) envs = args;
  if ('all' == envs || ~envs.indexOf(this.settings.env)) fn.call(this);
  return this;
};

app.genHandler = function(dir) {
//    var handlerMap = app.get('handlerMap');
//    if (handlerMap == undefined) {
//    	handlerMap = {};
//    }
//    fs.readdir(dir, function(files){
//    	for (var i = 0; i<files.length; i++){
//    		var file = files[i];
//            handlerMap.put(file, mailbox.genHandler(file));
//    	}
//    });
}

app.genRemote = function(dir) {
//    var remoteMap = app.get('remoteMap');
//    if (remoteMap == undefined) {
//    	remoteMap = {};
//    }
//    fs.readdir(dir, function(files){
//    	for (var i = 0; i<files.length; i++){
//    		var file = files[i];
//            remoteMap.put(file,mailbox.genRemote(file));
//    	}
//    });
}

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
    var typeServers = app.get('servers')[serverType];
   
    for (var server in typeServers){
        var serverInst = require('./'+ serverType + '/server.js');	
        serverInst.listen(server.port);
    }
};

app.run = function(server){
	if (app.host =='127.0.0.1' || app.host == 'localhost') {
		starter.run(server);
	}
	else {
		starter.sshrun(server);
	}
}

app.runAll = function(servers){
	
}

app.listenAll = function(servers) {
	
}

