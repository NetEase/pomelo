/**
 * Component for proxy.
 * Generate proxies for rpc client.
 */
var Client = require('pomelo-rpc').client;
var pathUtil = require('../util/pathUtil');
var crc = require('crc');

/**
 * Component factory function
 * 
 * @param	{Object} app	current application context
 * @param	{Object} opts construct parameters
 *											opts.router: (optional) rpc message route function, route(routeParam, msg, cb), 
 *											opts.mailBoxFactory: (optional) mail box factory instance.
 * @return {Object}			component instance
 */
module.exports = function(app, opts) {
	opts = opts || {};
	// proxy default config
	opts.cacheMsg = false;
	opts.interval = opts.interval || 30;
	opts.lazyConnect = opts.lazyConnect || true;
	opts.router = genRouteFun();
	opts.context = app;
	opts.routeContext = app;
	opts.servers = app.get('servers');

	return new Proxy(app, opts);
};

/**
 * Proxy component class
 * 
 * @param {Object} app	current application context
 * @param {Object} opts construct parameters
 */
var Proxy = function(app, opts) {
	this.client = null;
	this.app = app;
	this.opts = opts;
	this.client = genRpcClient(this.app, opts);
};

var pro = Proxy.prototype;

/**
 * Proxy component lifecycle function
 * 
 * @param	{Function} cb 
 * @return {Void}			
 */
pro.start = function(cb) {
	if(this.opts.enableRpcLog) {
		this.client.filter(require('../filters/rpc/rpcLog'));
	}
	process.nextTick(cb);
};

/**
 * Component lifecycle callback 
 * 
 * @param	{Function} cb 
 * @return {Void}		 
 */
pro.afterStart = function(cb) {
	this.app.set('rpc', this.client.proxies.user, true);
	this.app.set('sysrpc', this.client.proxies.sys, true);
	this.app.set('rpcInvoke', this.client.rpcInvoke.bind(this.client), true);
	this.client.start(cb);
};

/**
 * Proxy for rpc client rpcInvoke.
 * 
 * @param	{String}	 serverId remote server id
 * @param	{Object}	 msg			rpc message: {serverType: serverType, service: serviceName, method: methodName, args: arguments}
 * @param	{Function} cb			 callback function
 */
pro.rpcInvoke = function(serverId, msg, cb) {
	this.client.rpcInvoke(serverId, msg, cb);
};

/**
 * Generate rpc client
 *
 * @param {Object} app current application context
 * @param {Object} opts contructor parameters for rpc client
 * @return {Object} rpc client
 */
var genRpcClient = function(app, opts) {
	var paths = getProxyPaths(app);
	opts.paths = paths;
	opts.context = app;
	opts.routeContext = app;

	return Client.create(opts);
};

/**
 * Get proxy path for rpc client.
 * Iterate all the remote service path and create remote path record.
 * 
 * @param	{Object} app current application context
 * @return {Array}		 remote path record array
 */
var getProxyPaths = function(app) {
	var paths = [], appBase = app.getBase(), p;
	var servers = app.getServers(), sinfo, serverType;
	for(var sid in servers) {
		sinfo = servers[sid];
		serverType = sinfo.serverType;
		// sys remote service path record
		if(app.isFrontend(sinfo)) {
			p = pathUtil.getSysRemotePath('frontend');
		} else {
			p = pathUtil.getSysRemotePath('backend');
		}
		if(p) {
			paths.push(pathUtil.remotePathRecord('sys', serverType, p));
		}

		// user remote service path record
		p = pathUtil.getUserRemotePath(appBase, serverType);
		if(p) {
			paths.push(pathUtil.remotePathRecord('user', serverType, p));
		}
	}

	return paths;
};

var genRouteFun = function() {
	return function(session, msg, app, cb) {
		var routes = app.get('__routes__');

		if(!routes) {
			defaultRoute(session, msg, app, cb);
			return;
		}

		var type = msg.serverType, route = routes[type] || routes['default'];

		if(route) {
			route(session, msg, app, cb);
		} else {
			defaultRoute(session, msg, app, cb);
		}
	};
};

var defaultRoute = function(session, msg, app, cb) {
	var servers = app.get('servers');

	if(!servers) {
		cb(new Error('empty server configs.'));
		return;
	}

	var list = servers[msg.serverType];
	if(!list) {
		cb(new Error('can not find server info for type:' + msg.serverType));
		return;
	}

	var uid = session ? (session.uid || '') : '';
	var index = Math.abs(crc.crc32(uid)) % list.length;
	cb(null, list[index].id);
};