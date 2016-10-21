const Package = require('pomelo-protocol').Package;
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

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

		const self = this;

		if (!this.clients[socket.id])
		{
			// clear timers when socket disconnect or error
			this.clients[socket.id] = 1;
			socket.once('disconnect', () => {HeartbeatUtility.clearTimers(this, socket.id);});
			socket.once('error', () => {HeartbeatUtility.clearTimers(this, socket.id);});
		}

		// clear timeout timer
		if (self.disconnectOnTimeout)
		{
			this.clear(socket.id);
		}

		socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));

		if (self.disconnectOnTimeout)
		{
			self.timeouts[socket.id] = setTimeout(function()
			{
				logger.info('client %j heartbeat timeout.', socket.id);
				socket.disconnect();
			}, self.timeout);
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

module.exports = Heartbeat;
