/**
 * backend session service for backend session
 */
const utils = require('../../util/utils');

const EXPORTED_FIELDS = ['id', 'frontendId', 'uid', 'settings'];

/**
 * Service that maintains backend sessions and the communication with frontend
 * servers.
 *
 * BackendSessionService would be created in each server process and maintains
 * backend sessions for current process and communicates with the relative
 * frontend servers.
 *
 * BackendSessionService instance could be accessed by
 * `app.get('backendSessionService')` or app.backendSessionService.
 *
 * @class
 * @constructor
 */
class BackendSessionService
{
	constructor(app)
    {
		this.app = app;
	}

	create(opts)
    {
		if (!opts)
        {
			throw new Error('opts should not be empty.');
		}
		return new BackendSession(opts, this);
	}

    /**
     * Get backend session by frontend server id and session id.
     *
     * @param  {String}   frontendId frontend server id that session attached
     * @param  {String}   sid        session id
     * @param  {Function} cb         callback function. args: cb(err, BackendSession)
     *
     * @memberOf BackendSessionService
     */
	get(frontendId, sid, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'getBackendSessionBySid';
		const args = [sid];
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method,
            args, BackendSessionUtility.BackendSessionCB.bind(null, this, cb));
	}

    /**
     * Get backend sessions by frontend server id and user id.
     *
     * @param  {String}   frontendId frontend server id that session attached
     * @param  {String}   uid        user id binded with the session
     * @param  {Function} cb         callback function. args: cb(err, BackendSessions)
     *
     * @memberOf BackendSessionService
     */
	getByUid(frontendId, uid, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'getBackendSessionsByUid';
		const args = [uid];
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method,
            args, BackendSessionUtility.BackendSessionCB.bind(null, this, cb));
	}

    /**
     * Kick a session by session id.
     *
     * @param  {String}   frontendId cooperating frontend server id
     * @param  {Number}   sid        session id
     * @param  {Function} cb         callback function
     *
     * @memberOf BackendSessionService
     */
	kickBySid(frontendId, sid, reason, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'kickBySid';
		const args = [sid];
		if (typeof reason === 'function')
        {
			cb = reason;
		}
		else
        {
			args.push(reason);
		}
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
	}

    /**
     * Kick sessions by user id.
     *
     * @param  {String}          frontendId cooperating frontend server id
     * @param  {Number|String}   uid        user id
     * @param  {String}          reason     kick reason
     * @param  {Function}        cb         callback function
     *
     * @memberOf BackendSessionService
     */
	kickByUid(frontendId, uid, reason, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'kickByUid';
		const args = [uid];
		if (typeof reason === 'function')
        {
			cb = reason;
		}
		else
        {
			args.push(reason);
		}
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
	}

    /**
     * Bind the session with the specified user id. It would finally invoke the
     * the sessionService.bind in the cooperating frontend server.
     *
     * @param  {String}   frontendId cooperating frontend server id
     * @param  {Number}   sid        session id
     * @param  {String}   uid        user id
     * @param  {Function} cb         callback function
     *
     * @memberOf BackendSessionService
     * @api private
     */
	bind(frontendId, sid, uid, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'bind';
		const args = [sid, uid];
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
	}

    /**
     * Unbind the session with the specified user id. It would finally invoke the
     * the sessionService.unbind in the cooperating frontend server.
     *
     * @param  {String}   frontendId cooperating frontend server id
     * @param  {Number}   sid        session id
     * @param  {String}   uid        user id
     * @param  {Function} cb         callback function
     *
     * @memberOf BackendSessionService
     * @api private
     */
	unbind(frontendId, sid, uid, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'unbind';
		const args = [sid, uid];
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
	}

    /**
     * Push the specified customized change to the frontend internal session.
     *
     * @param  {String}   frontendId cooperating frontend server id
     * @param  {Number}   sid        session id
     * @param  {String}   key        key in session that should be push
     * @param  {Object}   value      value in session, primitive js object
     * @param  {Function} cb         callback function
     *
     * @memberOf BackendSessionService
     * @api private
     */
	push(frontendId, sid, key, value, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'push';
		const args = [sid, key, value];
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
	}

    /**
     * Push all the customized changes to the frontend internal session.
     *
     * @param  {String}   frontendId cooperating frontend server id
     * @param  {Number}   sid        session id
     * @param  {Object}   settings   key/values in session that should be push
     * @param  {Function} cb         callback function
     *
     * @memberOf BackendSessionService
     * @api private
     */
	pushAll(frontendId, sid, settings, cb)
    {
		const namespace = 'sys';
		const service = 'sessionRemote';
		const method = 'pushAll';
		const args = [sid, settings];
		BackendSessionUtility.rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
	}
}

/**
 * BackendSession is the proxy for the frontend internal session passed to handlers and
 * it helps to keep the key/value pairs for the server locally.
 * Internal session locates in frontend server and should not be accessed directly.
 *
 * The mainly operation on backend session should be read and any changes happen in backend
 * session is local and would be discarded in next request. You have to push the
 * changes to the frontend manually if necessary. Any push would overwrite the last push
 * of the same key silently and the changes would be saw in next request.
 * And you have to make sure the transaction outside if you would push the session
 * concurrently in different processes.
 *
 * See the api below for more details.
 *
 * @class
 * @constructor
 */
class BackendSession
{
	constructor(opts, service)
    {
		for (const f in opts)
        {
			this[f] = opts[f];
		}
		this.__sessionService__ = service;
	}

    /**
     * Bind current session with the user id. It would push the uid to frontend
     * server and bind  uid to the frontend internal session.
     *
     * @param  {Number|String}   uid user id
     * @param  {Function} cb  callback function
     *
     * @memberOf BackendSession
     */
	bind(uid, cb)
    {
		const self = this;
		this.__sessionService__.bind(this.frontendId, this.id, uid, function(err)
        {
			if (!err)
            {
				self.uid = uid;
			}
			utils.invokeCallback(cb, err);
		});
	}

    /**
     * Unbind current session with the user id. It would push the uid to frontend
     * server and unbind uid from the frontend internal session.
     *
     * @param  {Number|String}   uid user id
     * @param  {Function} cb  callback function
     *
     * @memberOf BackendSession
     */
	unbind(uid, cb)
    {
		const self = this;
		this.__sessionService__.unbind(this.frontendId, this.id, uid, function(err)
        {
			if (!err)
            {
				self.uid = null;
			}
			utils.invokeCallback(cb, err);
		});
	}

    /**
     * Set the key/value into backend session.
     *
     * @param {String} key   key
     * @param {Object} value value
     */
	set(key, value)
    {
		this.settings[key] = value;
	}

    /**
     * Get the value from backend session by key.
     *
     * @param  {String} key key
     * @return {Object}     value
     */
	get(key)
    {
		return this.settings[key];
	}

    /**
     * Push the key/value in backend session to the front internal session.
     *
     * @param  {String}   key key
     * @param  {Function} cb  callback function
     */
	push(key, cb)
    {
		this.__sessionService__.push(this.frontendId, this.id, key, this.get(key), cb);
	}

    /**
     * Push all the key/values in backend session to the frontend internal session.
     *
     * @param  {Function} cb callback function
     */
	pushAll(cb)
    {
		this.__sessionService__.pushAll(this.frontendId, this.id, this.settings, cb);
	}

    /**
     * Export the key/values for serialization.
     *
     * @api private
     */
	export()
    {
		const res = {};
		EXPORTED_FIELDS.forEach(field =>
        {
			res[field] = this[field];
		});
		return res;
	}
}

class BackendSessionUtility
{
	static rpcInvoke(app, sid, namespace, service, method, args, cb)
    {
		app.rpcInvoke(sid, {namespace : namespace,
            service   : service,
            method    : method,
            args      : args
        }, cb);
	}
    
	static BackendSessionCB(service, cb, err, sinfo)
    {
		if (err)
        {
			utils.invokeCallback(cb, err);
			return;
		}

		if (!sinfo)
        {
			utils.invokeCallback(cb);
			return;
		}
		let sessions = [];
		if (Array.isArray(sinfo))
        {
            // #getByUid
			for (let i = 0, k = sinfo.length; i < k; i++)
            {
				sessions.push(service.create(sinfo[i]));
			}
		}
		else
        {
            // #get
			sessions = service.create(sinfo);
		}
		utils.invokeCallback(cb, null, sessions);
	}
}

module.exports = BackendSessionService;