/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Ajax
 * @singleton
 * @markdown
 * @extends Ext.data.Connection

A singleton instance of an {@link Ext.data.Connection}. This class
is used to communicate with your server side code. It can be used as follows:

    Ext.Ajax.request({
        url: 'page.php',
        params: {
            id: 1
        },
        success: function(response){
            var text = response.responseText;
            // process server response here
        }
    });

Default options for all requests can be set by changing a property on the Ext.Ajax class:

    Ext.Ajax.timeout = 60000; // 60 seconds

Any options specified in the request method for the Ajax request will override any
defaults set on the Ext.Ajax class. In the code sample below, the timeout for the
request will be 60 seconds.

    Ext.Ajax.timeout = 120000; // 120 seconds
    Ext.Ajax.request({
        url: 'page.aspx',
        timeout: 60000
    });

In general, this class will be used for all Ajax requests in your application.
The main reason for creating a separate {@link Ext.data.Connection} is for a
series of requests that share common settings that are different to all other
requests in the application.

 */
Ext.define('Ext.Ajax', {
    extend: 'Ext.data.Connection',
    singleton: true,

    /**
     * @cfg {String} url @hide
     */
    /**
     * @cfg {Object} extraParams @hide
     */
    /**
     * @cfg {Object} defaultHeaders @hide
     */
    /**
     * @cfg {String} method (Optional) @hide
     */
    /**
     * @cfg {Number} timeout (Optional) @hide
     */
    /**
     * @cfg {Boolean} autoAbort (Optional) @hide
     */

    /**
     * @cfg {Boolean} disableCaching (Optional) @hide
     */

    /**
     * @property {Boolean} disableCaching
     * True to add a unique cache-buster param to GET requests. Defaults to true.
     */
    /**
     * @property {String} url
     * The default URL to be used for requests to the server.
     * If the server receives all requests through one URL, setting this once is easier than
     * entering it on every request.
     */
    /**
     * @property {Object} extraParams
     * An object containing properties which are used as extra parameters to each request made
     * by this object. Session information and other data that you need
     * to pass with each request are commonly put here.
     */
    /**
     * @property {Object} defaultHeaders
     * An object containing request headers which are added to each request made by this object.
     */
    /**
     * @property {String} method
     * The default HTTP method to be used for requests. Note that this is case-sensitive and
     * should be all caps (if not set but params are present will use
     * <tt>"POST"</tt>, otherwise will use <tt>"GET"</tt>.)
     */
    /**
     * @property {Number} timeout
     * The timeout in milliseconds to be used for requests. Defaults to 30000.
     */

    /**
     * @property {Boolean} autoAbort
     * Whether a new request should abort any pending requests.
     */
    autoAbort : false
});
