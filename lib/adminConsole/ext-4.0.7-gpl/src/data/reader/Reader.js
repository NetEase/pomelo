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
 * Readers are used to interpret data to be loaded into a {@link Ext.data.Model Model} instance or a {@link
 * Ext.data.Store Store} - often in response to an AJAX request. In general there is usually no need to create
 * a Reader instance directly, since a Reader is almost always used together with a {@link Ext.data.proxy.Proxy Proxy},
 * and is configured using the Proxy's {@link Ext.data.proxy.Proxy#cfg-reader reader} configuration property:
 * 
 *     Ext.create('Ext.data.Store', {
 *         model: 'User',
 *         proxy: {
 *             type: 'ajax',
 *             url : 'users.json',
 *             reader: {
 *                 type: 'json',
 *                 root: 'users'
 *             }
 *         },
 *     });
 *     
 * The above reader is configured to consume a JSON string that looks something like this:
 *  
 *     {
 *         "success": true,
 *         "users": [
 *             { "name": "User 1" },
 *             { "name": "User 2" }
 *         ]
 *     }
 * 
 *
 * # Loading Nested Data
 *
 * Readers have the ability to automatically load deeply-nested data objects based on the {@link Ext.data.Association
 * associations} configured on each Model. Below is an example demonstrating the flexibility of these associations in a
 * fictional CRM system which manages a User, their Orders, OrderItems and Products. First we'll define the models:
 *
 *     Ext.define("User", {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             'id', 'name'
 *         ],
 *
 *         hasMany: {model: 'Order', name: 'orders'},
 *
 *         proxy: {
 *             type: 'rest',
 *             url : 'users.json',
 *             reader: {
 *                 type: 'json',
 *                 root: 'users'
 *             }
 *         }
 *     });
 *
 *     Ext.define("Order", {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             'id', 'total'
 *         ],
 *
 *         hasMany  : {model: 'OrderItem', name: 'orderItems', associationKey: 'order_items'},
 *         belongsTo: 'User'
 *     });
 *
 *     Ext.define("OrderItem", {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             'id', 'price', 'quantity', 'order_id', 'product_id'
 *         ],
 *
 *         belongsTo: ['Order', {model: 'Product', associationKey: 'product'}]
 *     });
 *
 *     Ext.define("Product", {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             'id', 'name'
 *         ],
 *
 *         hasMany: 'OrderItem'
 *     });
 *
 * This may be a lot to take in - basically a User has many Orders, each of which is composed of several OrderItems.
 * Finally, each OrderItem has a single Product. This allows us to consume data like this:
 *
 *     {
 *         "users": [
 *             {
 *                 "id": 123,
 *                 "name": "Ed",
 *                 "orders": [
 *                     {
 *                         "id": 50,
 *                         "total": 100,
 *                         "order_items": [
 *                             {
 *                                 "id"      : 20,
 *                                 "price"   : 40,
 *                                 "quantity": 2,
 *                                 "product" : {
 *                                     "id": 1000,
 *                                     "name": "MacBook Pro"
 *                                 }
 *                             },
 *                             {
 *                                 "id"      : 21,
 *                                 "price"   : 20,
 *                                 "quantity": 3,
 *                                 "product" : {
 *                                     "id": 1001,
 *                                     "name": "iPhone"
 *                                 }
 *                             }
 *                         ]
 *                     }
 *                 ]
 *             }
 *         ]
 *     }
 *
 * The JSON response is deeply nested - it returns all Users (in this case just 1 for simplicity's sake), all of the
 * Orders for each User (again just 1 in this case), all of the OrderItems for each Order (2 order items in this case),
 * and finally the Product associated with each OrderItem. Now we can read the data and use it as follows:
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         model: "User"
 *     });
 *
 *     store.load({
 *         callback: function() {
 *             //the user that was loaded
 *             var user = store.first();
 *
 *             console.log("Orders for " + user.get('name') + ":")
 *
 *             //iterate over the Orders for each User
 *             user.orders().each(function(order) {
 *                 console.log("Order ID: " + order.getId() + ", which contains items:");
 *
 *                 //iterate over the OrderItems for each Order
 *                 order.orderItems().each(function(orderItem) {
 *                     //we know that the Product data is already loaded, so we can use the synchronous getProduct
 *                     //usually, we would use the asynchronous version (see {@link Ext.data.BelongsToAssociation})
 *                     var product = orderItem.getProduct();
 *
 *                     console.log(orderItem.get('quantity') + ' orders of ' + product.get('name'));
 *                 });
 *             });
 *         }
 *     });
 *
 * Running the code above results in the following:
 *
 *     Orders for Ed:
 *     Order ID: 50, which contains items:
 *     2 orders of MacBook Pro
 *     3 orders of iPhone
 */
Ext.define('Ext.data.reader.Reader', {
    requires: ['Ext.data.ResultSet'],
    alternateClassName: ['Ext.data.Reader', 'Ext.data.DataReader'],
    
    /**
     * @cfg {String} idProperty
     * Name of the property within a row object that contains a record identifier value. Defaults to The id of the
     * model. If an idProperty is explicitly specified it will override that of the one specified on the model
     */

    /**
     * @cfg {String} totalProperty
     * Name of the property from which to retrieve the total number of records in the dataset. This is only needed if
     * the whole dataset is not passed in one go, but is being paged from the remote server. Defaults to total.
     */
    totalProperty: 'total',

    /**
     * @cfg {String} successProperty
     * Name of the property from which to retrieve the success attribute. Defaults to success. See
     * {@link Ext.data.proxy.Server}.{@link Ext.data.proxy.Server#exception exception} for additional information.
     */
    successProperty: 'success',

    /**
     * @cfg {String} root
     * The name of the property which contains the Array of row objects.  For JSON reader it's dot-separated list
     * of property names.  For XML reader it's a CSS selector.  For array reader it's not applicable.
     * 
     * By default the natural root of the data will be used.  The root Json array, the root XML element, or the array.
     *
     * The data packet value for this property should be an empty array to clear the data or show no data.
     */
    root: '',
    
    /**
     * @cfg {String} messageProperty
     * The name of the property which contains a response message. This property is optional.
     */
    
    /**
     * @cfg {Boolean} implicitIncludes
     * True to automatically parse models nested within other models in a response object. See the
     * Ext.data.reader.Reader intro docs for full explanation. Defaults to true.
     */
    implicitIncludes: true,
    
    isReader: true,
    
    /**
     * Creates new Reader.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        var me = this;
        
        Ext.apply(me, config || {});
        me.fieldCount = 0;
        me.model = Ext.ModelManager.getModel(config.model);
        if (me.model) {
            me.buildExtractors();
        }
    },

    /**
     * Sets a new model for the reader.
     * @private
     * @param {Object} model The model to set.
     * @param {Boolean} setOnProxy True to also set on the Proxy, if one is configured
     */
    setModel: function(model, setOnProxy) {
        var me = this;
        
        me.model = Ext.ModelManager.getModel(model);
        me.buildExtractors(true);
        
        if (setOnProxy && me.proxy) {
            me.proxy.setModel(me.model, true);
        }
    },

    /**
     * Reads the given response object. This method normalizes the different types of response object that may be passed
     * to it, before handing off the reading of records to the {@link #readRecords} function.
     * @param {Object} response The response object. This may be either an XMLHttpRequest object or a plain JS object
     * @return {Ext.data.ResultSet} The parsed ResultSet object
     */
    read: function(response) {
        var data = response;
        
        if (response && response.responseText) {
            data = this.getResponseData(response);
        }
        
        if (data) {
            return this.readRecords(data);
        } else {
            return this.nullResultSet;
        }
    },

    /**
     * Abstracts common functionality used by all Reader subclasses. Each subclass is expected to call this function
     * before running its own logic and returning the Ext.data.ResultSet instance. For most Readers additional
     * processing should not be needed.
     * @param {Object} data The raw data object
     * @return {Ext.data.ResultSet} A ResultSet object
     */
    readRecords: function(data) {
        var me  = this;
        
        /*
         * We check here whether the number of fields has changed since the last read.
         * This works around an issue when a Model is used for both a Tree and another
         * source, because the tree decorates the model with extra fields and it causes
         * issues because the readers aren't notified.
         */
        if (me.fieldCount !== me.getFields().length) {
            me.buildExtractors(true);
        }
        
        /**
         * @property {Object} rawData
         * The raw data object that was last passed to readRecords. Stored for further processing if needed
         */
        me.rawData = data;

        data = me.getData(data);

        // If we pass an array as the data, we dont use getRoot on the data.
        // Instead the root equals to the data.
        var root    = Ext.isArray(data) ? data : me.getRoot(data),
            success = true,
            recordCount = 0,
            total, value, records, message;
            
        if (root) {
            total = root.length;
        }

        if (me.totalProperty) {
            value = parseInt(me.getTotal(data), 10);
            if (!isNaN(value)) {
                total = value;
            }
        }

        if (me.successProperty) {
            value = me.getSuccess(data);
            if (value === false || value === 'false') {
                success = false;
            }
        }
        
        if (me.messageProperty) {
            message = me.getMessage(data);
        }
        
        if (root) {
            records = me.extractData(root);
            recordCount = records.length;
        } else {
            recordCount = 0;
            records = [];
        }

        return Ext.create('Ext.data.ResultSet', {
            total  : total || recordCount,
            count  : recordCount,
            records: records,
            success: success,
            message: message
        });
    },

    /**
     * Returns extracted, type-cast rows of data.  Iterates to call #extractValues for each row
     * @param {Object[]/Object} root from server response
     * @private
     */
    extractData : function(root) {
        var me = this,
            values  = [],
            records = [],
            Model   = me.model,
            i       = 0,
            length  = root.length,
            idProp  = me.getIdProperty(),
            node, id, record;
            
        if (!root.length && Ext.isObject(root)) {
            root = [root];
            length = 1;
        }

        for (; i < length; i++) {
            node   = root[i];
            values = me.extractValues(node);
            id     = me.getId(node);

            
            record = new Model(values, id, node);
            records.push(record);
                
            if (me.implicitIncludes) {
                me.readAssociated(record, node);
            }
        }

        return records;
    },
    
    /**
     * @private
     * Loads a record's associations from the data object. This prepopulates hasMany and belongsTo associations
     * on the record provided.
     * @param {Ext.data.Model} record The record to load associations for
     * @param {Object} data The data object
     * @return {String} Return value description
     */
    readAssociated: function(record, data) {
        var associations = record.associations.items,
            i            = 0,
            length       = associations.length,
            association, associationData, proxy, reader;
        
        for (; i < length; i++) {
            association     = associations[i];
            associationData = this.getAssociatedDataRoot(data, association.associationKey || association.name);
            
            if (associationData) {
                reader = association.getReader();
                if (!reader) {
                    proxy = association.associatedModel.proxy;
                    // if the associated model has a Reader already, use that, otherwise attempt to create a sensible one
                    if (proxy) {
                        reader = proxy.getReader();
                    } else {
                        reader = new this.constructor({
                            model: association.associatedName
                        });
                    }
                }
                association.read(record, reader, associationData);
            }  
        }
    },
    
    /**
     * @private
     * Used internally by {@link #readAssociated}. Given a data object (which could be json, xml etc) for a specific
     * record, this should return the relevant part of that data for the given association name. This is only really
     * needed to support the XML Reader, which has to do a query to get the associated data object
     * @param {Object} data The raw data object
     * @param {String} associationName The name of the association to get data for (uses associationKey if present)
     * @return {Object} The root
     */
    getAssociatedDataRoot: function(data, associationName) {
        return data[associationName];
    },
    
    getFields: function() {
        return this.model.prototype.fields.items;
    },

    /**
     * @private
     * Given an object representing a single model instance's data, iterates over the model's fields and
     * builds an object with the value for each field.
     * @param {Object} data The data object to convert
     * @return {Object} Data object suitable for use with a model constructor
     */
    extractValues: function(data) {
        var fields = this.getFields(),
            i      = 0,
            length = fields.length,
            output = {},
            field, value;

        for (; i < length; i++) {
            field = fields[i];
            value = this.extractorFunctions[i](data);

            output[field.name] = value;
        }

        return output;
    },

    /**
     * @private
     * By default this function just returns what is passed to it. It can be overridden in a subclass
     * to return something else. See XmlReader for an example.
     * @param {Object} data The data object
     * @return {Object} The normalized data object
     */
    getData: function(data) {
        return data;
    },

    /**
     * @private
     * This will usually need to be implemented in a subclass. Given a generic data object (the type depends on the type
     * of data we are reading), this function should return the object as configured by the Reader's 'root' meta data config.
     * See XmlReader's getRoot implementation for an example. By default the same data object will simply be returned.
     * @param {Object} data The data object
     * @return {Object} The same data object
     */
    getRoot: function(data) {
        return data;
    },

    /**
     * Takes a raw response object (as passed to this.read) and returns the useful data segment of it. This must be
     * implemented by each subclass
     * @param {Object} response The responce object
     * @return {Object} The useful data from the response
     */
    getResponseData: function(response) {
        //<debug>
        Ext.Error.raise("getResponseData must be implemented in the Ext.data.reader.Reader subclass");
        //</debug>
    },

    /**
     * @private
     * Reconfigures the meta data tied to this Reader
     */
    onMetaChange : function(meta) {
        var fields = meta.fields,
            newModel;
        
        Ext.apply(this, meta);
        
        if (fields) {
            newModel = Ext.define("Ext.data.reader.Json-Model" + Ext.id(), {
                extend: 'Ext.data.Model',
                fields: fields
            });
            this.setModel(newModel, true);
        } else {
            this.buildExtractors(true);
        }
    },
    
    /**
     * Get the idProperty to use for extracting data
     * @private
     * @return {String} The id property
     */
    getIdProperty: function(){
        var prop = this.idProperty;
        if (Ext.isEmpty(prop)) {
            prop = this.model.prototype.idProperty;
        }
        return prop;
    },

    /**
     * @private
     * This builds optimized functions for retrieving record data and meta data from an object.
     * Subclasses may need to implement their own getRoot function.
     * @param {Boolean} [force=false] True to automatically remove existing extractor functions first
     */
    buildExtractors: function(force) {
        var me          = this,
            idProp      = me.getIdProperty(),
            totalProp   = me.totalProperty,
            successProp = me.successProperty,
            messageProp = me.messageProperty,
            accessor;
            
        if (force === true) {
            delete me.extractorFunctions;
        }
        
        if (me.extractorFunctions) {
            return;
        }   

        //build the extractors for all the meta data
        if (totalProp) {
            me.getTotal = me.createAccessor(totalProp);
        }

        if (successProp) {
            me.getSuccess = me.createAccessor(successProp);
        }

        if (messageProp) {
            me.getMessage = me.createAccessor(messageProp);
        }

        if (idProp) {
            accessor = me.createAccessor(idProp);

            me.getId = function(record) {
                var id = accessor.call(me, record);
                return (id === undefined || id === '') ? null : id;
            };
        } else {
            me.getId = function() {
                return null;
            };
        }
        me.buildFieldExtractors();
    },

    /**
     * @private
     */
    buildFieldExtractors: function() {
        //now build the extractors for all the fields
        var me = this,
            fields = me.getFields(),
            ln = fields.length,
            i  = 0,
            extractorFunctions = [],
            field, map;

        for (; i < ln; i++) {
            field = fields[i];
            map   = (field.mapping !== undefined && field.mapping !== null) ? field.mapping : field.name;

            extractorFunctions.push(me.createAccessor(map));
        }
        me.fieldCount = ln;

        me.extractorFunctions = extractorFunctions;
    }
}, function() {
    Ext.apply(this, {
        // Private. Empty ResultSet to return when response is falsy (null|undefined|empty string)
        nullResultSet: Ext.create('Ext.data.ResultSet', {
            total  : 0,
            count  : 0,
            records: [],
            success: true
        })
    });
});
