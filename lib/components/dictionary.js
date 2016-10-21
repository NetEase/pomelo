const fs = require('fs');
const path = require('path');
const utils = require('../util/utils');
const Loader = require('pomelo-loader');
const pathUtil = require('../util/pathUtil');
const crypto = require('crypto');

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
		let p = path.join(app.Base, '/config/dictionary.json');
		if (Boolean(opts) && Boolean(opts.dict))
        {
			p = opts.dict;
		}
		if (fs.existsSync(p))
        {
			this.userDicPath = p;
		}
		this.name = '__dictionary__';
	}

	start(cb)
    {
		const servers = this.app.get('servers');
		const routes = [];

        // Load all the handler files
		for (const serverType in servers)
        {
			const p = pathUtil.getHandlerPath(this.app.Base, serverType);
			if (!p)
            {
				continue;
			}

			const handlers = Loader.load(p, this.app);

			for (const name in handlers)
            {
				const handler = handlers[name];
				for (const key in handler)
                {
					if (typeof(handler[key]) === 'function')
                    {
						routes.push(`${serverType}.${name}.${key}`);
					}
				}
			}
		}

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

		utils.invokeCallback(cb);
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

class DictionaryUtility
{
	static Create(app, opts)
    {
		return new Dictionary(app, opts);
	}
}

module.exports = DictionaryUtility.Create;