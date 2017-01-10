const forEach = require('lodash').forEach,
	handler = require('../common/handler'),
	protocol = require('pomelo-protocol'),
	Package = protocol.Package,
	EventEmitter = require('events').EventEmitter,
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

const ST_INITED = 0;
const ST_WAIT_ACK = 1;
const ST_WORKING = 2;
const ST_CLOSED = 3;
class UDPSocket extends EventEmitter
{
	constructor(id, socket, peer)
    {
		super();

		this.id = id;
		this.socket = socket;
		this.peer = peer;
		this.host = peer.address;
		this.port = peer.port;
		this.remoteAddress = {
			ip   : this.host,
			port : this.port
		};

		this.on('package', pkg =>
        {
			if (pkg)
            {
				pkg = Package.decode(pkg);
				handler(this, pkg);
			}
		});

		this.state = ST_INITED;
	}

    /**
     * Send byte data package to client.
     *
     * @param  {Buffer} msg byte data
     */
	send(msg)
    {
		if (this.state !== ST_WORKING)
        {
			return;
		}
		if (msg instanceof String)
        {
			msg = new Buffer(msg);
		}
		else if (!(msg instanceof Buffer))
        {
			msg = new Buffer(JSON.stringify(msg));
		}
		this.sendRaw(Package.encode(Package.TYPE_DATA, msg));
	}

	sendRaw(msg)
    {
		this.socket.send(msg, 0, msg.length, this.port, this.host, function(err, bytes)
        {
			if (err)
            {
				logger.error('send msg to remote with err: %j', err.stack);
				return;
			}
		});
	}

	sendForce(msg)
    {
		if (this.state === ST_CLOSED)
        {
			return;
		}
		this.sendRaw(msg);
	}

	handshakeResponse(resp)
    {
		if (this.state !== ST_INITED)
        {
			return;
		}
		this.sendRaw(resp);
		this.state = ST_WAIT_ACK;
	}

	sendBatch(messages)
    {
		if (this.state !== ST_WORKING)
        {
			return;
		}
		const rs = [];
		forEach(messages, message =>
        {
			const src = Package.encode(Package.TYPE_DATA, message);
			rs.push(src);
		});
		this.sendRaw(Buffer.concat(rs));
	}

	disconnect()
    {
		if (this.state === ST_CLOSED)
        {
			return;
		}
		this.state = ST_CLOSED;
		this.emit('disconnect', 'the connection is disconnected.');
	}
}

module.exports = function(id, socket, peer)
{
	if (!(this instanceof UDPSocket))
    {
		return new UDPSocket(id, socket, peer);
	}
};