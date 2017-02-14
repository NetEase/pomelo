'use strict';

const util = require('util');
const EventEmitter = require('events');

const mqtt = require('mqtt');
const constants = require('../util/constants');
const MQTTSocket = require('./mqttsocket');
const Adaptor = require('./mqtt/mqttadaptor');
const generate = require('./mqtt/generate');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

let curId = 1;

/**
 * Connector that manager low level connection and protocol
 * bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol,
 * such as tcp or protobuf.
 */
module.exports = Connector;

function Connector(port, host, opts) {
  if (!(this instanceof Connector)) {
    return new Connector(port, host, opts);
  }

  EventEmitter.call(this);

  this.port = port;
  this.host = host;
  this.opts = opts || {};

  this.adaptor = new Adaptor(this.opts);
}
util.inherits(Connector, EventEmitter);

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function(cb) {
  this.mqttServer = mqtt.createServer();

  this.mqttServer.on('client', (client) => {
    client.on('error', (err) => {
      client.stream.destroy();
    });

    client.on('close', () => {
      client.stream.destroy();
    });

    client.on('disconnect', (packet) => {
      client.stream.destroy();
    });

    if (this.opts.disconnectOnTimeout) {
      let timeout;
      if (this.opts.timeout === 0 || this.opts.timeout === undefined) {
        timeout = constants.TIME.DEFAULT_MQTT_HEARTBEAT_TIMEOUT;
      } else {
        timeout = this.opts.timeout * 1000;
      }

      client.stream.setTimeout(timeout, () => {
        client.emit('close');
      });
    }

    client.on('connect', (packet) => {
      client.connack({returnCode: 0});
      const mqttsocket = new MQTTSocket(curId++, client, this.adaptor);
      this.emit('connection', mqttsocket);
    });
  });

  this.mqttServer.listen(this.port);

  process.nextTick(cb);
};

Connector.prototype.stop = function() {
  this.mqttServer.close();
  process.exit(0);
};

function _composeResponse(msgId, route, msgBody) {
  return {
    id: msgId,
    body: msgBody
  };
}

function _composePush(route, msgBody) {
  const msg = generate.publish(msgBody);
  if (!msg) {
    logger.error('invalid mqtt publish message: %j', msgBody);
  }

  return msg;
}

Connector.prototype.encode = function(reqId, route, msgBody) {
  if (reqId) {
    return _composeResponse(reqId, route, msgBody);
  } else {
    return _composePush(route, msgBody);
  }
};

Connector.prototype.close = function() {
  this.mqttServer.close();
};
