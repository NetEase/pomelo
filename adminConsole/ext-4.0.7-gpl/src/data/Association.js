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
 * Associations enable you to express relationships between different {@link Ext.data.Model Models}. Let's say we're
 * writing an ecommerce system where Users can make Orders - there's a relationship between these Models that we can
 * express like this:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'name', 'email'],
 *
 *         hasMany: {model: 'Order', name: 'orders'}
 *     });
 *
 *     Ext.define('Order', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'user_id', 'status', 'price'],
 *
 *         belongsTo: 'User'
 *     });
 *
 * We've set up two models - User and Order - and told them about each other. You can set up as many associations on
 * each Model as you need using the two default types - {@link Ext.data.HasManyAssociation hasMany} and {@link
 * Ext.data.BelongsToAssociation belongsTo}. There's much more detail on the usage of each of those inside their
 * documentation pages. If you're not familiar with Models already, {@link Ext.data.Model there is plenty on those too}.
 *
 * **Further Reading**
 *
 *   - {@link Ext.data.HasManyAssociation hasMany associations}
 *   - {@link Ext.data.BelongsToAssociation belongsTo associations}
 *   - {@link Ext.data.Model using Models}
 *
 * # Self association models
 *
 * We can also have models that create parent/child associations between the same type. Below is an example, where
 * groups can be nested inside other groups:
 *
 *     // Server Data
 *     {
 *         "groups": {
 *             "id": 10,
 *             "parent_id": 100,
 *             "name": "Main Group",
 *             "parent_group": {
 *                 "id": 100,
 *                 "parent_id": null,
 *                 "name": "Parent Group"
 *             },
 *             "child_groups": [{
 *                 "id": 2,
 *                 "parent_id": 10,
 *                 "name": "Child Group 1"
 *             },{
 *                 "id": 3,
 *                 "parent_id": 10,
 *                 "name": "Child Group 2"
 *             },{
 *                 "id": 4,
 *                 "parent_id": 10,
 *                 "name": "Child Group 3"
 *             }]
 *         }
 *     }
 *
 *     // Client code
 *     Ext.define('Group', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'parent_id', 'name'],
 *         proxy: {
 *             type: 'ajax',
 *             url: 'data.json',
 *             reader: {
 *                 type: 'json',
 *                 root: 'groups'
 *             }
 *         },
 *         associations: [{
 *             type: 'hasMany',
 *             model: 'Group',
 *             primaryKey: 'id',
 *             foreignKey: 'parent_id',
 *             autoLoad: true,
 *             associationKey: 'child_groups' // read child data from child_groups
 *         }, {
 *             type: 'belongsTo',
 *             model: 'Group',
 *             primaryKey: 'id',
 *             foreignKey: 'parent_id',
 *             associationKey: 'parent_group' // read parent data from parent_group
 *         }]
 *     });
 *
 *     Ext.onReady(function(){
 *
 *         Group.load(10, {
 *             success: function(group){
 *                 console.log(group.getGroup().get('name'));
 *
 *                 group.groups().each(function(rec){
 *                     console.log(rec.get('name'));
 *                 });
 *             }
 *         });
 *
 *     });
 *
 */
Ext.define('Ext.data.Association', {
    /**
     * @cfg {String} ownerModel (required)
     * The string name of the model that owns the association.
     */

    /**
     * @cfg {String} associatedModel (required)
     * The string name of the model that is being associated with.
     */

    /**
     * @cfg {String} primaryKey
     * The name of the primary key on the associated model. In general this will be the
     * {@link Ext.data.Model#idProperty} of the Model.
     */
    primaryKey: 'id',

    /**
     * @cfg {Ext.data.reader.Reader} reader
     * A special reader to read associated data
     */
    
    /**
     * @cfg {String} associationKey
     * The name of the property in the data to read the association from. Defaults to the name of the associated model.
     */

    defaultReaderType: 'json',

    statics: {
        create: function(association){
            if (!association.isAssociation) {
                if (Ext.isString(association)) {
                    association = {
                        type: association
                    };
                }

                switch (association.type) {
                    case 'belongsTo':
                        return Ext.create('Ext.data.BelongsToAssociation', association);
                    case 'hasMany':
                        return Ext.create('Ext.data.HasManyAssociation', association);
                    //TODO Add this back when it's fixed
//                    case 'polymorphic':
//                        return Ext.create('Ext.data.PolymorphicAssociation', association);
                    default:
                        //<debug>
                        Ext.Error.raise('Unknown Association type: "' + association.type + '"');
                        //</debug>
                }
            }
            return association;
        }
    },

    /**
     * Creates the Association object.
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        Ext.apply(this, config);

        var types           = Ext.ModelManager.types,
            ownerName       = config.ownerModel,
            associatedName  = config.associatedModel,
            ownerModel      = types[ownerName],
            associatedModel = types[associatedName],
            ownerProto;

        //<debug>
        if (ownerModel === undefined) {
            Ext.Error.raise("The configured ownerModel was not valid (you tried " + ownerName + ")");
        }
        if (associatedModel === undefined) {
            Ext.Error.raise("The configured associatedModel was not valid (you tried " + associatedName + ")");
        }
        //</debug>

        this.ownerModel = ownerModel;
        this.associatedModel = associatedModel;

        /**
         * @property {String} ownerName
         * The name of the model that 'owns' the association
         */

        /**
         * @property {String} associatedName
         * The name of the model is on the other end of the association (e.g. if a User model hasMany Orders, this is
         * 'Order')
         */

        Ext.applyIf(this, {
            ownerName : ownerName,
            associatedName: associatedName
        });
    },

    /**
     * Get a specialized reader for reading associated data
     * @return {Ext.data.reader.Reader} The reader, null if not supplied
     */
    getReader: function(){
        var me = this,
            reader = me.reader,
            model = me.associatedModel;

        if (reader) {
            if (Ext.isString(reader)) {
                reader = {
                    type: reader
                };
            }
            if (reader.isReader) {
                reader.setModel(model);
            } else {
                Ext.applyIf(reader, {
                    model: model,
                    type : me.defaultReaderType
                });
            }
            me.reader = Ext.createByAlias('reader.' + reader.type, reader);
        }
        return me.reader || null;
    }
});

