/**
 * Filter to keep request sequence.
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const taskManager = require('../../common/manager/taskManager');

class Serial
{
	constructor(timeout)
    {
		this.timeout = timeout;
	}

    /**
     * request serialization after filter
     */
	before(msg, session, next)
    {
		taskManager.addTask(session.id, function(task)
        {
			session.__serialTask__ = task;
			next();
		}, () =>
        {
			logger.error(`[serial filter] msg timeout, msg:${JSON.stringify(msg)}`);
		}, this.timeout);
	}

    /**
     * request serialization after filter
     */
	after(err, msg, session, resp, next)
    {
		const task = session.__serialTask__;
		if (task)
        {
			if (!task.done() && !err)
            {
				err = new Error(`task time out. msg:${JSON.stringify(msg)}`);
			}
		}
		next(err);
	}
}

module.exports = (timeout) =>
{
	return new Serial(timeout);
};