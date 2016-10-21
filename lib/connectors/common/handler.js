const protocol = require('pomelo-protocol');
const Package = protocol.Package;
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

const ST_INITED = 0;
const ST_WAIT_ACK = 1;
const ST_WORKING = 2;
const ST_CLOSED = 3;

class PackageType
{
	static getHandler(value)
	{
		switch (value)
		{
		case Package.TYPE_HANDSHAKE:
			return PackageType.handleHandshake;
		case Package.TYPE_HANDSHAKE_ACK:
			return PackageType.handleHandshakeAck;
		case Package.TYPE_HEARTBEAT:
			return PackageType.handleHeartbeat;
		case Package.TYPE_DATA:
			return PackageType.handleData;
		}
	}

	static handleHandshake(socket, pkg)
	{
		if (socket.state !== ST_INITED)
		{
			return;
		}
		try {socket.emit('handshake', JSON.parse(protocol.strdecode(pkg.body)));}
		catch (ex) {socket.emit('handshake', {});}
	}

	static handleHandshakeAck(socket, pkg)
	{
		if (socket.state !== ST_WAIT_ACK)
		{
			return;
		}
		socket.state = ST_WORKING;
		socket.emit('heartbeat');
	}

	static handleHeartbeat(socket, pkg)
	{
		if (socket.state !== ST_WORKING)
		{
			return;
		}
		socket.emit('heartbeat');
	}

	static handleData(socket, pkg)
	{
		if (socket.state !== ST_WORKING)
		{
			return;
		}
		socket.emit('message', pkg);
	}
}

const handle = (socket, pkg) =>
{
	const handler = PackageType.getHandler(pkg.type);
	if (handler)
	{
		handler(socket, pkg);
	}
	else
	{
		logger.error('could not find handle invalid data package.');
		socket.disconnect();
	}
};

module.exports = handle;
