/**
 * Created by frank on 16-12-26.
 */

const net = require('net'),
	tls = require('tls'),
	_ = require('lodash'),
	HybridSocket = require('./hybrid/hybridSocket'),
	Switcher = require('./hybrid/switcher'),
	Handshake = require('./commands/handshake'),
	Heartbeat = require('./commands/heartbeat'),
	Kick = require('./commands/kick'),
	coder = require('./common/coder'),
	app = require('../pomelo').app,
	EventEmitter = require('events').EventEmitter;

let curId = 1;

class HybridConnector extends EventEmitter
{
	constructor(port, host, opts)
    {
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
		this.listeningServer = null;
	}

	start(callBack)
    {
		const genSocket = (socket) =>
        {
			const hybridSocket = new HybridSocket(curId++, socket);
			hybridSocket.on('handshake', this.handshake.handle.bind(this.handshake, hybridSocket));
			hybridSocket.on('heartbeat', this.heartbeat.handle.bind(this.heartbeat, hybridSocket));
			hybridSocket.on('disconnect', this.heartbeat.clear.bind(this.heartbeat, hybridSocket.id));
			hybridSocket.on('closing', Kick.handle.bind(null, hybridSocket));
			this.emit('connection', hybridSocket);
		};

		const components = app.components;
		this.connector = _.get(components, '__connector__.connector', null);
		this.dictionary = _.get(components, '__dictionary__', null);
		this.protobuf = _.get(components, '__protobuf__', null);
		this.decodeIO_protobuf = _.get(components, '__decodeIO__protobuf__', null);

		if (!this.ssl)
        {
			this.listeningServer = net.createServer();
		}
		else
        {
			this.listeningServer = tls.createServer(this.ssl);
		}
		this.switcher = new Switcher(this.listeningServer, this.opts);

		this.switcher.on('connection', (socket) =>
        {
			genSocket(socket);
		});

		if (this.distinctHost)
        {
			this.listeningServer.listen(this.port, this.host);
		}
		else
        {
			this.listeningServer.listen(this.port);
		}

		process.nextTick(callBack);
	}

	stop(force, callBack)
    {
		if (!_.isNil(this.switcher))
        {
			this.switcher.close();
		}
		if (!_.isNil(this.listeningServer))
        {
			this.listeningServer.close();
		}
		process.nextTick(callBack);
	}

}

HybridConnector.decode = HybridConnector.prototype.decode = coder.decode;

HybridConnector.encode = HybridConnector.prototype.encode = coder.encode;

module.exports = function(port, host, opts)
{
	if (!(this instanceof HybridConnector))
    {
		return new HybridConnector(port, host, opts);
	}
};
