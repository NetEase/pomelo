/**
 * Scheduler component to schedule message sending.
 */

const _ = require('lodash'),
	DefaultScheduler = require('../pushSchedulers/direct'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class PushScheduler
{
	constructor(app, opts)
	{
		this.app = app;
		opts = opts || {};
		this.scheduler = PushSchedulerUtility.GetScheduler(this, app, opts);
		this.name = '__pushScheduler__';
	}

	/**
	 * Component lifecycle callback
	 * @param {Function} cb
	 */
	afterStart(cb)
	{
		if (this.isSelectable)
		{
			const schedulers = this.scheduler;
			_.forEach(schedulers, scheduler =>
			{
				if (_.isFunction(scheduler.start))
				{
					scheduler.start();
				}
			});
			process.nextTick(cb);
		}
		else if (_.isFunction(this.scheduler.start))
		{
			this.scheduler.start(cb);
		}
		else
		{
			process.nextTick(cb);
		}
	}

	/**
	 * Component lifecycle callback
	 * @param force
	 * @param {Function} cb
	 */
	stop(force, cb)
	{
		if (this.isSelectable)
		{
			const schedulers = this.scheduler;
			_.forEach(schedulers, scheduler =>
			{
				if (_.isFunction(scheduler.stop))
				{
					scheduler.stop();
				}
			});
			process.nextTick(cb);
		}
		else if (_.isFunction(this.scheduler.stop))
		{
			this.scheduler.stop(cb);
		}
		else
		{
			process.nextTick(cb);
		}
	}

	/**
	 * Schedule how the message to send.
	 *
	 * @param  {Number}   reqId request id
	 * @param  {String}   route route string of the message
	 * @param  {Object}   msg   message content after encoded
	 * @param  {Array}    recvs array of receiver's session id
	 * @param  {Object}   opts  options
	 * @param  {Function} cb
	 */
	schedule(reqId, route, msg, recvs, opts, cb)
	{
		if (this.isSelectable)
		{
			if (_.isFunction(this.selector))
			{
				this.selector(reqId, route, msg, recvs, opts, id =>
				{
					if (this.scheduler[id] && _.isFunction(this.scheduler[id].schedule))
					{
						this.scheduler[id].schedule(reqId, route, msg, recvs, opts, cb);
					}
					else
					{
						logger.error(`invalid pushScheduler id, id: ${id}`);
					}
				});
			}
			else
			{
				logger.error(`the selector for pushScheduler is not a function, selector: ${this.selector}`);
			}
		}
		else
		{
			if (_.isFunction(this.scheduler.schedule))
			{
				this.scheduler.schedule(reqId, route, msg, recvs, opts, cb);
			}
			else
			{
				logger.error(`the scheduler does not have a schedule function, scheduler: ${this.selector}`);
			}
		}
	}

}

class PushSchedulerUtility
{
	static GetScheduler(pushSchedulerComp, app, opts)
	{
		const scheduler = opts.scheduler || DefaultScheduler;
		if (_.isFunction(scheduler))
		{
			return scheduler(app, opts);
		}

		if (Array.isArray(scheduler))
		{
			const res = {};
			_.forEach(scheduler, sch =>
			{
				if (_.isFunction(sch.scheduler))
				{
					res[sch.id] = sch.scheduler(app, sch.options);
				}
				else
				{
					res[sch.id] = sch.scheduler;
				}
			});
			pushSchedulerComp.isSelectable = true;
			pushSchedulerComp.selector = opts.selector;
			return res;
		}

		return scheduler;
	}
}

module.exports = function(app, opts)
{
	return new PushScheduler(app, opts);
};
