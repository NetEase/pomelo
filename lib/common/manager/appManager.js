/**
 * Created by frank on 16-12-26.
 */
const _ = require('lodash'),
	async = require('async'),
	utils = require('../../util/utils'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	transactionLogger = require('pomelo-logger').getLogger('transaction-log', __filename),
	transactionErrorLogger = require('pomelo-logger').getLogger('transaction-error-log', __filename);

class AppManager
{
	static Transaction(name, conditions, handlers, retry)
	{
		if (!retry)
		{
			retry = 1;
		}
		if (!_.isString(name))
		{
			logger.error('transaction name is error format, name: %s.', name);
			return;
		}
		if (!_.isObject(conditions) || !_.isObject(handlers))
		{
			logger.error('transaction conditions parameter is error format, conditions: %j, handlers: %j.', conditions, handlers);
			return;
		}

		const cmethods = [], dmethods = [], cnames = [], dnames = [];
		_.forEach(conditions, (condition, key) =>
		{
			if (!_.isString(key) || !_.isFunction(condition))
			{
				logger.error('transaction conditions parameter is error format, condition name: %s, condition function: %j.', key, conditions[key]);
				return;
			}
			cnames.push(key);
			cmethods.push(condition);
		});

		let i = 0;
		// execute conditions
		async.forEachSeries(cmethods, (method, cb) =>
		{
			method(cb);
			transactionLogger.info('[%s]:[%s] condition is executed.', name, cnames[i]);
			i++;
		},
			(err) =>
			{
				if (err)
				{
					process.nextTick(() =>
					{
						transactionLogger.error('[%s]:[%s] condition is executed with err: %j.', name, cnames[--i], err.stack);
						const log = {
							name        : name,
							method      : cnames[i],
							time        : Date.now(),
							type        : 'condition',
							description : err.stack
						};
						transactionErrorLogger.error(JSON.stringify(log));
					});
				}
				else
				{
					// execute handlers
					process.nextTick(() =>
					{
						_.forEach(handlers, (handle, key) =>
						{
							if (!_.isString(key) || !_.isFunction(handle))
							{
								logger.error('transcation handlers parameter is error format, handler name: %s, handler function: %j.', key, handlers[key]);
								return;
							}
							dnames.push(key);
							dmethods.push(handlers[key]);
						});

						let flag = true;
						const times = retry;

						// do retry if failed util retry times
						async.whilst(() =>
							{
							return retry > 0 && flag;
						},
							callback =>
							{
								let j = 0;
								retry--;
								async.forEachSeries(dmethods, (method, cb) =>
									{
									method(cb);
									transactionLogger.info('[%s]:[%s] handler is executed.', name, dnames[j]);
									j++;
								},
									(err) =>
									{
										if (err)
										{
											process.nextTick(() =>
											{
												transactionLogger.error('[%s]:[%s]:[%s] handler is executed with err: %j.', name, dnames[--j], times - retry, err.stack);
												const log = {
													name        : name,
													method      : dnames[j],
													retry       : times - retry,
													time        : Date.now(),
													type        : 'handler',
													description : err.stack
												};
												transactionErrorLogger.error(JSON.stringify(log));
												utils.invokeCallback(callback);
											});
											return;
										}
										flag = false;
										utils.invokeCallback(callback);
										process.nextTick(() =>
										{
											transactionLogger.info('[%s] all conditions and handlers are executed successfully.', name);
										});
									});
							},
							(err) =>
							{
								if (err)
								{
									logger.error('transaction process is executed with error: %j', err);
								}
								// callback will not pass error
							});
					});
				}
			});
	}
}

module.exports.transaction = AppManager.Transaction;