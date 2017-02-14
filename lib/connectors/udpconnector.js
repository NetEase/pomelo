'use strict';

const util = require('util');
const dgram = require('dgram');
const EventEmitter = require('events');

const utils = require('../util/utils');
const Constants = require('../util/constants');
const UdpSocket = require('./udpsocket');
const Kick = require('./commands/kick');
const Handshake = require('./commands/handshake');
const Heartbeat = require('./commands/heartbeat');
const coder = require('./common/coder');

let curId = 1;

module.exports = Connector;

function Connector(port, host, opts) {
  if (!(this instanceof Connector)) {
    return new Connector(port, host, opts);
  }

  EventEmitter.call(this);

  this.opts = opts || {};
  this.type = opts.udpType || 'udp4';
  this.handshake = new Handshake(opts);

  if (!opts.heartbeat) {
    opts.heartbeat = Constants.TIME.DEFAULT_UDP_HEARTBEAT_TIME;
    opts.timeout = Constants.TIME.DEFAULT_UDP_HEARTBEAT_TIMEOUT;
  }

  this.heartbeat = new Heartbeat(utils.extends(opts,
                                               {disconnectOnTimeout: true}));
  this.clients = {};
  this.host = host;
  this.port = port;
}
util.inherits(Connector, EventEmitter);


Connector.prototype.start = function(cb) {
  this.socket = dgram.createSocket(this.type, (msg, peer) => {
    const key = _genKey(peer);

    if (!this.clients[key]) {
      const udpsocket = new UdpSocket(curId++, this.socket, peer);
      this.clients[key] = udpsocket;

      udpsocket.on('handshake',
                   this.handshake.handle.bind(this.handshake, udpsocket));

      udpsocket.on('heartbeat',
                   this.heartbeat.handle.bind(this.heartbeat, udpsocket));

      udpsocket.on('disconnect',
                   this.heartbeat.clear.bind(this.heartbeat, udpsocket.id));

      udpsocket.on('disconnect', () => {
        delete this.clients[_genKey(udpsocket.peer)];
      });

      udpsocket.on('closing', Kick.handle.bind(null, udpsocket));

      this.emit('connection', udpsocket);
    }
  });

  this.socket.on('message', (data, peer) => {
    const socket = this.clients[_genKey(peer)];
    if (socket) {
      socket.emit('package', data);
    }
  });

  this.socket.on('error', (err) => {
    // TODO:
    return;
  });

  this.socket.bind(this.port, this.host);
  process.nextTick(cb);
};

Connector.prototype.decode = coder.decode;
Connector.decode = Connector.prototype.decode;

Connector.prototype.encode = coder.encode;
Connector.encode = Connector.prototype.encode;

Connector.prototype.stop = function(force, cb) {
  this.socket.close();
  process.nextTick(cb);
};

function _genKey(peer) {
  return peer.address + ':' + peer.port;
}
