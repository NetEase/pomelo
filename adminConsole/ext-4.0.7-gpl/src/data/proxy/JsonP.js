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
 * The JsonP proxy is useful when you need to load data from a domain other than the one your application is running on. If
 * your application is running on http://domainA.com it cannot use {@link Ext.data.proxy.Ajax Ajax} to load its data
 * from http://domainB.com because cross-domain ajax requests are prohibited by the browser.
 *
 * We can get around this using a JsonP proxy. JsonP proxy injects a `<script>` tag into the DOM whenever an AJAX request
 * would usually be made. Let's say we want to load data from http://domainB.com/users - the script tag that would be
 * injected might look like this:
 *
 *     <script src="http://domainB.com/users?callback=someCallback"></script>
 *
 * When we inject the tag above, the browser makes a request to that url and includes the response as if it was any
 * other type of JavaScript include. By passing a callback in the url above, we're telling domainB's server that we want
 * to be notified when the result comes in and that it should call our callback function with the data it sends back. So
 * long as the server formats the response to look like this, everything will work:
 *
 *     someCallback({
 *         users: [
 *             {
 *                 id: 1,
 *                 name: "Ed Spencer",
 *                 email: "ed@sencha.com"
 *             }
 *         ]
 *     });
 *
 * As soon as the script finishes loading, the 'someCallback' function that we passed in the url is called with the JSON
 * object that the server returned.
 *
 * JsonP proxy takes care of all of this automatically. It formats the url you pass, adding the callback parameter
 * automatically. It even creates a temporary callback function, waits for it to be called and then puts the data into
 * the Proxy making it look just like you loaded it through a normal {@link Ext.data.proxy.Ajax AjaxProxy}. Here's how
 * we might set that up:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'name', 'email']
 *     });
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'User',
 *         proxy: {
 *             type: 'jsonp',
 *             url : 'http://domainB.com/users'
 *         }
 *     });
 *
 *     store.load();
 *
 * That's all we need to do - JsonP proxy takes care of the rest. In this case the Proxy will have injected a script tag
 * like this:
 *
 *     <script src="http://domainB.com/users?callback=callback1"></script>
 *
 * # Customization
 *
 * This script tag can be customized using the {@link #callbackKey} configuration. For example:
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'User',
 *         proxy: {
 *             type: 'jsonp',
 *             url : 'http://domainB.com/users',
 *             callbackKey: 'theCallbackFunction'
 *         }
 *     });
 *
 *     store.load();
 *
 * Would inject a script tag like this:
 *
 *     <script src="http://domainB.com/users?theCallbackFunction=callback1"></script>
 *
 * # Implementing on the server side
 *
 * The remote server side needs to be configured to return data in this format. Here are suggestions for how you might
 * achieve this using Java, PHP and ASP.net:
 *
 * Java:
 *
 *     boolean jsonP = false;
 *     String cb = request.getParameter("callback");
 *     if (cb != null) {
 *         jsonP = true;
 *         response.setContentType("text/javascript");
 *     } else {
 *         response.setContentType("application/x-json");
 *     }
 *     Writer out = response.getWriter();
 *     if (jsonP) {
 *         out.write(cb + "(");
 *     }
 *     out.print(dataBlock.toJsonString());
 *     if (jsonP) {
 *         out.write(");");
 *     }
 *
 * PHP:
 *
 *     $callback = $_REQUEST['callback'];
 *
 *     // Create the output object.
 *     $output = array('a' => 'Apple', 'b' => 'Banana');
 *
 *     //start output
 *     if ($callback) {
 *         header('Content-Type: text/javascript');
 *         echo $callback . '(' . json_encode($output) . ');';
 *     } else {
 *         header('Content-Type: application/x-json');
 *         echo json_encode($output);
 *     }
 *
 * ASP.net:
 *
 *     String jsonString = "{success: true}";
 *     String cb = Request.Params.Get("callback");
 *     String responseString = "";
 *     if (!String.IsNullOrEmpty(cb)) {
 *         responseString = cb + "(" + jsonString + ")";
 *     } else {
 *         responseString = jsonString;
 *     }
 *     Response.Write(responseString);
 */
Ext.define('Ext.data.proxy.JsonP', {
    extend: 'Ext.data.proxy.Server',
    alternateClassName: 'Ext.data.ScriptTagProxy',
    alias: ['proxy.jsonp', 'proxy.scripttag'],
    requires: ['Ext.data.JsonP'],

    defaultWriterType: 'base',

    /**
     * @cfg {String} callbackKey
     * See {@link Ext.data.JsonP#callbackKey}.
     */
    callbackKey : 'callback',

    /**
     * @cfg {String} recordParam
     * The param name to use when passing records to the server (e.g. 'records=someEncodedRecordString'). Defaults to
     * 'records'
     */
    recordParam: 'records',

    /**
     * @cfg {Boolean} autoAppendParams
     * True to automatically append the request's params to the generated url. Defaults to true
     */
    autoAppendParams: true,

    constructor: function(){
        this.addEvents(
            /**
             * @event
             * Fires when the server returns an exception
             * @param {Ext.data.proxy.Proxy} this
             * @param {Ext.data.Request} request The request that was sent
             * @param {Ext.data.Operation} operation The operation that triggered the request
             */
            'exception'
        );
        this.callParent(arguments);
    },

    /**
     * @private
     * Performs the read request to the remote domain. JsonP proxy does not actually create an Ajax request,
     * instead we write out a <script> tag based on the configuration of the internal Ext.data.Request object
     * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
     * @param {Function} callback A callback function to execute when the Operation has been completed
     * @param {Object} scope The scope to execute the callback in
     */
    doRequest: function(operation, callback, scope) {
        //generate the unique IDs for this request
        var me      = this,
            writer  = me.getWriter(),
            request = me.buildRequest(operation),
            params = request.params;

        if (operation.allowWrite()) {
            request = writer.write(request);
        }

        // apply JsonP proxy-specific attributes to the Request
        Ext.apply(request, {
            callbackKey: me.callbackKey,
            timeout: me.timeout,
            scope: me,
            disableCaching: false, // handled by the proxy
            callback: me.createRequestCallback(request, operation, callback, scope)
        });

        // prevent doubling up
        if (me.autoAppendParams) {
            request.params = {};
        }

        request.jsonp = Ext.data.JsonP.request(request);
        // restore on the request
        request.params = params;
        operation.setStarted();
        me.lastRequest = request;

        return request;
    },

    /**
     * @private
     * Creates and returns the function that is called when the request has completed. The returned function
     * should accept a Response object, which contains the response to be read by the configured Reader.
     * The third argument is the callback that should be called after the request has been completed and the Reader has decoded
     * the response. This callback will typically be the callback passed by a store, e.g. in proxy.read(operation, theCallback, scope)
     * theCallback refers to the callback argument received by this function.
     * See {@link #doRequest} for details.
     * @param {Ext.data.Request} request The Request object
     * @param {Ext.data.Operation} operation The Operation being executed
     * @param {Function} callback The callback function to be called when the request completes. This is usually the callback
     * passed to doRequest
     * @param {Object} scope The scope in which to execute the callback function
     * @return {Function} The callback function
     */
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;

        return function(success, response, errorType) {
            delete me.lastRequest;
            me.processResponse(success, operation, request, response, callback, scope);
        };
    },

    // inherit docs
    setException: function(operation, response) {
        operation.setException(operation.request.jsonp.errorType);
    },


    /**
     * Generates a url based on a given Ext.data.Request object. Adds the params and callback function name to the url
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var me      = this,
            url     = me.callParent(arguments),
            params  = Ext.apply({}, request.params),
            filters = params.filters,
            records,
            filter, i;

        delete params.filters;

        if (me.autoAppendParams) {
            url = Ext.urlAppend(url, Ext.Object.toQueryString(params));
        }

        if (filters && filters.length) {
            for (i = 0; i < filters.length; i++) {
                filter = filters[i];

                if (filter.value) {
                    url = Ext.urlAppend(url, filter.property + "=" + filter.value);
                }
            }
        }

        //if there are any records present, append them to the url also
        records = request.records;

        if (Ext.isArray(records) && records.length > 0) {
            url = Ext.urlAppend(url, Ext.String.format("{0}={1}", me.recordParam, me.encodeRecords(records)));
        }

        return url;
    },

    //inherit docs
    destroy: function() {
        this.abort();
        this.callParent();
    },

    /**
     * Aborts the current server request if one is currently running
     */
    abort: function() {
        var lastRequest = this.lastRequest;
        if (lastRequest) {
            Ext.data.JsonP.abort(lastRequest.jsonp);
        }
    },

    /**
     * Encodes an array of records into a string suitable to be appended to the script src url. This is broken out into
     * its own function so that it can be easily overridden.
     * @param {Ext.data.Model[]} records The records array
     * @return {String} The encoded records string
     */
    encodeRecords: function(records) {
        var encoded = "",
            i = 0,
            len = records.length;

        for (; i < len; i++) {
            encoded += Ext.Object.toQueryString(records[i].data);
        }

        return encoded;
    }
});

