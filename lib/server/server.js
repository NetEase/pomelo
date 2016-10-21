/**
 * Implementation of server component.
 * Init and start server instance.
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const fs = require('fs');
const path = require('path');
const pathUtil = require('../util/pathUtil');
const Loader = require('pomelo-loader');
const utils = require('../util/utils');
const schedule = require('pomelo-scheduler');
const events = require('../util/events');
const Constants = require('../util/constants');
const FilterService = require('../common/service/filterService');
const HandlerService = require('../common/service/handlerService');

const ST_INITED = 0;    // server inited
const ST_STARTED = 1;   // server started
const ST_STOPED = 2;    // server stoped

class Server
{
    /**
     * Server factory function.
     *
     * @param {Object} app  current application context
     * @return {Object} erver instance
     */
	constructor(app, opts)
    {
		this.opts = opts || {};
		this.app = app;
		this.globalFilterService = null;
		this.filterService = null;
		this.handlerService = null;
		this.crons = [];
		this.jobs = {};
		this.state = ST_INITED;

		app.event.on(events.ADD_CRONS, this.addCrones.bind(this));
		app.event.on(events.REMOVE_CRONS, this.removeCrones.bind(this));
	}

    /**
     * Server lifecycle callback
     */
	start()
    {
		if (this.state > ST_INITED)
        {
			return;
		}

		this.globalFilterService = ServerUtility.initFilter(true, this.app);
		this.filterService = ServerUtility.initFilter(false, this.app);
		this.handlerService = ServerUtility.initHandler(this.app, this.opts);
		this.cronHandlers = ServerUtility.loadCronHandlers(this.app);
		ServerUtility.loadCrones(this, this.app);
		this.state = ST_STARTED;
	}

	afterStart()
    {
		ServerUtility.scheduleCrones(this, this.crons);
	}

    /**
     * Stop server
     */
	stop()
    {
		this.state = ST_STOPED;
	}

    /**
     * Global handler.
     *
     * @param  {Object} msg request message
     * @param  {Object} session session object
     * @param  {Function} cb function
     */
	globalHandle(msg, session, cb)
    {
		if (this.state !== ST_STARTED)
        {
			utils.invokeCallback(cb, new Error('server not started'));
			return;
		}

		const routeRecord = ServerUtility.parseRoute(msg.route);
		if (!routeRecord)
        {
			utils.invokeCallback(cb, new Error('meet unknown route message %j', msg.route));
			return;
		}

		const self = this;
		const dispatch = (err, resp, opts) =>
        {
			if (err)
            {
				ServerUtility.handleError(true, self, err, msg, session, resp, opts, (err, resp, opts) =>
                {
					ServerUtility.response(true, self, err, msg, session, resp, opts, cb);
				});
				return;
			}

			if (self.app.ServerType !== routeRecord.serverType)
            {
				ServerUtility.doForward(self.app, msg, session, routeRecord, (err, resp, opts) =>
                {
					ServerUtility.response(true, self, err, msg, session, resp, opts, cb);
				});
			}
			else
            {
				ServerUtility.doHandle(self, msg, session, routeRecord, (err, resp, opts) =>
                {
					ServerUtility.response(true, self, err, msg, session, resp, opts, cb);
				});
			}
		};
		ServerUtility.beforeFilter(true, self, msg, session, dispatch);
	}

    /**
     * Handle request
     */
	handle(msg, session, cb)
    {
		if (this.state !== ST_STARTED)
        {
			cb(new Error('server not started'));
			return;
		}

		const routeRecord = ServerUtility.parseRoute(msg.route);
		ServerUtility.doHandle(this, msg, session, routeRecord, cb);
	}

    /**
     * Add crones at runtime.
     *
     * @param {Array} crones would be added in application
     */
	addCrones(crones)
    {
		this.cronHandlers = ServerUtility.loadCronHandlers(this.app);
		for (let i = 0, l = crones.length; i < l; i++)
        {
			const cron = crones[i];
			ServerUtility.checkAndAdd(cron, this.crons, this);
		}
		ServerUtility.scheduleCrones(this, crones);
	}

    /**
     * Remove crones at runtime.
     *
     * @param {Array} crones would be removed in application
     */
	removeCrones(crones)
    {
		for (let i = 0, l = crones.length; i < l; i++)
        {
			const cron = crones[i];
			const id = parseInt(cron.id);
			if (this.jobs[id])
            {
				schedule.cancelJob(this.jobs[id]);
			}
			else
            {
				logger.warn('cron is not in application: %j', cron);
			}
		}
	}
}

module.exports = Server;

class ServerUtility
{
	static initFilter(isGlobal, app)
    {
		const service = new FilterService();
		let befores, afters;

		if (isGlobal)
        {
			befores = app.get(Constants.KEYWORDS.GLOBAL_BEFORE_FILTER);
			afters = app.get(Constants.KEYWORDS.GLOBAL_AFTER_FILTER);
		}
		else
        {
			befores = app.get(Constants.KEYWORDS.BEFORE_FILTER);
			afters = app.get(Constants.KEYWORDS.AFTER_FILTER);
		}

		let i, l;
		if (befores)
        {
			for (i = 0, l = befores.length; i < l; i++)
            {
				service.before(befores[i]);
			}
		}

		if (afters)
        {
			for (i = 0, l = afters.length; i < l; i++)
            {
				service.after(afters[i]);
			}
		}

		return service;
	}

	static initHandler(app, opts)
    {
		return new HandlerService(app, opts);
	}

    /**
     * Load cron handlers from current application
     */
	static loadCronHandlers(app)
    {
		const p = pathUtil.getCronPath(app.Base, app.ServerType);
		if (p)
        {
			return Loader.load(p, app);
		}
	}

    /**
     * Load crons from configure file
     */
	static loadCrones(server, app)
    {
		const env = app.get(Constants.RESERVED.ENV);
		let p = path.join(app.Base, Constants.FILEPATH.CRON);
		if (!fs.existsSync(p))
        {
			p = path.join(app.Base, Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.CRON));
			if (!fs.existsSync(p))
            {
				return;
			}
		}
		app.loadConfigBaseApp(Constants.RESERVED.CRONS, Constants.FILEPATH.CRON);
		const crons = app.get(Constants.RESERVED.CRONS);
		for (const serverType in crons)
        {
			if (app.serverType === serverType)
            {
				const list = crons[serverType];
				for (let i = 0; i < list.length; i++)
                {
					if (!list[i].serverId)
                    {
						ServerUtility.checkAndAdd(list[i], server.crons, server);
					}
					else
                    {
						if (app.serverId === list[i].serverId)
                        {
							ServerUtility.checkAndAdd(list[i], server.crons, server);
						}
					}
				}
			}
		}
	}

    /**
     * Fire before filter chain if any
     */
	static beforeFilter(isGlobal, server, msg, session, cb)
    {
		let fm;
		if (isGlobal)
        {
			fm = server.globalFilterService;
		}
		else
        {
			fm = server.filterService;
		}
		if (fm)
        {
			fm.beforeFilter(msg, session, cb);
		}
		else
        {
			utils.invokeCallback(cb);
		}
	}

    /**
     * Fire after filter chain if have
     */
	static afterFilter(isGlobal, server, err, msg, session, resp, opts, cb)
    {
		let fm;
		if (isGlobal)
        {
			fm = server.globalFilterService;
		}
		else
        {
			fm = server.filterService;
		}
		if (fm)
        {
			if (isGlobal)
            {
				fm.afterFilter(err, msg, session, resp, () =>
                {
                    // do nothing
				});
			}
			else
            {
				fm.afterFilter(err, msg, session, resp, (err) =>
                {
					cb(err, resp, opts);
				});
			}
		}
	}

    /**
     * pass err to the global error handler if specified
     */
	static handleError(isGlobal, server, err, msg, session, resp, opts, cb)
    {
		let handler;
		if (isGlobal)
        {
			handler = server.app.get(Constants.RESERVED.GLOBAL_ERROR_HANDLER);
		}
		else
        {
			handler = server.app.get(Constants.RESERVED.ERROR_HANDLER);
		}
		if (!handler)
        {
			logger.debug(`no default error handler to resolve unknown exception. ${err.stack}`);
			utils.invokeCallback(cb, err, resp, opts);
		}
		else
        {
			if (handler.length === 5)
            {
				handler(err, msg, resp, session, cb);
			}
			else
            {
				handler(err, msg, resp, session, opts, cb);
			}
		}
	}

    /**
     * Send response to client and fire after filter chain if any.
     */
	static response(isGlobal, server, err, msg, session, resp, opts, cb)
    {
		if (isGlobal)
        {
			cb(err, resp, opts);
        // after filter should not interfere response
			ServerUtility.afterFilter(isGlobal, server, err, msg, session, resp, opts, cb);
		}
		else
        {
			ServerUtility.afterFilter(isGlobal, server, err, msg, session, resp, opts, cb);
		}
	}

    /**
     * Parse route string.
     *
     * @param  {String} route route string, such as: serverName.handlerName.methodName
     * @return {Object}       parse result object or null for illeagle route string
     */
	static parseRoute(route)
    {
		if (!route)
        {
			return null;
		}
		const ts = route.split('.');
		if (ts.length !== 3)
        {
			return null;
		}

		return {
			route      : route,
			serverType : ts[0],
			handler    : ts[1],
			method     : ts[2]
		};
	}

	static doForward(app, msg, session, routeRecord, cb)
    {
		let finished = false;
    // should route to other servers
		try
        {
	        app.sysrpc[routeRecord.serverType].msgRemote.forwardMessage(session,
                msg,
                session.export(),
                (err, resp, opts) =>
                {
	                if (err)
                    {
		                logger.error(`fail to process remote message:${err.stack}`);
	                }
	                finished = true;
	                utils.invokeCallback(cb, err, resp, opts);
                }
            );
        }
        catch (err)
        {
	        if (!finished)
            {
		        logger.error(`fail to forward message:${err.stack}`);
		        utils.invokeCallback(cb, err);
	        }
        }
	}

	static doHandle(server, msg, session, routeRecord, cb)
    {
		const originMsg = msg;
		msg = msg.body || {};
		msg.__route__ = originMsg.route;

		const serverSelf = server;

		const handle = (err, resp, opts) =>
        {
			if (err)
            {
                // error from before filter
				ServerUtility.handleError(false, serverSelf, err, msg, session, resp, opts, (err, resp, opts) =>
                {
					ServerUtility.response(false, serverSelf, err, msg, session, resp, opts, cb);
				});
				return;
			}

			self.handlerService.handle(routeRecord, msg, session, (err, resp, opts) =>
            {
				if (err)
                {
                    // error from handler
					ServerUtility.handleError(false, serverSelf, err, msg, session, resp, opts, (err, resp, opts) =>
                    {
						ServerUtility.response(false, serverSelf, err, msg, session, resp, opts, cb);
					});
					return;
				}

				ServerUtility.response(false, serverSelf, err, msg, session, resp, opts, cb);
			});
		};  // end of handle

		ServerUtility.beforeFilter(false, server, msg, session, handle);
	}

    /**
     * Schedule crones
     */
	static scheduleCrones(server, crons)
    {
		const handlers = server.cronHandlers;
		for (let i = 0; i < crons.length; i++)
        {
			const cronInfo = crons[i];
			const time = cronInfo.time;
			const action = cronInfo.action;
			const jobId = cronInfo.id;

			if (!time || !action || !jobId)
            {
				logger.error('cron miss necessary parameters: %j', cronInfo);
				continue;
			}

			if (action.indexOf('.') < 0)
            {
				logger.error('cron action is error format: %j', cronInfo);
				continue;
			}

			const cron = action.split('.')[0];
			const job = action.split('.')[1];
			const handler = handlers[cron];

			if (!handler)
            {
				logger.error('could not find cron: %j', cronInfo);
				continue;
			}

			if (typeof handler[job] !== 'function')
            {
				logger.error('could not find cron job: %j, %s', cronInfo, job);
				continue;
			}

			const id = schedule.scheduleJob(time, handler[job].bind(handler));
			server.jobs[jobId] = id;
		}
	}

    /**
     * If cron is not in crons then put it in the array.
     */
	static checkAndAdd(cron, crons, server)
    {
		if (!ServerUtility.containCron(cron.id, crons))
        {
			server.crons.push(cron);
		}
		else
        {
			logger.warn('cron is duplicated: %j', cron);
		}
	}

    /**
     * Check if cron is in crons.
     */
	static containCron(id, crons)
    {
		for (let i = 0, l = crons.length; i < l; i++)
        {
			if (id === crons[i].id)
            {
				return true;
			}
		}
		return false;
	}
}

