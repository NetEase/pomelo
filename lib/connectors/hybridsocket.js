const EventEmitter = require('events').EventEmitter;
const handler = require('./common/handler');
const protocol = require('pomelo-protocol');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const Package = protocol.Package;

const ST_INITED = 0;
const ST_WAIT_ACK = 1;
const ST_WORKING = 2;
const ST_CLOSED = 3;

/**
 * Socket class that wraps socket and websocket to provide unified interface for up level.
 */
class HyBirdSocket extends EventEmitter
{
	constructor(id, socket)
    {
		super();
		this.id = id;
		this.socket = socket;

		if (!socket._socket)
        {
			this.remoteAddress = {
				ip   : socket.address().address,
				port : socket.address().port
			};
		}
		else
        {
			this.remoteAddress = {
				ip   : socket._socket.remoteAddress,
				port : socket._socket.remotePort
			};
		}

		const self = this;

		socket.once('close', this.emit.bind(this, 'disconnect'));
		socket.on('error', this.emit.bind(this, 'error'));

		socket.on('message', function(msg)
        {
			if (msg)
            {
				msg = Package.decode(msg);
				handler(self, msg);
			}
		});

		this.state = ST_INITED;
        // TODO: any other events?
	}

    /**
     * Send raw byte data.
     *
     * @api private
     */
	sendRaw(msg)
    {
		if (this.state !== ST_WORKING)
        {
			return;
		}
		this.socket.send(msg, {binary: true}, function(err)
        {
			if (err)
            {
				logger.error('websocket send binary data failed: %j', err.stack);
			}
		});
	}

    /**
     * Send byte data package to client.
     *
     * @param  {Buffer} msg byte data
     */
	send(msg)
    {
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

    /**
     * Send byte data packages to client in batch.
     *
     * @param  {Buffer} msgs byte data
     */
	sendBatch(msgs)
    {
		const rs = [];
		for (let i = 0; i < msgs.length; i++)
        {
			const src = Package.encode(Package.TYPE_DATA, msgs[i]);
			rs.push(src);
		}
		this.sendRaw(Buffer.concat(rs));
	}

    /**
     * Send message to client no matter whether handshake.
     *
     * @api private
     */
	sendForce(msg)
    {
		if (this.state === ST_CLOSED)
        {
			return;
		}
		this.socket.send(msg, {binary: true});
	}

    /**
     * Response handshake request
     *
     * @api private
     */
	handshakeResponse(resp)
    {
		if (this.state !== ST_INITED)
        {
			return;
		}

		this.socket.send(resp, {binary: true});
		this.state = ST_WAIT_ACK;
	}

    /**
     * Close the connection.
     *
     * @api private
     */
	disconnect()
    {
		if (this.state === ST_CLOSED)
        {
			return;
		}

		this.state = ST_CLOSED;
		this.socket.emit('close');
		this.socket.close();
	}
}

module.exports = HyBirdSocket;