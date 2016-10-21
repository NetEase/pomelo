const EventEmitter = require('events').EventEmitter;
const utils = require('../../util/utils');
const TcpSocket = require('./tcpsocket');

const ST_STARTED = 1;
const ST_CLOSED = 2;

// private protocol, no need exports
const HEAD_SIZE = 4;

/**
 * websocket protocol processor
 */
class TcpProcessor extends EventEmitter
{
	constructor(closeMethod)
    {
		super();
		this.closeMethod = closeMethod;
		this.state = ST_STARTED;
	}

	add(socket, data)
    {
		if (this.state !== ST_STARTED)
        {
			return;
		}
		const tcpsocket = new TcpSocket(socket, {headSize    : HEAD_SIZE,
            headHandler : utils.headHandler,
            closeMethod : this.closeMethod});
		this.emit('connection', tcpsocket);
		socket.emit('data', data);
	}

	close()
    {
		if (this.state !== ST_STARTED)
        {
			return;
		}
		this.state = ST_CLOSED;
	}
}

module.exports = TcpProcessor;