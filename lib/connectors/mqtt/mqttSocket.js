const forEach = require('lodash').forEach,
	EventEmitter = require('events').EventEmitter;

const ST_INITED = 1;
const ST_CLOSED = 2;

/**
 * Socket class that wraps socket and websocket to provide unified interface for up level.
 */
class MQTTSocket extends EventEmitter
{
	constructor(id, socket, adaptor)
    {
		super();
		this.id = id;
		this.socket = socket;
		this.remoteAddress = {
			ip   : socket.stream.remoteAddress,
			port : socket.stream.remotePort
		};
		this.adaptor = adaptor;

		socket.on('close', this.emit.bind(this, 'disconnect'));
		socket.on('error', this.emit.bind(this, 'disconnect'));
		socket.on('disconnect', this.emit.bind(this, 'disconnect'));

		socket.on('pingreq', packet =>
        {
			socket.pingresp();
		});

		socket.on('subscribe', this.adaptor.onSubscribe.bind(this.adaptor, this));

		socket.on('publish', this.adaptor.onPublish.bind(this.adaptor, this));

		this.state = ST_INITED;

        // TODO: any other events?
	}

	send(msg)
    {
		if (this.state !== ST_INITED)
        {
			return;
		}
		if (msg instanceof Buffer)
        {
            // if encoded, send directly
			this.socket.stream.write(msg);
		}
		else
        {
			this.adaptor.publish(this, msg);
		}
	}

	sendBatch(messages)
    {
		forEach(messages, message =>
        {
			this.send(message);
		});
	}

	disconnect()
    {
		if (this.state === ST_CLOSED)
        {
			return;
		}

		this.state = ST_CLOSED;
		this.socket.stream.destroy();
	}
}

module.exports = function(id, socket, adaptor)
{
	if (!(this instanceof MQTTSocket))
    {
		return new MQTTSocket(id, socket, adaptor);
	}
};