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
			var httsServer = https.createServer(ssl).listen(port);
			var wss = new WebSocketServer({server: httsServer});
			wss.on('connection', this.emit.bind(this, 'connection'));
			break;
			case 'tls':
				var tlsServer = tls.createServer(ssl, function(socket) {
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
module.exports = TLS;