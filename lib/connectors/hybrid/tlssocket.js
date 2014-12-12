var EventEmitter = require('events').EventEmitter;
var util = require('util');
var https = require('https');
var tls = require('tls');
var utils = require('../../util/utils');
var TcpSocket = require('./tcpsocket');
var WebSocketServer	= require('ws').Server;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var HEAD_SIZE = 4;

var TLS = function(port, opts) {
	EventEmitter.call(this);
	var self = this;
	var ssl = opts.ssl;
	switch(ssl.type) {
		case 'wss':
			var httpsServer = https.createServer(ssl).listen(port);
			this.server = new WebSocketServer({server: httpsServer});
			this.server.on('connection', this.emit.bind(this, 'connection'));
			break;
			case 'tls':
				this.server = tls.createServer(ssl, function(socket) {
					var tcpsocket = new TcpSocket(socket, {headSize: HEAD_SIZE,
						headHandler: utils.headHandler,
						closeMethod: opts.closeMethod});
					self.emit('connection', tcpsocket);
				}).listen(port);	
			break;
			default:
				logger.error('undefined ssl type: %s', ssl.type);
			break;
	}
};

util.inherits(TLS, EventEmitter);

TLS.prototype.close = function() {
	if (this.server) {
		this.server.close();
	}
};

module.exports = TLS;
