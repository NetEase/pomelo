const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const taskManager = require('../common/manager/taskManager');
const pomelo = require('../pomelo');
const rsa = require('node-bignumber');
const events = require('../util/events');
const utils = require('../util/utils');

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
		this.server = this.app.components.__server__;
		this.session = this.app.components.__session__;
		this.connection = this.app.components.__connection__;

        // check component dependencies
		if (!this.server)
        {
			process.nextTick(function()
            {
				utils.invokeCallback(cb, new Error('fail to start connector component for no server component loaded'));
			});
			return;
		}

		if (!this.session)
        {
			process.nextTick(function()
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
		logger.debug('[%s] send message reqId: %s, route: %s, msg: %j, receivers: %j, opts: %j', this.app.serverId, reqId, route, msg, recvs, opts);
		let emsg = msg;
		if (this.encode)
        {// use costumized encode
			emsg = this.encode(this, reqId, route, msg);
		}
		else if (this.connector.encode)
        {// use connector default encode
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

		this.app.components.__pushScheduler__.schedule(reqId, route, emsg,
            recvs, opts, cb);
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

	static Create(app, opts)
    {
		return new Connector(app, opts);
	}
    
	static GetConnector(app, opts)
    {
		const connector = opts.connector;
		if (!connector)
        {
			return ConnectorUtility.GetDefaultConnector(app, opts);
		}

		if (typeof connector !== 'function')
        {
			return connector;
		}

		const curServer = app.CurServer;
		return connector(curServer.clientPort, curServer.host, opts);
	}

	static GetDefaultConnector(app, opts)
    {
		const DefaultConnector = require('../connectors/sioconnector');
		const curServer = app.CurServer;
		return new DefaultConnector(curServer.clientPort, curServer.host, opts);
	}

	static HostFilter(cb, socket)
    {
		
        // dynamical check
		if (this.blacklist.length !== 0 && Boolean(ConnectorUtility.HostCheck(socket, this.blacklist)))
        {
			return;
		}
        // static check
		if (Boolean(this.blacklistFun) && typeof this.blacklistFun === 'function')
        {
			const self = this;
			self.blacklistFun(function(err, list)
            {
				if (err)
                {
					logger.error('connector blacklist error: %j', err.stack);
					utils.invokeCallback(cb, self, socket);
					return;
				}
				if (!Array.isArray(list))
                {
					logger.error('connector blacklist is not array: %j', list);
					utils.invokeCallback(cb, self, socket);
					return;
				}
				if (!ConnectorUtility.check(socket, list))
                {
					utils.invokeCallback(cb, self, socket);
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
			const curServer = connector.app.CurServer;
			if (statisticInfo.totalConnCount > curServer['max-connections'])
            {
				logger.warn('the server %s has reached the max connections %s', curServer.id, curServer['max-connections']);
				socket.disconnect();
				return;
			}
		}

        // create session for connection
		const session = ConnectorUtility.GetSession(connector, socket);
		let closed = false;

		socket.on('disconnect', function()
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
		socket.on('message', function(msg)
        {
			let dmsg = msg;
			if (connector.decode)
            {
				dmsg = connector.decode(connector, msg, session);
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
				const verified = ConnectorUtility.verifyMessage(connector, session, dmsg);
				if (!verified)
                {
					logger.error('fail to verify the data received from client.');
					return;
				}
			}

			ConnectorUtility.handleMessage(connector, session, dmsg);
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

		session = connector.session.create(sid, app.ServerId, socket);
		logger.debug('[%s] getSession session is created with session id: %s', app.ServerId, sid);

        // bind events for session
		socket.on('disconnect', session.closed.bind(session));
		socket.on('error', session.closed.bind(session));
		session.on('closed', ConnectorUtility.onSessionClose.bind(null, app));
		session.on('bind', function(uid)
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

	static onSessionClose(app, session, reason)
    {
		taskManager.closeQueue(session.id, true);
		app.event.emit(events.CLOSE_SESSION, session);
	}

	static handleMessage(connector, session, msg)
    {
		logger.debug('[%s] handleMessage session id: %s, msg: %j', connector.app.serverId, session.id, msg);
		const type = ConnectorUtility.checkServerType(msg.route);
		if (!type)
        {
			logger.error('invalid route string. route : %j', msg.route);
			return;
		}
		connector.server.globalHandle(msg, session.toFrontendSession(), function(err, resp, opts)
        {
			if (resp && !msg.id)
            {
				logger.warn('try to response to a notify: %j', msg.route);
				return;
			}
			if (!msg.id && !resp) return;
			if (!resp) resp = {};
			if (Boolean(err) && !resp.code)
            {
				resp.code = 500;
			}
			opts = {
				type        : 'response',
				userOptions : opts || {}};
            // for compatiablity
			opts.isResponse = true;

			connector.send(msg.id, msg.route, resp, [session.id], opts, null);
		});
	}

    /**
     * Get server type form request message.
     */
	static checkServerType(route)
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

	static verifyMessage(connector, session, msg)
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

module.exports = ConnectorUtility.Create;