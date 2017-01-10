const net = require('net');
const dGram = require('dgram');
const utils = require('../util/utils');
const Constants = require('../util/constants');
const UdpSocket = require('./udp/udpSocket');
const Kick = require('./commands/kick');
const Handshake = require('./commands/handshake');
const Heartbeat = require('./commands/heartbeat');
const coder = require('./common/coder');
const EventEmitter = require('events').EventEmitter;
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

let curId = 1;

class UDPConnector extends EventEmitter
{
	constructor(port, host, opts)
    {
		super();
		this.opts = opts || {};
		this.type = opts.udpType || 'udp4';
		this.handshake = new Handshake(opts);
		if (!opts.heartbeat)
        {
			opts.heartbeat = Constants.TIME.DEFAULT_UDP_HEARTBEAT_TIME;
			opts.timeout = Constants.TIME.DEFAULT_UDP_HEARTBEAT_TIMEOUT;
		}
		this.heartbeat = new Heartbeat(utils.extends(opts, {disconnectOnTimeout: true}));
		this.clients = {};
		this.host = host;
		this.port = port;
	}

	start(cb)
    {
		this.tcpServer = net.createServer();
		this.socket = dGram.createSocket(this.type, (msg, peer) =>
        {
			const key = genKey(peer);
			if (!this.clients[key])
            {
				const udpSocket = new UdpSocket(curId++, this.socket, peer);
				this.clients[key] = udpSocket;

				udpSocket.on('handshake',
                    this.handshake.handle.bind(this.handshake, udpSocket));

				udpSocket.on('heartbeat',
                    this.heartbeat.handle.bind(this.heartbeat, udpSocket));

				udpSocket.on('disconnect',
                    this.heartbeat.clear.bind(this.heartbeat, udpSocket.id));

				udpSocket.on('disconnect', () =>
                {
					delete this.clients[genKey(udpSocket.peer)];
				});

				udpSocket.on('closing', Kick.handle.bind(null, udpSocket));

				this.emit('connection', udpSocket);
			}
		});

		this.socket.on('message', (data, peer) =>
        {
			const socket = this.clients[genKey(peer)];
			if (socket)
            {
				socket.emit('package', data);
			}
		});

		this.socket.on('error', (err) =>
        {
			logger.error(`udp socket encounters with error: ${err.stack}`);
			return;
		});

		this.socket.bind(this.port, this.host);
		this.tcpServer.listen(this.port);
		process.nextTick(cb);
	}

	stop(force, cb)
    {
		this.socket.close();
		process.nextTick(cb);
	}

}

const genKey = peer =>
{
	return `${peer.address}:${peer.port}`;
};

UDPConnector.decode = UDPConnector.prototype.decode = coder.decode;

UDPConnector.encode = UDPConnector.prototype.encode = coder.encode;

module.exports = function(port, host, opts)
{
	if (!(this instanceof UDPConnector))
    {
		return new UDPConnector(port, host, opts);
	}
};