/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Base Manager class
 */
Ext.define('Ext.AbstractManager', {

    /* Begin Definitions */

    requires: ['Ext.util.HashMap'],

    /* End Definitions */

    typeName: 'type',

    constructor: function(config) {
        Ext.apply(this, config || {});

        /**
         * @property {Ext.util.HashMap} all
         * Contains all of the items currently managed
         */
        this.all = Ext.create('Ext.util.HashMap');

        this.types = {};
    },

    /**
     * Returns an item by id.
     * For additional details see {@link Ext.util.HashMap#get}.
     * @param {String} id The id of the item
     * @return {Object} The item, undefined if not found.
     */
    get : function(id) {
        return this.all.get(id);
    },

    /**
     * Registers an item to be managed
     * @param {Object} item The item to register
     */
    register: function(item) {
        //<debug>
        var all = this.all,
            key = all.getKey(item);
            
        if (all.containsKey(key)) {
            Ext.Error.raise('Registering duplicate id "' + key + '" with this manager');
        }
        //</debug>
        this.all.add(item);
    },

    /**
     * Unregisters an item by removing it from this manager
     * @param {Object} item The item to unregister
     */
    unregister: function(item) {
        this.all.remove(item);
    },

    /**
     * Registers a new item constructor, keyed by a type key.
     * @param {String} type The mnemonic string by which the class may be looked up.
     * @param {Function} cls The new instance class.
     */
    registerType : function(type, cls) {
        this.types[type] = cls;
        cls[this.typeName] = type;
    },

    /**
     * Checks if an item type is registered.
     * @param {String} type The mnemonic string by which the class may be looked up
     * @return {Boolean} Whether the type is registered.
     */
    isRegistered : function(type){
        return this.types[type] !== undefined;
    },

    /**
     * Creates and returns an instance of whatever this manager manages, based on the supplied type and
     * config object.
     * @param {Object} config The config object
     * @param {String} defaultType If no type is discovered in the config object, we fall back to this type
     * @return {Object} The instance of whatever this manager is managing
     */
    create: function(config, defaultType) {
        var type        = config[this.typeName] || config.type || defaultType,
            Constructor = this.types[type];

        //<debug>
        if (Constructor === undefined) {
            Ext.Error.raise("The '" + type + "' type has not been registered with this manager");
        }
        //</debug>

        return new Constructor(config);
    },

    /**
     * Registers a function that will be called when an item with the specified id is added to the manager.
     * This will happen on instantiation.
     * @param {String} id The item id
     * @param {Function} fn The callback function. Called with a single parameter, the item.
     * @param {Object} scope The scope (this reference) in which the callback is executed.
     * Defaults to the item.
     */
    onAvailable : function(id, fn, scope){
        var all = this.all,
            item;
        
        if (all.containsKey(id)) {
            item = all.get(id);
            fn.call(scope || item, item);
        } else {
            all.on('add', function(map, key, item){
                if (key == id) {
                    fn.call(scope || item, item);
                    all.un('add', fn, scope);
                }
            });
        }
    },
    
    /**
     * Executes the specified function once for each item in the collection.
     * @param {Function} fn The function to execute.
     * @param {String} fn.key The key of the item
     * @param {Number} fn.value The value of the item
     * @param {Number} fn.length The total number of items in the collection
     * @param {Boolean} fn.return False to cease iteration.
     * @param {Object} scope The scope to execute in. Defaults to `this`.
     */
    each: function(fn, scope){
        this.all.each(fn, scope || this);    
    },
    
    /**
     * Gets the number of items in the collection.
     * @return {Number} The number of items in the collection.
     */
    getCount: function(){
        return this.all.getCount();
    }
});

