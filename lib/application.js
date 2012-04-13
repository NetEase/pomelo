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
var logger = require('./util/log/log').getLogger(__filename);
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
  
  // router
//  this._router = new Router(this);
//  this.routes = this._router.routes;
//  this.__defineGetter__('router', function(){
//    this._usedRouter = true;
//    this._router.caseSensitive = this.enabled('case sensitive routing');
//    this._router.strict = this.enabled('strict routing');
//    return this._router.middleware;
//  });

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


app.getServers = function(val){
  if (utils.endsWith(val, '.json')){
	  val = require(val);  // read from jason file
  }
  var servers = val[app.env];
  return servers;
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
  var settingPath = './common/service/' + setting;
  path.exists(__dirname+settingPath , function(exists){
      if (exists) {
      	require(settingPath).run(this.get(setting));
      }
  });
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
				app.get('mailRouter').route({type: attach.type, uid: uid}, function(err, serverId) {
					if(!!err) {
						logger.error('fail to route type:' + attach.type + ', uid:' + uid + ', err:' + err.stack);
					}
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
    //console.log('findServer  serverType: '+serverType+ '  typeServers: '+typeServers);
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
    console.log('[app listen] listen on servers invoked ' + server.serverType + ' ' + JSON.stringify(server));
    loadSysRemote(server);
    loadSysProxy();
    var serverInst = require('./server/server.js').createServer(server);	
    serverInst.start();
    app.set('currentServer', serverInst);
    serverInstances.push(serverInst);
};

var loadSysRemote = function(server) {
	if(isFrontEndServer(server)) {
		app.genRemote(server.serverType, __dirname + '/common/remote/frontend', 'sys');
	} else {
		app.genRemote(server.serverType, __dirname + '/common/remote/backend', 'sys');
	}
};

var loadSysProxy = function() {
	var servers = app.get('servers');
	if(!servers) return;
	
	for(var type in servers) {
		if(isFrontEndServer(servers[type])) {
			app.genProxy(type, __dirname + '/common/remote/frontend', 'sys');
		} else {
			app.genProxy(type, __dirname + '/common/remote/backend', 'sys');
		}
	}
};

/**
 * check a server config whether is a front end server
 */
var isFrontEndServer = function(server) {
	return !!server && !!server.wsPort;
};

app.run = function(server){
    console.log('app.run server '+ JSON.stringify(server));
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
  console.log('[app listenAll] listen on servers invoked ' + servers);
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
 * 
 * start node monitor client
 * 
 */
app.startMonitor = function() {
  if (this.env =='development') return ;
  var master = this.master;
  logger.info('monitor connect to master ' + JSON.stringify(master));
  var monitorClient = require('./monitor/monitorClient.js');
  monitorClient.start(this,master);
};
