var logger = require('pomelo-logger').getLogger(__filename);
var sessionService = require('../common/service/sessionService');
var taskManager = require('../common/service/taskManager');

module.exports = function(app, opts) {
	return new Component(app, opts);
};

/**
 * Connector component. Receive client requests and attach session with socket.
 * 
 * @param {Object} app  current application context
 * @param {Object} opts attach parameters
 *                      opts.connector {Object} provides low level network and protocol details implementation between server and clients.
 */
var Component = function(app, opts) {
	opts = opts || {};
	this.app = app;
	this.connector = opts.connector || getDefaultConnector(app);

	// component dependencies
	this.server = null;
	this.session = null;
};

Component.prototype.name = '__connector__';

Component.prototype.start = function(cb) {
	this.server = this.app.components.__server__;
	this.session = this.app.components.__session__;

	// check component dependencies
	if(!this.server) {
		process.nextTick(function() {
			cb(new Error('fail to start connector component for no server component loaded'));
		});
		return;
	}

	if(!this.session) {
		process.nextTick(function() {
			cb(new Error('fail to start connector component for no session component loaded'));
		});
		return;
	}

	cb();
};

Component.prototype.afterStart = function(cb) {
	var self = this;
	this.connector.start();

	this.connector.on('connection', function(socket) {
		bindEvents(self, socket);
	}); //on connection end

	process.nextTick(cb);
};

Component.prototype.stop = function(force, cb) {
	if(this.connector) {
		this.connector.stop();
		this.connector = null;
	}

	process.nextTick(cb);
};

var getDefaultConnector = function(app) {
	var DefaultConnector = require('../connectors/sioconnector');
	var curServer = app.get('curServer');
	return new DefaultConnector(curServer.wsPort, curServer.host);
};

var bindEvents = function(component, socket) {
	if(component.connection) {
		component.connection.increaseConnectionCount();
	}

	//create session for connection
	var session = getSession(component, socket);

	socket.on('disconnect', function() {
		if(component.connection) {
			component.connection.decreaseConnectionCount(session.uid);
		}
	});

	// new message
	socket.on('message', function(msg) {
		handleMessage(component, session, msg);
	}); //on message end
};

/**
 * get session for current connection
 */
var getSession = function(component, socket) {
	var app = component.app, sid = socket.id;
	var session = component.session.get(sid);
	if(session) {
		return session;
	}

	session = component.session.create(sid, app.get('serverId'), socket);

	// bind events for session
	socket.on('disconnect', session.closed.bind(session));
	socket.on('error', session.closed.bind(session));
	session.on('closed', onSessionClose.bind(null, app));
	session.on('bind', function(uid) {
		// update connection statistics if necessary
		if(component.connection) {
			component.connection.addLoginedUser(uid, {
				loginTime: Date.now(),
				uid: uid,
				address: socket.remoteAddress.ip + ':' + socket.remoteAddress.port
			});
		}
	});

	return session;
};

var onSessionClose = function(app, session, reason) {
	taskManager.closeQueue(session.id, true);
};

var handleMessage = function(component, session, msg) {
	if(!msg) {
		//ignore empty request
		return;
	}

	var type = checkServerType(msg.route);
	if(!type) {
		logger.error('invalid route string. ' + msg.route);
		return;
	}

	component.server.handle(msg, session.mockLocalSession(), function(err, resp) {
		if(resp) {
			if(!msg.id) {
				logger.warn('try to response to a notify: %j', msg.route);
				return;
			}
			resp = {
				id: msg.id,
				body: resp
			};
			component.session.sendMessage(session.id, resp);
		}
	});
};

/**
 * Get server type form request message.
 */
var checkServerType = function (route) {
	if(!route) {
		return null;
	}
	var idx = route.indexOf('.');
	if(idx < 0) {
		return null;
	}
	return route.substring(0, idx);
};
