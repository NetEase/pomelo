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
 * Simple class that represents a Request that will be made by any {@link Ext.data.proxy.Server} subclass.
 * All this class does is standardize the representation of a Request as used by any ServerProxy subclass,
 * it does not contain any actual logic or perform the request itself.
 */
Ext.define('Ext.data.Request', {
    /**
     * @cfg {String} action
     * The name of the action this Request represents. Usually one of 'create', 'read', 'update' or 'destroy'.
     */
    action: undefined,
    
    /**
     * @cfg {Object} params
     * HTTP request params. The Proxy and its Writer have access to and can modify this object.
     */
    params: undefined,
    
    /**
     * @cfg {String} method
     * The HTTP method to use on this Request. Should be one of 'GET', 'POST', 'PUT' or 'DELETE'.
     */
    method: 'GET',
    
    /**
     * @cfg {String} url
     * The url to access on this Request
     */
    url: undefined,

    /**
     * Creates the Request object.
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        Ext.apply(this, config);
    }
});
