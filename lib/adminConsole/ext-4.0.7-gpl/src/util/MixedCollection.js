/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.MixedCollection
 * <p>
 * Represents a collection of a set of key and value pairs. Each key in the MixedCollection
 * must be unique, the same key cannot exist twice. This collection is ordered, items in the
 * collection can be accessed by index  or via the key. Newly added items are added to
 * the end of the collection. This class is similar to {@link Ext.util.HashMap} however it
 * is heavier and provides more functionality. Sample usage:
 * <pre><code>
var coll = new Ext.util.MixedCollection();
coll.add('key1', 'val1');
coll.add('key2', 'val2');
coll.add('key3', 'val3');

console.log(coll.get('key1')); // prints 'val1'
console.log(coll.indexOfKey('key3')); // prints 2
 * </code></pre>
 *
 * <p>
 * The MixedCollection also has support for sorting and filtering of the values in the collection.
 * <pre><code>
var coll = new Ext.util.MixedCollection();
coll.add('key1', 100);
coll.add('key2', -100);
coll.add('key3', 17);
coll.add('key4', 0);
var biggerThanZero = coll.filterBy(function(value){
    return value > 0;
});
console.log(biggerThanZero.getCount()); // prints 2
 * </code></pre>
 * </p>
 */
Ext.define('Ext.util.MixedCollection', {
    extend: 'Ext.util.AbstractMixedCollection',
    mixins: {
        sortable: 'Ext.util.Sortable'
    },

    /**
     * Creates new MixedCollection.
     * @param {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
     * function should add function references to the collection. Defaults to
     * <tt>false</tt>.
     * @param {Function} keyFn A function that can accept an item of the type(s) stored in this MixedCollection
     * and return the key value for that item.  This is used when available to look up the key on items that
     * were passed without an explicit key parameter to a MixedCollection method.  Passing this parameter is
     * equivalent to providing an implementation for the {@link #getKey} method.
     */
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        me.addEvents('sort');
        me.mixins.sortable.initSortable.call(me);
    },

    doSort: function(sorterFn) {
        this.sortBy(sorterFn);
    },

    /**
     * @private
     * Performs the actual sorting based on a direction and a sorting function. Internally,
     * this creates a temporary array of all items in the MixedCollection, sorts it and then writes
     * the sorted array data back into this.items and this.keys
     * @param {String} property Property to sort by ('key', 'value', or 'index')
     * @param {String} dir (optional) Direction to sort 'ASC' or 'DESC'. Defaults to 'ASC'.
     * @param {Function} fn (optional) Comparison function that defines the sort order.
     * Defaults to sorting by numeric value.
     */
    _sort : function(property, dir, fn){
        var me = this,
            i, len,
            dsc   = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            //this is a temporary array used to apply the sorting function
            c     = [],
            keys  = me.keys,
            items = me.items;

        //default to a simple sorter function if one is not provided
        fn = fn || function(a, b) {
            return a - b;
        };

        //copy all the items into a temporary array, which we will sort
        for(i = 0, len = items.length; i < len; i++){
            c[c.length] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }

        //sort the temporary array
        Ext.Array.sort(c, function(a, b){
            var v = fn(a[property], b[property]) * dsc;
            if(v === 0){
                v = (a.index < b.index ? -1 : 1);
            }
            return v;
        });

        //copy the temporary array back into the main this.items and this.keys objects
        for(i = 0, len = c.length; i < len; i++){
            items[i] = c[i].value;
            keys[i]  = c[i].key;
        }

        me.fireEvent('sort', me);
    },

    /**
     * Sorts the collection by a single sorter function
     * @param {Function} sorterFn The function to sort by
     */
    sortBy: function(sorterFn) {
        var me     = this,
            items  = me.items,
            keys   = me.keys,
            length = items.length,
            temp   = [],
            i;

        //first we create a copy of the items array so that we can sort it
        for (i = 0; i < length; i++) {
            temp[i] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }

        Ext.Array.sort(temp, function(a, b) {
            var v = sorterFn(a.value, b.value);
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }

            return v;
        });

        //copy the temporary array back into the main this.items and this.keys objects
        for (i = 0; i < length; i++) {
            items[i] = temp[i].value;
            keys[i]  = temp[i].key;
        }
        
        me.fireEvent('sort', me, items, keys);
    },

    /**
     * Reorders each of the items based on a mapping from old index to new index. Internally this
     * just translates into a sort. The 'sort' event is fired whenever reordering has occured.
     * @param {Object} mapping Mapping from old item index to new item index
     */
    reorder: function(mapping) {
        var me = this,
            items = me.items,
            index = 0,
            length = items.length,
            order = [],
            remaining = [],
            oldIndex;

        me.suspendEvents();

        //object of {oldPosition: newPosition} reversed to {newPosition: oldPosition}
        for (oldIndex in mapping) {
            order[mapping[oldIndex]] = items[oldIndex];
        }

        for (index = 0; index < length; index++) {
            if (mapping[index] == undefined) {
                remaining.push(items[index]);
            }
        }

        for (index = 0; index < length; index++) {
            if (order[index] == undefined) {
                order[index] = remaining.shift();
            }
        }

        me.clear();
        me.addAll(order);

        me.resumeEvents();
        me.fireEvent('sort', me);
    },

    /**
     * Sorts this collection by <b>key</b>s.
     * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
     * @param {Function} fn (optional) Comparison function that defines the sort order.
     * Defaults to sorting by case insensitive string.
     */
    sortByKey : function(dir, fn){
        this._sort('key', dir, fn || function(a, b){
            var v1 = String(a).toUpperCase(), v2 = String(b).toUpperCase();
            return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
        });
    }
});

