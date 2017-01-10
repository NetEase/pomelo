/**
 * Remote session service for frontend server.
 * Set session info for backend servers.
 */
const _ = require('lodash'),
	utils = require('../../../util/utils');

class SessionRemote
{
	constructor(app)
	{
		this.app = app;
	}

	bind(sid, uid, cb)
	{
		this.app.get('sessionService').bind(sid, uid, cb);
	}

	unbind(sid, uid, cb)
	{
		this.app.get('sessionService').unbind(sid, uid, cb);
	}

	push(sid, key, value, cb)
	{
		this.app.get('sessionService').import(sid, key, value, cb);
	}

	pushAll(sid, settings, cb)
	{
		this.app.get('sessionService').importAll(sid, settings, cb);
	}

	/**
	 * Get front session info with session id.
	 *
	 * @param  {String}   sid session id binded with the session
	 * @param  {Function} callback(err, sinfo)  callback function, session info would be null if the session not exist.
	 */
	getBackendSessionBySid(sid, callback)
	{
		const session = this.app.get('sessionService').get(sid);
		if (!session)
		{
			utils.invokeCallback(callback);
			return;
		}
		utils.invokeCallback(callback, null, session.toFrontendSession().export());
	}

	/**
	 * Get all the session informations with the specified user id.
	 *
	 * @param  {String}   uid user id binded with the session
	 * @param  {Function} cb(err, sinfo)  callback function, session info would be null if the session does not exist.
	 */
	getBackendSessionsByUid(uid, cb)
	{
		const sessions = this.app.get('sessionService').getByUid(uid);
		if (!sessions)
		{
			utils.invokeCallback(cb);
			return;
		}

		const res = [];
		_.forEach(sessions, session =>
		{
			res.push(session.toFrontendSession().export());
		});
		utils.invokeCallback(cb, null, res);
	}

	/**
	 * Kick a session by session id.
	 *
	 * @param  {Number}   sid session id
	 * @param  {String}   reason  kick reason
	 * @param  {Function} cb  callback function
	 */
	kickBySid(sid, reason, cb)
	{
		this.app.get('sessionService').kickBySessionId(sid, reason, cb);
	}

	/**
	 * Kick sessions by user id.
	 *
	 * @param  {Number|String}   uid user id
	 * @param  {String}          reason     kick reason
	 * @param  {Function} cb     callback function
	 */
	kickByUid(uid, reason, cb)
	{
		this.app.get('sessionService').kick(uid, reason, cb);
	}
}

module.exports = function(app)
{
	return new SessionRemote(app);
};