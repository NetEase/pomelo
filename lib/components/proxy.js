/**
 * Component for proxy.
 * Generate proxies for rpc client.
 */
const crc = require('crc'),
	utils = require('../util/utils'),
	events = require('../util/events'),
	Client = require('pomelo-rpc-upgrade').client,
	pathUtil = require('../util/pathUtil'),
	Constants = require('../util/constants'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	_ = require('lodash');

/**
 * Component factory function
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 *                      opts.router: (optional) rpc message route function, route(routeParam, msg, cb),
 *                      opts.mailBoxFactory: (optional) mail box factory instance.
 * @return {Object}     component instance
 */
module.exports = function(app, opts)
{
	if (!(this instanceof Component))
    {
		return new Component(app, opts);
	}
};

class Component
{
    /**
     * Proxy component class
     *
     * @param {Object} app  current application context
     * @param {Object} opts construct parameters
     */
	constructor(app, opts)
    {
		opts = opts || {};
        // proxy default config
        // cacheMsg is deprecated, just for compatibility here.
		opts.bufferMsg = opts.bufferMsg || opts.cacheMsg || false;
		opts.interval = opts.interval || 30;
		opts.router = ProxyUtility.GenRouteFun();
		opts.context = app;
		opts.routeContext = app;
		if (app.enabled('rpcDebugLog'))
        {
			opts.rpcDebugLog = true;
			opts.rpcLogger = require('pomelo-logger').getLogger('rpc-debug', __filename);
		}
		this.name = '__proxy__';
		this.app = app;
		this.opts = opts;
		this.client = ProxyUtility.GenRpcClient(this.app, opts);
		this.app.event.on(events.ADD_SERVERS, this.addServers.bind(this));
		this.app.event.on(events.REMOVE_SERVERS, this.removeServers.bind(this));
		this.app.event.on(events.REPLACE_SERVERS, this.replaceServers.bind(this));
	}

    /**
     * Proxy component lifecycle function
     *
     * @param {Function} cb
     * @return {Void}
     */
	start(cb)
    {
		if (this.opts.enableRpcLog)
        {
			logger.warn('enableRpcLog is deprecated in 0.8.0, please use app.rpcFilter(pomelo.rpcFilters.rpcLog())');
		}
		const rpcBefores = this.app.get(Constants.KEYWORDS.RPC_BEFORE_FILTER);
		const rpcAfters = this.app.get(Constants.KEYWORDS.RPC_AFTER_FILTER);
		const rpcErrorHandler = this.app.get(Constants.RESERVED.RPC_ERROR_HANDLER);

		if (rpcBefores)
        {
			this.client.before(rpcBefores);
		}
		if (rpcAfters)
        {
			this.client.after(rpcAfters);
		}
		if (rpcErrorHandler)
        {
			this.client.setErrorHandler(rpcErrorHandler);
		}
		process.nextTick(cb);
	}

    /**
     * Component lifecycle callback
     *
     * @param {Function} cb
     * @return {Void}
     */
	afterStart(cb)
    {
		utils.DefineGetter(this.app, 'rpc', () =>
		{
			return this.client.proxies.user;
		});

		utils.DefineGetter(this.app, 'sysrpc', () =>
		{
			return this.client.proxies.sys;
		});

		this.app.set('rpcInvoke', this.client.rpcInvoke.bind(this.client), true);
		this.client.start(cb);
	}

    /**
     * Add remote server to the rpc client.
     *
     * @param {Array} servers server info list, {id, serverType, host, port}
     */
	addServers(servers)
    {
		if (!servers || !servers.length)
        {
			return;
		}

		ProxyUtility.GenProxies(this.client, this.app, servers);
		this.client.addServers(servers);
	}

    /**
     * Remove remote server from the rpc client.
     *
     * @param  {Array} ids server id list
     */
	removeServers(ids)
    {
		this.client.removeServers(ids);
	}

    /**
     * Replace remote servers from the rpc client.
     *
     * @param  {Array} servers server id list
     */
	replaceServers(servers)
    {
		if (!servers || !servers.length)
        {
			return;
		}

        // update proxies
		this.client.proxies = {};
		ProxyUtility.GenProxies(this.client, this.app, servers);

		this.client.replaceServers(servers);
	}

    /**
     * Proxy for rpc client rpcInvoke.
     *
     * @param {String}   serverId remote server id
     * @param {Object}   msg      rpc message: {serverType: serverType, service: serviceName, method: methodName, args: arguments}
     * @param {Function} cb      callback function
     */
	rpcInvoke(serverId, msg, cb)
    {
		this.client.rpcInvoke(serverId, msg, cb);
	}
}

class ProxyUtility
{

    /**
     * Generate rpc client
     *
     * @param {Object} app current application context
     * @param {Object} opts contructor parameters for rpc client
     * @return {Object} rpc client
     */
	static GenRpcClient(app, opts)
    {
		opts.context = app;
		opts.routeContext = app;
		if (opts.rpcClient)
        {
			return opts.rpcClient.create(opts);
		}
		return Client.create(opts);
	}

    /**
     * Generate proxy for the server infos.
     *
     * @param  {Object} client rpc client instance
     * @param  {Object} app    application context
     * @param  {Array} serverInfoList server info list
     */
	static GenProxies(client, app, serverInfoList)
    {
		_.forEach(serverInfoList, serverInfo =>
        {
			if (!ProxyUtility.HasProxy(client, serverInfo))
            {
				client.addProxies(ProxyUtility.GetProxyRecords(app, serverInfo));
			}
		});
	}

    /**
     * Check a server whether has generated proxy before
     *
     * @param  {Object}  client rpc client instance
     * @param  {Object}  serverInfo  server info
     * @return {Boolean}        true or false
     */
	static HasProxy(client, serverInfo)
    {
		const proxy = client.proxies;
		return proxy.sys && proxy.sys[serverInfo.serverType];
	}

    /**
     * Get proxy path for rpc client.
     * Iterate all the remote service path and create remote path record.
     *
     * @param {Object} app current application context
     * @param {Object} serverInfo server info, format: {id, serverType, host, port}
     * @return {Array}     remote path record array
     */
	static GetProxyRecords(app, serverInfo)
    {
		const records = [],
			appBase = app.getBase();
		let	record;
        // sys remote service path record
		if (app.isFrontend(serverInfo))
        {
			record = pathUtil.getSysRemotePath('frontend');
		}
		else
        {
			record = pathUtil.getSysRemotePath('backend');
		}
		if (record)
        {
			records.push(pathUtil.remotePathRecord('sys', serverInfo.serverType, record));
		}

        // user remote service path record
		record = pathUtil.getUserRemotePath(appBase, serverInfo.serverType);
		if (record)
        {
			records.push(pathUtil.remotePathRecord('user', serverInfo.serverType, record));
		}

		return records;
	}

	static GenRouteFun()
    {
		return function(session, msg, app, cb)
        {
			const routes = app.get('__routes__');

			if (!routes)
            {
				ProxyUtility.DefaultRoute(session, msg, app, cb);
				return;
			}

			const type = msg.serverType,
				route = routes[type] || routes['default'];

			if (route)
            {
				route(session, msg, app, cb);
			}
			else
            {
				ProxyUtility.DefaultRoute(session, msg, app, cb);
			}
		};
	}

	static DefaultRoute(session, msg, app, cb)
    {
		const list = app.getServersByType(msg.serverType);
		if (!list || !list.length)
        {
			cb(new Error(`can not find server info for type:${msg.serverType}`));
			return;
		}

		const uid = session ? (session.uid || '') : '';
		const index = Math.abs(crc.crc32(uid.toString())) % list.length;
		utils.invokeCallback(cb, null, list[index].id);
	}
}

