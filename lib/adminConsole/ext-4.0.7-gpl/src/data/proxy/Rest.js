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
 * The Rest proxy is a specialization of the {@link Ext.data.proxy.Ajax AjaxProxy} which simply maps the four actions
 * (create, read, update and destroy) to RESTful HTTP verbs. For example, let's set up a {@link Ext.data.Model Model}
 * with an inline Rest proxy
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'name', 'email'],
 *
 *         proxy: {
 *             type: 'rest',
 *             url : '/users'
 *         }
 *     });
 *
 * Now we can create a new User instance and save it via the Rest proxy. Doing this will cause the Proxy to send a POST
 * request to '/users':
 *
 *     var user = Ext.create('User', {name: 'Ed Spencer', email: 'ed@sencha.com'});
 *
 *     user.save(); //POST /users
 *
 * Let's expand this a little and provide a callback for the {@link Ext.data.Model#save} call to update the Model once
 * it has been created. We'll assume the creation went successfully and that the server gave this user an ID of 123:
 *
 *     user.save({
 *         success: function(user) {
 *             user.set('name', 'Khan Noonien Singh');
 *
 *             user.save(); //PUT /users/123
 *         }
 *     });
 *
 * Now that we're no longer creating a new Model instance, the request method is changed to an HTTP PUT, targeting the
 * relevant url for that user. Now let's delete this user, which will use the DELETE method:
 *
 *         user.destroy(); //DELETE /users/123
 *
 * Finally, when we perform a load of a Model or Store, Rest proxy will use the GET method:
 *
 *     //1. Load via Store
 *
 *     //the Store automatically picks up the Proxy from the User model
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'User'
 *     });
 *
 *     store.load(); //GET /users
 *
 *     //2. Load directly from the Model
 *
 *     //GET /users/123
 *     Ext.ModelManager.getModel('User').load(123, {
 *         success: function(user) {
 *             console.log(user.getId()); //outputs 123
 *         }
 *     });
 *
 * # Url generation
 *
 * The Rest proxy is able to automatically generate the urls above based on two configuration options - {@link #appendId} and
 * {@link #format}. If appendId is true (it is by default) then Rest proxy will automatically append the ID of the Model
 * instance in question to the configured url, resulting in the '/users/123' that we saw above.
 *
 * If the request is not for a specific Model instance (e.g. loading a Store), the url is not appended with an id.
 * The Rest proxy will automatically insert a '/' before the ID if one is not already present.
 *
 *     new Ext.data.proxy.Rest({
 *         url: '/users',
 *         appendId: true //default
 *     });
 *
 *     // Collection url: /users
 *     // Instance url  : /users/123
 *
 * The Rest proxy can also optionally append a format string to the end of any generated url:
 *
 *     new Ext.data.proxy.Rest({
 *         url: '/users',
 *         format: 'json'
 *     });
 *
 *     // Collection url: /users.json
 *     // Instance url  : /users/123.json
 *
 * If further customization is needed, simply implement the {@link #buildUrl} method and add your custom generated url
 * onto the {@link Ext.data.Request Request} object that is passed to buildUrl. See [Rest proxy's implementation][1] for
 * an example of how to achieve this.
 *
 * Note that Rest proxy inherits from {@link Ext.data.proxy.Ajax AjaxProxy}, which already injects all of the sorter,
 * filter, group and paging options into the generated url. See the {@link Ext.data.proxy.Ajax AjaxProxy docs} for more
 * details.
 *
 * [1]: source/RestProxy.html#method-Ext.data.proxy.Rest-buildUrl
 */
Ext.define('Ext.data.proxy.Rest', {
    extend: 'Ext.data.proxy.Ajax',
    alternateClassName: 'Ext.data.RestProxy',
    alias : 'proxy.rest',
    
    /**
     * @cfg {Boolean} appendId
     * True to automatically append the ID of a Model instance when performing a request based on that single instance.
     * See Rest proxy intro docs for more details. Defaults to true.
     */
    appendId: true,
    
    /**
     * @cfg {String} format
     * Optional data format to send to the server when making any request (e.g. 'json'). See the Rest proxy intro docs
     * for full details. Defaults to undefined.
     */
    
    /**
     * @cfg {Boolean} batchActions
     * True to batch actions of a particular type when synchronizing the store. Defaults to false.
     */
    batchActions: false,
    
    /**
     * Specialized version of buildUrl that incorporates the {@link #appendId} and {@link #format} options into the
     * generated url. Override this to provide further customizations, but remember to call the superclass buildUrl so
     * that additional parameters like the cache buster string are appended.
     * @param {Object} request
     */
    buildUrl: function(request) {
        var me        = this,
            operation = request.operation,
            records   = operation.records || [],
            record    = records[0],
            format    = me.format,
            url       = me.getUrl(request),
            id        = record ? record.getId() : operation.id;
        
        if (me.appendId && id) {
            if (!url.match(/\/$/)) {
                url += '/';
            }
            
            url += id;
        }
        
        if (format) {
            if (!url.match(/\.$/)) {
                url += '.';
            }
            
            url += format;
        }
        
        request.url = url;
        
        return me.callParent(arguments);
    }
}, function() {
    Ext.apply(this.prototype, {
        /**
         * @property {Object} actionMethods
         * Mapping of action name to HTTP request method. These default to RESTful conventions for the 'create', 'read',
         * 'update' and 'destroy' actions (which map to 'POST', 'GET', 'PUT' and 'DELETE' respectively). This object
         * should not be changed except globally via {@link Ext#override Ext.override} - the {@link #getMethod} function
         * can be overridden instead.
         */
        actionMethods: {
            create : 'POST',
            read   : 'GET',
            update : 'PUT',
            destroy: 'DELETE'
        }
    });
});

