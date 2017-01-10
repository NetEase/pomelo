const rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);
const utils = require('../../util/utils');

class RpcLog
{
	constructor()
	{
		this.name = 'rpcLog';
	}

	/**
	 * Before filter for rpc
	 */
	before(serverId, msg, opts, next)
	{
		opts = opts || {};
		opts.__start_time__ = Date.now();
		next(serverId, msg, opts);
	}

	/**
	 * After filter for rpc
	 */
	after(serverId, msg, opts, next)
	{
		if (opts && opts.__start_time__)
		{
			const start = opts.__start_time__;
			const end = Date.now();
			const timeUsed = end - start;
			const log = {
				route    : msg.service,
				args     : msg.args,
				time     : utils.format(new Date(start)),
				timeUsed : timeUsed
			};
			rpcLogger.info(JSON.stringify(log));
		}
		next(serverId, msg, opts);
	}
}

module.exports = function()
{
	return new RpcLog();
};