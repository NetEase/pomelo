const _ = require('lodash'),
	Stream = require('stream'),
	protocol = require('pomelo-protocol'),
	Package = protocol.Package,
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Work states
 */
const ST_HEAD = 1;      // wait for head
const ST_BODY = 2;      // wait for body
const ST_CLOSED = 3;    // closed

/**
 * Tcp socket wrapper with package compositing.
 * Collect the package from socket and emit a completed package with 'data' event.
 * Uniform with ws.WebSocket interfaces.
 *
 * @param {Object} socket origin socket from node.js net module
 * @param {Object} opts   options parameter.
 *                        opts.headSize size of package head
 *                        opts.headHandler(headBuffer) handler for package head. caculate and return body size from head data.
 */
class Socket extends Stream
{
	constructor(socket, opts)
	{
		if (!socket || !opts)
		{
			throw new Error('invalid socket or opts');
		}

		if (!opts.headSize || typeof opts.headHandler !== 'function')
		{
			throw new Error('invalid opts.headSize or opts.headHandler');
		}

		// stream style interfaces.
		// TODO: need to port to stream2 after node 0.9
		super();
		this.readable = true;
		this.writeable = true;

		this._socket = socket;
		this.headSize = opts.headSize;
		this.closeMethod = opts.closeMethod;
		this.headBuffer = new Buffer(opts.headSize);
		this.headHandler = opts.headHandler;

		this.headOffset = 0;
		this.packageOffset = 0;
		this.packageSize = 0;
		this.packageBuffer = null;

		// bind event form the origin socket
		this._socket.on('data', SocketUtility.OnData.bind(null, this));
		this._socket.on('end', SocketUtility.OnEnd.bind(null, this));
		this._socket.on('error', this.emit.bind(this, 'error'));
		this._socket.on('close', this.emit.bind(this, 'close'));

		this.state = ST_HEAD;
	}

	send(msg, encode, cb)
	{
		this._socket.write(msg, encode, cb);
	}

	close()
	{
		if (this.closeMethod && _.isEqual(this.closeMethod, 'end'))
		{
			this._socket.end();
		}
		else
		{
			try
			{
				this._socket.destroy();
			}
			catch (e)
			{
				logger.error(`socket close with destroy error: ${e.stack}`);
			}
		}
	}

}

class SocketUtility
{
	static OnData(socket, chunk)
	{
		if (socket.state === ST_CLOSED)
		{
			throw new Error('socket has closed');
		}

		if (!_.isString(chunk) && !Buffer.isBuffer(chunk))
		{
			throw new Error('invalid data');
		}

		if (_.isString(chunk))
		{
			chunk = new Buffer(chunk, 'utf8');
		}

		let offset = 0;
		const end = chunk.length;

		while (offset < end && socket.state !== ST_CLOSED)
		{
			if (socket.state === ST_HEAD)
			{
				offset = SocketUtility.ReadHead(socket, chunk, offset);
			}

			if (socket.state === ST_BODY)
			{
				offset = SocketUtility.ReadBody(socket, chunk, offset);
			}
		}

		return true;
	}

	static OnEnd(socket, chunk)
	{
		if (chunk)
		{
			socket._socket.write(chunk);
		}

		socket.state = ST_CLOSED;
		SocketUtility.Reset(socket);
		socket.emit('end');
	}

	/**
	 * Read head segment from data to socket.headBuffer.
	 *
	 * @param  {Object} socket Socket instance
	 * @param  {Object} data   Buffer instance
	 * @param  {Number} offset offset read star from data
	 * @return {Number}        new offset of data after read
	 */
	static ReadHead(socket, data, offset)
	{
		const headLength = socket.headSize - socket.headOffset;
		const dataLength = data.length - offset;
		const len = Math.min(headLength, dataLength);
		let dataEnd = offset + len;

		data.copy(socket.headBuffer, socket.headOffset, offset, dataEnd);
		socket.headOffset += len;

		if (_.isEqual(socket.headOffset, socket.headSize))
		{
			// if head segment finished
			const size = socket.headHandler(socket.headBuffer);
			if (size < 0)
			{
				throw new Error(`invalid body size: ${size}`);
			}
			// check if header contains a valid type
			if (SocketUtility.CheckTypeData(socket.headBuffer[0]))
			{
				socket.packageSize = size + socket.headSize;
				socket.packageBuffer = new Buffer(socket.packageSize);
				socket.headBuffer.copy(socket.packageBuffer, 0, 0, socket.headSize);
				socket.packageOffset = socket.headSize;
				socket.state = ST_BODY;
			}
			else
			{
				dataEnd = data.length;
				logger.error(`close the connection with invalid head message, the remote ip:${socket._socket.remoteAddress}  port:${socket._socket.remotePort} message: ${data}`);
				socket.close();
			}

		}

		return dataEnd;
	}

	/**
	 * Read body segment from data buffer to socket.packageBuffer;
	 *
	 * @param  {Object} socket Socket instance
	 * @param  {Object} data   Buffer instance
	 * @param  {Number} offset offset read star from data
	 * @return {Number}        new offset of data after read
	 */
	static ReadBody(socket, data, offset)
	{
		const packageSize = socket.packageSize - socket.packageOffset;
		const dataLength = data.length - offset;
		const len = Math.min(packageSize, dataLength);
		const dataEnd = offset + len;

		data.copy(socket.packageBuffer, socket.packageOffset, offset, dataEnd);

		socket.packageOffset += len;

		if (_.isEqual(socket.packageOffset, socket.packageSize))
		{
			// if all the package finished
			const buffer = socket.packageBuffer;
			socket.emit('message', buffer);
			SocketUtility.Reset(socket);
		}

		return dataEnd;
	}

	static Reset(socket)
	{
		socket.headOffset = 0;
		socket.packageOffset = 0;
		socket.packageSize = 0;
		socket.packageBuffer = null;
		socket.state = ST_HEAD;
	}

	static CheckTypeData(data)
	{
		const packageTypes = [
			Package.TYPE_HANDSHAKE,
			Package.TYPE_HANDSHAKE_ACK,
			Package.TYPE_HEARTBEAT,
			Package.TYPE_DATA,
			Package.TYPE_KICK,
		];
		return _.includes(packageTypes, data);
	}
}

module.exports = function(socket, opts)
{
	if (!(this instanceof Socket))
	{
		return new Socket(socket, opts);
	}
};