const net = require('net');
const tls = require('tls');
const EventEmitter = require('events').EventEmitter;

const HybridSocket = require('./hybridsocket');
const Switcher = require('./hybrid/switcher');
const Handshake = require('./commands/handshake');
const Heartbeat = require('./commands/heartbeat');
const Kick = require('./commands/kick');
const coder = require('./common/coder');

let curId = 1;

/**
 * Connector that manager low level connection and protocol bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol, such as tcp or probuf.
 */
class Connector extends EventEmitter
{
	constructor(port, host, opts)
    {
		if (!(new.target instanceof Connector))
        {
			return new Connector(port, host, opts);
		}
		super();
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

    /**
     * Start connector to listen the specified port
     */
	start(cb)
    {
		const app = require('../pomelo').app;
		const self = this;

		this.connector = app.components.__connector__.connector;
		this.dictionary = app.components.__dictionary__;
		this.protobuf = app.components.__protobuf__;
		this.decodeIO_protobuf = app.components.__decodeIO__protobuf__;

		if (!this.ssl)
        {
			this.listeningServer = net.createServer();
		}
		else
        {
			this.listeningServer = tls.createServer(this.ssl);
		}
		this.switcher = new Switcher(this.listeningServer, self.opts);

		this.switcher.on('connection', ConnectorUtility.GenSocket);

		if (this.distinctHost)
        {
			this.listeningServer.listen(this.port, this.host);
		}
		else
        {
			this.listeningServer.listen(this.port);
		}

		process.nextTick(cb);
	}

	stop(force, cb)
    {
		this.switcher.close();
		this.listeningServer.close();

		process.nextTick(cb);
	}
}

class ConnectorUtility
{
	static GenSocket(connector, socket)
    {
		const hyBirdSocket = new HybridSocket(curId++, socket);
		hyBirdSocket.on('handshake', connector.handshake.handle.bind(connector.handshake, hyBirdSocket));
		hyBirdSocket.on('heartbeat', connector.heartbeat.handle.bind(connector.heartbeat, hyBirdSocket));
		hyBirdSocket.on('disconnect', connector.heartbeat.clear.bind(connector.heartbeat, hyBirdSocket.id));
		hyBirdSocket.on('closing', Kick.handle.bind(null, hyBirdSocket));
		connector.emit('connection', hyBirdSocket);
	}
}

Connector.decode = Connector.prototype.decode = coder.decode;

Connector.encode = Connector.prototype.encode = coder.encode;

module.exports = Connector;