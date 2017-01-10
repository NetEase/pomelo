const SessionService = require('../common/service/sessionService'),
	_ = require('lodash');

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
		const getFun = m =>
		{
			return (() =>
			{
				return (...args) =>
				{
					return this.service[m](...args);
				};
			})();
		};

		const prototypeOf = Object.getPrototypeOf(this.service);
		const propertyNames = Object.getOwnPropertyNames(prototypeOf);
		_.forEach(propertyNames, propertyName =>
		{
			if (propertyName !== 'start' && propertyName !== 'stop' && propertyName != 'constructor')
			{
				const method = prototypeOf[propertyName];
				if (_.isFunction(method))
				{
					this[propertyName] = getFun(propertyName);
				}
			}
		});
		/**
		 for(var m in this.service) {
			if(m !== 'start' && m !== 'stop') {
				const method = this.service[m];
				if(typeof method === 'function') {
					this[m] = getFun(m);
				}
			}
		}
		 **/
		this.name = '__session__';
	}
}

module.exports = function(app, opts)
{
	const cmp = new Session(app, opts);
	app.set('sessionService', cmp, true);
	return cmp;
};