const SessionService = require('../common/service/sessionService');

class Session
{
    /**
     * Session component. Manage sessions.
     *
     * @param {Object} app  current application context
     * @param {Object} opts attach parameters
     */
	constructor(app, opts)
    {
		opts = opts || {};
		this.app = app;
		this.service = new SessionService(opts);
		let method;
        // proxy the service methods except the lifecycle interfaces of component
		for (const m in this.service)
        {
			if (m !== 'start' && m !== 'stop')
            {
				method = this.service[m];
				if (typeof method === 'function')
                {
					this[m] = SessionUtility.GetFun(m);
				}
			}
		}
		this.name = '__session__';
	}
}

class SessionUtility
{
	static Create(app, opts)
    {
		const cmp = new Session(app, opts);
		app.set('sessionService', cmp, true);
		return cmp;
	}
    
	static GetFun(session, m)
    {
		return (function()
        {
			return function()
            {
				return session.service[m](session.service, ...arguments);
			};
		})();
	}
}

module.exports = SessionUtility.Create;
