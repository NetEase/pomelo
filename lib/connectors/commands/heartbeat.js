const Package = require('pomelo-protocol').Package,
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

class Heartbeat
{
	/**
	 * Process heartbeat request.
	 *
	 * @param {Object} opts option request
	 *                      opts.heartbeat heartbeat interval
	 */
	constructor(opts)
	{
		opts = opts || {};
		this.heartbeat = null;
		this.timeout = null;

		if (opts.heartbeat)
		{
			this.heartbeat = opts.heartbeat * 1000; // heartbeat interval
			this.timeout = opts.timeout * 1000 || this.heartbeat * 2;      // max heartbeat message timeout
		}

		this.timeouts = {};
		this.clients = {};
		this.disconnectOnTimeout = opts.disconnectOnTimeout;
	}

	handle(socket)
	{
		if (!this.heartbeat)
		{
			// no heartbeat setting
			return;
		}

		const socketId = socket.id;

		if (!this.clients[socketId])
		{
			// clear timers when socket disconnect or error
			this.clients[socketId] = 1;
			socket.once('disconnect', HeartbeatUtility.clearTimers.bind(null, this, socketId));
			socket.once('error', HeartbeatUtility.clearTimers.bind(null, this, socketId));
		}

		// clear timeout timer
		if (this.disconnectOnTimeout)
		{
			this.clear(socketId);
		}

		socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));

		if (this.disconnectOnTimeout)
		{
			this.timeouts[socketId] = setTimeout(() =>
			{
				logger.info(`client ${socketId} heartbeat timeout.`);
				socket.disconnect();
			}, this.timeout);
		}
	}

	clear(id)
	{
		const tid = this.timeouts[id];
		if (tid)
		{
			clearTimeout(tid);
			delete this.timeouts[id];
		}
	}

}

class HeartbeatUtility
{
	static clearTimers(heartbeat, id)
	{
		delete heartbeat.clients[id];
		const tid = heartbeat.timeouts[id];
		if (tid)
		{
			clearTimeout(tid);
			delete heartbeat.timeouts[id];
		}
	}
}

module.exports = function(opts)
{
	return new Heartbeat(opts);
};
