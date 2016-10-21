const utils = require('../util/utils');
const DEFAULT_FLUSH_INTERVAL = 20;

class Buffer
{
	constructor(app, opts)
    {
		if (!(this instanceof Buffer))
        {
			return new Buffer(app, opts);
		}

		opts = opts || {};
		this.app = app;
		this.flushInterval = opts.flushInterval || DEFAULT_FLUSH_INTERVAL;
		this.sessions = {};   // sid -> msg queue
		this.tid = null;
	}

	start(cb)
    {
		this.tid = setInterval(BufferUtility.flush(null, this), this.flushInterval);
		process.nextTick(() =>
        {
			utils.invokeCallback(cb);
		});
	}

	stop(force, cb)
    {
		if (this.tid)
        {
			clearInterval(this.tid);
			this.tid = null;
		}
		process.nextTick(() =>
        {
			utils.invokeCallback(cb);
		});
	}

	schedule(reqId, route, msg, recvs, opts, cb)
    {
		opts = opts || {};
		if (opts.type === 'broadcast')
        {
			BufferUtility.doBroadcast(this, msg, opts.userOptions);
		}
		else
        {
			BufferUtility.doBatchPush(this, msg, recvs);
		}

		process.nextTick(() =>
        {
			utils.invokeCallback(cb);
		});
	}
}

module.exports = Buffer;

class BufferUtility
{
	static doBroadcast(buffer, msg, opts)
    {
		const channelService = buffer.app.get('channelService');
		const sessionService = buffer.app.get('sessionService');

		if (opts.binded)
        {
			sessionService.forEachBindedSession((session) =>
            {
				if (channelService.broadcastFilter &&
                    !channelService.broadcastFilter(session, msg, opts.filterParam))
                {
					return;
				}

				BufferUtility.enqueue(buffer, session, msg);
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

				BufferUtility.enqueue(buffer, session, msg);
			});
		}
	}
    
	static doBatchPush(buffer, msg, recvs)
    {
		const sessionService = buffer.app.get('sessionService');
		let session;
		for (let i = 0, l = recvs.length; i < l; i++)
        {
			session = sessionService.get(recvs[i]);
			if (session)
            {
				BufferUtility.enqueue(buffer, session, msg);
			}
		}
	}

	static enqueue(buffer, session, msg)
    {
		let queue = buffer.sessions[session.id];
		if (!queue)
        {
			queue = buffer.sessions[session.id] = [];
			session.once('closed', BufferUtility.onClose(null, buffer));
		}
		queue.push(msg);
	}

	static onClose(buffer, session)
    {
		delete buffer.sessions[session.id];
	}

	static flush(buffer)
    {
		const sessionService = buffer.app.get('sessionService');
		let queue, session;
		for (const sid in buffer.sessions)
        {
			session = sessionService.get(sid);
			if (!session)
            {
				continue;
			}

			queue = buffer.sessions[sid];
			if (!queue || queue.length === 0)
            {
				continue;
			}

			session.sendBatch(queue);
			buffer.sessions[sid] = [];
		}
	}
}