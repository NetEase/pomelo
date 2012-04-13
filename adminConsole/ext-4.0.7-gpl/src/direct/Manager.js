/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Ext.Direct aims to streamline communication between the client and server by providing a single interface that
 * reduces the amount of common code typically required to validate data and handle returned data packets (reading data,
 * error conditions, etc).
 *
 * The Ext.direct namespace includes several classes for a closer integration with the server-side. The Ext.data
 * namespace also includes classes for working with Ext.data.Stores which are backed by data from an Ext.Direct method.
 *
 * # Specification
 *
 * For additional information consult the [Ext.Direct Specification][1].
 *
 * # Providers
 *
 * Ext.Direct uses a provider architecture, where one or more providers are used to transport data to and from the
 * server. There are several providers that exist in the core at the moment:
 *
 * - {@link Ext.direct.JsonProvider JsonProvider} for simple JSON operations
 * - {@link Ext.direct.PollingProvider PollingProvider} for repeated requests
 * - {@link Ext.direct.RemotingProvider RemotingProvider} exposes server side on the client.
 *
 * A provider does not need to be invoked directly, providers are added via {@link Ext.direct.Manager}.{@link #addProvider}.
 *
 * # Router
 *
 * Ext.Direct utilizes a "router" on the server to direct requests from the client to the appropriate server-side
 * method. Because the Ext.Direct API is completely platform-agnostic, you could completely swap out a Java based server
 * solution and replace it with one that uses C# without changing the client side JavaScript at all.
 *
 * # Server side events
 *
 * Custom events from the server may be handled by the client by adding listeners, for example:
 *
 *     {"type":"event","name":"message","data":"Successfully polled at: 11:19:30 am"}
 *
 *     // add a handler for a 'message' event sent by the server
 *     Ext.direct.Manager.on('message', function(e){
 *         out.append(String.format('<p><i>{0}</i></p>', e.data));
 *         out.el.scrollTo('t', 100000, true);
 *     });
 *
 *    [1]: http://sencha.com/products/extjs/extdirect
 *
 * @singleton
 * @alternateClassName Ext.Direct
 */
Ext.define('Ext.direct.Manager', {

    /* Begin Definitions */
    singleton: true,

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: ['Ext.util.MixedCollection'],

    statics: {
        exceptions: {
            TRANSPORT: 'xhr',
            PARSE: 'parse',
            LOGIN: 'login',
            SERVER: 'exception'
        }
    },

    /* End Definitions */

    constructor: function(){
        var me = this;

        me.addEvents(
            /**
             * @event event
             * Fires after an event.
             * @param {Ext.direct.Event} e The Ext.direct.Event type that occurred.
             * @param {Ext.direct.Provider} provider The {@link Ext.direct.Provider Provider}.
             */
            'event',
            /**
             * @event exception
             * Fires after an event exception.
             * @param {Ext.direct.Event} e The event type that occurred.
             */
            'exception'
        );
        me.transactions = Ext.create('Ext.util.MixedCollection');
        me.providers = Ext.create('Ext.util.MixedCollection');

        me.mixins.observable.constructor.call(me);
    },

    /**
     * Adds an Ext.Direct Provider and creates the proxy or stub methods to execute server-side methods. If the provider
     * is not already connected, it will auto-connect.
     *
     *     var pollProv = new Ext.direct.PollingProvider({
     *         url: 'php/poll2.php'
     *     });
     *
     *     Ext.direct.Manager.addProvider({
     *         "type":"remoting",       // create a {@link Ext.direct.RemotingProvider}
     *         "url":"php\/router.php", // url to connect to the Ext.Direct server-side router.
     *         "actions":{              // each property within the actions object represents a Class
     *             "TestAction":[       // array of methods within each server side Class
     *             {
     *                 "name":"doEcho", // name of method
     *                 "len":1
     *             },{
     *                 "name":"multiply",
     *                 "len":1
     *             },{
     *                 "name":"doForm",
     *                 "formHandler":true, // handle form on server with Ext.Direct.Transaction
     *                 "len":1
     *             }]
     *         },
     *         "namespace":"myApplication",// namespace to create the Remoting Provider in
     *     },{
     *         type: 'polling', // create a {@link Ext.direct.PollingProvider}
     *         url:  'php/poll.php'
     *     }, pollProv); // reference to previously created instance
     *
     * @param {Ext.direct.Provider/Object...} provider
     * Accepts any number of Provider descriptions (an instance or config object for
     * a Provider). Each Provider description instructs Ext.Directhow to create
     * client-side stub methods.
     */
    addProvider : function(provider){
        var me = this,
            args = arguments,
            i = 0,
            len;

        if (args.length > 1) {
            for (len = args.length; i < len; ++i) {
                me.addProvider(args[i]);
            }
            return;
        }

        // if provider has not already been instantiated
        if (!provider.isProvider) {
            provider = Ext.create('direct.' + provider.type + 'provider', provider);
        }
        me.providers.add(provider);
        provider.on('data', me.onProviderData, me);


        if (!provider.isConnected()) {
            provider.connect();
        }

        return provider;
    },

    /**
     * Retrieves a {@link Ext.direct.Provider provider} by the **{@link Ext.direct.Provider#id id}** specified when the
     * provider is {@link #addProvider added}.
     * @param {String/Ext.direct.Provider} id The id of the provider, or the provider instance.
     */
    getProvider : function(id){
        return id.isProvider ? id : this.providers.get(id);
    },

    /**
     * Removes the provider.
     * @param {String/Ext.direct.Provider} provider The provider instance or the id of the provider.
     * @return {Ext.direct.Provider} The provider, null if not found.
     */
    removeProvider : function(provider){
        var me = this,
            providers = me.providers;

        provider = provider.isProvider ? provider : providers.get(provider);

        if (provider) {
            provider.un('data', me.onProviderData, me);
            providers.remove(provider);
            return provider;
        }
        return null;
    },

    /**
     * Adds a transaction to the manager.
     * @private
     * @param {Ext.direct.Transaction} transaction The transaction to add
     * @return {Ext.direct.Transaction} transaction
     */
    addTransaction: function(transaction){
        this.transactions.add(transaction);
        return transaction;
    },

    /**
     * Removes a transaction from the manager.
     * @private
     * @param {String/Ext.direct.Transaction} transaction The transaction/id of transaction to remove
     * @return {Ext.direct.Transaction} transaction
     */
    removeTransaction: function(transaction){
        transaction = this.getTransaction(transaction);
        this.transactions.remove(transaction);
        return transaction;
    },

    /**
     * Gets a transaction
     * @private
     * @param {String/Ext.direct.Transaction} transaction The transaction/id of transaction to get
     * @return {Ext.direct.Transaction}
     */
    getTransaction: function(transaction){
        return transaction.isTransaction ? transaction : this.transactions.get(transaction);
    },

    onProviderData : function(provider, event){
        var me = this,
            i = 0,
            len;

        if (Ext.isArray(event)) {
            for (len = event.length; i < len; ++i) {
                me.onProviderData(provider, event[i]);
            }
            return;
        }
        if (event.name && event.name != 'event' && event.name != 'exception') {
            me.fireEvent(event.name, event);
        } else if (event.status === false) {
            me.fireEvent('exception', event);
        }
        me.fireEvent('event', event, provider);
    }
}, function(){
    // Backwards compatibility
    Ext.Direct = Ext.direct.Manager;
});

