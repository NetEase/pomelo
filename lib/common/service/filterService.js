const _ = require('lodash'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Filter service.
 * Register and fire before and after filters.
 */
class FilterService
{
	constructor()
	{
		this.befores = [];    // before filters
		this.afters = [];     // after filters
		this.name = 'filter';
	}

	/**
	 * Add before filter into the filter chain.
	 *
	 * @param filter {Object|Function} filter instance or filter function.
	 */
	before(filter)
	{
		this.befores.push(filter);
	}

	/**
	 * Add after filter into the filter chain.
	 *
	 * @param filter {Object|Function} filter instance or filter function.
	 */
	after(filter)
	{
		this.afters.unshift(filter);
	}

	/**
	 * TODO: other insert method for filter? such as unShift
	 */

	/**
	 * Do the before filter.
	 * Fail over if any filter pass err parameter to the next function.
	 *
	 * @param msg {Object} clienet request msg
	 * @param session {Object} a session object for current request
	 * @param cb {Function} cb(err) callback function to invoke next chain node
	 */
	beforeFilter(msg, session, cb)
	{
		let index = 0;
		const next = (err, resp, opts) =>
		{
			if (err || index >= this.befores.length)
			{
				cb(err, resp, opts);
				return;
			}

			const handler = this.befores[index++];
			if (_.isFunction(handler))
			{
				handler(msg, session, next);
			}
			else if (_.isFunction(handler.before))
			{
				handler.before(msg, session, next);
			}
			else
			{
				logger.error('meet invalid before filter, handler or handler.before should be function.');
				next(new Error('invalid before filter.'));
			}
		}; // end of next
		next();
	}

	/**
	 * Do after filter chain.
	 * Give server a chance to do clean up jobs after request responsed.
	 * After filter can not change the request flow before.
	 * After filter should call the next callback to let the request pass to next after filter.
	 *
	 * @param err {Object} error object
	 * @param msg {*} msg object
	 * @param session {Object} session object for current request
	 * @param {Object} resp response object send to client
	 * @param cb {Function} cb(err) callback function to invoke next chain node
	 */
	afterFilter(err, msg, session, resp, cb)
	{
		let index = 0;
		const next = (err) =>
		{
			// if done
			if (index >= this.afters.length)
			{
				cb(err);
				return;
			}

			const handler = this.afters[index++];
			if (_.isFunction(handler))
			{
				handler(err, msg, session, resp, next);
			}
			else if (_.isFunction(handler.after))
			{
				handler.after(err, msg, session, resp, next);
			}
			else
			{
				logger.error('meet invalid after filter, handler or handler.after should be function.');
				next(new Error('invalid after filter.'));
			}
		}; // end of next
		next(err);
	}
}

module.exports = function(app)
{
	if (!(this instanceof FilterService))
	{
		return new FilterService(app);
	}
};