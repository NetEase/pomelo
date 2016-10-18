/**
 * Pomelo
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
const fs = require('fs');
const path = require('path');
const application = require('./application');
const Package = require('../package');

const component = {},
	filter = {},
	rpcFilter = {},
	pomelo = {};
let	connector = '',
	pushScheduler = '',
	selfApp = null;
/**
 * Expose `createApplication()`.
 */
class Pomelo
{

    /**
     * filter and component
     */
	static get filterComponent()
    {
		return pomelo;
	}

    /**
     * Framework version.
     */
	static get version()
    {
		return Package.version;
	}

    /**
     * Event definitions that would be emitted by app.event
     * @returns {*}
     */
	static get events()
    {
		return require('./util/events');
	}
    
    /**
     * auto loaded components
     * @returns {{}}
     */
	static get components()
    {
		return component;
	}

    /**
     * auto loaded filters
     * @returns {{}}
     */
	static get filters()
    {
		return filter;
	}

    /**
     * auto loaded rpc filters
     */
	static get rpcFilters()
    {
		return rpcFilter;
	}

    /**
     * connectors
     */
	static set connectors(value)
    {
		switch (value)
        {
		case 'sioconnector':
			connector = Pomelo.load('./connectors/sioconnector');
			break;
		case 'hybridconnector':
			connector = Pomelo.load('./connectors/hybridconnector');
			break;
		case 'udpconnector':
			connector = Pomelo.load('./connectors/udpconnector');
			break;
		case 'mqttconnector':
			connector = Pomelo.load('./connectors/mqttconnector');
			break;
		}
	}

    /**
     * connectors
     */
	static get connectors()
    {
		return connector;
	}

    /**
     * pushSchedulers
     */
	static set pushSchedulers(value)
    {
		switch (value)
        {
		case 'direct':
			pushScheduler = Pomelo.load('./pushSchedulers/direct');
			break;
		case 'buffer':
			pushScheduler = Pomelo.load('./pushSchedulers/buffer');
			break;
		}
	}

    /**
     * connectors
     */
	static get pushSchedulers()
    {
		return pushScheduler;
	}

    /**
     * Create an pomelo application.
     *
     * @return {Application}
     * @memberOf Pomelo
     * @api public
     */
	static createApp(opts)
    {
		selfApp = application;
		selfApp.init(opts);
		return selfApp;
	}

    /**
     * Get application
     */
	static get app()
    {
		return selfApp;
	}
    
	static load(path, name)
    {
		if(name)
        {
			return require(`${path}${name}`);
		}
		return require(path);
	}
}

/**
 * Auto-load bundled components with getters.
 */
fs.readdirSync(`${__dirname}/components`).forEach(filename =>
{
	if(!/\.js$/.test(filename))
    {
		return;
	}
	const name = path.basename(filename, '.js');
	const _load = Pomelo.load('./components/', name);
	component[name] = _load;
	pomelo[name] = _load;
});

fs.readdirSync(`${__dirname}/filters/handler`).forEach(filename =>
{
	if(!/\.js$/.test(filename))
    {
		return;
	}
	const name = path.basename(filename, '.js');
	const _load = Pomelo.load('./filters/handler/', name);
  
	filter[name] = _load;
	pomelo[name] = _load;
});

fs.readdirSync(`${__dirname}/filters/rpc`).forEach(filename =>
{
	if(!/\.js$/.test(filename))
    {
		return;
	}
	const name = path.basename(filename, '.js');
	rpcFilter[name] = Pomelo.load('./filters/rpc/', name);
});

module.exports = Pomelo;