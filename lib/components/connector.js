const _ = require('lodash'),
	utils = require('../util/utils'),
	taskManager = require('../common/manager/taskManager'),
	pomelo = require('../pomelo'),
	rsa = require('node-bignumber'),
	events = require('../util/events'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class Connector
{
	/**
	 * Connector component. Receive client requests and attach session with socket.
	 *
	 * @param {Object} app  current application context
	 * @param {Object} opts attach parameters
	 *                      opts.connector {Object} provides low level network and protocol details implementation between server and clients.
	 */
	constructor(app, opts)
	{
		opts = opts || {};
		this.app = app;
		this.connector = ConnectorUtility.GetConnector(app, opts);
		this.encode = opts.encode;
		this.decode = opts.decode;
		this.useCrypto = opts.useCrypto;
		this.blacklistFun = opts.blacklistFun;
		this.keys = {};
		this.blacklist = [];

		if (opts.useDict)
		{
			app.load(pomelo.dictionary, app.get('dictionaryConfig'));
		}

		if (opts.useProtobuf)
		{
			app.load(pomelo.protobuf, app.get('protobufConfig'));
		}

		// component dependencies
		this.server = null;
		this.session = null;
		this.connection = null;
		this.name = '__connector__';
	}

	start(cb)
	{
		const components = this.app.components;

		this.server = _.get(components, '__server__', null);
		this.session = _.get(components, '__session__', null);
		this.connection = _.get(components, '__connection__', null);

		// check component dependencies
		if (!this.server)
		{
			process.nextTick(() =>
			{
				utils.invokeCallback(cb, new Error('fail to start connector component for no server component loaded'));
			});
			return;
		}

		if (!this.session)
		{
			process.nextTick(() =>
			{
				utils.invokeCallback(cb, new Error('fail to start connector component for no session component loaded'));
			});
			return;
		}

		process.nextTick(cb);
	}

	afterStart(cb)
	{
		this.connector.start(cb);
		this.connector.on('connection', ConnectorUtility.HostFilter.bind(this, ConnectorUtility.BindEvents));
	}

	stop(force, cb)
	{
		if (this.connector)
		{
			this.connector.stop(force, cb);
			this.connector = null;
		}
		else
		{
			process.nextTick(cb);
		}
	}

	send(reqId, route, msg, recvs, opts, cb)
	{
		logger.debug(`[${this.app.serverId}] send message reqId: ${reqId}, route: ${route}, msg: ${msg}, receivers: ${recvs}, opts: ${opts}`);
		let emsg = msg;
		if (this.encode)
		{
			// use costumized encode
			emsg = this.encode(reqId, route, msg);
		}
		else if (this.connector.encode)
		{
			// use connector default encode
			emsg = this.connector.encode(reqId, route, msg);
		}

		if (!emsg)
		{
			process.nextTick(function()
			{
				utils.invokeCallback(cb, new Error('fail to send message for encode result is empty.'));
				return;
			});
		}

		this.app.components.__pushScheduler__.schedule(reqId, route, emsg, recvs, opts, cb);
	}

	setPubKey(id, key)
	{
		const pubKey = new rsa.Key();
		pubKey.n = new rsa.BigInteger(key.rsa_n, 16);
		pubKey.e = key.rsa_e;
		this.keys[id] = pubKey;
	}

	getPubKey(id)
	{
		return this.keys[id];
	}
}

class ConnectorUtility
{
	static GetConnector(app, opts)
	{
		const connector = opts.connector;
		if (!connector)
		{
			return ConnectorUtility.GetDefaultConnector(app, opts);
		}

		if (!_.isFunction(connector))
		{
			return connector;
		}

		const curServer = app.getCurServer();
		return connector(curServer.clientPort, curServer.host, opts);
	}

	static GetDefaultConnector(app, opts)
	{
		const DefaultConnector = require('../connectors/sioConnector');
		const curServer = app.getCurServer();
		return new DefaultConnector(curServer.clientPort, curServer.host, opts);
	}

	static HostFilter(cb, socket)
	{

		// dynamical check
		if (this.blacklist.length !== 0 && ConnectorUtility.HostCheck(socket, this.blacklist))
		{
			return;
		}
		// static check
		if (this.blacklistFun && _.isFunction(this.blacklistFun))
		{
			this.blacklistFun((err, list) =>
			{
				if (err)
				{
					logger.error(`connector blacklist error: ${err.stack}`);
					utils.invokeCallback(cb, this, socket);
					return;
				}
				if (!Array.isArray(list))
				{
					logger.error('connector blacklist is not array: %j', list);
					utils.invokeCallback(cb, this, socket);
					return;
				}
				if (!ConnectorUtility.HostCheck(socket, list))
				{
					utils.invokeCallback(cb, this, socket);
				}
			});
		}
		else
		{
			utils.invokeCallback(cb, this, socket);
		}
	}

	static HostCheck(socket, list)
	{
		const ip = socket.remoteAddress.ip;
		for (const address in list)
		{
			const exp = new RegExp(list[address]);
			if (exp.test(ip))
			{
				socket.disconnect();
				return true;
			}
		}
		return false;
	}

	static BindEvents(connector, socket)
	{
		if (connector.connection)
		{
			connector.connection.increaseConnectionCount();
			const statisticInfo = connector.connection.getStatisticsInfo();
			const curServer = connector.app.getCurServer();
			if (statisticInfo.totalConnCount > curServer['max-connections'])
			{
				logger.warn(`the server ${curServer.id} has reached the max connections ${curServer['max-connections']}`);
				socket.disconnect();
				return;
			}
		}

		// create session for connection
		const session = ConnectorUtility.GetSession(connector, socket);
		let closed = false;

		socket.on('disconnect', () =>
		{
			if (closed)
			{
				return;
			}
			closed = true;
			if (connector.connection)
			{
				connector.connection.decreaseConnectionCount(session.uid);
			}
		});

		socket.on('error', function()
		{
			if (closed)
			{
				return;
			}
			closed = true;
			if (connector.connection)
			{
				connector.connection.decreaseConnectionCount(session.uid);
			}
		});

		// new message
		socket.on('message', msg =>
		{
			let dmsg = msg;
			if (connector.decode)
			{
				dmsg = connector.decode(msg, session);
			}
			else if (connector.connector.decode)
			{
				dmsg = connector.connector.decode(msg);
			}
			if (!dmsg)
			{
				// discard invalid message
				return;
			}

			// use rsa crypto
			if (connector.useCrypto)
			{
				const verified = ConnectorUtility.VerifyMessage(connector, session, dmsg);
				if (!verified)
				{
					logger.error('fail to verify the data received from client.');
					return;
				}
			}

			ConnectorUtility.HandleMessage(connector, session, dmsg);
		}); // on message end
	}

	/**
	 * get session for current connection
	 */
	static GetSession(connector, socket)
	{
		const app = connector.app, sid = socket.id;
		let session = connector.session.get(sid);
		if (session)
		{
			return session;
		}

		session = connector.session.create(sid, app.getServerId(), socket);
		logger.debug(`[${app.getServerId()}] getSession session is created with session id: ${sid}`);

		// bind events for session
		socket.on('disconnect', session.closed.bind(session));
		socket.on('error', session.closed.bind(session));
		session.on('closed', ConnectorUtility.OnSessionClose.bind(null, app));
		session.on('bind', uid =>
		{
			logger.debug('session on [%s] bind with uid: %s', connector.app.serverId, uid);
			// update connection statistics if necessary
			if (connector.connection)
			{
				connector.connection.addLoginedUser(uid, {
					loginTime : Date.now(),
					uid       : uid,
					address   : `${socket.remoteAddress.ip}:${socket.remoteAddress.port}`
				});
			}
			connector.app.event.emit(events.BIND_SESSION, session);
		});

		session.on('unbind', function(uid)
		{
			if (connector.connection)
			{
				connector.connection.removeLoginedUser(uid);
			}
			connector.app.event.emit(events.UNBIND_SESSION, session);
		});

		return session;
	}

	static OnSessionClose(app, session, reason)
	{
		taskManager.closeQueue(session.id, true);
		app.event.emit(events.CLOSE_SESSION, session);
	}

	static HandleMessage(connector, session, msg)
	{
		logger.debug(`[${connector.app.serverId}] handleMessage session id: ${session.id}, msg: ${msg}`);
		const type = ConnectorUtility.CheckServerType(msg.route);
		if (!type)
		{
			logger.error(`invalid route string. route : ${msg.route}`);
			return;
		}
		connector.server.globalHandle(msg, session.toFrontendSession(), function(err, resp, opts)
		{
			if (resp && !msg.id)
			{
				logger.warn(`try to response to a notify : ${msg.route}`);
				return;
			}
			if (!msg.id && !resp) return;
			if (!resp) resp = {};
			if (err && !resp.code)
			{
				resp.code = 500;
			}
			opts = {
				type        : 'response',
				userOptions : opts || {}
			};
			// for compatiablity
			opts.isResponse = true;

			connector.send(msg.id, msg.route, resp, [session.id], opts, () =>
			{
				// null
			});
		});
	}

	/**
	 * Get server type form request message.
	 */
	static CheckServerType(route)
	{
		if (!route)
		{
			return null;
		}
		const idx = route.indexOf('.');
		if (idx < 0)
		{
			return null;
		}
		return route.substring(0, idx);
	}

	static VerifyMessage(connector, session, msg)
	{
		const sig = msg.body.__crypto__;
		if (!sig)
		{
			logger.error('receive data from client has no signature [%s]', connector.app.serverId);
			return false;
		}

		let pubKey;

		if (!session)
		{
			logger.error('could not find session.');
			return false;
		}

		if (!session.get('pubKey'))
		{
			pubKey = connector.getPubKey(session.id);
			if (pubKey)
			{
				delete connector.keys[session.id];
				session.set('pubKey', pubKey);
			}
			else
			{
				logger.error('could not get public key, session id is %s', session.id);
				return false;
			}
		}
		else
		{
			pubKey = session.get('pubKey');
		}

		if (!pubKey.n || !pubKey.e)
		{
			logger.error('could not verify message without public key [%s]', connector.app.serverId);
			return false;
		}

		delete msg.body.__crypto__;

		let message = JSON.stringify(msg.body);
		if (utils.hasChineseChar(message))
			message = utils.unicodeToUtf8(message);

		return pubKey.verifyString(message, sig);
	}

}

module.exports = function(app, opts)
{
	return new Connector(app, opts);
};