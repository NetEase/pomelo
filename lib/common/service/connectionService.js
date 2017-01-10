const _ = require('lodash');
/**
 * connection statistics service
 * record connection, login count and list
 */
class ConnectionService
{
	constructor(app)
	{
		this.serverId = app.getServerId();
		this.connCount = 0;
		this.loginedCount = 0;
		this.logined = {};
	}

	/**
	 * Add logined user.
	 *
	 * @param uid {String} user id
	 * @param info {Object} record for logined user
	 */
	addLoginedUser(uid, info)
	{
		if (!this.logined[uid])
		{
			this.loginedCount++;
		}
		if (_.isObject(info))
			info.uid = uid;
		this.logined[uid] = info;
	}

	/**
	 * Update user info.
	 * @param uid {String} user id
	 * @param info {Object} info for update.
	 */
	updateUserInfo(uid, infos)
	{
		const user = this.logined[uid];
		if (!user)
		{
			return;
		}
		_.forEach(infos, (info, key) =>
		{
			if (infos.hasOwnProperty(key) && !_.isFunction(info))
			{
				user[key] = info;
			}
		});
	}

	/**
	 * Increase connection count
	 */
	increaseConnectionCount()
	{
		this.connCount++;
	}

	/**
	 * Remote logined user
	 *
	 * @param uid {String} user id
	 */
	removeLoginedUser(uid)
	{
		if (this.logined[uid])
		{
			this.loginedCount--;
		}
		delete this.logined[uid];
	}

	/**
	 * Decrease connection count
	 *
	 * @param uid {String} uid
	 */
	decreaseConnectionCount(uid)
	{
		if (this.connCount)
		{
			this.connCount--;
		}
		if (uid)
		{
			this.removeLoginedUser(uid);
		}
	}

	/**
	 * Get statistics info
	 *
	 * @return {Object} statistics info
	 */
	getStatisticsInfo()
	{
		const list = _.values(this.logined);

		return {
			serverId       : this.serverId,
			totalConnCount : this.connCount,
			loginedCount   : this.loginedCount,
			loginedList    : list};
	}
}

module.exports = ConnectionService;