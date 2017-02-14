'use strict';

const net = require('net');
const tls = require('tls');
const util = require('util');
const EventEmitter = require('events');

const HybridSocket = require('./hybridsocket');
const Switcher = require('./hybrid/switcher');
const Handshake = require('./commands/handshake');
const Heartbeat = require('./commands/heartbeat');
const Kick = require('./commands/kick');
const coder = require('./common/coder');

let curId = 1;

/**
 * Connector that manager low level connection and protocol
 * bewteen server and client.
 *
 * Develper can provide their own connector to switch the low level prototol,
 * such as tcp or protobuf.
 */
module.exports = Connector;

function Connector(port, host, opts) {
  if (!(this instanceof Connector)) {
    return new Connector(port, host, opts);
  }

  EventEmitter.call(this);

  this.opts = opts || {};
  this.port = port;
  this.host = host;
  this.useDict = opts.useDict;
  this.useProtobuf = opts.useProtobuf;
  this.handshake = new Handshake(opts);
  this.heartbeat = new Heartbeat(opts);
  this.distinctHost = opts.distinctHost;
  this.ssl = opts.ssl;

  this.switcher = null;
}
util.inherits(Connector, EventEmitter);

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function(cb) {
  const app = require('../pomelo').app;

  const gensocket = (socket) => {
    const hybridsocket = new HybridSocket(curId++, socket);
    hybridsocket.on('handshake',
                    this.handshake.handle.bind(this.handshake, hybridsocket));

    hybridsocket.on('heartbeat',
                    this.heartbeat.handle.bind(this.heartbeat, hybridsocket));

    hybridsocket.on('disconnect',
                    this.heartbeat.clear.bind(this.heartbeat, hybridsocket.id));

    hybridsocket.on('closing', Kick.handle.bind(null, hybridsocket));
    this.emit('connection', hybridsocket);
  };

  this.connector = app.components.__connector__.connector;
  this.dictionary = app.components.__dictionary__;
  this.protobuf = app.components.__protobuf__;
  this.decodeIO_protobuf = app.components.__decodeIO__protobuf__;

  if (!this.ssl) {
    this.listeningServer = net.createServer();
  } else {
    this.listeningServer = tls.createServer(this.ssl);
  }

  this.switcher = new Switcher(this.listeningServer, this.opts);

  this.switcher.on('connection', function(socket) {
    gensocket(socket);
  });

  if (this.distinctHost) {
    this.listeningServer.listen(this.port, this.host);
  } else {
    this.listeningServer.listen(this.port);
  }

  process.nextTick(cb);
};

Connector.prototype.stop = function(force, cb) {
  this.switcher.close();
  this.listeningServer.close();

  process.nextTick(cb);
};

Connector.prototype.decode = coder.decode;
Connector.decode = Connector.prototype.decode;

Connector.prototype.encode = coder.encode;
Connector.encode = Connector.prototype.encode;
