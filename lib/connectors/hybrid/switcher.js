
const _ = require('lodash'),
	EventEmitter = require('events').EventEmitter,
	WSProcessor = require('./wsprocessor'),
	TCPProcessor = require('./tcpprocessor'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

const HTTP_METHODS = [
	'GET', 'POST', 'DELETE', 'PUT', 'HEAD'
];

const ST_STARTED = 1;
const ST_CLOSED = 2;
const DEFAULT_TIMEOUT = 90;

class Switcher extends EventEmitter
{
	/**
	 * Switcher for tcp and websocket protocol
	 *
	 * @param {Object} server tcp server instance from node.js net module
	 */
	constructor(server, opts)
	{
		super();
		this.server = server;
		this.wsprocessor = new WSProcessor();
		this.tcpprocessor = new TCPProcessor(opts.closeMethod);
		this.id = 1;
		this.timeout = (opts.timeout || DEFAULT_TIMEOUT) * 1000;
		this.setNoDelay = opts.setNoDelay;

		if (!opts.ssl)
		{
			this.server.on('connection', this.newSocket.bind(this));
		}
		else
		{
			this.server.on('secureConnection', this.newSocket.bind(this));
			this.server.on('clientError', (e) =>
			{
				logger.warn('an ssl error occured before handshake established: ', e);
			});
		}

		this.wsprocessor.on('connection', this.emit.bind(this, 'connection'));
		this.tcpprocessor.on('connection', this.emit.bind(this, 'connection'));

		this.state = ST_STARTED;
	}

	newSocket(socket)
	{
		if (this.state !== ST_STARTED)
		{
			return;
		}

		socket.setTimeout(this.timeout, () =>
		{
			logger.warn(`connection is timeout without communication, the remote ip is ${socket.remoteAddress} && port is ${socket.remotePort}`);
			socket.destroy();
		});

		socket.once('data', data =>
		{
			// FIXME: handle incomplete HTTP method
			if (SwitcherUtility.IsHttp(data))
			{
				SwitcherUtility.ProcessHttp(this, this.wsprocessor, socket, data);
			}
			else
			{
				if (this.setNoDelay)
				{
					socket.setNoDelay(true);
				}
				SwitcherUtility.ProcessTcp(this, this.tcpprocessor, socket, data);
			}
		});
	}

	close()
	{
		if (this.state !== ST_STARTED)
		{
			return;
		}

		this.state = ST_CLOSED;
		this.wsprocessor.close();
		this.tcpprocessor.close();
	}

}

class SwitcherUtility
{
	static IsHttp(data)
	{
		const head = data.toString('utf8', 0, 4);

		_.forEach(HTTP_METHODS, httpType =>
		{
			if (_.indexOf(head, httpType) === 0)
			{
				return true;
			}
		});
		return false;
	}

	static ProcessHttp(switcher, processor, socket, data)
	{
		processor.add(socket, data);
	}

	static ProcessTcp(switcher, processor, socket, data)
	{
		processor.add(socket, data);
	}
}

module.exports = function(server, opts)
{
	return new Switcher(server, opts);
};