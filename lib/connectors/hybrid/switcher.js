'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');

const WSProcessor = require('./wsprocessor');
const TCPProcessor = require('./tcpprocessor');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

const HTTP_METHODS = ['GET', 'POST', 'DELETE', 'PUT', 'HEAD'];

const ST_STARTED = 1;
const ST_CLOSED = 2;

const DEFAULT_TIMEOUT = 90;

/**
 * Switcher for tcp and websocket protocol
 *
 * @param {Object} server tcp server instance from node.js net module
 */
module.exports = Switcher;

function Switcher(server, opts) {
  EventEmitter.call(this);

  this.server = server;
  this.wsprocessor = new WSProcessor();
  this.tcpprocessor = new TCPProcessor(opts.closeMethod);
  this.id = 1;
  this.timeout = (opts.timeout || DEFAULT_TIMEOUT) * 1000;
  this.setNoDelay = opts.setNoDelay;

  if (!opts.ssl) {
    this.server.on('connection', this.newSocket.bind(this));
  } else {
    this.server.on('secureConnection', this.newSocket.bind(this));
    this.server.on('clientError', function(e, tlsSo) {
      logger.warn('an ssl error occured before handshake established: ', e);
      tlsSo.destroy();
    });
  }

  this.wsprocessor.on('connection', this.emit.bind(this, 'connection'));
  this.tcpprocessor.on('connection', this.emit.bind(this, 'connection'));

  this.state = ST_STARTED;
}
util.inherits(Switcher, EventEmitter);

Switcher.prototype.newSocket = function(socket) {
  if (this.state !== ST_STARTED) {
    return;
  }

  socket.setTimeout(this.timeout, function() {
    logger.warn('connection is timeout without communication, ' +
                'the remote ip is %s && port is %s',
                socket.remoteAddress, socket.remotePort);
    socket.destroy();
  });

  socket.once('data', (data) => {
    // FIXME: handle incomplete HTTP method
    // FIXME: slow connection attack
    if (_isHttp(data)) {
      _processHttp(this, this.wsprocessor, socket, data);
    } else {
      if (this.setNoDelay) {
        socket.setNoDelay(true);
      }
      _processTcp(this, this.tcpprocessor, socket, data);
    }
  });
};

Switcher.prototype.close = function() {
  if (this.state !== ST_STARTED) {
    return;
  }

  this.state = ST_CLOSED;
  this.wsprocessor.close();
  this.tcpprocessor.close();
};

function _isHttp(data) {
  const MAX_HTTP_METHOD_LEN = 4;
  const head = data.toString('utf8', 0, MAX_HTTP_METHOD_LEN);

  let i;
  for (i = 0; i < HTTP_METHODS.length; i++) {
    if (head.indexOf(HTTP_METHODS[i]) === 0) {
      return true;
    }
  }

  return false;
}

function _processHttp(switcher, processor, socket, data) {
  processor.add(socket, data);
}

function _processTcp(switcher, processor, socket, data) {
  processor.add(socket, data);
}
