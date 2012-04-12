/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This class is used to send requests to the server using {@link Ext.direct.Manager Ext.Direct}. When a
 * request is made, the transport mechanism is handed off to the appropriate
 * {@link Ext.direct.RemotingProvider Provider} to complete the call.
 *
 * # Specifying the function
 *
 * This proxy expects a Direct remoting method to be passed in order to be able to complete requests.
 * This can be done by specifying the {@link #directFn} configuration. This will use the same direct
 * method for all requests. Alternatively, you can provide an {@link #api} configuration. This
 * allows you to specify a different remoting method for each CRUD action.
 *
 * # Parameters
 *
 * This proxy provides options to help configure which parameters will be sent to the server.
 * By specifying the {@link #paramsAsHash} option, it will send an object literal containing each
 * of the passed parameters. The {@link #paramOrder} option can be used to specify the order in which
 * the remoting method parameters are passed.
 *
 * # Example Usage
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['firstName', 'lastName'],
 *         proxy: {
 *             type: 'direct',
 *             directFn: MyApp.getUsers,
 *             paramOrder: 'id' // Tells the proxy to pass the id as the first parameter to the remoting method.
 *         }
 *     });
 *     User.load(1);
 */
Ext.define('Ext.data.proxy.Direct', {
    /* Begin Definitions */

    extend: 'Ext.data.proxy.Server',
    alternateClassName: 'Ext.data.DirectProxy',

    alias: 'proxy.direct',

    requires: ['Ext.direct.Manager'],

    /* End Definitions */

    /**
     * @cfg {String/String[]} paramOrder
     * Defaults to undefined. A list of params to be executed server side.  Specify the params in the order in
     * which they must be executed on the server-side as either (1) an Array of String values, or (2) a String
     * of params delimited by either whitespace, comma, or pipe. For example, any of the following would be
     * acceptable:
     *
     *     paramOrder: ['param1','param2','param3']
     *     paramOrder: 'param1 param2 param3'
     *     paramOrder: 'param1,param2,param3'
     *     paramOrder: 'param1|param2|param'
     */
    paramOrder: undefined,

    /**
     * @cfg {Boolean} paramsAsHash
     * Send parameters as a collection of named arguments.
     * Providing a {@link #paramOrder} nullifies this configuration.
     */
    paramsAsHash: true,

    /**
     * @cfg {Function} directFn
     * Function to call when executing a request.  directFn is a simple alternative to defining the api configuration-parameter
     * for Store's which will not implement a full CRUD api.
     */
    directFn : undefined,

    /**
     * @cfg {Object} api
     * The same as {@link Ext.data.proxy.Server#api}, however instead of providing urls, you should provide a direct
     * function call.
     */

    /**
     * @cfg {Object} extraParams
     * Extra parameters that will be included on every read request. Individual requests with params
     * of the same name will override these params when they are in conflict.
     */

    // private
    paramOrderRe: /[\s,|]/,

    constructor: function(config){
        var me = this;

        Ext.apply(me, config);
        if (Ext.isString(me.paramOrder)) {
            me.paramOrder = me.paramOrder.split(me.paramOrderRe);
        }
        me.callParent(arguments);
    },

    doRequest: function(operation, callback, scope) {
        var me = this,
            writer = me.getWriter(),
            request = me.buildRequest(operation, callback, scope),
            fn = me.api[request.action]  || me.directFn,
            args = [],
            params = request.params,
            paramOrder = me.paramOrder,
            method,
            i = 0,
            len;

        //<debug>
        if (!fn) {
            Ext.Error.raise('No direct function specified for this proxy');
        }
        //</debug>

        if (operation.allowWrite()) {
            request = writer.write(request);
        }

        if (operation.action == 'read') {
            // We need to pass params
            method = fn.directCfg.method;

            if (method.ordered) {
                if (method.len > 0) {
                    if (paramOrder) {
                        for (len = paramOrder.length; i < len; ++i) {
                            args.push(params[paramOrder[i]]);
                        }
                    } else if (me.paramsAsHash) {
                        args.push(params);
                    }
                }
            } else {
                args.push(params);
            }
        } else {
            args.push(request.jsonData);
        }

        Ext.apply(request, {
            args: args,
            directFn: fn
        });
        args.push(me.createRequestCallback(request, operation, callback, scope), me);
        fn.apply(window, args);
    },

    /*
     * Inherit docs. We don't apply any encoding here because
     * all of the direct requests go out as jsonData
     */
    applyEncoding: function(value){
        return value;
    },

    createRequestCallback: function(request, operation, callback, scope){
        var me = this;

        return function(data, event){
            me.processResponse(event.status, operation, request, event, callback, scope);
        };
    },

    // inherit docs
    extractResponseData: function(response){
        return Ext.isDefined(response.result) ? response.result : response.data;
    },

    // inherit docs
    setException: function(operation, response) {
        operation.setException(response.message);
    },

    // inherit docs
    buildUrl: function(){
        return '';
    }
});

