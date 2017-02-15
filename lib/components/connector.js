'use strict';

const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const taskManager = require('../common/manager/taskManager');
const pomelo = require('../pomelo');
const rsa = require('node-bignumber');
const events = require('../util/events');
const utils = require('../util/utils');

/**
 * Connector component. Receive client requests and attach session with socket.
 *
 * @param {Object} app  current application context
 * @param {Object} opts attach parameters
 *                      opts.connector {Object} provides low level network
 *                      and protocol details implementation
 *                      between server and clients.
 */
module.exports = Component;

function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  opts = opts || {};
  this.app = app;
  this.connector = _getConnector(app, opts);
  this.encode = opts.encode;
  this.decode = opts.decode;
  this.useCrypto = opts.useCrypto;
  this.blacklistFun = opts.blacklistFun;
  this.keys = {};
  this.blacklist = [];

  if (opts.useDict) {
    app.load(pomelo.dictionary, app.get('dictionaryConfig'));
  }

  if (opts.useProtobuf) {
    app.load(pomelo.protobuf, app.get('protobufConfig'));
  }

  // component dependencies
  this.server = null;
  this.session = null;
  this.connection = null;
}

Component.prototype.name = '__connector__';

Component.prototype.start = function(cb) {
  this.server = this.app.components.__server__;
  this.session = this.app.components.__session__;
  this.connection = this.app.components.__connection__;

  // check component dependencies
  if (!this.server) {
    process.nextTick(() => {
      const er = new Error('fail to start connector component ' +
                           'for no server component loaded');
      utils.invokeCallback(cb, er);
    });
    return;
  }

  if (!this.session) {
    process.nextTick(() => {
      const er = new Error('fail to start connector component ' +
                           'for no session component loaded');
      utils.invokeCallback(cb, er);
    });
    return;
  }

  process.nextTick(cb);
};

Component.prototype.afterStart = function(cb) {
  this.connector.start(cb);
  this.connector.on('connection', _hostFilter.bind(this, _bindEvents));
};

Component.prototype.stop = function(force, cb) {
  if (this.connector) {
    this.connector.stop(force, cb);
    this.connector = null;
    return;
  } else {
    process.nextTick(cb);
  }
};

Component.prototype.send = function(reqId, route, msg, recvs, opts, cb) {
  logger.debug('[%s] send message reqId: %s, route: %s, msg: %j, ' +
               ' receivers: %j, opts: %j',
               this.app.serverId, reqId, route, msg, recvs, opts);
  let emsg = msg;
  if (this.encode) {
    // use costumized encode
    emsg = this.encode(reqId, route, msg);
  } else if (this.connector.encode) {
    // use connector default encode
    emsg = this.connector.encode(reqId, route, msg);
  }

  if (!emsg) {
    process.nextTick(() => {
      const er = new Error('fail to send message for encode result is empty.');
      utils.invokeCallback(cb, er);
      return;
    });
  }

  this.app.components.__pushScheduler__.schedule(reqId, route, emsg,
                                                 recvs, opts, cb);
};

Component.prototype.setPubKey = function(id, key) {
  const pubKey = new rsa.Key();
  pubKey.n = new rsa.BigInteger(key.rsa_n, 16);
  pubKey.e = key.rsa_e;
  this.keys[id] = pubKey;
};

Component.prototype.getPubKey = function(id) {
  return this.keys[id];
};

function _getConnector(app, opts) {
  const connector = opts.connector;
  if (!connector) {
    return _getDefaultConnector(app, opts);
  }

  if (typeof connector !== 'function') {
    return connector;
  }

  const curServer = app.getCurServer();
  return connector(curServer.clientPort, curServer.host, opts);
}

function _getDefaultConnector(app, opts) {
  const DefaultConnector = require('../connectors/sioconnector');
  const curServer = app.getCurServer();
  return new DefaultConnector(curServer.clientPort, curServer.host, opts);
}

function _hostFilter(cb, socket) {
  const ip = socket.remoteAddress.ip;
  const check = (blist) => {
    let address;
    for (address in blist) {
      const exp = new RegExp(blist[address]);
      if (exp.test(ip)) {
        socket.disconnect();
        return true;
      }
    }
    return false;
  };

  // dynamical check
  if (this.blacklist.length !== 0 && check(this.blacklist)) {
    return;
  }

  // static check
  if (this.blacklistFun && typeof this.blacklistFun === 'function') {
    this.blacklistFun((err, list) => {
      if (err) {
        logger.error('connector blacklist error: %j', err.stack);
        utils.invokeCallback(cb, this, socket);
        return;
      }

      if (!Array.isArray(list)) {
        logger.error('connector blacklist is not array: %j', list);
        utils.invokeCallback(cb, this, socket);
        return;
      }

      if (check(list)) {
        return;
      } else {
        utils.invokeCallback(cb, this, socket);
        return;
      }
    });
  } else {
    utils.invokeCallback(cb, this, socket);
  }
}

function _bindEvents(self, socket) {
  if (self.connection) {
    self.connection.increaseConnectionCount();
    const statisticInfo = self.connection.getStatisticsInfo();
    const curServer = self.app.getCurServer();
    if (statisticInfo.totalConnCount > curServer['max-connections']) {
      logger.warn('the server %s has reached the max connections %s',
                  curServer.id, curServer['max-connections']);
      socket.disconnect();
      return;
    }
  }

  //create session for connection
  const session = _getSession(self, socket);
  let closed = false;

  socket.on('disconnect', () => {
    if (closed) {
      return;
    }

    closed = true;

    if (self.connection) {
      self.connection.decreaseConnectionCount(session.uid);
    }
  });

  socket.on('error', () => {
    if (closed) {
      return;
    }
    closed = true;
    if (self.connection) {
      self.connection.decreaseConnectionCount(session.uid);
    }
  });

  // new message
  socket.on('message', (msg) => {
    let dmsg = msg;
    if (self.decode) {
      dmsg = self.decode(msg, session);
    } else if (self.connector.decode) {
      dmsg = self.connector.decode(msg);
    }

    if (!dmsg) {
      // discard invalid message
      return;
    }

    // use rsa crypto
    if (self.useCrypto) {
      const verified = _verifyMessage(self, session, dmsg);
      if (!verified) {
        logger.error('fail to verify the data received from client.');
        return;
      }
    }

    _handleMessage(self, session, dmsg);
  }); //on message end
}

/**
 * get session for current connection
 */
function _getSession(self, socket) {
  const app = self.app;
  const sid = socket.id;
  let session = self.session.get(sid);

  if (session) {
    return session;
  }

  session = self.session.create(sid, app.getServerId(), socket);

  logger.debug('[%s] _getSession session is created with session id: %s',
               app.getServerId(), sid);

  // bind events for session
  socket.on('disconnect', session.closed.bind(session));
  socket.on('error', session.closed.bind(session));
  session.on('closed', _onSessionClose.bind(null, app));
  session.on('bind', (uid) => {
    logger.debug('session on [%s] bind with uid: %s',
                 self.app.serverId, uid);
    // update connection statistics if necessary
    if (self.connection) {
      self.connection.addLoginedUser(uid, {
        loginTime: Date.now(),
        uid: uid,
        address: socket.remoteAddress.ip + ':' + socket.remoteAddress.port
      });
    }
    self.app.event.emit(events.BIND_SESSION, session);
  });

  session.on('unbind', (uid) => {
    if (self.connection) {
      self.connection.removeLoginedUser(uid);
    }
    self.app.event.emit(events.UNBIND_SESSION, session);
  });

  return session;
}

function _onSessionClose(app, session, reason) {
  taskManager.closeQueue(session.id, true);
  app.event.emit(events.CLOSE_SESSION, session);
}

function _handleMessage(self, session, msg) {
  logger.debug('[%s] _handleMessage session id: %s, msg: %j',
               self.app.serverId, session.id, msg);

  const type = _checkServerType(msg.route);

  if (!type) {
    logger.error('invalid route string. route : %j', msg.route);
    return;
  }

  const fsession = session.toFrontendSession();
  self.server.globalHandle(msg, fsession, (err, resp, opts) => {
    if (resp && !msg.id) {
      logger.warn('try to response to a notify: %j', msg.route);
      return;
    }

    if (!msg.id && !resp) {
      return;
    }

    if (!resp) {
      resp = {};
    }

    if (err && !resp.code) {
      resp.code = 500;
    }

    opts = {type: 'response', userOptions: opts || {}};
    // for compatiablity
    opts.isResponse = true;

    self.send(msg.id, msg.route, resp, [session.id], opts, _noop);
  });
}

function _noop() {}

/**
 * Get server type form request message.
 */
function _checkServerType(route) {
  if (!route) {
    return null;
  }
  const idx = route.indexOf('.');
  if (idx < 0) {
    return null;
  }
  return route.substring(0, idx);
}

function _verifyMessage(self, session, msg) {
  const sig = msg.body.__crypto__;
  if (!sig) {
    logger.error('receive data from client has no signature [%s]',
                 self.app.serverId);
    return false;
  }

  if (!session) {
    logger.error('could not find session.');
    return false;
  }

  let pubKey;
  if (!session.get('pubKey')) {
    pubKey = self.getPubKey(session.id);
    if (pubKey) {
      delete self.keys[session.id];
      session.set('pubKey', pubKey);
    } else {
      logger.error('could not get public key, session id is %s',
                   session.id);
      return false;
    }
  } else {
    pubKey = session.get('pubKey');
  }

  if (!pubKey.n || !pubKey.e) {
    logger.error('could not verify message without public key [%s]',
                 self.app.serverId);
    return false;
  }

  delete msg.body.__crypto__;

  let message = JSON.stringify(msg.body);
  if (utils.hasChineseChar(message)) {
    message = utils.unicodeToUtf8(message);
  }

  return pubKey.verifyString(message, sig);
}
