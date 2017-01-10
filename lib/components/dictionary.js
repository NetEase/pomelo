const _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	utils = require('../util/utils'),
	Loader = require('pomelo-loader-upgrade'),
	pathUtil = require('../util/pathUtil'),
	crypto = require('crypto');

class Dictionary
{
	constructor(app, opts)
	{
		this.app = app;
		this.dict = {};
		this.abbrs = {};
		this.userDicPath = null;
		this.version = '';

		// Set user dictionary
		let p = path.join(app.getBase(), '/config/dictionary.json');
		if (opts && opts.dict)
		{
			p = opts.dict;
		}
		if (fs.existsSync(p))
		{
			this.userDicPath = p;
		}
		this.name = '__dictionary__';
	}

	start(callBack)
	{
		const servers = this.app.get('servers');
		const routes = [];

		// 待测试
		// Load all the handler files
		_.forEach(servers, (server, serverType) =>
		{
			const p = pathUtil.getHandlerPath(this.app.getBase(), serverType);
			if (p)
			{
				const handlers = Loader.load(p, this.app);
				_.forEach(handlers, (handler, handlerName) =>
				{
					_.forEach(handler, (value, key) =>
					{
						if (_.isFunction(value))
						{
							routes.push(`${serverType}.${handlerName}.${key}`);
						}
					});
				});
			}
		});

		// Sort the route to make sure all the routers abbr are the same in all the servers
		routes.sort();
		let abbr;
		let i;
		for (i = 0; i < routes.length; i++)
		{
			abbr = i + 1;
			this.abbrs[abbr] = routes[i];
			this.dict[routes[i]] = abbr;
		}

		// Load user dictionary
		if (this.userDicPath)
		{
			const userDic = require(this.userDicPath);

			abbr = routes.length + 1;
			for (i = 0; i < userDic.length; i++)
			{
				const route = userDic[i];

				this.abbrs[abbr] = route;
				this.dict[route] = abbr;
				abbr++;
			}
		}

		this.version = crypto.createHash('md5')
			.update(JSON.stringify(this.dict))
			.digest('base64');

		utils.invokeCallback(callBack);
	}

	getDict()
	{
		return this.dict;
	}

	getAbbrs()
	{
		return this.abbrs;
	}

	getVersion()
	{
		return this.version;
	}
}

module.exports = function(app, opts)
{
	if (!(this instanceof Dictionary))
	{
		return new Dictionary(app, opts);
	}
};