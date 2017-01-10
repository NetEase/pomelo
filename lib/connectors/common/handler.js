const protocol = require('pomelo-protocol'),
	Package = protocol.Package,
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

const ST_INITED = 0;
const ST_WAIT_ACK = 1;
const ST_WORKING = 2;
const ST_CLOSED = 3;

class PackageType
{
	static GetHandler(value)
	{
		switch (value)
		{
		case Package.TYPE_HANDSHAKE:
			return PackageType.HandleHandshake;
		case Package.TYPE_HANDSHAKE_ACK:
			return PackageType.HandleHandshakeAck;
		case Package.TYPE_HEARTBEAT:
			return PackageType.HandleHeartbeat;
		case Package.TYPE_DATA:
			return PackageType.HandleData;
		}
	}

	static HandleHandshake(socket, pkg)
	{
		if (socket.state !== ST_INITED)
		{
			return;
		}
		try
		{
			socket.emit('handshake', JSON.parse(protocol.strdecode(pkg.body)));
		}
		catch (ex)
		{
			socket.emit('handshake', {});
		}
	}

	static HandleHandshakeAck(socket, pkg)
	{
		if (socket.state !== ST_WAIT_ACK)
		{
			return;
		}
		socket.state = ST_WORKING;
		socket.emit('heartbeat');
	}

	static HandleHeartbeat(socket, pkg)
	{
		if (socket.state !== ST_WORKING)
		{
			return;
		}
		socket.emit('heartbeat');
	}

	static HandleData(socket, pkg)
	{
		if (socket.state !== ST_WORKING)
		{
			return;
		}
		socket.emit('message', pkg);
	}
}

module.exports = function(socket, pkg)
{
	const handler = PackageType.GetHandler(pkg.type);
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