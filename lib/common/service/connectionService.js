/**
 * connection statistics service
 * record connection, login count and list
 */
class ConnectionService
{
	constructor(app)
    {
		this.serverId = app.ServerId;
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
		info.uid = uid;
		this.logined[uid] = info;
	}

    /**
     * Update user info.
     * @param uid {String} user id
     * @param info {Object} info for update.
     */
	updateUserInfo(uid, info)
    {
		const user = this.logined[uid];
		if (!user)
        {
			return;
		}

		for (const p in info)
        {
			if (info.hasOwnProperty(p) && typeof info[p] !== 'function')
            {
				user[p] = info[p];
			}
		}
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
		const list = [];
		for (const uid in this.logined)
        {
			list.push(this.logined[uid]);
		}

		return {
			serverId       : this.serverId,
			totalConnCount : this.connCount,
			loginedCount   : this.loginedCount,
			loginedList    : list};
	}
}

module.exports = ConnectionService;