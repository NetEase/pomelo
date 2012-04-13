/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A class used to load remote content to an Element. Sample usage:
 *
 *     Ext.get('el').load({
 *         url: 'myPage.php',
 *         scripts: true,
 *         params: {
 *             id: 1
 *         }
 *     });
 *
 * In general this class will not be instanced directly, rather the {@link Ext.Element#load} method
 * will be used.
 */
Ext.define('Ext.ElementLoader', {

    /* Begin Definitions */

    mixins: {
        observable: 'Ext.util.Observable'
    },

    uses: [
        'Ext.data.Connection',
        'Ext.Ajax'
    ],

    statics: {
        Renderer: {
            Html: function(loader, response, active){
                loader.getTarget().update(response.responseText, active.scripts === true);
                return true;
            }
        }
    },

    /* End Definitions */

    /**
     * @cfg {String} url
     * The url to retrieve the content from.
     */
    url: null,

    /**
     * @cfg {Object} params
     * Any params to be attached to the Ajax request. These parameters will
     * be overridden by any params in the load options.
     */
    params: null,

    /**
     * @cfg {Object} baseParams Params that will be attached to every request. These parameters
     * will not be overridden by any params in the load options.
     */
    baseParams: null,

    /**
     * @cfg {Boolean/Object} autoLoad
     * True to have the loader make a request as soon as it is created.
     * This argument can also be a set of options that will be passed to {@link #load} is called.
     */
    autoLoad: false,

    /**
     * @cfg {HTMLElement/Ext.Element/String} target
     * The target element for the loader. It can be the DOM element, the id or an {@link Ext.Element}.
     */
    target: null,

    /**
     * @cfg {Boolean/String} loadMask
     * True or a string to show when the element is loading.
     */
    loadMask: false,

    /**
     * @cfg {Object} ajaxOptions
     * Any additional options to be passed to the request, for example timeout or headers.
     */
    ajaxOptions: null,

    /**
     * @cfg {Boolean} scripts
     * True to parse any inline script tags in the response.
     */
    scripts: false,

    /**
     * @cfg {Function} success
     * A function to be called when a load request is successful.
     * Will be called with the following config parameters:
     *
     * - this - The ElementLoader instance.
     * - response - The response object.
     * - options - Ajax options.
     */

    /**
     * @cfg {Function} failure A function to be called when a load request fails.
     * Will be called with the following config parameters:
     *
     * - this - The ElementLoader instance.
     * - response - The response object.
     * - options - Ajax options.
     */

    /**
     * @cfg {Function} callback A function to be called when a load request finishes.
     * Will be called with the following config parameters:
     *
     * - this - The ElementLoader instance.
     * - success - True if successful request.
     * - response - The response object.
     * - options - Ajax options.
     */

    /**
     * @cfg {Object} scope
     * The scope to execute the {@link #success} and {@link #failure} functions in.
     */

    /**
     * @cfg {Function} renderer
     * A custom function to render the content to the element. The passed parameters are:
     *
     * - The loader
     * - The response
     * - The active request
     */

    isLoader: true,

    constructor: function(config) {
        var me = this,
            autoLoad;

        config = config || {};
        Ext.apply(me, config);
        me.setTarget(me.target);
        me.addEvents(
            /**
             * @event beforeload
             * Fires before a load request is made to the server.
             * Returning false from an event listener can prevent the load
             * from occurring.
             * @param {Ext.ElementLoader} this
             * @param {Object} options The options passed to the request
             */
            'beforeload',

            /**
             * @event exception
             * Fires after an unsuccessful load.
             * @param {Ext.ElementLoader} this
             * @param {Object} response The response from the server
             * @param {Object} options The options passed to the request
             */
            'exception',

            /**
             * @event load
             * Fires after a successful load.
             * @param {Ext.ElementLoader} this
             * @param {Object} response The response from the server
             * @param {Object} options The options passed to the request
             */
            'load'
        );

        // don't pass config because we have already applied it.
        me.mixins.observable.constructor.call(me);

        if (me.autoLoad) {
            autoLoad = me.autoLoad;
            if (autoLoad === true) {
                autoLoad = {};
            }
            me.load(autoLoad);
        }
    },

    /**
     * Sets an {@link Ext.Element} as the target of this loader.
     * Note that if the target is changed, any active requests will be aborted.
     * @param {String/HTMLElement/Ext.Element} target The element or its ID.
     */
    setTarget: function(target){
        var me = this;
        target = Ext.get(target);
        if (me.target && me.target != target) {
            me.abort();
        }
        me.target = target;
    },

    /**
     * Returns the target of this loader.
     * @return {Ext.Component} The target or null if none exists.
     */
    getTarget: function(){
        return this.target || null;
    },

    /**
     * Aborts the active load request
     */
    abort: function(){
        var active = this.active;
        if (active !== undefined) {
            Ext.Ajax.abort(active.request);
            if (active.mask) {
                this.removeMask();
            }
            delete this.active;
        }
    },

    /**
     * Removes the mask on the target
     * @private
     */
    removeMask: function(){
        this.target.unmask();
    },

    /**
     * Adds the mask on the target
     * @private
     * @param {Boolean/Object} mask The mask configuration
     */
    addMask: function(mask){
        this.target.mask(mask === true ? null : mask);
    },

    /**
     * Loads new data from the server.
     * @param {Object} options The options for the request. They can be any configuration option that can be specified for
     * the class, with the exception of the target option. Note that any options passed to the method will override any
     * class defaults.
     */
    load: function(options) {
        //<debug>
        if (!this.target) {
            Ext.Error.raise('A valid target is required when loading content');
        }
        //</debug>

        options = Ext.apply({}, options);

        var me = this,
            target = me.target,
            mask = Ext.isDefined(options.loadMask) ? options.loadMask : me.loadMask,
            params = Ext.apply({}, options.params),
            ajaxOptions = Ext.apply({}, options.ajaxOptions),
            callback = options.callback || me.callback,
            scope = options.scope || me.scope || me,
            request;

        Ext.applyIf(ajaxOptions, me.ajaxOptions);
        Ext.applyIf(options, ajaxOptions);

        Ext.applyIf(params, me.params);
        Ext.apply(params, me.baseParams);

        Ext.applyIf(options, {
            url: me.url
        });

        //<debug>
        if (!options.url) {
            Ext.Error.raise('You must specify the URL from which content should be loaded');
        }
        //</debug>

        Ext.apply(options, {
            scope: me,
            params: params,
            callback: me.onComplete
        });

        if (me.fireEvent('beforeload', me, options) === false) {
            return;
        }

        if (mask) {
            me.addMask(mask);
        }

        request = Ext.Ajax.request(options);
        me.active = {
            request: request,
            options: options,
            mask: mask,
            scope: scope,
            callback: callback,
            success: options.success || me.success,
            failure: options.failure || me.failure,
            renderer: options.renderer || me.renderer,
            scripts: Ext.isDefined(options.scripts) ? options.scripts : me.scripts
        };
        me.setOptions(me.active, options);
    },

    /**
     * Sets any additional options on the active request
     * @private
     * @param {Object} active The active request
     * @param {Object} options The initial options
     */
    setOptions: Ext.emptyFn,

    /**
     * Parses the response after the request completes
     * @private
     * @param {Object} options Ajax options
     * @param {Boolean} success Success status of the request
     * @param {Object} response The response object
     */
    onComplete: function(options, success, response) {
        var me = this,
            active = me.active,
            scope = active.scope,
            renderer = me.getRenderer(active.renderer);


        if (success) {
            success = renderer.call(me, me, response, active);
        }

        if (success) {
            Ext.callback(active.success, scope, [me, response, options]);
            me.fireEvent('load', me, response, options);
        } else {
            Ext.callback(active.failure, scope, [me, response, options]);
            me.fireEvent('exception', me, response, options);
        }
        Ext.callback(active.callback, scope, [me, success, response, options]);

        if (active.mask) {
            me.removeMask();
        }

        delete me.active;
    },

    /**
     * Gets the renderer to use
     * @private
     * @param {String/Function} renderer The renderer to use
     * @return {Function} A rendering function to use.
     */
    getRenderer: function(renderer){
        if (Ext.isFunction(renderer)) {
            return renderer;
        }
        return this.statics().Renderer.Html;
    },

    /**
     * Automatically refreshes the content over a specified period.
     * @param {Number} interval The interval to refresh in ms.
     * @param {Object} options (optional) The options to pass to the load method. See {@link #load}
     */
    startAutoRefresh: function(interval, options){
        var me = this;
        me.stopAutoRefresh();
        me.autoRefresh = setInterval(function(){
            me.load(options);
        }, interval);
    },

    /**
     * Clears any auto refresh. See {@link #startAutoRefresh}.
     */
    stopAutoRefresh: function(){
        clearInterval(this.autoRefresh);
        delete this.autoRefresh;
    },

    /**
     * Checks whether the loader is automatically refreshing. See {@link #startAutoRefresh}.
     * @return {Boolean} True if the loader is automatically refreshing
     */
    isAutoRefreshing: function(){
        return Ext.isDefined(this.autoRefresh);
    },

    /**
     * Destroys the loader. Any active requests will be aborted.
     */
    destroy: function(){
        var me = this;
        me.stopAutoRefresh();
        delete me.target;
        me.abort();
        me.clearListeners();
    }
});

