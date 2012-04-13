/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.HashMap
 * <p>
 * Represents a collection of a set of key and value pairs. Each key in the HashMap
 * must be unique, the same key cannot exist twice. Access to items is provided via
 * the key only. Sample usage:
 * <pre><code>
var map = new Ext.util.HashMap();
map.add('key1', 1);
map.add('key2', 2);
map.add('key3', 3);

map.each(function(key, value, length){
    console.log(key, value, length);
});
 * </code></pre>
 * </p>
 *
 * <p>The HashMap is an unordered class,
 * there is no guarantee when iterating over the items that they will be in any particular
 * order. If this is required, then use a {@link Ext.util.MixedCollection}.
 * </p>
 */
Ext.define('Ext.util.HashMap', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {Function} keyFn A function that is used to retrieve a default key for a passed object.
     * A default is provided that returns the <b>id</b> property on the object. This function is only used
     * if the add method is called with a single argument.
     */

    /**
     * Creates new HashMap.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        config = config || {};
        
        var me = this,
            keyFn = config.keyFn;

        me.addEvents(
            /**
             * @event add
             * Fires when a new item is added to the hash
             * @param {Ext.util.HashMap} this.
             * @param {String} key The key of the added item.
             * @param {Object} value The value of the added item.
             */
            'add',
            /**
             * @event clear
             * Fires when the hash is cleared.
             * @param {Ext.util.HashMap} this.
             */
            'clear',
            /**
             * @event remove
             * Fires when an item is removed from the hash.
             * @param {Ext.util.HashMap} this.
             * @param {String} key The key of the removed item.
             * @param {Object} value The value of the removed item.
             */
            'remove',
            /**
             * @event replace
             * Fires when an item is replaced in the hash.
             * @param {Ext.util.HashMap} this.
             * @param {String} key The key of the replaced item.
             * @param {Object} value The new value for the item.
             * @param {Object} old The old value for the item.
             */
            'replace'
        );

        me.mixins.observable.constructor.call(me, config);
        me.clear(true);
        
        if (keyFn) {
            me.getKey = keyFn;
        }
    },

    /**
     * Gets the number of items in the hash.
     * @return {Number} The number of items in the hash.
     */
    getCount: function() {
        return this.length;
    },

    /**
     * Implementation for being able to extract the key from an object if only
     * a single argument is passed.
     * @private
     * @param {String} key The key
     * @param {Object} value The value
     * @return {Array} [key, value]
     */
    getData: function(key, value) {
        // if we have no value, it means we need to get the key from the object
        if (value === undefined) {
            value = key;
            key = this.getKey(value);
        }

        return [key, value];
    },

    /**
     * Extracts the key from an object. This is a default implementation, it may be overridden
     * @param {Object} o The object to get the key from
     * @return {String} The key to use.
     */
    getKey: function(o) {
        return o.id;
    },

    /**
     * Adds an item to the collection. Fires the {@link #add} event when complete.
     * @param {String} key <p>The key to associate with the item, or the new item.</p>
     * <p>If a {@link #getKey} implementation was specified for this HashMap,
     * or if the key of the stored items is in a property called <tt><b>id</b></tt>,
     * the HashMap will be able to <i>derive</i> the key for the new item.
     * In this case just pass the new item in this parameter.</p>
     * @param {Object} o The item to add.
     * @return {Object} The item added.
     */
    add: function(key, value) {
        var me = this,
            data;

        if (arguments.length === 1) {
            value = key;
            key = me.getKey(value);
        }

        if (me.containsKey(key)) {
            return me.replace(key, value);
        }

        data = me.getData(key, value);
        key = data[0];
        value = data[1];
        me.map[key] = value;
        ++me.length;
        me.fireEvent('add', me, key, value);
        return value;
    },

    /**
     * Replaces an item in the hash. If the key doesn't exist, the
     * {@link #add} method will be used.
     * @param {String} key The key of the item.
     * @param {Object} value The new value for the item.
     * @return {Object} The new value of the item.
     */
    replace: function(key, value) {
        var me = this,
            map = me.map,
            old;

        if (!me.containsKey(key)) {
            me.add(key, value);
        }
        old = map[key];
        map[key] = value;
        me.fireEvent('replace', me, key, value, old);
        return value;
    },

    /**
     * Remove an item from the hash.
     * @param {Object} o The value of the item to remove.
     * @return {Boolean} True if the item was successfully removed.
     */
    remove: function(o) {
        var key = this.findKey(o);
        if (key !== undefined) {
            return this.removeAtKey(key);
        }
        return false;
    },

    /**
     * Remove an item from the hash.
     * @param {String} key The key to remove.
     * @return {Boolean} True if the item was successfully removed.
     */
    removeAtKey: function(key) {
        var me = this,
            value;

        if (me.containsKey(key)) {
            value = me.map[key];
            delete me.map[key];
            --me.length;
            me.fireEvent('remove', me, key, value);
            return true;
        }
        return false;
    },

    /**
     * Retrieves an item with a particular key.
     * @param {String} key The key to lookup.
     * @return {Object} The value at that key. If it doesn't exist, <tt>undefined</tt> is returned.
     */
    get: function(key) {
        return this.map[key];
    },

    /**
     * Removes all items from the hash.
     * @return {Ext.util.HashMap} this
     */
    clear: function(/* private */ initial) {
        var me = this;
        me.map = {};
        me.length = 0;
        if (initial !== true) {
            me.fireEvent('clear', me);
        }
        return me;
    },

    /**
     * Checks whether a key exists in the hash.
     * @param {String} key The key to check for.
     * @return {Boolean} True if they key exists in the hash.
     */
    containsKey: function(key) {
        return this.map[key] !== undefined;
    },

    /**
     * Checks whether a value exists in the hash.
     * @param {Object} value The value to check for.
     * @return {Boolean} True if the value exists in the dictionary.
     */
    contains: function(value) {
        return this.containsKey(this.findKey(value));
    },

    /**
     * Return all of the keys in the hash.
     * @return {Array} An array of keys.
     */
    getKeys: function() {
        return this.getArray(true);
    },

    /**
     * Return all of the values in the hash.
     * @return {Array} An array of values.
     */
    getValues: function() {
        return this.getArray(false);
    },

    /**
     * Gets either the keys/values in an array from the hash.
     * @private
     * @param {Boolean} isKey True to extract the keys, otherwise, the value
     * @return {Array} An array of either keys/values from the hash.
     */
    getArray: function(isKey) {
        var arr = [],
            key,
            map = this.map;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                arr.push(isKey ? key: map[key]);
            }
        }
        return arr;
    },

    /**
     * Executes the specified function once for each item in the hash.
     * Returning false from the function will cease iteration.
     *
     * The paramaters passed to the function are:
     * <div class="mdetail-params"><ul>
     * <li><b>key</b> : String<p class="sub-desc">The key of the item</p></li>
     * <li><b>value</b> : Number<p class="sub-desc">The value of the item</p></li>
     * <li><b>length</b> : Number<p class="sub-desc">The total number of items in the hash</p></li>
     * </ul></div>
     * @param {Function} fn The function to execute.
     * @param {Object} scope The scope to execute in. Defaults to <tt>this</tt>.
     * @return {Ext.util.HashMap} this
     */
    each: function(fn, scope) {
        // copy items so they may be removed during iteration.
        var items = Ext.apply({}, this.map),
            key,
            length = this.length;

        scope = scope || this;
        for (key in items) {
            if (items.hasOwnProperty(key)) {
                if (fn.call(scope, key, items[key], length) === false) {
                    break;
                }
            }
        }
        return this;
    },

    /**
     * Performs a shallow copy on this hash.
     * @return {Ext.util.HashMap} The new hash object.
     */
    clone: function() {
        var hash = new this.self(),
            map = this.map,
            key;

        hash.suspendEvents();
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                hash.add(key, map[key]);
            }
        }
        hash.resumeEvents();
        return hash;
    },

    /**
     * @private
     * Find the key for a value.
     * @param {Object} value The value to find.
     * @return {Object} The value of the item. Returns <tt>undefined</tt> if not found.
     */
    findKey: function(value) {
        var key,
            map = this.map;

        for (key in map) {
            if (map.hasOwnProperty(key) && map[key] === value) {
                return key;
            }
        }
        return undefined;
    }
});

