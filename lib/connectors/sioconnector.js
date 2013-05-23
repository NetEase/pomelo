var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sio = require('socket.io');
var SioSocket = require('./siosocket');

var app = require('express').createServer(), http = require('http');

var curId = 1;

/**
 * Connector that manager low level connection and protocol bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol, such as tcp or probuf.
 */
var Connector = function(port, host) {
  if (!(this instanceof Connector)) {
    return new Connector(port, host);
  }

  EventEmitter.call(this);
  this.port = port;
  this.host = host;
};

util.inherits(Connector, EventEmitter);

module.exports = Connector;

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function() {
  var self = this;
  // issue https://github.com/NetEase/pomelo-cn/issues/174
  this.wsocket = sio.listen(app);
  this.wsocket.set('log level', 1);
  this.wsocket.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
  this.wsocket.sockets.on('connection', function (socket) {
    var siosocket = new SioSocket(curId++, socket);
    self.emit('connection', siosocket);
    siosocket.on('closing', function(reason) {
      if(reason === 'kick') {
        siosocket.send({route: 'onKick'});
      }
    });
  });
  
  app.listen(this.port);
	 
	var domains = ["*:*"]; // domain:port list

	app.get('/crossdomain.xml', function (req, res) {
		var xml = '<?xml version="1.0" ?>\n<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n';
		
		domains.forEach(function(domain) {
			var parts = domain.split(':');
			xml += "\t<allow-access-from domain='" + parts[0] + "' to-ports='" + parts[1] + "' />\n";
		});

		xml += '</cross-domain-policy>\n';

		req.setEncoding('utf8');
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(xml);  
	});
};

/**
 * Stop connector
 */
Connector.prototype.stop = function() {
  this.wsocket.server.close();
};

Connector.prototype.composeResponse = function(msgId, route, msgBody) {
  return {
    id: msgId,
    body: msgBody
  };
};

Connector.prototype.composePush = function(route, msgBody) {
  return JSON.stringify({route: route, body: msgBody});
};
