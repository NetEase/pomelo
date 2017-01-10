/**
 * Filter for rpc log.
 * Reject rpc request when toobusy
 */
const rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);

let toobusy = null;
const DEFAULT_MAXLAG = 70;

const Filter = function(maxLag)
{
	try
	{
		toobusy = require('toobusy');
	}
	catch (e)
	{
		// null
	}
	if (toobusy)
	{
		toobusy.maxLag(maxLag);
	}
};

Filter.prototype.name = 'toobusy';

/**
 * Before filter for rpc
 */
Filter.prototype.before = function(serverId, msg, opts, next)
{
	opts = opts || {};
	if (toobusy && toobusy())
	{
		rpcLogger.warn(`Server too busy for rpc request, serverId:${serverId} msg:${msg}`);
		const err = new Error(`Backend server : ${serverId} is too busy now!`);
		err.code = 500;
		next(err);
	}
	else
	{
		next(serverId, msg, opts);
	}
};

module.exports = function(maxLag)
{
	return new Filter(maxLag || DEFAULT_MAXLAG);
};
