var logger = require('pomelo-logger').getLogger(__filename);
var sessionService = require('../common/service/sessionService');
var taskManager = require('../common/manager/taskManager');
var pomelo = require('../pomelo');
var rsa = require("node-bignumber");

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
  this.connector = getConnector(app, opts);
  this.encode = opts.encode;
  this.decode = opts.decode;
  this.useCrypto = opts.useCrypto;
  this.keys = {};

  if(opts.useDict) {
    app.load(pomelo.dictionary, app.get('dictionaryConfig'));
  }

  // component dependencies
  this.server = null;
  this.session = null;
  this.connection = null;
};

Component.prototype.name = '__connector__';

Component.prototype.start = function(cb) {
  this.server = this.app.components.__server__;
  this.session = this.app.components.__session__;
  this.connection = this.app.components.__connection__;

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

  process.nextTick(cb);
};

Component.prototype.afterStart = function(cb) {
  var self = this;
  this.connector.start(cb);

  this.connector.on('connection', function(socket) {
    bindEvents(self, socket);
  }); //on connection end
};

Component.prototype.stop = function(force, cb) {
  if(this.connector) {
    this.connector.stop(force, cb);
    this.connector = null;
    return;
  }

  process.nextTick(cb);
};

Component.prototype.send = function(reqId, route, msg, recvs, opts, cb) {
  var emsg = msg;
  if(this.encode) {
    // use costumized encode
    emsg = this.encode.call(null, reqId, route, msg);
  } else if(this.connector.encode) {
    // use connector default encode
    emsg = this.connector.encode(reqId, route, msg);
  }

  if(!emsg) {
    process.nextTick(function() {
      cb(new Error('fail to send message for encode result is empty.'));
      return;
    });
  }

  this.app.components.__scheduler__.schedule(reqId, route, emsg,
      recvs, opts, cb);
};

Component.prototype.setPubKey = function(id, key) {
  var pubKey = new rsa.Key();
  pubKey.n = new rsa.BigInteger(key.rsa_n, 16);
  pubKey.e = key.rsa_e;
  this.keys[id] = pubKey;
};

Component.prototype.getPubKey = function(id) {
  return this.keys[id];
};

var getConnector = function(app, opts) {
  var connector = opts.connector;
  if(!connector) {
    return getDefaultConnector(app);
  }

  if(typeof connector !== 'function') {
    return connector;
  }

  var curServer = app.getCurServer();
  return connector(curServer.clientPort, curServer.host, opts);
};

var getDefaultConnector = function(app) {
  var DefaultConnector = require('../connectors/sioconnector');
  var curServer = app.getCurServer();
  return new DefaultConnector(curServer.clientPort, curServer.host);
};

var bindEvents = function(self, socket) {
  if(self.connection) {
    self.connection.increaseConnectionCount();
    var statisticInfo = self.connection.getStatisticsInfo();
    var curServer = self.app.getCurServer();
    if(statisticInfo.totalConnCount > curServer['max-connections']) {
      logger.warn('the server %s has reached the max connections %s', curServer.id, curServer['max-connections']);
      socket.disconnect();
      return;
    }
  }

  //create session for connection
  var session = getSession(self, socket);
  var closed = false;

  socket.on('disconnect', function() {
    if(closed) {
      return;
    }
    closed = true;
    if(self.connection) {
      self.connection.decreaseConnectionCount(session.uid);
    }
  });

  socket.on('error', function() {
    if(closed) {
      return;
    }
    closed = true;
    if(self.connection) {
      self.connection.decreaseConnectionCount(session.uid);
    }
  });

  // new message
  socket.on('message', function(msg) {
    var dmsg = msg;
    if(self.decode) {
      dmsg = self.decode(msg);
    } else if(self.connector.decode) {
      dmsg = self.connector.decode(msg);
    }
    if(!dmsg) {
      // discard invalid message
      return;
    }

    // use rsa crypto
    if(self.useCrypto) {
      var verified = verifyMessage(self, session, dmsg);
      if(!verified) {
        logger.error('fail to verify the data received from client.');
        return;
      }
    }

    handleMessage(self, session, dmsg);
  }); //on message end
};

/**
 * get session for current connection
 */
var getSession = function(self, socket) {
  var app = self.app, sid = socket.id;
  var session = self.session.get(sid);
  if(session) {
    return session;
  }

  session = self.session.create(sid, app.getServerId(), socket);

  // bind events for session
  socket.on('disconnect', session.closed.bind(session));
  socket.on('error', session.closed.bind(session));
  session.on('closed', onSessionClose.bind(null, app));
  session.on('bind', function(uid) {
    // update connection statistics if necessary
    if(self.connection) {
      self.connection.addLoginedUser(uid, {
        loginTime: Date.now(),
        uid: uid,
        address: socket.remoteAddress.ip + ':' + socket.remoteAddress.port
      });
    }

    if(!!self.app.get('statusService')) {
      var statusService = self.app.get('statusService');
      statusService.add(uid, app.getServerId(), function(err) {
        if(!!err) {
          logger.error('statusService add user failed: [%s] [%s], err: %j', uid, app.getServerId(), err);
          return;
        }
      });
    }

  });

  socket.on('disconnect', statusClose.bind(session, app));
  socket.on('error', statusClose.bind(session, app));

  return session;
};

var onSessionClose = function(app, session, reason) {
  taskManager.closeQueue(session.id, true);
};

var handleMessage = function(self, session, msg) {
  var type = checkServerType(msg.route);
  if(!type) {
    logger.error('invalid route string. route : %j', msg.route);
    return;
  }

  self.server.handle(msg, session.mockLocalSession(), function(err, resp) {
    if(resp) {
      if(!msg.id) {
        logger.warn('try to response to a notify: %j', msg.route);
        return;
      }
      self.send(msg.id, msg.route, resp, [session.id], {isResponse: true},
        function() {});
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

var verifyMessage = function (self, session, msg) {
  var sig = msg.body.__crypto__;
  if(!sig) {
    logger.error('receive data from client has no signature [%s]', self.app.serverId);
    return false;
  }

  var pubKey;
  
  if(!session) {
    logger.error('could not find session.');
    return false;
  }

  if(!session.get('pubKey')) {
    pubKey = self.getPubKey(session.id);
    if(!!pubKey) {
      delete self.keys[session.id];
      session.set('pubKey', pubKey);
    }
    else {
      logger.error('could not get public key, session id is %s', session.id);
      return false;
    }
  }
  else {
    pubKey = session.get('pubKey');
  }

  if(!pubKey.n || !pubKey.e) {
    logger.error('could not verify message without public key [%s]', self.app.serverId);
    return false;
  }

  delete  msg.body['__crypto__'];
  return pubKey.verifyString(JSON.stringify(msg.body), sig);
};

var statusClose = function(app) {
  if(!this.uid) {
    return;
  }
  if(!app.get('statusService')) {
    return;
  }

  var statusService = app.get('statusService');
  statusService.leave(this.uid, this.frontendId, function(err) {
    if(!!err) {
      logger.error('failed to kick user in statusService: [%s] [%s], err: %j', this.uid, this.frontendId, err);
      return;
    }
  });
};