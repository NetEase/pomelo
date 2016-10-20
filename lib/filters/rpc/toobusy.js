/**
 * Filter for rpc log.
 * Reject rpc request when toobusy
 */
const rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);

const DEFAULT_MAXLAG = 70;

class TooBusy
{
	constructor(maxLag)
    {
		this.name = 'toobusy';
		this.maxLog = maxLag;
	}

	set maxLag(value)
    {
		this.maxLog = value;
	}

	get maxLag()
    {
		return this.maxLog;
	}

    /**
     * Before filter for rpc
     */
	before(serverId, msg, opts, next)
    {
		opts = opts || {};
		if (Boolean(toobusy) && toobusy)
        {
			rpcLogger.warn(`Server too busy for rpc request, serverId:${serverId} msg: ${msg}`);
			const err = new Error(`Backend server ${serverId} is too busy now!`);
			err.code = 500;
			next(err);
		}
		else
        {
			next();
		}
	}
}

module.exports = new TooBusy(DEFAULT_MAXLAG);
const toobusy = require('./toobusy');