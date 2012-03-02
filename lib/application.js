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
  , Router = require('./router');

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
  console.log('app.init invoked');
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

app.use = function(route, handler){
  filterManager.use(route, handler);

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
    this[setting] = val;
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
	  //console.log('start app.configure');
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
	  //console.log('[app.configure] runEnv '+ runEnv + ' serverType:'+serverType+' setting.env:'+this.settings.env+' setting.serverType: '+this.settings.serverType);
	  if (runEnv =='all' || runEnv.indexOf(this.settings.env)>=0 ) {
		  if (serverType == 'all' || serverType.indexOf(this.settings.serverType)>=0){
			  fn.call(this);
		  }
	  }
	  return this;
	};

app.genHandler = function(dir) {
    var handlerMap = app.get('handlerMap');
    if (handlerMap == undefined) {
    	handlerMap = {};
        app.set('handlerMap', handlerMap);
    }
    // mock handler
    var fightHandler = require('../demos/webrunner/app/area/handler/fightHandler');
    handlerMap['area.handler.fightHandler.kick'] = fightHandler.kick;
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

app.getHandlerMap = function(){
    var handlerMap = app.get('handlerMap');
    return handlerMap;
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
    var server = findServer(serverType, serverId, app.servers);
    this.listenOnServer(server);
};


function findServer(serverType, serverId, servers){
	var typeServers = servers[serverType];
    for (var i=0; i<typeServers.length; i++) {
        var curServer = typeServers[i];
        //master use first as default server 
        if (serverType==='master'){
        	app.set('serverId',curServer.id);
        	return curServer;
        } else if (curServer.id === serverId){
        	return curServer;
        }
    }
    throw new Error('[findServer] can not find server with serverType:'+serverType+' serverId:'+ serverId);
}

app.listenOnServer = function(server) {
    console.log('[app listen] listen on servers invoked ' + this.serverType + ' ' + JSON.stringify(server));
    var serverInst = require('./'+ this.serverType + '/server.js');	
    serverInst.listen(server);
}

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
    console.log('[app listenListenAll] listen on servers invoked ' + servers);
	for (serverType in servers){
		var typeServers = servers[serverType];
        for (var i=0; i<typeServers.length; i++){
            var server = typeServers[i];	
            app.listenOnServer(server);
        }
	}
}

