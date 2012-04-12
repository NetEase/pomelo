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
 * @class Ext.data.BelongsToAssociation
 * @extends Ext.data.Association
 *
 * Represents a many to one association with another model. The owner model is expected to have
 * a foreign key which references the primary key of the associated model:
 *
 *     Ext.define('Category', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             { name: 'id',   type: 'int' },
 *             { name: 'name', type: 'string' }
 *         ]
 *     });
 *
 *     Ext.define('Product', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             { name: 'id',          type: 'int' },
 *             { name: 'category_id', type: 'int' },
 *             { name: 'name',        type: 'string' }
 *         ],
 *         // we can use the belongsTo shortcut on the model to create a belongsTo association
 *         associations: [
 *             { type: 'belongsTo', model: 'Category' }
 *         ]
 *     });
 *
 * In the example above we have created models for Products and Categories, and linked them together
 * by saying that each Product belongs to a Category. This automatically links each Product to a Category
 * based on the Product's category_id, and provides new functions on the Product model:
 *
 * ## Generated getter function
 *
 * The first function that is added to the owner model is a getter function:
 *
 *     var product = new Product({
 *         id: 100,
 *         category_id: 20,
 *         name: 'Sneakers'
 *     });
 *
 *     product.getCategory(function(category, operation) {
 *         // do something with the category object
 *         alert(category.get('id')); // alerts 20
 *     }, this);
 *
 * The getCategory function was created on the Product model when we defined the association. This uses the
 * Category's configured {@link Ext.data.proxy.Proxy proxy} to load the Category asynchronously, calling the provided
 * callback when it has loaded.
 *
 * The new getCategory function will also accept an object containing success, failure and callback properties
 * - callback will always be called, success will only be called if the associated model was loaded successfully
 * and failure will only be called if the associatied model could not be loaded:
 *
 *     product.getCategory({
 *         callback: function(category, operation) {}, // a function that will always be called
 *         success : function(category, operation) {}, // a function that will only be called if the load succeeded
 *         failure : function(category, operation) {}, // a function that will only be called if the load did not succeed
 *         scope   : this // optionally pass in a scope object to execute the callbacks in
 *     });
 *
 * In each case above the callbacks are called with two arguments - the associated model instance and the
 * {@link Ext.data.Operation operation} object that was executed to load that instance. The Operation object is
 * useful when the instance could not be loaded.
 *
 * ## Generated setter function
 *
 * The second generated function sets the associated model instance - if only a single argument is passed to
 * the setter then the following two calls are identical:
 *
 *     // this call...
 *     product.setCategory(10);
 *
 *     // is equivalent to this call:
 *     product.set('category_id', 10);
 *
 * If we pass in a second argument, the model will be automatically saved and the second argument passed to
 * the owner model's {@link Ext.data.Model#save save} method:
 *
 *     product.setCategory(10, function(product, operation) {
 *         // the product has been saved
 *         alert(product.get('category_id')); //now alerts 10
 *     });
 *
 *     //alternative syntax:
 *     product.setCategory(10, {
 *         callback: function(product, operation), // a function that will always be called
 *         success : function(product, operation), // a function that will only be called if the load succeeded
 *         failure : function(product, operation), // a function that will only be called if the load did not succeed
 *         scope   : this //optionally pass in a scope object to execute the callbacks in
 *     })
 *
 * ## Customisation
 *
 * Associations reflect on the models they are linking to automatically set up properties such as the
 * {@link #primaryKey} and {@link #foreignKey}. These can alternatively be specified:
 *
 *     Ext.define('Product', {
 *         fields: [...],
 *
 *         associations: [
 *             { type: 'belongsTo', model: 'Category', primaryKey: 'unique_id', foreignKey: 'cat_id' }
 *         ]
 *     });
 *
 * Here we replaced the default primary key (defaults to 'id') and foreign key (calculated as 'category_id')
 * with our own settings. Usually this will not be needed.
 */
Ext.define('Ext.data.BelongsToAssociation', {
    extend: 'Ext.data.Association',

    alias: 'association.belongsto',

    /**
     * @cfg {String} foreignKey The name of the foreign key on the owner model that links it to the associated
     * model. Defaults to the lowercased name of the associated model plus "_id", e.g. an association with a
     * model called Product would set up a product_id foreign key.
     *
     *     Ext.define('Order', {
     *         extend: 'Ext.data.Model',
     *         fields: ['id', 'date'],
     *         hasMany: 'Product'
     *     });
     *
     *     Ext.define('Product', {
     *         extend: 'Ext.data.Model',
     *         fields: ['id', 'name', 'order_id'], // refers to the id of the order that this product belongs to
     *         belongsTo: 'Group'
     *     });
     *     var product = new Product({
     *         id: 1,
     *         name: 'Product 1',
     *         order_id: 22
     *     }, 1);
     *     product.getOrder(); // Will make a call to the server asking for order_id 22
     *
     */

    /**
     * @cfg {String} getterName The name of the getter function that will be added to the local model's prototype.
     * Defaults to 'get' + the name of the foreign model, e.g. getCategory
     */

    /**
     * @cfg {String} setterName The name of the setter function that will be added to the local model's prototype.
     * Defaults to 'set' + the name of the foreign model, e.g. setCategory
     */

    /**
     * @cfg {String} type The type configuration can be used when creating associations using a configuration object.
     * Use 'belongsTo' to create a HasManyAssocation
     *
     *     associations: [{
     *         type: 'belongsTo',
     *         model: 'User'
     *     }]
     */
    constructor: function(config) {
        this.callParent(arguments);

        var me             = this,
            ownerProto     = me.ownerModel.prototype,
            associatedName = me.associatedName,
            getterName     = me.getterName || 'get' + associatedName,
            setterName     = me.setterName || 'set' + associatedName;

        Ext.applyIf(me, {
            name        : associatedName,
            foreignKey  : associatedName.toLowerCase() + "_id",
            instanceName: associatedName + 'BelongsToInstance',
            associationKey: associatedName.toLowerCase()
        });

        ownerProto[getterName] = me.createGetter();
        ownerProto[setterName] = me.createSetter();
    },

    /**
     * @private
     * Returns a setter function to be placed on the owner model's prototype
     * @return {Function} The setter function
     */
    createSetter: function() {
        var me              = this,
            ownerModel      = me.ownerModel,
            associatedModel = me.associatedModel,
            foreignKey      = me.foreignKey,
            primaryKey      = me.primaryKey;

        //'this' refers to the Model instance inside this function
        return function(value, options, scope) {
            this.set(foreignKey, value);

            if (typeof options == 'function') {
                options = {
                    callback: options,
                    scope: scope || this
                };
            }

            if (Ext.isObject(options)) {
                return this.save(options);
            }
        };
    },

    /**
     * @private
     * Returns a getter function to be placed on the owner model's prototype. We cache the loaded instance
     * the first time it is loaded so that subsequent calls to the getter always receive the same reference.
     * @return {Function} The getter function
     */
    createGetter: function() {
        var me              = this,
            ownerModel      = me.ownerModel,
            associatedName  = me.associatedName,
            associatedModel = me.associatedModel,
            foreignKey      = me.foreignKey,
            primaryKey      = me.primaryKey,
            instanceName    = me.instanceName;

        //'this' refers to the Model instance inside this function
        return function(options, scope) {
            options = options || {};

            var model = this,
                foreignKeyId = model.get(foreignKey),
                instance,
                args;

            if (model[instanceName] === undefined) {
                instance = Ext.ModelManager.create({}, associatedName);
                instance.set(primaryKey, foreignKeyId);

                if (typeof options == 'function') {
                    options = {
                        callback: options,
                        scope: scope || model
                    };
                }

                associatedModel.load(foreignKeyId, options);
                model[instanceName] = associatedModel;
                return associatedModel;
            } else {
                instance = model[instanceName];
                args = [instance];
                scope = scope || model;

                //TODO: We're duplicating the callback invokation code that the instance.load() call above
                //makes here - ought to be able to normalize this - perhaps by caching at the Model.load layer
                //instead of the association layer.
                Ext.callback(options, scope, args);
                Ext.callback(options.success, scope, args);
                Ext.callback(options.failure, scope, args);
                Ext.callback(options.callback, scope, args);

                return instance;
            }
        };
    },

    /**
     * Read associated data
     * @private
     * @param {Ext.data.Model} record The record we're writing to
     * @param {Ext.data.reader.Reader} reader The reader for the associated model
     * @param {Object} associationData The raw associated data
     */
    read: function(record, reader, associationData){
        record[this.instanceName] = reader.read([associationData]).records[0];
    }
});

