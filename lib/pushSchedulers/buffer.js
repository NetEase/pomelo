const _ = require('lodash'),
	utils = require('../util/utils');

const DEFAULT_FLUSH_INTERVAL = 20;
class Buffer
{
	constructor(app, opts)
	{
		opts = opts || {};
		this.app = app;
		this.flushInterval = opts.flushInterval || DEFAULT_FLUSH_INTERVAL;
		this.sessions = {};   // sid -> msg queue
		this.tid = null;
	}

	start(callBack)
	{
		this.tid = setInterval(() => {BufferUtility.Flush(this);}, this.flushInterval);
		process.nextTick(() =>
		{
			utils.invokeCallback(callBack);
		});
	}

	stop(force, callBack)
	{
		if (this.tid)
		{
			clearInterval(this.tid);
			this.tid = null;
		}
		process.nextTick(() =>
		{
			utils.invokeCallback(callBack);
		});
	}

	schedule(reqId, route, msg, recvs, opts, callBack)
	{
		opts = opts || {};
		if (opts.type === 'broadcast')
		{
			BufferUtility.DoBroadcast(this, msg, opts.userOptions);
		}
		else
		{
			BufferUtility.DoBatchPush(this, msg, recvs);
		}

		process.nextTick(() =>
		{
			utils.invokeCallback(callBack);
		});
	}
}

class BufferUtility
{
	static Flush(buffer)
	{
		const sessionService = buffer.app.get('sessionService');
		let queue, session;
		_.forEach(buffer.session, (value, sid) =>
		{
			session = sessionService.get(sid);
			if (!session)
			{
				return;
			}
			queue = buffer.sessions[sid];
			if (_.size(queue) > 0)
			{
				session.sendBatch(queue);
				buffer.sessions[sid] = [];
			}
		});
	}

	static OnClose(buffer, session)
	{
		delete buffer.sessions[session.id];
	}

	static DoBroadcast(buffer, msg, opts)
	{
		const channelService = buffer.app.get('channelService');
		const sessionService = buffer.app.get('sessionService');

		if (opts.binded)
		{
			sessionService.forEachBindedSession(session =>
			{
				if (channelService.broadcastFilter &&
					!channelService.broadcastFilter(session, msg, opts.filterParam))
				{
					return;
				}

				BufferUtility.Enqueue(buffer, session, msg);
			});
		}
		else
		{
			sessionService.forEachSession(session =>
			{
				if (channelService.broadcastFilter &&
					!channelService.broadcastFilter(session, msg, opts.filterParam))
				{
					return;
				}

				BufferUtility.Enqueue(buffer, session, msg);
			});
		}
	}

	static DoBatchPush(buffer, msg, recvs)
	{
		const sessionService = buffer.app.get('sessionService');
		let session;
		_.forEach(recvs, recv =>
		{
			session = sessionService.get(recv);
			if (session)
			{
				BufferUtility.Enqueue(buffer, session, msg);
			}
		});
	}

	static Enqueue(buffer, session, msg)
	{
		let queue = buffer.sessions[session.id];
		if (!queue)
		{
			queue = buffer.sessions[session.id] = [];
			session.once('closed', BufferUtility.OnClose.bind(null, buffer));
		}
		queue.push(msg);
	}
}

module.exports = function(app, opts)
{
	if (!(this instanceof Buffer))
	{
		return new Buffer(app, opts);
	}
};