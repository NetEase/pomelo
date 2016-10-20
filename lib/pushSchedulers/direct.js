const utils = require('../util/utils');

class Direct
{
	constructor(app, opts)
    {
		if (!(this instanceof Direct))
        {
			return new Direct(app, opts);
		}
    
		opts = opts || {};
		this.app = app;
	}

	schedule(reqId, route, msg, recves, opts, cb)
    {
		opts = opts || {};
		if (opts.type === 'broadcast')
        {
			DirectUtility.doBroadcast(this, msg, opts.userOptions);
		}
		else
        {
			DirectUtility.doBatchPush(this, msg, recves);
		}

		if (cb)
        {
			process.nextTick(() =>
            {
				utils.invokeCallback(cb);
			});
		}
	}
}

module.exports = Direct;

class DirectUtility
{
	static doBroadcast(service, msg, opts)
    {
		const channelService = service.app.get('channelService');
		const sessionService = service.app.get('sessionService');

		if (opts.binded)
        {
			sessionService.forEachBindedSession(function(session)
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
			sessionService.forEachSession((session) =>
            {
				if (channelService.broadcastFilter &&
                    !channelService.broadcastFilter(session, msg, opts.filterParam))
                {
					return;
				}

				sessionService.sendMessage(session.id, msg);
			});
		}
	}

	static doBatchPush(service, msg, recves)
    {
		const sessionService = service.app.get('sessionService');
		for (let i = 0, l = recves.length; i < l; i++)
        {
			sessionService.sendMessage(recves[i], msg);
		}
	}
}

