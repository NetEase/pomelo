const fs = require('fs');
const utils = require('../../util/utils');
const Loader = require('pomelo-loader');
const pathUtil = require('../../util/pathUtil');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const forwardLogger = require('pomelo-logger').getLogger('forward-log', __filename);

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
			handlerServiceUtility.watchHandlers(app, this.handlerMap);
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
			logger.error('[handleManager]: fail to find handler for %j', msg.__route__);
			utils.invokeCallback(cb, new Error(`fail to find handler for ${msg.__route__}`));
			return;
		}
		const start = Date.now();

		handler[routeRecord.method](msg, session, function(err, resp, opts)
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
		return;
	}

    /**
     * Get handler instance by routeRecord.
     *
     * @param  {Object} handlers    handler map
     * @param  {Object} routeRecord route record parsed from route string
     * @return {Object}             handler instance if any matchs or null for match fail
     */
	getHandler(routeRecord)
    {
		const serverType = routeRecord.serverType;
		if (!this.handlerMap[serverType])
        {
			handlerServiceUtility.loadHandlers(this.app, serverType, this.handlerMap);
		}
		const handlers = this.handlerMap[serverType] || {};
		const handler = handlers[routeRecord.handler];
		if (!handler)
        {
			logger.warn('could not find handler for routeRecord: %j', routeRecord);
			return null;
		}
		if (typeof handler[routeRecord.method] !== 'function')
        {
			logger.warn('could not find the method %s in handler: %s', routeRecord.method, routeRecord.handler);
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
	static loadHandlers(app, serverType, handlerMap)
    {
		const p = pathUtil.getHandlerPath(app.Base, serverType);
		if (p)
        {
			handlerMap[serverType] = Loader.load(p, app);
		}
	}

	static watchHandlers(app, handlerMap)
    {
		const p = pathUtil.getHandlerPath(app.Base, app.serverType);
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

module.exports = HandlerService;

