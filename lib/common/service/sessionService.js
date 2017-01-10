const _ = require('lodash'),
	EventEmitter = require('events').EventEmitter,
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	utils = require('../../util/utils');

const FRONTEND_SESSION_FIELDS = ['id', 'frontendId', 'uid', '__sessionService__'];
const EXPORTED_SESSION_FIELDS = ['id', 'frontendId', 'uid', 'settings'];

const ST_INITED = 0;
const ST_CLOSED = 1;

class SessionService
{
	/**
	 * Session service maintains the internal session for each client connection.
	 *
	 * Session service is created by session component and is only
	 * <b>available</b> in frontend servers. You can access the service by
	 * `app.get('sessionService')` or `app.sessionService` in frontend servers.
	 *
	 * @param {Object} opts constructor parameters
	 * @class
	 * @constructor
	 */
	constructor(opts)
	{
		opts = opts || {};
		this.singleSession = opts.singleSession;
		this.sessions = {};     // sid -> session
		this.uidMap = {};       // uid -> sessions
	}

	/**
	 * Create and return internal session.
	 *
	 * @param {Integer} sid uniqe id for the internal session
	 * @param {String} frontendId frontend server in which the internal session is created
	 * @param {Object} socket the underlying socket would be held by the internal session
	 *
	 * @return {Session}
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	create(sid, frontendId, socket)
	{
		const session = new Session(sid, frontendId, socket, this);
		this.sessions[session.id] = session;

		return session;
	}

	/**
	 * Bind the session with a user id.
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	bind(sid, uid, cb)
	{
		const session = this.sessions[sid];

		if (!session)
		{
			process.nextTick(() =>
			{
				cb(new Error(`session does not exist, sid: ${sid}`));
			});
			return;
		}

		if (session.uid)
		{
			if (session.uid === uid)
			{
				// already bound with the same uid
				cb();
				return;
			}

			// already bound with other uid
			process.nextTick(() =>
			{
				cb(new Error(`session has already bound with ${session.uid}`));
			});
			return;
		}

		let sessions = this.uidMap[uid];

		if (this.singleSession && sessions)
		{
			process.nextTick(() =>
			{
				cb(new Error(`singleSession is enabled, and session has already bound with uid: ${uid}`));
			});
			return;
		}

		if (!sessions)
		{
			sessions = this.uidMap[uid] = [];
		}

		for (let i = 0, l = sessions.length; i < l; i++)
		{
			// session has binded with the uid
			if (sessions[i].id === session.id)
			{
				process.nextTick(cb);
				return;
			}
		}
		sessions.push(session);
		session.bind(uid);
		if (cb)
		{
			process.nextTick(cb);
		}
	}

	/**
	 * Unbind a session with the user id.
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	unbind(sid, uid, cb)
	{
		const session = this.sessions[sid];

		if (!session)
		{
			process.nextTick(function()
			{
				cb(new Error(`session does not exist, sid: ${sid}`));
			});
			return;
		}

		if (!session.uid || session.uid !== uid)
		{
			process.nextTick(function()
			{
				cb(new Error(`session has not bind with ${session.uid}`));
			});
			return;
		}

		const sessions = this.uidMap[uid];

		if (sessions)
		{
			let session;
			for (let i = 0, l = sessions.length; i < l; i++)
			{
				session = sessions[i];
				if (session.id === sid)
				{
					sessions.splice(i, 1);
					break;
				}
			}

			if (sessions.length === 0)
			{
				delete this.uidMap[uid];
			}
		}
		session.unbind(uid);

		if (cb)
		{
			process.nextTick(cb);
		}
	}

	/**
	 * Get session by id.
	 *
	 * @param {Number} sid The session id
	 * @return {Session}
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	get(sid)
	{
		return this.sessions[sid];
	}

	/**
	 * Get sessions by userId.
	 *
	 * @param {Number} uid User id associated with the session
	 * @return {Array} list of session binded with the uid
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	getByUid(uid)
	{
		return this.uidMap[uid];
	}

	/**
	 * Remove session by key.
	 *
	 * @param {Number} sid The session id
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	remove(sid)
	{
		const session = this.sessions[sid];
		if (session)
		{
			const uid = session.uid;
			delete this.sessions[session.id];

			const sessions = this.uidMap[uid];
			if (!sessions)
			{
				return;
			}

			for (let i = 0, l = sessions.length; i < l; i++)
			{
				if (sessions[i].id === sid)
				{
					sessions.splice(i, 1);
					if (sessions.length === 0)
					{
						delete this.uidMap[uid];
					}
					break;
				}
			}
		}
	}

	/**
	 * Import the key/value into session.
	 *
	 * @api private
	 */
	import(sid, key, value, cb)
	{
		const session = this.sessions[sid];
		if (!session)
		{
			utils.invokeCallback(cb, new Error(`session does not exist, sid: ${sid}`));
			return;
		}
		session.set(key, value);
		utils.invokeCallback(cb);
	}

	/**
	 * Import new value for the existed session.
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	importAll(sid, settings, cb)
	{
		const session = this.sessions[sid];
		if (!session)
		{
			utils.invokeCallback(cb, new Error(`session does not exist, sid: ${sid}`));
			return;
		}

		_.forEach(settings, (setting, key) =>
		{
			session.set(key, setting);
		});
		utils.invokeCallback(cb);
	}

	/**
	 * Kick all the session offline under the user id.
	 *
	 * @param {Number}   uid user id asscociated with the session
	 * @param {Function} cb  callback function
	 *
	 * @memberOf SessionService
	 */
	kick(uid, reason, cb)
	{
		// compatible for old kick(uid, cb);
		if (typeof reason === 'function')
		{
			cb = reason;
			reason = 'kick';
		}
		const sessions = this.getByUid(uid);

		if (sessions)
		{
			// notify client
			const sids = [];
			_.forEach(sessions, session =>
			{
				sids.push(session.id);
			});

			sids.forEach(sid =>
			{
				this.sessions[sid].closed(reason);
			});

			process.nextTick(function()
			{
				utils.invokeCallback(cb);
			});
		}
		else
		{
			process.nextTick(function()
			{
				utils.invokeCallback(cb);
			});
		}
	}

	/**
	 * Kick a user offline by session id.
	 *
	 * @param {Number}   sid session id
	 * @param {Function} cb  callback function
	 *
	 * @memberOf SessionService
	 */
	kickBySessionId(sid, reason, cb)
	{
		if (_.isFunction(reason))
		{
			cb = reason;
			reason = 'kick';
		}

		const session = this.get(sid);

		if (session)
		{
			// notify client
			session.closed(reason);
			process.nextTick(function()
			{
				utils.invokeCallback(cb);
			});
		}
		else
		{
			process.nextTick(function()
			{
				utils.invokeCallback(cb);
			});
		}
	}

	/**
	 * Get client remote address by session id.
	 *
	 * @param {Number}   sid session id
	 * @return {Object} remote address of client
	 *
	 * @memberOf SessionService
	 */
	getClientAddressBySessionId(sid)
	{
		const session = this.get(sid);
		if (session)
		{
			const socket = session.__socket__;
			return socket.remoteAddress;
		}
		return null;
	}

	/**
	 * Send message to the client by session id.
	 *
	 * @param {String} sid session id
	 * @param {Object} msg message to send
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	sendMessage(sid, msg)
	{
		const session = this.sessions[sid];

		if (!session)
		{
			logger.debug(`Fail to send message for non-existing session, sid: ${sid} msg: ${msg}`);
			return false;
		}

		return SessionServiceUtility.Send(this, session, msg);
	}

	/**
	 * Send message to the client by user id.
	 *
	 * @param {String} uid userId
	 * @param {Object} msg message to send
	 *
	 * @memberOf SessionService
	 * @api private
	 */
	sendMessageByUid(uid, msg)
	{
		const sessions = this.uidMap[uid];

		if (!sessions)
		{
			logger.debug('fail to send message by uid for non-existing session. uid: %j',
				uid);
			return false;
		}
		for (let i = 0, l = sessions.length; i < l; i++)
		{
			SessionServiceUtility.Send(this, sessions[i], msg);
		}
	}

	/**
	 * Iterate all the session in the session service.
	 *
	 * @param  {Function} cb callback function to fetch session
	 * @api private
	 */
	forEachSession(cb)
	{
		for (const sid in this.sessions)
		{
			cb(this.sessions[sid]);
		}
	}

	/**
	 * Iterate all the binded session in the session service.
	 *
	 * @param  {Function} cb callback function to fetch session
	 * @api private
	 */
	forEachBindedSession(cb)
	{
		let i, l, sessions;
		for (const uid in this.uidMap)
		{
			sessions = this.uidMap[uid];
			for (i = 0, l = sessions.length; i < l; i++)
			{
				cb(sessions[i]);
			}
		}
	}

	/**
	 * Get sessions' quantity in specified server.
	 *
	 */
	getSessionsCount()
	{
		return utils.size(this.sessions);
	}

}

module.exports = SessionService;

/**
 * Session maintains the relationship between client connection and user information.
 * There is a session associated with each client connection. And it should bind to a
 * user id after the client passes the identification.
 *
 * Session is created in frontend server and should not be accessed in handler.
 * There is a proxy class called BackendSession in backend servers and FrontendSession
 * in frontend servers.
 */
class Session extends EventEmitter
{
	constructor(sid, frontendId, socket, service)
	{
		super();
		this.id = sid;          // r
		this.frontendId = frontendId; // r
		this.uid = null;        // r
		this.settings = {};

		// private
		this.__socket__ = socket;
		this.__sessionService__ = service;
		this.__state__ = ST_INITED;
	}

  /*
   * Export current session as frontend session.
   */
	toFrontendSession()
	{
		return new FrontendSession(this);
	}

	/**
	 * Bind the session with the the uid.
	 *
	 * @param {Number} uid User id
	 * @api public
	 */
	bind(uid)
	{
		this.uid = uid;
		this.emit('bind', uid);
	}

	/**
	 * Unbind the session with the the uid.
	 *
	 * @param {Number} uid User id
	 * @api private
	 */
	unbind(uid)
	{
		this.uid = null;
		this.emit('unbind', uid);
	}

	/**
	 * Set values (one or many) for the session.
	 *
	 * @param {String|Object} key session key
	 * @param {Object} value session value
	 * @api public
	 */
	set(key, value)
	{
		if (utils.isObject(key))
		{
			for (const i in key)
			{
				this.settings[i] = key[i];
			}
		}
		else
		{
			this.settings[key] = value;
		}
	}

	/**
	 * Remove value from the session.
	 *
	 * @param {String} key session key
	 * @api public
	 */
	remove(key)
	{
		delete this[key];
	}

	/**
	 * Get value from the session.
	 *
	 * @param {String} key session key
	 * @return {Object} value associated with session key
	 * @api public
	 */
	get(key)
	{
		return this.settings[key];
	}

	/**
	 * Send message to the session.
	 *
	 * @param  {Object} msg final message sent to client
	 */
	send(msg)
	{
		this.__socket__.send(msg);
	}

	/**
	 * Send message to the session in batch.
	 *
	 * @param  {Array} msgs list of message
	 */
	sendBatch(msgs)
	{
		this.__socket__.sendBatch(msgs);
	}

	/**
	 * Closed callback for the session which would disconnect client in next tick.
	 *
	 * @api public
	 */
	closed(reason)
	{
		logger.debug('session on [%s] is closed with session id: %s', this.frontendId, this.id);
		if (this.__state__ === ST_CLOSED)
		{
			return;
		}
		this.__state__ = ST_CLOSED;
		this.__sessionService__.remove(this.id);
		this.emit('closed', this.toFrontendSession(), reason);
		this.__socket__.emit('closing', reason);

		const self = this;
		// give a chance to send disconnect message to client

		process.nextTick(function()
		{
			self.__socket__.disconnect();
		});
	}
}

/**
 * Frontend session for frontend server.
 */
class FrontendSession extends EventEmitter
{
	constructor(session)
	{
		super();
		SessionServiceUtility.Clone(session, this, FRONTEND_SESSION_FIELDS);
		// deep copy for settings
		this.settings = SessionServiceUtility.DeepClone(session.settings);
		this.__session__ = session;
	}

	bind(uid, cb)
	{
		const self = this;
		this.__sessionService__.bind(this.id, uid, function(err)
		{
			if (!err)
			{
				self.uid = uid;
			}
			utils.invokeCallback(cb, err);
		});
	}

	unbind(uid, cb)
	{
		const self = this;
		this.__sessionService__.unbind(this.id, uid, function(err)
		{
			if (!err)
			{
				self.uid = null;
			}
			utils.invokeCallback(cb, err);
		});
	}

	set(key, value)
	{
		this.settings[key] = value;
	}

	get(key)
	{
		return this.settings[key];
	}

	push(key, cb)
	{
		this.__sessionService__.import(this.id, key, this.get(key), cb);
	}

	pushAll(cb)
	{
		this.__sessionService__.importAll(this.id, this.settings, cb);
	}

	on(event, listener)
	{
		EventEmitter.prototype.on.call(this, event, listener);
		this.__session__.on(event, listener);
	}

	/**
	 * Export the key/values for serialization.
	 *
	 * @api private
	 */
	export()
	{
		const res = {};
		SessionServiceUtility.Clone(this, res, EXPORTED_SESSION_FIELDS);
		return res;
	}
}

class SessionServiceUtility
{
	static Clone(src, dest, includes)
	{
		_.forEach(includes, (include, key) =>
		{
			dest[include] = src[include];
		});
	}

	static DeepClone(src)
	{
		const res = {};
		_.forEach(src, (value, key) =>
		{
			res[key] = value;
		});
		return res;
	}

	/**
	 * Send message to the client that associated with the session.
	 *
	 * @api private
	 */
	static Send(service, session, msg)
	{
		session.send(msg);

		return true;
	}
}