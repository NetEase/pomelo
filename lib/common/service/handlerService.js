const _ = require('lodash'),
	fs = require('fs'),
	utils = require('../../util/utils'),
	Loader = require('pomelo-loader-upgrade'),
	pathUtil = require('../../util/pathUtil'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	forwardLogger = require('pomelo-logger').getLogger('forward-log', __filename);

class HandlerService
{
	/**
	 * Handler service.
	 * Dispatch request to the relactive handler.
	 *
	 * @param {Object} app      current application context
	 */
	constructor(app, opts)
	{
		this.app = app;
		this.handlerMap = {};
		this.name = 'handler';
		if (opts.reloadHandlers)
		{
			handlerServiceUtility.WatchHandlers(app, this.handlerMap);
		}
	}

	/**
	 * Handler the request.
	 */
	handle(routeRecord, msg, session, cb)
	{
		// the request should be processed by current server
		const handler = this.getHandler(routeRecord);
		if (!handler)
		{
			logger.error(`[handleManager]: fail to find handler for ${msg.__route__}`);
			utils.invokeCallback(cb, new Error(`fail to find handler for ${msg.__route__}`));
			return;
		}
		const start = Date.now();

		handler[routeRecord.method](msg, session, (err, resp, opts) =>
		{
			const log = {
				route    : msg.__route__,
				args     : msg,
				time     : utils.format(new Date(start)),
				timeUsed : new Date() - start
			};
			forwardLogger.info(JSON.stringify(log));
			utils.invokeCallback(cb, err, resp, opts);
		});
	}

	/**
	 * Get handler instance by routeRecord.
	 *
	 * @param  {Object} routeRecord route record parsed from route string
	 * @return {Object}             handler instance if any matchs or null for match fail
	 */
	getHandler(routeRecord)
	{
		const serverType = routeRecord.serverType;
		if (!this.handlerMap[serverType])
		{
			handlerServiceUtility.LoadHandlers(this.app, serverType, this.handlerMap);
		}
		const handlers = this.handlerMap[serverType] || {};
		const handler = handlers[routeRecord.handler];
		if (!handler)
		{
			logger.warn(`could not find handler for routeRecord: ${routeRecord}`);
			return null;
		}
		if (!_.isFunction(handler[routeRecord.method]))
		{
			logger.warn(`could not find the method ${routeRecord.method} in handler: ${routeRecord.handler}`);
			return null;
		}
		return handler;
	}
}

class handlerServiceUtility
{
	/**
	 * Load handlers from current application
	 */
	static LoadHandlers(app, serverType, handlerMap)
	{
		const p = pathUtil.getHandlerPath(app.getBase(), serverType);
		if (p)
		{
			handlerMap[serverType] = Loader.load(p, app);
		}
	}

	static WatchHandlers(app, handlerMap)
	{
		const p = pathUtil.getHandlerPath(app.getBase(), app.serverType);
		if (p)
		{
			fs.watch(p, function(event, name)
			{
				if (event === 'change')
				{
					handlerMap[app.serverType] = Loader.load(p, app);
				}
			});
		}
	}
}

module.exports = function(app, opts)
{
	if (!(this instanceof HandlerService))
	{
		return new HandlerService(app, opts);
	}
};