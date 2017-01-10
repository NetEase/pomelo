/**
 * Filter for statistics.
 * Record used time for each request.
 */
const conLogger = require('pomelo-logger').getLogger('con-log', __filename);
const utils = require('../../util/utils');

class Time
{
	before(msg, session, next)
	{
		session.__startTime__ = Date.now();
		next();
	}

	after(err, msg, session, resp, next)
	{
		const start = session.__startTime__;
		if (typeof start === 'number')
		{
			const timeUsed = Date.now() - start;
			const log = {
				route    : msg.__route__,
				args     : msg,
				time     : utils.format(new Date(start)),
				timeUsed : timeUsed
			};
			conLogger.info(JSON.stringify(log));
		}
		next(err);
	}
}

module.exports = () => {return new Time();};
