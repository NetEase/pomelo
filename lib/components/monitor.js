/**
 * Component for monitor.
 * Load and start monitor client.
 */
var Monitor = require('../monitor/monitor');

class Component
{
    constructor(app, opts)
    {
        this.monitor = new Monitor(app, opts);
        this.name = '__monitor__';
    };

    start(cb)
    {
        this.monitor.start(cb);
    };

    stop(force, cb)
    {
        this.monitor.stop(cb);
    };

    reconnect(masterInfo)
    {
        this.monitor.reconnect(masterInfo);
    };
}


class ComponentFactory
{
    /**
     * Component factory function
     *
     * @param  {Object} app  current application context
     * @param  {Object} opts  
     * @return {Object}      component instances
     */
    static Create(app, opts)
    {
        return new Component(app, opts);
    }
}


module.exports = ComponentFactory.Create;
