/**
 * Created by frank on 16-12-27.
 */
const isString = require('lodash').isString,
	Package = require('pomelo-protocol').Package;

class Kick
{
	static Handle(socket, reason)
	{
		if (isString(reason))
		{
			const buffer = new Buffer(JSON.stringify({reason: reason}));
			socket.sendRaw(Package.encode(Package.TYPE_KICK, buffer));
		}
	}
}

module.exports.handle = Kick.Handle;