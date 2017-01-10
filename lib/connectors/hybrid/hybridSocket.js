const _ = require('lodash'),
	handler = require('../common/handler'),
	protocol = require('pomelo-protocol'),
	Package = protocol.Package,
	EventEmitter = require('events').EventEmitter,
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

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

		const remoteSocket = _.get(socket, '_socket', null);
		let port = null;
		let ip = null;

		if (_.isNil(remoteSocket))
        {
			ip = _.get(socket.address(), 'address');
			port = _.get(socket.address(), 'port');
		}
		else
        {
			ip = _.get(remoteSocket, 'remoteAddress');
			port = _.get(remoteSocket, 'remotePort');
		}
		this.remoteAddress = {
			ip   : ip,
			port : port
		};

		socket.once('close', this.emit.bind(this, 'disconnect'));
		socket.on('error', this.emit.bind(this, 'error'));

		socket.on('message', msg =>
        {
			if (msg)
            {
				msg = Package.decode(msg);
				handler(this, msg);
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
		this.socket.send(msg, {binary: true}, err =>
        {
			if (err)
            {
				logger.error(`websocket send binary data failed: ${err.stack}`);
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
     * @param  {Buffer} messages byte data
     */
	sendBatch(messages)
    {
		const rs = [];
		let encodeResult;
		_.forEach(messages, message =>
        {
			encodeResult = Package.encode(Package.TYPE_DATA, message);
			rs.push(encodeResult);
		});
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

module.exports = function(id, socket)
{
	return new HyBirdSocket(id, socket);
};