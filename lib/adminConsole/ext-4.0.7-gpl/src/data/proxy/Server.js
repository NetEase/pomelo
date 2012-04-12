/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 *
 * ServerProxy is a superclass of {@link Ext.data.proxy.JsonP JsonPProxy} and {@link Ext.data.proxy.Ajax AjaxProxy}, and
 * would not usually be used directly.
 *
 * ServerProxy should ideally be named HttpProxy as it is a superclass for all HTTP proxies - for Ext JS 4.x it has been
 * called ServerProxy to enable any 3.x applications that reference the HttpProxy to continue to work (HttpProxy is now
 * an alias of AjaxProxy).
 * @private
 */
Ext.define('Ext.data.proxy.Server', {
    extend: 'Ext.data.proxy.Proxy',
    alias : 'proxy.server',
    alternateClassName: 'Ext.data.ServerProxy',
    uses  : ['Ext.data.Request'],

    /**
     * @cfg {String} url
     * The URL from which to request the data object.
     */

    /**
     * @cfg {String} pageParam
     * The name of the 'page' parameter to send in a request. Defaults to 'page'. Set this to undefined if you don't
     * want to send a page parameter.
     */
    pageParam: 'page',

    /**
     * @cfg {String} startParam
     * The name of the 'start' parameter to send in a request. Defaults to 'start'. Set this to undefined if you don't
     * want to send a start parameter.
     */
    startParam: 'start',

    /**
     * @cfg {String} limitParam
     * The name of the 'limit' parameter to send in a request. Defaults to 'limit'. Set this to undefined if you don't
     * want to send a limit parameter.
     */
    limitParam: 'limit',

    /**
     * @cfg {String} groupParam
     * The name of the 'group' parameter to send in a request. Defaults to 'group'. Set this to undefined if you don't
     * want to send a group parameter.
     */
    groupParam: 'group',

    /**
     * @cfg {String} sortParam
     * The name of the 'sort' parameter to send in a request. Defaults to 'sort'. Set this to undefined if you don't
     * want to send a sort parameter.
     */
    sortParam: 'sort',

    /**
     * @cfg {String} filterParam
     * The name of the 'filter' parameter to send in a request. Defaults to 'filter'. Set this to undefined if you don't
     * want to send a filter parameter.
     */
    filterParam: 'filter',

    /**
     * @cfg {String} directionParam
     * The name of the direction parameter to send in a request. **This is only used when simpleSortMode is set to
     * true.** Defaults to 'dir'.
     */
    directionParam: 'dir',

    /**
     * @cfg {Boolean} simpleSortMode
     * Enabling simpleSortMode in conjunction with remoteSort will only send one sort property and a direction when a
     * remote sort is requested. The directionParam and sortParam will be sent with the property name and either 'ASC'
     * or 'DESC'.
     */
    simpleSortMode: false,

    /**
     * @cfg {Boolean} noCache
     * Disable caching by adding a unique parameter name to the request. Set to false to allow caching. Defaults to true.
     */
    noCache : true,

    /**
     * @cfg {String} cacheString
     * The name of the cache param added to the url when using noCache. Defaults to "_dc".
     */
    cacheString: "_dc",

    /**
     * @cfg {Number} timeout
     * The number of milliseconds to wait for a response. Defaults to 30000 milliseconds (30 seconds).
     */
    timeout : 30000,

    /**
     * @cfg {Object} api
     * Specific urls to call on CRUD action methods "create", "read", "update" and "destroy". Defaults to:
     *
     *     api: {
     *         create  : undefined,
     *         read    : undefined,
     *         update  : undefined,
     *         destroy : undefined
     *     }
     *
     * The url is built based upon the action being executed [create|read|update|destroy] using the commensurate
     * {@link #api} property, or if undefined default to the configured
     * {@link Ext.data.Store}.{@link Ext.data.proxy.Server#url url}.
     *
     * For example:
     *
     *     api: {
     *         create  : '/controller/new',
     *         read    : '/controller/load',
     *         update  : '/controller/update',
     *         destroy : '/controller/destroy_action'
     *     }
     *
     * If the specific URL for a given CRUD action is undefined, the CRUD action request will be directed to the
     * configured {@link Ext.data.proxy.Server#url url}.
     */

    constructor: function(config) {
        var me = this;

        config = config || {};
        this.addEvents(
            /**
             * @event exception
             * Fires when the server returns an exception
             * @param {Ext.data.proxy.Proxy} this
             * @param {Object} response The response from the AJAX request
             * @param {Ext.data.Operation} operation The operation that triggered request
             */
            'exception'
        );
        me.callParent([config]);

        /**
         * @cfg {Object} extraParams
         * Extra parameters that will be included on every request. Individual requests with params of the same name
         * will override these params when they are in conflict.
         */
        me.extraParams = config.extraParams || {};

        me.api = config.api || {};

        //backwards compatibility, will be deprecated in 5.0
        me.nocache = me.noCache;
    },

    //in a ServerProxy all four CRUD operations are executed in the same manner, so we delegate to doRequest in each case
    create: function() {
        return this.doRequest.apply(this, arguments);
    },

    read: function() {
        return this.doRequest.apply(this, arguments);
    },

    update: function() {
        return this.doRequest.apply(this, arguments);
    },

    destroy: function() {
        return this.doRequest.apply(this, arguments);
    },

    /**
     * Creates and returns an Ext.data.Request object based on the options passed by the {@link Ext.data.Store Store}
     * that this Proxy is attached to.
     * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
     * @return {Ext.data.Request} The request object
     */
    buildRequest: function(operation) {
        var params = Ext.applyIf(operation.params || {}, this.extraParams || {}),
            request;

        //copy any sorters, filters etc into the params so they can be sent over the wire
        params = Ext.applyIf(params, this.getParams(operation));

        if (operation.id && !params.id) {
            params.id = operation.id;
        }

        request = Ext.create('Ext.data.Request', {
            params   : params,
            action   : operation.action,
            records  : operation.records,
            operation: operation,
            url      : operation.url
        });

        request.url = this.buildUrl(request);

        /*
         * Save the request on the Operation. Operations don't usually care about Request and Response data, but in the
         * ServerProxy and any of its subclasses we add both request and response as they may be useful for further processing
         */
        operation.request = request;

        return request;
    },

    // Should this be documented as protected method?
    processResponse: function(success, operation, request, response, callback, scope){
        var me = this,
            reader,
            result;

        if (success === true) {
            reader = me.getReader();
            result = reader.read(me.extractResponseData(response));

            if (result.success !== false) {
                //see comment in buildRequest for why we include the response object here
                Ext.apply(operation, {
                    response: response,
                    resultSet: result
                });

                operation.commitRecords(result.records);
                operation.setCompleted();
                operation.setSuccessful();
            } else {
                operation.setException(result.message);
                me.fireEvent('exception', this, response, operation);
            }
        } else {
            me.setException(operation, response);
            me.fireEvent('exception', this, response, operation);
        }

        //this callback is the one that was passed to the 'read' or 'write' function above
        if (typeof callback == 'function') {
            callback.call(scope || me, operation);
        }

        me.afterRequest(request, success);
    },

    /**
     * Sets up an exception on the operation
     * @private
     * @param {Ext.data.Operation} operation The operation
     * @param {Object} response The response
     */
    setException: function(operation, response){
        operation.setException({
            status: response.status,
            statusText: response.statusText
        });
    },

    /**
     * Template method to allow subclasses to specify how to get the response for the reader.
     * @template
     * @private
     * @param {Object} response The server response
     * @return {Object} The response data to be used by the reader
     */
    extractResponseData: function(response){
        return response;
    },

    /**
     * Encode any values being sent to the server. Can be overridden in subclasses.
     * @private
     * @param {Array} An array of sorters/filters.
     * @return {Object} The encoded value
     */
    applyEncoding: function(value){
        return Ext.encode(value);
    },

    /**
     * Encodes the array of {@link Ext.util.Sorter} objects into a string to be sent in the request url. By default,
     * this simply JSON-encodes the sorter data
     * @param {Ext.util.Sorter[]} sorters The array of {@link Ext.util.Sorter Sorter} objects
     * @return {String} The encoded sorters
     */
    encodeSorters: function(sorters) {
        var min = [],
            length = sorters.length,
            i = 0;

        for (; i < length; i++) {
            min[i] = {
                property : sorters[i].property,
                direction: sorters[i].direction
            };
        }
        return this.applyEncoding(min);

    },

    /**
     * Encodes the array of {@link Ext.util.Filter} objects into a string to be sent in the request url. By default,
     * this simply JSON-encodes the filter data
     * @param {Ext.util.Filter[]} filters The array of {@link Ext.util.Filter Filter} objects
     * @return {String} The encoded filters
     */
    encodeFilters: function(filters) {
        var min = [],
            length = filters.length,
            i = 0;

        for (; i < length; i++) {
            min[i] = {
                property: filters[i].property,
                value   : filters[i].value
            };
        }
        return this.applyEncoding(min);
    },

    /**
     * @private
     * Copy any sorters, filters etc into the params so they can be sent over the wire
     */
    getParams: function(operation) {
        var me             = this,
            params         = {},
            isDef          = Ext.isDefined,
            groupers       = operation.groupers,
            sorters        = operation.sorters,
            filters        = operation.filters,
            page           = operation.page,
            start          = operation.start,
            limit          = operation.limit,

            simpleSortMode = me.simpleSortMode,

            pageParam      = me.pageParam,
            startParam     = me.startParam,
            limitParam     = me.limitParam,
            groupParam     = me.groupParam,
            sortParam      = me.sortParam,
            filterParam    = me.filterParam,
            directionParam = me.directionParam;

        if (pageParam && isDef(page)) {
            params[pageParam] = page;
        }

        if (startParam && isDef(start)) {
            params[startParam] = start;
        }

        if (limitParam && isDef(limit)) {
            params[limitParam] = limit;
        }

        if (groupParam && groupers && groupers.length > 0) {
            // Grouper is a subclass of sorter, so we can just use the sorter method
            params[groupParam] = me.encodeSorters(groupers);
        }

        if (sortParam && sorters && sorters.length > 0) {
            if (simpleSortMode) {
                params[sortParam] = sorters[0].property;
                params[directionParam] = sorters[0].direction;
            } else {
                params[sortParam] = me.encodeSorters(sorters);
            }

        }

        if (filterParam && filters && filters.length > 0) {
            params[filterParam] = me.encodeFilters(filters);
        }

        return params;
    },

    /**
     * Generates a url based on a given Ext.data.Request object. By default, ServerProxy's buildUrl will add the
     * cache-buster param to the end of the url. Subclasses may need to perform additional modifications to the url.
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var me = this,
            url = me.getUrl(request);

        //<debug>
        if (!url) {
            Ext.Error.raise("You are using a ServerProxy but have not supplied it with a url.");
        }
        //</debug>

        if (me.noCache) {
            url = Ext.urlAppend(url, Ext.String.format("{0}={1}", me.cacheString, Ext.Date.now()));
        }

        return url;
    },

    /**
     * Get the url for the request taking into account the order of priority,
     * - The request
     * - The api
     * - The url
     * @private
     * @param {Ext.data.Request} request The request
     * @return {String} The url
     */
    getUrl: function(request){
        return request.url || this.api[request.action] || this.url;
    },

    /**
     * In ServerProxy subclasses, the {@link #create}, {@link #read}, {@link #update} and {@link #destroy} methods all
     * pass through to doRequest. Each ServerProxy subclass must implement the doRequest method - see {@link
     * Ext.data.proxy.JsonP} and {@link Ext.data.proxy.Ajax} for examples. This method carries the same signature as
     * each of the methods that delegate to it.
     *
     * @param {Ext.data.Operation} operation The Ext.data.Operation object
     * @param {Function} callback The callback function to call when the Operation has completed
     * @param {Object} scope The scope in which to execute the callback
     */
    doRequest: function(operation, callback, scope) {
        //<debug>
        Ext.Error.raise("The doRequest function has not been implemented on your Ext.data.proxy.Server subclass. See src/data/ServerProxy.js for details");
        //</debug>
    },

    /**
     * Optional callback function which can be used to clean up after a request has been completed.
     * @param {Ext.data.Request} request The Request object
     * @param {Boolean} success True if the request was successful
     * @method
     */
    afterRequest: Ext.emptyFn,

    onDestroy: function() {
        Ext.destroy(this.reader, this.writer);
    }
});

