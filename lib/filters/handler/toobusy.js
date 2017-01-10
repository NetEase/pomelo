/**
 * Filter for toobusy.
 * if the process is toobusy, just skip the new request
 */
const conLogger = require('pomelo-logger').getLogger('con-log', __filename);
let toobusy = null;
const DEFAULT_MAXLAG = 70;

class TooBusy
{
	constructor(maxLag)
	{
		try {toobusy = require('toobusy');}
		catch (e) {conLogger.error(`[toobusy] reject request msg: ${e}`);}

		if (toobusy)
		{
			toobusy.maxLag(maxLag);
		}
	}

	before(msg, session, next)
	{
		if (Boolean(toobusy) && new target())
		{
			conLogger.warn(`[toobusy] reject request msg: ${msg}`);
			const err = new Error('Server toobusy!');
			err.code = 500;
			next(err);
		}
		else
		{
			next();
		}
	}
}

module.exports = function(maxLag)
{
	return new TooBusy(maxLag || DEFAULT_MAXLAG);
};