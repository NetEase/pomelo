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
  , handlerManager = require('./handlerManager')
  , Loader = require('module-loader')
  , Proxy = require('local-proxy')
  , logger = require('./util/log/log').getLogger(__filename);

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
  console.log('app.init invoked');
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
  console.log("Enable");
  require('./service/' + setting).run(this.get(setting));
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
	  console.log('[app.configure] runEnv '+ runEnv + ' serverType:'+serverType+' setting.env:'+this.settings.env+' setting.serverType: '+this.settings.serverType);
	  if (runEnv =='all' || runEnv.indexOf(this.settings.env)>=0 ) {
		  if (serverType == 'all' || this.settings.serverType == 'all' || serverType.indexOf(this.settings.serverType)>=0){
			  fn.call(this);
		  }
	  }
	  return this;
	};

/**
 * generate handler instances
 * 
 * @param name server type
 * @param dir handler codes root dir in abosulte path
 */
app.genHandler = function(name, dir) {
	logger.info('[app.genHandler] loading handler module, name:'+name+'   dir:' + dir);
	if(!dir || dir[0] == '.') {
		throw new Error('dir should use absolute path, dir: '+dir );
	}
    
	var handlerMap = app.get('handlerMap');
	if (!handlerMap) {
		handlerMap = {};
		app.set('handlerMap', handlerMap);
	}
    	
	var services = handlerMap[name];
	if(!services) {
		services = {};
	}

	try {
    	logger.info('[app.genHandler] loading handler module, name:'+name+'   dir:' + dir);
		handlerMap[name] = Loader.loadPath({path: dir, recurse: false, rootObj: services});
	} catch(err) {
		logger.warn('fail to load handler for name:' + name +'  dir:'+dir+ ', err message:' + err.message);
	}
};

/**
 * generate remote service instance 
 * 
 * @param name server type
 * @param dir handler codes root dir in abosulte path
 */
app.genRemote = function(name, dir, scope) {
	logger.info('[app.genRemote] loading handler module, name:'+name+'   dir:' + dir);
	var remoteMap = app.get('remoteMap');
	if(!remoteMap) {
		remoteMap = {};
		app.set('remoteMap', remoteMap);
	}
	
	scope = scope || 'user';
	var sobj = remoteMap[scope];
	if(!sobj) {
		sobj = {};
		remoteMap[scope] = sobj;
	}
	
	var services = sobj[name];
	if(!services) {
		services = {};
		sobj[name] = services;
	}
	
	try {
		sobj[name] = Loader.loadPath({path: dir, recurse: false, rootObj: services});
	} catch(err) {
		logger.warn('fail to load remote service for ' + name + ', err message:' + err.message);
	}
}; 

/**
 * generate local proxy for remote interface
 * 
 * @param name server type
 * @param dir handler codes root dir in abosulte path
 * @param scope user or sys, default is user
 */
app.genProxy = function(name, dir, scope) {
	console.log("[app.genProxy]:" + name+'  dir:'+dir);
	var proxyMap = app.get('proxyMap');
	if(!proxyMap) {
		proxyMap = {};
		app.set('proxyMap', proxyMap);
	}
	
	scope = scope || 'user';
	
	var sobj = proxyMap[scope];
	if(!sobj) {
		sobj = {};
		proxyMap[scope] = sobj;
	}
	
	var services = sobj[name];
	if(!services) {
		services = {};
		sobj[name] = services;
	}
	
	/**
	 * local proxy loading callback
	 * replace the origin module object with the proxy object
	 */
	function proxyCallback(namespace, mod) {
		return Proxy.createProxy({
			origin: mod, 
			namespace: namespace, 
			attach: {type: name}, 
			callback: function(namespace, method, args, attach, invoke) {
				var uid, cb;
				if(args.length == 0) {
					uid = '';
					cb = function(){};
				} else {
					uid = args[0];
					if(typeof args[args.length - 1] === 'function') {
						cb = args.pop();
					} else {
						cb = function(){};
					}
				}
				
				var msg = {service: namespace, method: method, args: args};
				console.log(attach);
				app.get('mailRouter').route({type: attach.type, uid: uid}, function(err, serverId) {
					app.get('mailBox').dispatch(serverId, msg, null, cb);
				});
			}
		});
	}; //end of proxyCallback
	
	try {
		sobj[name] = Loader.loadPath({path: dir, recurse: false, namespace: scope + '.' + name, rootObj: services, callback: proxyCallback});
	} catch(err) {
		logger.warn('fail to load proxy for ' + name + ', err message:' + err.message);
	}
}; 	//end of genProxy

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
        	curServer.serverType = serverType;
        	return curServer;
        } else if (curServer.id === serverId){
        	curServer.serverType = serverType;
        	return curServer;
        }
    }
    throw new Error('[findServer] can not find server with serverType:'+serverType+' serverId:'+ serverId);
}

app.listenOnServer = function(server) {
    console.log('[app listen] listen on servers invoked ' + server.serverType + ' ' + JSON.stringify(server));
    loadSysRemote(server);
    loadSysProxy();
    var serverInst = require('./'+ server.serverType + '/server.js');	
    serverInst.listen(server);
    serverInstances.push(serverInst);
};

var loadSysRemote = function(server) {
	app.genRemote(server.serverType, __dirname + '/' + server.serverType + '/remote', 'sys');
};

var loadSysProxy = function() {
	app.genProxy('connector', __dirname + '/connector/remote', 'sys');
	app.genProxy('logic', __dirname + '/logic/remote', 'sys');
	app.genProxy('area', __dirname + '/area/remote', 'sys');
};

app.run = function(server){
	if (server.host =='127.0.0.1' || server.host == 'localhost') {
		var cmd = 'node ' + process.cwd() + '/demos/webrunner/app.js production ' + server.serverType + ' ' + server.id;
		starter.run(cmd);
	} else {
		var cmd = 'node ' + process.cwd() + '/demos/webrunner/app.js production ' + server.serverType + ' ' + server.id;
		starter.sshrun(cmd,server.host);
	}
};
 
app.runAll = function(servers){
 	for (var serverType in servers){
		if (serverType==='master') continue;
		var typeServers = servers[serverType];
		for (var i=0; i<typeServers.length; i++) {
      var curServer = typeServers[i];
      curServer.serverType = serverType;
      this.run(curServer);
		}
	}
};

app.listenAll = function(servers) {
  console.log('[app listenListenAll] listen on servers invoked ' + servers);
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
	console.log('[after listen] after servers linsten invoked ' + servers);
	for(var i=0, l=serverInstances.length; i<l; i++) {
    serverInstances[i].afterStart();
	}
};

/**
 * start monitor client
 */
app.startMonitor = function() {
	var servers = this.servers;
  var typeServers = servers['master'];
  console.log('[app startMonitor] listen on servers invoked master ');
  var monitor = require(process.cwd()+'/lib/monitor/monitorClient.js');
  for (var i=0; i<typeServers.length; i++){
    var server = typeServers[i];	
    monitor.start(this,server);
  }
};
