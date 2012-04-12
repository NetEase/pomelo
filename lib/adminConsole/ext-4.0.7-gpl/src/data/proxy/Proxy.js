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
 * Proxies are used by {@link Ext.data.Store Stores} to handle the loading and saving of {@link Ext.data.Model Model}
 * data. Usually developers will not need to create or interact with proxies directly.
 *
 * # Types of Proxy
 *
 * There are two main types of Proxy - {@link Ext.data.proxy.Client Client} and {@link Ext.data.proxy.Server Server}.
 * The Client proxies save their data locally and include the following subclasses:
 *
 * - {@link Ext.data.proxy.LocalStorage LocalStorageProxy} - saves its data to localStorage if the browser supports it
 * - {@link Ext.data.proxy.SessionStorage SessionStorageProxy} - saves its data to sessionStorage if the browsers supports it
 * - {@link Ext.data.proxy.Memory MemoryProxy} - holds data in memory only, any data is lost when the page is refreshed
 *
 * The Server proxies save their data by sending requests to some remote server. These proxies include:
 *
 * - {@link Ext.data.proxy.Ajax Ajax} - sends requests to a server on the same domain
 * - {@link Ext.data.proxy.JsonP JsonP} - uses JSON-P to send requests to a server on a different domain
 * - {@link Ext.data.proxy.Direct Direct} - uses {@link Ext.direct.Manager} to send requests
 *
 * Proxies operate on the principle that all operations performed are either Create, Read, Update or Delete. These four
 * operations are mapped to the methods {@link #create}, {@link #read}, {@link #update} and {@link #destroy}
 * respectively. Each Proxy subclass implements these functions.
 *
 * The CRUD methods each expect an {@link Ext.data.Operation Operation} object as the sole argument. The Operation
 * encapsulates information about the action the Store wishes to perform, the {@link Ext.data.Model model} instances
 * that are to be modified, etc. See the {@link Ext.data.Operation Operation} documentation for more details. Each CRUD
 * method also accepts a callback function to be called asynchronously on completion.
 *
 * Proxies also support batching of Operations via a {@link Ext.data.Batch batch} object, invoked by the {@link #batch}
 * method.
 */
Ext.define('Ext.data.proxy.Proxy', {
    alias: 'proxy.proxy',
    alternateClassName: ['Ext.data.DataProxy', 'Ext.data.Proxy'],
    requires: [
        'Ext.data.reader.Json',
        'Ext.data.writer.Json'
    ],
    uses: [
        'Ext.data.Batch', 
        'Ext.data.Operation', 
        'Ext.data.Model'
    ],
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    /**
     * @cfg {String} batchOrder
     * Comma-separated ordering 'create', 'update' and 'destroy' actions when batching. Override this to set a different
     * order for the batched CRUD actions to be executed in. Defaults to 'create,update,destroy'.
     */
    batchOrder: 'create,update,destroy',
    
    /**
     * @cfg {Boolean} batchActions
     * True to batch actions of a particular type when synchronizing the store. Defaults to true.
     */
    batchActions: true,
    
    /**
     * @cfg {String} defaultReaderType
     * The default registered reader type. Defaults to 'json'.
     * @private
     */
    defaultReaderType: 'json',
    
    /**
     * @cfg {String} defaultWriterType
     * The default registered writer type. Defaults to 'json'.
     * @private
     */
    defaultWriterType: 'json',
    
    /**
     * @cfg {String/Ext.data.Model} model
     * The name of the Model to tie to this Proxy. Can be either the string name of the Model, or a reference to the
     * Model constructor. Required.
     */
    
    /**
     * @cfg {Object/String/Ext.data.reader.Reader} reader
     * The Ext.data.reader.Reader to use to decode the server's response or data read from client. This can either be a
     * Reader instance, a config object or just a valid Reader type name (e.g. 'json', 'xml').
     */
    
    /**
     * @cfg {Object/String/Ext.data.writer.Writer} writer
     * The Ext.data.writer.Writer to use to encode any request sent to the server or saved to client. This can either be
     * a Writer instance, a config object or just a valid Writer type name (e.g. 'json', 'xml').
     */
    
    isProxy: true,
    
    /**
     * Creates the Proxy
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        config = config || {};
        
        if (config.model === undefined) {
            delete config.model;
        }

        this.mixins.observable.constructor.call(this, config);
        
        if (this.model !== undefined && !(this.model instanceof Ext.data.Model)) {
            this.setModel(this.model);
        }
    },
    
    /**
     * Sets the model associated with this proxy. This will only usually be called by a Store
     *
     * @param {String/Ext.data.Model} model The new model. Can be either the model name string,
     * or a reference to the model's constructor
     * @param {Boolean} setOnStore Sets the new model on the associated Store, if one is present
     */
    setModel: function(model, setOnStore) {
        this.model = Ext.ModelManager.getModel(model);
        
        var reader = this.reader,
            writer = this.writer;
        
        this.setReader(reader);
        this.setWriter(writer);
        
        if (setOnStore && this.store) {
            this.store.setModel(this.model);
        }
    },
    
    /**
     * Returns the model attached to this Proxy
     * @return {Ext.data.Model} The model
     */
    getModel: function() {
        return this.model;
    },
    
    /**
     * Sets the Proxy's Reader by string, config object or Reader instance
     *
     * @param {String/Object/Ext.data.reader.Reader} reader The new Reader, which can be either a type string,
     * a configuration object or an Ext.data.reader.Reader instance
     * @return {Ext.data.reader.Reader} The attached Reader object
     */
    setReader: function(reader) {
        var me = this;
        
        if (reader === undefined || typeof reader == 'string') {
            reader = {
                type: reader
            };
        }

        if (reader.isReader) {
            reader.setModel(me.model);
        } else {
            Ext.applyIf(reader, {
                proxy: me,
                model: me.model,
                type : me.defaultReaderType
            });

            reader = Ext.createByAlias('reader.' + reader.type, reader);
        }
        
        me.reader = reader;
        return me.reader;
    },
    
    /**
     * Returns the reader currently attached to this proxy instance
     * @return {Ext.data.reader.Reader} The Reader instance
     */
    getReader: function() {
        return this.reader;
    },
    
    /**
     * Sets the Proxy's Writer by string, config object or Writer instance
     *
     * @param {String/Object/Ext.data.writer.Writer} writer The new Writer, which can be either a type string,
     * a configuration object or an Ext.data.writer.Writer instance
     * @return {Ext.data.writer.Writer} The attached Writer object
     */
    setWriter: function(writer) {
        if (writer === undefined || typeof writer == 'string') {
            writer = {
                type: writer
            };
        }

        if (!(writer instanceof Ext.data.writer.Writer)) {
            Ext.applyIf(writer, {
                model: this.model,
                type : this.defaultWriterType
            });

            writer = Ext.createByAlias('writer.' + writer.type, writer);
        }
        
        this.writer = writer;
        
        return this.writer;
    },
    
    /**
     * Returns the writer currently attached to this proxy instance
     * @return {Ext.data.writer.Writer} The Writer instance
     */
    getWriter: function() {
        return this.writer;
    },
    
    /**
     * Performs the given create operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    create: Ext.emptyFn,
    
    /**
     * Performs the given read operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    read: Ext.emptyFn,
    
    /**
     * Performs the given update operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    update: Ext.emptyFn,
    
    /**
     * Performs the given destroy operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    destroy: Ext.emptyFn,
    
    /**
     * Performs a batch of {@link Ext.data.Operation Operations}, in the order specified by {@link #batchOrder}. Used
     * internally by {@link Ext.data.Store}'s {@link Ext.data.Store#sync sync} method. Example usage:
     *
     *     myProxy.batch({
     *         create : [myModel1, myModel2],
     *         update : [myModel3],
     *         destroy: [myModel4, myModel5]
     *     });
     *
     * Where the myModel* above are {@link Ext.data.Model Model} instances - in this case 1 and 2 are new instances and
     * have not been saved before, 3 has been saved previously but needs to be updated, and 4 and 5 have already been
     * saved but should now be destroyed.
     *
     * @param {Object} operations Object containing the Model instances to act upon, keyed by action name
     * @param {Object} listeners (optional) listeners object passed straight through to the Batch -
     * see {@link Ext.data.Batch}
     * @return {Ext.data.Batch} The newly created Ext.data.Batch object
     */
    batch: function(operations, listeners) {
        var me = this,
            batch = Ext.create('Ext.data.Batch', {
                proxy: me,
                listeners: listeners || {}
            }),
            useBatch = me.batchActions, 
            records;
        
        Ext.each(me.batchOrder.split(','), function(action) {
            records = operations[action];
            if (records) {
                if (useBatch) {
                    batch.add(Ext.create('Ext.data.Operation', {
                        action: action,
                        records: records
                    }));
                } else {
                    Ext.each(records, function(record){
                        batch.add(Ext.create('Ext.data.Operation', {
                            action : action, 
                            records: [record]
                        }));
                    });
                }
            }
        }, me);
        
        batch.start();
        return batch;
    }
}, function() {
    // Ext.data.proxy.ProxyMgr.registerType('proxy', this);
    
    //backwards compatibility
    Ext.data.DataProxy = this;
    // Ext.deprecate('platform', '2.0', function() {
    //     Ext.data.DataProxy = this;
    // }, this);
});

