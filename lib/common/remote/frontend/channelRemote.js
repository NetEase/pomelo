/**
 * Remote channel service for frontend server.
 * Receive push request from backend servers and push it to clients.
 */
const _ = require('lodash'),
	utils = require('../../../util/utils'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class ChannelRemote
{
	constructor(app)
	{
		this.app = app;
	}

	/**
	 * Push message to client by uids.
	 *
	 * @param  {String}   route route string of message
	 * @param  {Object}   msg   message
	 * @param  {Array}    uids  user ids that would receive the message
	 * @param  {Object}   opts  push options
	 * @param  {Function} callback    callback function
	 */
	pushMessage(route, msg, uids, opts, callback)
	{
		if (!msg)
		{
			logger.error(`Can not send empty message! route : ${route}, compressed msg : ${msg}`);
			utils.invokeCallback(callback, new Error('can not send empty message.'));
			return;
		}

		const connector = this.app.components.__connector__;

		const sessionService = this.app.get('sessionService');
		const fails = [], sids = [];
		let sessions;
		_.forEach(uids, uid =>
		{
			sessions = sessionService.getByUid(uid);
			if (!sessions)
			{
				fails.push(uid);
			}
			else
			{
				_.forEach(sessions, session =>
				{
					sids.push(session.id);
				});
			}
		});
		logger.debug(`[${this.app.serverId}] pushMessage uids: ${uids}, msg:  ${msg}, sids:  ${sids}`);
		connector.send(null, route, msg, sids, opts, err =>
		{
			utils.invokeCallback(callback, err, fails);
		});
	}

	/**
	 * Broadcast to all the client connected with current frontend server.
	 *
	 * @param  {String}    route  route string
	 * @param  {Object}    msg    message
	 * @param  {Boolean}   opts   broadcast options.
	 * @param  {Function}  cb     callback function
	 */
	broadcast(route, msg, opts, cb)
	{
		const connector = this.app.components.__connector__;
		connector.send(null, route, msg, null, opts, cb);
	}
}

module.exports = function(app)
{
	if (!(this instanceof ChannelRemote))
	{
		return new ChannelRemote(app);
	}
};