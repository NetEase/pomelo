/**
 * Component for remote service.
 * Load remote service and add to global context.
 */
const fs = require('fs');
const pathUtil = require('../util/pathUtil');
const RemoteServer = require('pomelo-rpc').server;

class Remote
{
    /**
     * Remote component class
     *
     * @param {Object} app  current application context
     * @param {Object} opts construct parameters
     */
	constructor(app, opts)
    {
		this.app = app;
		this.opts = opts;
		this.name = '__remote__';
	}

    /**
     * Remote component lifecycle function
     *
     * @param {Function} cb
     * @return {Void}
     */
	start(cb)
    {
		this.opts.port = this.app.CurServer.port;
		this.remote = RemoteUtility.GenRemote(this.app, this.opts);
		this.remote.start();
		process.nextTick(cb);
	}

    /**
     * Remote component lifecycle function
     *
     * @param {Boolean}  force whether stop the component immediately
     * @param {Function}  cb
     * @return {Void}
     */
	stop(force, cb)
    {
		this.remote.stop(force);
		process.nextTick(cb);
	}
}

class RemoteUtility
{
    /**
     * Remote component factory function
     *
     * @param {Object} app  current application context
     * @param {Object} opts construct parameters
     *                       opts.acceptorFactory {Object}: acceptorFactory.create(opts, cb)
     * @return {Object}     remote component instances
     */
	static Create(app, opts)
    {
		opts = opts || {};
        // cacheMsg is deprecated, just for compatibility here.
		opts.bufferMsg = opts.bufferMsg || opts.cacheMsg || false;
		opts.interval = opts.interval || 30;
		if (app.enabled('rpcDebugLog'))
        {
			opts.rpcDebugLog = true;
			opts.rpcLogger = require('pomelo-logger').getLogger('rpc-debug', __filename);
		}
		return new Remote(app, opts);
	}

    /**
     * Get remote paths from application
     *
     * @param {Object} app current application context
     * @return {Array} paths
     *
     */
	static GetRemotePaths(app)
    {
		const paths = [];

		let role;
        // master server should not come here
		if (app.isFrontend())
        {
			role = 'frontend';
		}
		else
        {
			role = 'backend';
		}

		const sysPath = pathUtil.getSysRemotePath(role), serverType = app.ServerType;
		if (fs.existsSync(sysPath))
        {
			paths.push(pathUtil.remotePathRecord('sys', serverType, sysPath));
		}
		const userPath = pathUtil.getUserRemotePath(app.Base, serverType);
		if (fs.existsSync(userPath))
        {
			paths.push(pathUtil.remotePathRecord('user', serverType, userPath));
		}

		return paths;
	}

    /**
     * Generate remote server instance
     *
     * @param {Object} app current application context
     * @param {Object} opts contructor parameters for rpc Server
     * @return {Object} remote server instance
     */
	static GenRemote(app, opts)
    {
		opts.paths = RemoteUtility.GetRemotePaths(app);
		opts.context = app;
		if (opts.rpcServer)
        {
			return opts.rpcServer.create(opts);
		}
		return RemoteServer.create(opts);
	}
}

module.exports = RemoteUtility.Create;