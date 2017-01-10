/**
 * Created by frank on 16-12-26.
 */
const _ = require('lodash'),
	utils = require('../util/utils');

class Direct
{
	constructor(app, opts)
	{
		opts = opts || {};
		this.app = app;
	}

	schedule(reqId, route, msg, recvs, opts, callBack)
	{
		opts = opts || {};
		if (opts.type === 'broadcast')
		{
			DirectUtility.DoBroadcast(this, msg, opts.userOptions);
		}
		else
		{
			DirectUtility.DoBatchPush(this, msg, recvs);
		}

		if (callBack)
		{
			process.nextTick(() =>
			{
				utils.invokeCallback(callBack);
			});
		}
	}
}

class DirectUtility
{
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
				sessionService.sendMessageByUid(session.uid, msg);
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
				sessionService.sendMessageByUid(session.uid, msg);
			});
		}
	}

	static DoBatchPush(buffer, msg, recvs)
	{
		const sessionService = buffer.app.get('sessionService');
		_.forEach(recvs, recv =>
		{
			sessionService.sendMessage(recv, msg);
		});
	}
}

module.exports = function(app, opts)
{
	if (!(this instanceof Direct))
	{
		return new Direct(app, opts);
	}
};