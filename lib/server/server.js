/**
 * Implementation of server component.
 * Init and start server instance.
 */
const _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	pathUtil = require('../util/pathUtil'),
	Loader = require('pomelo-loader-upgrade'),
	utils = require('../util/utils'),
	schedule = require('pomelo-scheduler'),
	events = require('../util/events'),
	Constants = require('../util/constants'),
	FilterService = require('../common/service/filterService'),
	HandlerService = require('../common/service/handlerService'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

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

		app.event.on(events.ADD_CRONS, this.addCrons.bind(this));
		app.event.on(events.REMOVE_CRONS, this.removeCrons.bind(this));
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

		this.globalFilterService = ServerUtility.InitFilter(true, this.app);
		this.filterService = ServerUtility.InitFilter(false, this.app);
		this.handlerService = ServerUtility.InitHandler(this.app, this.opts);
		this.cronHandlers = ServerUtility.LoadCronHandlers(this.app);
		ServerUtility.LoadCrons(this, this.app);
		this.state = ST_STARTED;
	}

	afterStart()
	{
		ServerUtility.ScheduleCrons(this, this.crons);
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

		const routeRecord = ServerUtility.ParseRoute(msg.route);
		if (!routeRecord)
		{
			utils.invokeCallback(cb, new Error(`meet unknown route message ${msg.route}`));
			return;
		}

		const dispatch = (err, resp, opts) =>
		{
			if (err)
			{
				ServerUtility.HandleError(true, this, err, msg, session, resp, opts, (err, resp, opts) =>
				{
					ServerUtility.Response(true, this, err, msg, session, resp, opts, cb);
				});
				return;
			}

			if (this.app.getServerType() !== routeRecord.serverType)
			{
				ServerUtility.DoForward(this.app, msg, session, routeRecord, (err, resp, opts) =>
				{
					ServerUtility.Response(true, this, err, msg, session, resp, opts, cb);
				});
			}
			else
			{
				ServerUtility.DoHandle(this, msg, session, routeRecord, (err, resp, opts) =>
				{
					ServerUtility.Response(true, this, err, msg, session, resp, opts, cb);
				});
			}
		};
		ServerUtility.BeforeFilter(true, this, msg, session, dispatch);
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

		const routeRecord = ServerUtility.ParseRoute(msg.route);
		ServerUtility.DoHandle(this, msg, session, routeRecord, cb);
	}

	/**
	 * Add crones at runtime.
	 *
	 * @param {Array} crones would be added in application
	 */
	addCrons(crones)
	{
		this.cronHandlers = ServerUtility.LoadCronHandlers(this.app);
		_.forEach(crones, crone =>
		{
			ServerUtility.CheckAndAdd(crone, this.crons, this);
		});
		ServerUtility.ScheduleCrons(this, crones);
	}

	/**
	 * Remove crones at runtime.
	 *
	 * @param {Array} crones would be removed in application
	 */
	removeCrons(crones)
	{
		_.forEach(crones, crone =>
		{
			const id = parseInt(crone.id);
			if (this.jobs[id])
			{
				schedule.cancelJob(this.jobs[id]);
			}
			else
			{
				logger.warn(`cron is not in application: ${crone}`);
			}
		});
	}
}

class ServerUtility
{
	static InitFilter(isGlobal, app)
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

		if (befores)
		{
			_.forEach(befores, before =>
			{
				service.before(before);
			});
		}

		if (afters)
		{
			_.forEach(afters, after =>
			{
				service.before(after);
			});
		}

		return service;
	}

	static InitHandler(app, opts)
	{
		return new HandlerService(app, opts);
	}

	/**
	 * Load cron handlers from current application
	 */
	static LoadCronHandlers(app)
	{
		const p = pathUtil.getCronPath(app.getBase(), app.getServerType());
		if (p)
		{
			return Loader.load(p, app);
		}
	}

	/**
	 * Load crons from configure file
	 */
	static LoadCrons(server, app)
	{
		const env = app.get(Constants.RESERVED.ENV);
		let p = path.join(app.getBase(), Constants.FILEPATH.CRON);
		if (!fs.existsSync(p))
		{
			p = path.join(app.getBase(), Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.CRON));
			if (!fs.existsSync(p))
			{
				return;
			}
		}
		app.loadConfigBaseApp(Constants.RESERVED.CRONS, Constants.FILEPATH.CRON);
		const crons = app.get(Constants.RESERVED.CRONS);
		_.forEach(crons, (serverList, serverType) =>
		{
			if (app.serverType === serverType)
			{
				_.forEach(serverList, serverInfo =>
				{
					if (!serverInfo.serverId)
					{
						ServerUtility.CheckAndAdd(serverInfo, server.crons, server);
					}
					else
					{
						if (app.serverId === serverInfo.serverId)
						{
							ServerUtility.CheckAndAdd(serverInfo, server.crons, server);
						}
					}
				});
			}
		});
	}

	/**
	 * Fire before filter chain if any
	 */
	static BeforeFilter(isGlobal, server, msg, session, cb)
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
	static AfterFilter(isGlobal, server, err, msg, session, resp, opts, cb)
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
				fm.afterFilter(err, msg, session, resp, err =>
				{
					cb(err, resp, opts);
				});
			}
		}
	}

	/**
	 * pass err to the global error handler if specified
	 */
	static HandleError(isGlobal, server, err, msg, session, resp, opts, cb)
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
	static Response(isGlobal, server, err, msg, session, resp, opts, cb)
	{
		if (isGlobal)
		{
			cb(err, resp, opts);
			// after filter should not interfere response
			ServerUtility.AfterFilter(isGlobal, server, err, msg, session, resp, opts, cb);
		}
		else
		{
			ServerUtility.AfterFilter(isGlobal, server, err, msg, session, resp, opts, cb);
		}
	}

	/**
	 * Parse route string.
	 *
	 * @param  {String} route route string, such as: serverName.handlerName.methodName
	 * @return {Object}       parse result object or null for illeagle route string
	 */
	static ParseRoute(route)
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

	static DoForward(app, msg, session, routeRecord, cb)
	{
		let finished = false;
		// should route to other servers
		try
		{
			app.sysrpc[routeRecord.serverType].msgRemote.forwardMessage(
				session,
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

	static DoHandle(server, msg, session, routeRecord, cb)
	{
		const originMsg = msg;
		msg = msg.body || {};
		msg.__route__ = originMsg.route;

		const handle = (err, resp, opts) =>
		{
			if (err)
			{
				// error from before filter
				ServerUtility.HandleError(false, server, err, msg, session, resp, opts, (err, resp, opts) =>
				{
					ServerUtility.Response(false, server, err, msg, session, resp, opts, cb);
				});
				return;
			}

			server.handlerService.handle(routeRecord, msg, session, (err, resp, opts) =>
			{
				if (err)
				{
					// error from handler
					ServerUtility.HandleError(false, server, err, msg, session, resp, opts, (err, resp, opts) =>
					{
						ServerUtility.Response(false, server, err, msg, session, resp, opts, cb);
					});
					return;
				}

				ServerUtility.Response(false, server, err, msg, session, resp, opts, cb);
			});
		};  // end of handle

		ServerUtility.BeforeFilter(false, server, msg, session, handle);
	}

	/**
	 * Schedule crones
	 */
	static ScheduleCrons(server, crons)
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

			if (!_.isFunction(handler[job]))
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
	static CheckAndAdd(cron, crons, server)
	{
		if (!ServerUtility.ContainCron(cron.id, crons))
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
	static ContainCron(id, crons)
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

module.exports.create = function(app, opts)
{
	return new Server(app, opts);
};