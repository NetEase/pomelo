/**
 * Created by frank on 16-12-27.
 */
const _ = require('lodash');

class CountDownLatch
{
	constructor(count, opts, callBack)
	{
		this.count = count;
		this.cb = callBack;
		if (opts.timeout)
		{
			this.timerId = setTimeout(() =>
			{
				this.cb(true);
			}, opts.timeout);
		}
	}

	done()
	{
		if (this.count <= 0)
		{
			throw new Error('illegal state.');
		}

		this.count--;
		if (this.count === 0)
		{
			if (this.timerId)
			{
				clearTimeout(this.timerId);
			}
			this.cb();
		}
	}

	static CreateCountDownLatch(count, opts, callBack)
	{
		if (!count || count <= 0)
		{
			throw new Error('count should be positive.');
		}

		if (!callBack && _.isFunction(opts))
		{
			callBack = opts;
			opts = {};
		}

		if (!_.isFunction(callBack))
		{
			throw new Error('cb should be a function.');
		}

		return new CountDownLatch(count, opts, callBack);
	}
}

module.exports =
{
	createCountDownLatch : CountDownLatch.CreateCountDownLatch
};