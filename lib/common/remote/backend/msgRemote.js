const _ = require('lodash'),
	utils = require('../../../util/utils'),
	logger = require('pomelo-logger').getLogger('forward-log', __filename);

class MsgRemote
{
	constructor(app)
	{
		this.app = app;
	}

	/**
	 * Forward message from frontend server to other server's handlers
	 *
	 * @param msg {Object} request message
	 * @param session {Object} session object for current request
	 * @param cb {Function} callback function
	 */
	forwardMessage(msg, session, cb)
	{
		const components = this.app.components;
		const server = _.get(components, '__server__', null);

		if (!server)
		{
			logger.error(`server component not enable on ${this.app.serverId}`);
			utils.invokeCallback(cb, new Error('server component not enable'));
			return;
		}

		const sessionService = _.get(components, '__backendSession__', null);
		if (!sessionService)
		{
			logger.error(`backend session component not enable on ${this.app.serverId}`);
			utils.invokeCallback(cb, new Error('backend sesssion component not enable'));
			return;
		}

		// generate backend session for current request
		const backendSession = sessionService.create(session);

		// handle the request
		logger.debug(`backend server [${this.app.serverId}] handle message: ${msg}`);

		server.handle(msg, backendSession, function(err, resp, opts)
		{
			utils.invokeCallback(cb, err, resp, opts);
		});
	}

}

/**
 * Remote service for backend servers.
 * Receive and handle request message forwarded from frontend server.
 */
module.exports = function(app)
{
	if (!(this instanceof MsgRemote))
	{
		return new MsgRemote(app);
	}
};