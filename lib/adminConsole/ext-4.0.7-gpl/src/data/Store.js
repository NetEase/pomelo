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
 * @class Ext.data.Store
 * @extends Ext.data.AbstractStore
 *
 * <p>The Store class encapsulates a client side cache of {@link Ext.data.Model Model} objects. Stores load
 * data via a {@link Ext.data.proxy.Proxy Proxy}, and also provide functions for {@link #sort sorting},
 * {@link #filter filtering} and querying the {@link Ext.data.Model model} instances contained within it.</p>
 *
 * <p>Creating a Store is easy - we just tell it the Model and the Proxy to use to load and save its data:</p>
 *
<pre><code>
// Set up a {@link Ext.data.Model model} to use in our Store
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'firstName', type: 'string'},
        {name: 'lastName',  type: 'string'},
        {name: 'age',       type: 'int'},
        {name: 'eyeColor',  type: 'string'}
    ]
});

var myStore = Ext.create('Ext.data.Store', {
    model: 'User',
    proxy: {
        type: 'ajax',
        url : '/users.json',
        reader: {
            type: 'json',
            root: 'users'
        }
    },
    autoLoad: true
});
</code></pre>

 * <p>In the example above we configured an AJAX proxy to load data from the url '/users.json'. We told our Proxy
 * to use a {@link Ext.data.reader.Json JsonReader} to parse the response from the server into Model object -
 * {@link Ext.data.reader.Json see the docs on JsonReader} for details.</p>
 *
 * <p><u>Inline data</u></p>
 *
 * <p>Stores can also load data inline. Internally, Store converts each of the objects we pass in as {@link #data}
 * into Model instances:</p>
 *
<pre><code>
Ext.create('Ext.data.Store', {
    model: 'User',
    data : [
        {firstName: 'Ed',    lastName: 'Spencer'},
        {firstName: 'Tommy', lastName: 'Maintz'},
        {firstName: 'Aaron', lastName: 'Conran'},
        {firstName: 'Jamie', lastName: 'Avins'}
    ]
});
</code></pre>
 *
 * <p>Loading inline data using the method above is great if the data is in the correct format already (e.g. it doesn't need
 * to be processed by a {@link Ext.data.reader.Reader reader}). If your inline data requires processing to decode the data structure,
 * use a {@link Ext.data.proxy.Memory MemoryProxy} instead (see the {@link Ext.data.proxy.Memory MemoryProxy} docs for an example).</p>
 *
 * <p>Additional data can also be loaded locally using {@link #add}.</p>
 *
 * <p><u>Loading Nested Data</u></p>
 *
 * <p>Applications often need to load sets of associated data - for example a CRM system might load a User and her Orders.
 * Instead of issuing an AJAX request for the User and a series of additional AJAX requests for each Order, we can load a nested dataset
 * and allow the Reader to automatically populate the associated models. Below is a brief example, see the {@link Ext.data.reader.Reader} intro
 * docs for a full explanation:</p>
 *
<pre><code>
var store = Ext.create('Ext.data.Store', {
    autoLoad: true,
    model: "User",
    proxy: {
        type: 'ajax',
        url : 'users.json',
        reader: {
            type: 'json',
            root: 'users'
        }
    }
});
</code></pre>
 *
 * <p>Which would consume a response like this:</p>
 *
<pre><code>
{
    "users": [
        {
            "id": 1,
            "name": "Ed",
            "orders": [
                {
                    "id": 10,
                    "total": 10.76,
                    "status": "invoiced"
                },
                {
                    "id": 11,
                    "total": 13.45,
                    "status": "shipped"
                }
            ]
        }
    ]
}
</code></pre>
 *
 * <p>See the {@link Ext.data.reader.Reader} intro docs for a full explanation.</p>
 *
 * <p><u>Filtering and Sorting</u></p>
 *
 * <p>Stores can be sorted and filtered - in both cases either remotely or locally. The {@link #sorters} and {@link #filters} are
 * held inside {@link Ext.util.MixedCollection MixedCollection} instances to make them easy to manage. Usually it is sufficient to
 * either just specify sorters and filters in the Store configuration or call {@link #sort} or {@link #filter}:
 *
<pre><code>
var store = Ext.create('Ext.data.Store', {
    model: 'User',
    sorters: [
        {
            property : 'age',
            direction: 'DESC'
        },
        {
            property : 'firstName',
            direction: 'ASC'
        }
    ],

    filters: [
        {
            property: 'firstName',
            value   : /Ed/
        }
    ]
});
</code></pre>
 *
 * <p>The new Store will keep the configured sorters and filters in the MixedCollection instances mentioned above. By default, sorting
 * and filtering are both performed locally by the Store - see {@link #remoteSort} and {@link #remoteFilter} to allow the server to
 * perform these operations instead.</p>
 *
 * <p>Filtering and sorting after the Store has been instantiated is also easy. Calling {@link #filter} adds another filter to the Store
 * and automatically filters the dataset (calling {@link #filter} with no arguments simply re-applies all existing filters). Note that by
 * default {@link #sortOnFilter} is set to true, which means that your sorters are automatically reapplied if using local sorting.</p>
 *
<pre><code>
store.filter('eyeColor', 'Brown');
</code></pre>
 *
 * <p>Change the sorting at any time by calling {@link #sort}:</p>
 *
<pre><code>
store.sort('height', 'ASC');
</code></pre>
 *
 * <p>Note that all existing sorters will be removed in favor of the new sorter data (if {@link #sort} is called with no arguments,
 * the existing sorters are just reapplied instead of being removed). To keep existing sorters and add new ones, just add them
 * to the MixedCollection:</p>
 *
<pre><code>
store.sorters.add(new Ext.util.Sorter({
    property : 'shoeSize',
    direction: 'ASC'
}));

store.sort();
</code></pre>
 *
 * <p><u>Registering with StoreManager</u></p>
 *
 * <p>Any Store that is instantiated with a {@link #storeId} will automatically be registed with the {@link Ext.data.StoreManager StoreManager}.
 * This makes it easy to reuse the same store in multiple views:</p>
 *
 <pre><code>
//this store can be used several times
Ext.create('Ext.data.Store', {
    model: 'User',
    storeId: 'usersStore'
});

new Ext.List({
    store: 'usersStore',

    //other config goes here
});

new Ext.view.View({
    store: 'usersStore',

    //other config goes here
});
</code></pre>
 *
 * <p><u>Further Reading</u></p>
 *
 * <p>Stores are backed up by an ecosystem of classes that enables their operation. To gain a full understanding of these
 * pieces and how they fit together, see:</p>
 *
 * <ul style="list-style-type: disc; padding-left: 25px">
 * <li>{@link Ext.data.proxy.Proxy Proxy} - overview of what Proxies are and how they are used</li>
 * <li>{@link Ext.data.Model Model} - the core class in the data package</li>
 * <li>{@link Ext.data.reader.Reader Reader} - used by any subclass of {@link Ext.data.proxy.Server ServerProxy} to read a response</li>
 * </ul>
 *
 */
Ext.define('Ext.data.Store', {
    extend: 'Ext.data.AbstractStore',

    alias: 'store.store',

    requires: ['Ext.data.StoreManager', 'Ext.ModelManager', 'Ext.data.Model', 'Ext.util.Grouper'],
    uses: ['Ext.data.proxy.Memory'],

    /**
     * @cfg {Boolean} remoteSort
     * True to defer any sorting operation to the server. If false, sorting is done locally on the client. Defaults to <tt>false</tt>.
     */
    remoteSort: false,

    /**
     * @cfg {Boolean} remoteFilter
     * True to defer any filtering operation to the server. If false, filtering is done locally on the client. Defaults to <tt>false</tt>.
     */
    remoteFilter: false,

    /**
     * @cfg {Boolean} remoteGroup
     * True if the grouping should apply on the server side, false if it is local only.  If the
     * grouping is local, it can be applied immediately to the data.  If it is remote, then it will simply act as a
     * helper, automatically sending the grouping information to the server.
     */
    remoteGroup : false,

    /**
     * @cfg {String/Ext.data.proxy.Proxy/Object} proxy The Proxy to use for this Store. This can be either a string, a config
     * object or a Proxy instance - see {@link #setProxy} for details.
     */

    /**
     * @cfg {Object[]/Ext.data.Model[]} data Optional array of Model instances or data objects to load locally. See "Inline data" above for details.
     */

    /**
     * @property {String} groupField
     * The field by which to group data in the store. Internally, grouping is very similar to sorting - the
     * groupField and {@link #groupDir} are injected as the first sorter (see {@link #sort}). Stores support a single
     * level of grouping, and groups can be fetched via the {@link #getGroups} method.
     */
    groupField: undefined,

    /**
     * The direction in which sorting should be applied when grouping. Defaults to "ASC" - the other supported value is "DESC"
     * @property groupDir
     * @type String
     */
    groupDir: "ASC",

    /**
     * @cfg {Number} pageSize
     * The number of records considered to form a 'page'. This is used to power the built-in
     * paging using the nextPage and previousPage functions. Defaults to 25.
     */
    pageSize: 25,

    /**
     * The page that the Store has most recently loaded (see {@link #loadPage})
     * @property currentPage
     * @type Number
     */
    currentPage: 1,

    /**
     * @cfg {Boolean} clearOnPageLoad True to empty the store when loading another page via {@link #loadPage},
     * {@link #nextPage} or {@link #previousPage}. Setting to false keeps existing records, allowing
     * large data sets to be loaded one page at a time but rendered all together.
     */
    clearOnPageLoad: true,

    /**
     * @property {Boolean} loading
     * True if the Store is currently loading via its Proxy
     * @private
     */
    loading: false,

    /**
     * @cfg {Boolean} sortOnFilter For local filtering only, causes {@link #sort} to be called whenever {@link #filter} is called,
     * causing the sorters to be reapplied after filtering. Defaults to true
     */
    sortOnFilter: true,

    /**
     * @cfg {Boolean} buffered
     * Allow the store to buffer and pre-fetch pages of records. This is to be used in conjunction with a view will
     * tell the store to pre-fetch records ahead of a time.
     */
    buffered: false,

    /**
     * @cfg {Number} purgePageCount
     * The number of pages to keep in the cache before purging additional records. A value of 0 indicates to never purge the prefetched data.
     * This option is only relevant when the {@link #buffered} option is set to true.
     */
    purgePageCount: 5,

    isStore: true,

    onClassExtended: function(cls, data) {
        var model = data.model;

        if (typeof model == 'string') {
            var onBeforeClassCreated = data.onBeforeClassCreated;

            data.onBeforeClassCreated = function(cls, data) {
                var me = this;

                Ext.require(model, function() {
                    onBeforeClassCreated.call(me, cls, data);
                });
            };
        }
    },

    /**
     * Creates the store.
     * @param {Object} config (optional) Config object
     */
    constructor: function(config) {
        // Clone the config so we don't modify the original config object
        config = Ext.Object.merge({}, config);

        var me = this,
            groupers = config.groupers || me.groupers,
            groupField = config.groupField || me.groupField,
            proxy,
            data;

        if (config.buffered || me.buffered) {
            me.prefetchData = Ext.create('Ext.util.MixedCollection', false, function(record) {
                return record.index;
            });
            me.pendingRequests = [];
            me.pagesRequested = [];

            me.sortOnLoad = false;
            me.filterOnLoad = false;
        }

        me.addEvents(
            /**
             * @event beforeprefetch
             * Fires before a prefetch occurs. Return false to cancel.
             * @param {Ext.data.Store} this
             * @param {Ext.data.Operation} operation The associated operation
             */
            'beforeprefetch',
            /**
             * @event groupchange
             * Fired whenever the grouping in the grid changes
             * @param {Ext.data.Store} store The store
             * @param {Ext.util.Grouper[]} groupers The array of grouper objects
             */
            'groupchange',
            /**
             * @event load
             * Fires whenever records have been prefetched
             * @param {Ext.data.Store} this
             * @param {Ext.util.Grouper[]} records An array of records
             * @param {Boolean} successful True if the operation was successful.
             * @param {Ext.data.Operation} operation The associated operation
             */
            'prefetch'
        );
        data = config.data || me.data;

        /**
         * The MixedCollection that holds this store's local cache of records
         * @property data
         * @type Ext.util.MixedCollection
         */
        me.data = Ext.create('Ext.util.MixedCollection', false, function(record) {
            return record.internalId;
        });

        if (data) {
            me.inlineData = data;
            delete config.data;
        }

        if (!groupers && groupField) {
            groupers = [{
                property : groupField,
                direction: config.groupDir || me.groupDir
            }];
        }
        delete config.groupers;

        /**
         * The collection of {@link Ext.util.Grouper Groupers} currently applied to this Store
         * @property groupers
         * @type Ext.util.MixedCollection
         */
        me.groupers = Ext.create('Ext.util.MixedCollection');
        me.groupers.addAll(me.decodeGroupers(groupers));

        this.callParent([config]);
        // don't use *config* anymore from here on... use *me* instead...

        if (me.groupers.items.length) {
            me.sort(me.groupers.items, 'prepend', false);
        }

        proxy = me.proxy;
        data = me.inlineData;

        if (data) {
            if (proxy instanceof Ext.data.proxy.Memory) {
                proxy.data = data;
                me.read();
            } else {
                me.add.apply(me, data);
            }

            me.sort();
            delete me.inlineData;
        } else if (me.autoLoad) {
            Ext.defer(me.load, 10, me, [typeof me.autoLoad === 'object' ? me.autoLoad: undefined]);
            // Remove the defer call, we may need reinstate this at some point, but currently it's not obvious why it's here.
            // this.load(typeof this.autoLoad == 'object' ? this.autoLoad : undefined);
        }
    },

    onBeforeSort: function() {
        var groupers = this.groupers;
        if (groupers.getCount() > 0) {
            this.sort(groupers.items, 'prepend', false);
        }
    },

    /**
     * @private
     * Normalizes an array of grouper objects, ensuring that they are all Ext.util.Grouper instances
     * @param {Object[]} groupers The groupers array
     * @return {Ext.util.Grouper[]} Array of Ext.util.Grouper objects
     */
    decodeGroupers: function(groupers) {
        if (!Ext.isArray(groupers)) {
            if (groupers === undefined) {
                groupers = [];
            } else {
                groupers = [groupers];
            }
        }

        var length  = groupers.length,
            Grouper = Ext.util.Grouper,
            config, i;

        for (i = 0; i < length; i++) {
            config = groupers[i];

            if (!(config instanceof Grouper)) {
                if (Ext.isString(config)) {
                    config = {
                        property: config
                    };
                }

                Ext.applyIf(config, {
                    root     : 'data',
                    direction: "ASC"
                });

                //support for 3.x style sorters where a function can be defined as 'fn'
                if (config.fn) {
                    config.sorterFn = config.fn;
                }

                //support a function to be passed as a sorter definition
                if (typeof config == 'function') {
                    config = {
                        sorterFn: config
                    };
                }

                groupers[i] = new Grouper(config);
            }
        }

        return groupers;
    },

    /**
     * Group data in the store
     * @param {String/Object[]} groupers Either a string name of one of the fields in this Store's configured {@link Ext.data.Model Model},
     * or an Array of grouper configurations.
     * @param {String} direction The overall direction to group the data by. Defaults to "ASC".
     */
    group: function(groupers, direction) {
        var me = this,
            hasNew = false,
            grouper,
            newGroupers;

        if (Ext.isArray(groupers)) {
            newGroupers = groupers;
        } else if (Ext.isObject(groupers)) {
            newGroupers = [groupers];
        } else if (Ext.isString(groupers)) {
            grouper = me.groupers.get(groupers);

            if (!grouper) {
                grouper = {
                    property : groupers,
                    direction: direction
                };
                newGroupers = [grouper];
            } else if (direction === undefined) {
                grouper.toggle();
            } else {
                grouper.setDirection(direction);
            }
        }

        if (newGroupers && newGroupers.length) {
            hasNew = true;
            newGroupers = me.decodeGroupers(newGroupers);
            me.groupers.clear();
            me.groupers.addAll(newGroupers);
        }

        if (me.remoteGroup) {
            me.load({
                scope: me,
                callback: me.fireGroupChange
            });
        } else {
            // need to explicitly force a sort if we have groupers
            me.sort(null, null, null, hasNew);
            me.fireGroupChange();
        }
    },

    /**
     * Clear any groupers in the store
     */
    clearGrouping: function(){
        var me = this;
        // Clear any groupers we pushed on to the sorters
        me.groupers.each(function(grouper){
            me.sorters.remove(grouper);
        });
        me.groupers.clear();
        if (me.remoteGroup) {
            me.load({
                scope: me,
                callback: me.fireGroupChange
            });
        } else {
            me.sort();
            me.fireEvent('groupchange', me, me.groupers);
        }
    },

    /**
     * Checks if the store is currently grouped
     * @return {Boolean} True if the store is grouped.
     */
    isGrouped: function() {
        return this.groupers.getCount() > 0;
    },

    /**
     * Fires the groupchange event. Abstracted out so we can use it
     * as a callback
     * @private
     */
    fireGroupChange: function(){
        this.fireEvent('groupchange', this, this.groupers);
    },

    /**
     * Returns an array containing the result of applying grouping to the records in this store. See {@link #groupField},
     * {@link #groupDir} and {@link #getGroupString}. Example for a store containing records with a color field:
<pre><code>
var myStore = Ext.create('Ext.data.Store', {
    groupField: 'color',
    groupDir  : 'DESC'
});

myStore.getGroups(); //returns:
[
    {
        name: 'yellow',
        children: [
            //all records where the color field is 'yellow'
        ]
    },
    {
        name: 'red',
        children: [
            //all records where the color field is 'red'
        ]
    }
]
</code></pre>
     * @param {String} groupName (Optional) Pass in an optional groupName argument to access a specific group as defined by {@link #getGroupString}
     * @return {Object/Object[]} The grouped data
     */
    getGroups: function(requestGroupString) {
        var records = this.data.items,
            length = records.length,
            groups = [],
            pointers = {},
            record,
            groupStr,
            group,
            i;

        for (i = 0; i < length; i++) {
            record = records[i];
            groupStr = this.getGroupString(record);
            group = pointers[groupStr];

            if (group === undefined) {
                group = {
                    name: groupStr,
                    children: []
                };

                groups.push(group);
                pointers[groupStr] = group;
            }

            group.children.push(record);
        }

        return requestGroupString ? pointers[requestGroupString] : groups;
    },

    /**
     * @private
     * For a given set of records and a Grouper, returns an array of arrays - each of which is the set of records
     * matching a certain group.
     */
    getGroupsForGrouper: function(records, grouper) {
        var length = records.length,
            groups = [],
            oldValue,
            newValue,
            record,
            group,
            i;

        for (i = 0; i < length; i++) {
            record = records[i];
            newValue = grouper.getGroupString(record);

            if (newValue !== oldValue) {
                group = {
                    name: newValue,
                    grouper: grouper,
                    records: []
                };
                groups.push(group);
            }

            group.records.push(record);

            oldValue = newValue;
        }

        return groups;
    },

    /**
     * @private
     * This is used recursively to gather the records into the configured Groupers. The data MUST have been sorted for
     * this to work properly (see {@link #getGroupData} and {@link #getGroupsForGrouper}) Most of the work is done by
     * {@link #getGroupsForGrouper} - this function largely just handles the recursion.
     * @param {Ext.data.Model[]} records The set or subset of records to group
     * @param {Number} grouperIndex The grouper index to retrieve
     * @return {Object[]} The grouped records
     */
    getGroupsForGrouperIndex: function(records, grouperIndex) {
        var me = this,
            groupers = me.groupers,
            grouper = groupers.getAt(grouperIndex),
            groups = me.getGroupsForGrouper(records, grouper),
            length = groups.length,
            i;

        if (grouperIndex + 1 < groupers.length) {
            for (i = 0; i < length; i++) {
                groups[i].children = me.getGroupsForGrouperIndex(groups[i].records, grouperIndex + 1);
            }
        }

        for (i = 0; i < length; i++) {
            groups[i].depth = grouperIndex;
        }

        return groups;
    },

    /**
     * @private
     * <p>Returns records grouped by the configured {@link #groupers grouper} configuration. Sample return value (in
     * this case grouping by genre and then author in a fictional books dataset):</p>
<pre><code>
[
    {
        name: 'Fantasy',
        depth: 0,
        records: [
            //book1, book2, book3, book4
        ],
        children: [
            {
                name: 'Rowling',
                depth: 1,
                records: [
                    //book1, book2
                ]
            },
            {
                name: 'Tolkein',
                depth: 1,
                records: [
                    //book3, book4
                ]
            }
        ]
    }
]
</code></pre>
     * @param {Boolean} sort True to call {@link #sort} before finding groups. Sorting is required to make grouping
     * function correctly so this should only be set to false if the Store is known to already be sorted correctly
     * (defaults to true)
     * @return {Object[]} The group data
     */
    getGroupData: function(sort) {
        var me = this;
        if (sort !== false) {
            me.sort();
        }

        return me.getGroupsForGrouperIndex(me.data.items, 0);
    },

    /**
     * <p>Returns the string to group on for a given model instance. The default implementation of this method returns
     * the model's {@link #groupField}, but this can be overridden to group by an arbitrary string. For example, to
     * group by the first letter of a model's 'name' field, use the following code:</p>
<pre><code>
Ext.create('Ext.data.Store', {
    groupDir: 'ASC',
    getGroupString: function(instance) {
        return instance.get('name')[0];
    }
});
</code></pre>
     * @param {Ext.data.Model} instance The model instance
     * @return {String} The string to compare when forming groups
     */
    getGroupString: function(instance) {
        var group = this.groupers.first();
        if (group) {
            return instance.get(group.property);
        }
        return '';
    },
    /**
     * Inserts Model instances into the Store at the given index and fires the {@link #add} event.
     * See also <code>{@link #add}</code>.
     * @param {Number} index The start index at which to insert the passed Records.
     * @param {Ext.data.Model[]} records An Array of Ext.data.Model objects to add to the cache.
     */
    insert: function(index, records) {
        var me = this,
            sync = false,
            i,
            record,
            len;

        records = [].concat(records);
        for (i = 0, len = records.length; i < len; i++) {
            record = me.createModel(records[i]);
            record.set(me.modelDefaults);
            // reassign the model in the array in case it wasn't created yet
            records[i] = record;

            me.data.insert(index + i, record);
            record.join(me);

            sync = sync || record.phantom === true;
        }

        if (me.snapshot) {
            me.snapshot.addAll(records);
        }

        me.fireEvent('add', me, records, index);
        me.fireEvent('datachanged', me);
        if (me.autoSync && sync) {
            me.sync();
        }
    },

    /**
     * Adds Model instance to the Store. This method accepts either:
     *
     * - An array of Model instances or Model configuration objects.
     * - Any number of Model instance or Model configuration object arguments.
     *
     * The new Model instances will be added at the end of the existing collection.
     *
     * Sample usage:
     *
     *     myStore.add({some: 'data'}, {some: 'other data'});
     *
     * @param {Ext.data.Model[]/Ext.data.Model...} model An array of Model instances
     * or Model configuration objects, or variable number of Model instance or config arguments.
     * @return {Ext.data.Model[]} The model instances that were added
     */
    add: function(records) {
        //accept both a single-argument array of records, or any number of record arguments
        if (!Ext.isArray(records)) {
            records = Array.prototype.slice.apply(arguments);
        }

        var me = this,
            i = 0,
            length = records.length,
            record;

        for (; i < length; i++) {
            record = me.createModel(records[i]);
            // reassign the model in the array in case it wasn't created yet
            records[i] = record;
        }

        me.insert(me.data.length, records);

        return records;
    },

    /**
     * Converts a literal to a model, if it's not a model already
     * @private
     * @param record {Ext.data.Model/Object} The record to create
     * @return {Ext.data.Model}
     */
    createModel: function(record) {
        if (!record.isModel) {
            record = Ext.ModelManager.create(record, this.model);
        }

        return record;
    },

    /**
     * Calls the specified function for each of the {@link Ext.data.Model Records} in the cache.
     * @param {Function} fn The function to call. The {@link Ext.data.Model Record} is passed as the first parameter.
     * Returning <tt>false</tt> aborts and exits the iteration.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed.
     * Defaults to the current {@link Ext.data.Model Record} in the iteration.
     */
    each: function(fn, scope) {
        this.data.each(fn, scope);
    },

    /**
     * Removes the given record from the Store, firing the 'remove' event for each instance that is removed, plus a single
     * 'datachanged' event after removal.
     * @param {Ext.data.Model/Ext.data.Model[]} records The Ext.data.Model instance or array of instances to remove
     */
    remove: function(records, /* private */ isMove) {
        if (!Ext.isArray(records)) {
            records = [records];
        }

        /*
         * Pass the isMove parameter if we know we're going to be re-inserting this record
         */
        isMove = isMove === true;
        var me = this,
            sync = false,
            i = 0,
            length = records.length,
            isPhantom,
            index,
            record;

        for (; i < length; i++) {
            record = records[i];
            index = me.data.indexOf(record);

            if (me.snapshot) {
                me.snapshot.remove(record);
            }

            if (index > -1) {
                isPhantom = record.phantom === true;
                if (!isMove && !isPhantom) {
                    // don't push phantom records onto removed
                    me.removed.push(record);
                }

                record.unjoin(me);
                me.data.remove(record);
                sync = sync || !isPhantom;

                me.fireEvent('remove', me, record, index);
            }
        }

        me.fireEvent('datachanged', me);
        if (!isMove && me.autoSync && sync) {
            me.sync();
        }
    },

    /**
     * Removes the model instance at the given index
     * @param {Number} index The record index
     */
    removeAt: function(index) {
        var record = this.getAt(index);

        if (record) {
            this.remove(record);
        }
    },

    /**
     * <p>Loads data into the Store via the configured {@link #proxy}. This uses the Proxy to make an
     * asynchronous call to whatever storage backend the Proxy uses, automatically adding the retrieved
     * instances into the Store and calling an optional callback if required. Example usage:</p>
     *
<pre><code>
store.load({
    scope   : this,
    callback: function(records, operation, success) {
        //the {@link Ext.data.Operation operation} object contains all of the details of the load operation
        console.log(records);
    }
});
</code></pre>
     *
     * <p>If the callback scope does not need to be set, a function can simply be passed:</p>
     *
<pre><code>
store.load(function(records, operation, success) {
    console.log('loaded records');
});
</code></pre>
     *
     * @param {Object/Function} options (Optional) config object, passed into the Ext.data.Operation object before loading.
     */
    load: function(options) {
        var me = this;

        options = options || {};

        if (Ext.isFunction(options)) {
            options = {
                callback: options
            };
        }

        Ext.applyIf(options, {
            groupers: me.groupers.items,
            page: me.currentPage,
            start: (me.currentPage - 1) * me.pageSize,
            limit: me.pageSize,
            addRecords: false
        });

        return me.callParent([options]);
    },

    /**
     * @private
     * Called internally when a Proxy has completed a load request
     */
    onProxyLoad: function(operation) {
        var me = this,
            resultSet = operation.getResultSet(),
            records = operation.getRecords(),
            successful = operation.wasSuccessful();

        if (resultSet) {
            me.totalCount = resultSet.total;
        }

        if (successful) {
            me.loadRecords(records, operation);
        }

        me.loading = false;
        me.fireEvent('load', me, records, successful);

        //TODO: deprecate this event, it should always have been 'load' instead. 'load' is now documented, 'read' is not.
        //People are definitely using this so can't deprecate safely until 2.x
        me.fireEvent('read', me, records, operation.wasSuccessful());

        //this is a callback that would have been passed to the 'read' function and is optional
        Ext.callback(operation.callback, operation.scope || me, [records, operation, successful]);
    },

    /**
     * Create any new records when a write is returned from the server.
     * @private
     * @param {Ext.data.Model[]} records The array of new records
     * @param {Ext.data.Operation} operation The operation that just completed
     * @param {Boolean} success True if the operation was successful
     */
    onCreateRecords: function(records, operation, success) {
        if (success) {
            var i = 0,
                data = this.data,
                snapshot = this.snapshot,
                length = records.length,
                originalRecords = operation.records,
                record,
                original,
                index;

            /*
             * Loop over each record returned from the server. Assume they are
             * returned in order of how they were sent. If we find a matching
             * record, replace it with the newly created one.
             */
            for (; i < length; ++i) {
                record = records[i];
                original = originalRecords[i];
                if (original) {
                    index = data.indexOf(original);
                    if (index > -1) {
                        data.removeAt(index);
                        data.insert(index, record);
                    }
                    if (snapshot) {
                        index = snapshot.indexOf(original);
                        if (index > -1) {
                            snapshot.removeAt(index);
                            snapshot.insert(index, record);
                        }
                    }
                    record.phantom = false;
                    record.join(this);
                }
            }
        }
    },

    /**
     * Update any records when a write is returned from the server.
     * @private
     * @param {Ext.data.Model[]} records The array of updated records
     * @param {Ext.data.Operation} operation The operation that just completed
     * @param {Boolean} success True if the operation was successful
     */
    onUpdateRecords: function(records, operation, success){
        if (success) {
            var i = 0,
                length = records.length,
                data = this.data,
                snapshot = this.snapshot,
                record;

            for (; i < length; ++i) {
                record = records[i];
                data.replace(record);
                if (snapshot) {
                    snapshot.replace(record);
                }
                record.join(this);
            }
        }
    },

    /**
     * Remove any records when a write is returned from the server.
     * @private
     * @param {Ext.data.Model[]} records The array of removed records
     * @param {Ext.data.Operation} operation The operation that just completed
     * @param {Boolean} success True if the operation was successful
     */
    onDestroyRecords: function(records, operation, success){
        if (success) {
            var me = this,
                i = 0,
                length = records.length,
                data = me.data,
                snapshot = me.snapshot,
                record;

            for (; i < length; ++i) {
                record = records[i];
                record.unjoin(me);
                data.remove(record);
                if (snapshot) {
                    snapshot.remove(record);
                }
            }
            me.removed = [];
        }
    },

    //inherit docs
    getNewRecords: function() {
        return this.data.filterBy(this.filterNew).items;
    },

    //inherit docs
    getUpdatedRecords: function() {
        return this.data.filterBy(this.filterUpdated).items;
    },

    /**
     * Filters the loaded set of records by a given set of filters.
     *
     * Filtering by single field:
     *
     *     store.filter("email", /\.com$/);
     *
     * Using multiple filters:
     *
     *     store.filter([
     *         {property: "email", value: /\.com$/},
     *         {filterFn: function(item) { return item.get("age") > 10; }}
     *     ]);
     *
     * Using Ext.util.Filter instances instead of config objects
     * (note that we need to specify the {@link Ext.util.Filter#root root} config option in this case):
     *
     *     store.filter([
     *         Ext.create('Ext.util.Filter', {property: "email", value: /\.com$/, root: 'data'}),
     *         Ext.create('Ext.util.Filter', {filterFn: function(item) { return item.get("age") > 10; }, root: 'data'})
     *     ]);
     *
     * @param {Object[]/Ext.util.Filter[]/String} filters The set of filters to apply to the data. These are stored internally on the store,
     * but the filtering itself is done on the Store's {@link Ext.util.MixedCollection MixedCollection}. See
     * MixedCollection's {@link Ext.util.MixedCollection#filter filter} method for filter syntax. Alternatively,
     * pass in a property string
     * @param {String} value (optional) value to filter by (only if using a property string as the first argument)
     */
    filter: function(filters, value) {
        if (Ext.isString(filters)) {
            filters = {
                property: filters,
                value: value
            };
        }

        var me = this,
            decoded = me.decodeFilters(filters),
            i = 0,
            doLocalSort = me.sortOnFilter && !me.remoteSort,
            length = decoded.length;

        for (; i < length; i++) {
            me.filters.replace(decoded[i]);
        }

        if (me.remoteFilter) {
            //the load function will pick up the new filters and request the filtered data from the proxy
            me.load();
        } else {
            /**
             * A pristine (unfiltered) collection of the records in this store. This is used to reinstate
             * records when a filter is removed or changed
             * @property snapshot
             * @type Ext.util.MixedCollection
             */
            if (me.filters.getCount()) {
                me.snapshot = me.snapshot || me.data.clone();
                me.data = me.data.filter(me.filters.items);

                if (doLocalSort) {
                    me.sort();
                }
                // fire datachanged event if it hasn't already been fired by doSort
                if (!doLocalSort || me.sorters.length < 1) {
                    me.fireEvent('datachanged', me);
                }
            }
        }
    },

    /**
     * Revert to a view of the Record cache with no filtering applied.
     * @param {Boolean} suppressEvent If <tt>true</tt> the filter is cleared silently without firing the
     * {@link #datachanged} event.
     */
    clearFilter: function(suppressEvent) {
        var me = this;

        me.filters.clear();

        if (me.remoteFilter) {
            me.load();
        } else if (me.isFiltered()) {
            me.data = me.snapshot.clone();
            delete me.snapshot;

            if (suppressEvent !== true) {
                me.fireEvent('datachanged', me);
            }
        }
    },

    /**
     * Returns true if this store is currently filtered
     * @return {Boolean}
     */
    isFiltered: function() {
        var snapshot = this.snapshot;
        return !! snapshot && snapshot !== this.data;
    },

    /**
     * Filter by a function. The specified function will be called for each
     * Record in this Store. If the function returns <tt>true</tt> the Record is included,
     * otherwise it is filtered out.
     * @param {Function} fn The function to be called. It will be passed the following parameters:<ul>
     * <li><b>record</b> : Ext.data.Model<p class="sub-desc">The {@link Ext.data.Model record}
     * to test for filtering. Access field values using {@link Ext.data.Model#get}.</p></li>
     * <li><b>id</b> : Object<p class="sub-desc">The ID of the Record passed.</p></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Store.
     */
    filterBy: function(fn, scope) {
        var me = this;

        me.snapshot = me.snapshot || me.data.clone();
        me.data = me.queryBy(fn, scope || me);
        me.fireEvent('datachanged', me);
    },

    /**
     * Query the cached records in this Store using a filtering function. The specified function
     * will be called with each record in this Store. If the function returns <tt>true</tt> the record is
     * included in the results.
     * @param {Function} fn The function to be called. It will be passed the following parameters:<ul>
     * <li><b>record</b> : Ext.data.Model<p class="sub-desc">The {@link Ext.data.Model record}
     * to test for filtering. Access field values using {@link Ext.data.Model#get}.</p></li>
     * <li><b>id</b> : Object<p class="sub-desc">The ID of the Record passed.</p></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Store.
     * @return {Ext.util.MixedCollection} Returns an Ext.util.MixedCollection of the matched records
     **/
    queryBy: function(fn, scope) {
        var me = this,
        data = me.snapshot || me.data;
        return data.filterBy(fn, scope || me);
    },

    /**
     * Loads an array of data straight into the Store.
     * 
     * Using this method is great if the data is in the correct format already (e.g. it doesn't need to be
     * processed by a reader). If your data requires processing to decode the data structure, use a
     * {@link Ext.data.proxy.Memory MemoryProxy} instead.
     * 
     * @param {Ext.data.Model[]/Object[]} data Array of data to load. Any non-model instances will be cast
     * into model instances.
     * @param {Boolean} [append=false] True to add the records to the existing records in the store, false
     * to remove the old ones first.
     */
    loadData: function(data, append) {
        var model = this.model,
            length = data.length,
            newData = [],
            i,
            record;

        //make sure each data element is an Ext.data.Model instance
        for (i = 0; i < length; i++) {
            record = data[i];

            if (!(record instanceof Ext.data.Model)) {
                record = Ext.ModelManager.create(record, model);
            }
            newData.push(record);
        }

        this.loadRecords(newData, {addRecords: append});
    },


    /**
     * Loads data via the bound Proxy's reader
     *
     * Use this method if you are attempting to load data and want to utilize the configured data reader.
     *
     * @param {Object[]} data The full JSON object you'd like to load into the Data store.
     * @param {Boolean} [append=false] True to add the records to the existing records in the store, false
     * to remove the old ones first.
     */
    loadRawData : function(data, append) {
         var me      = this,
             result  = me.proxy.reader.read(data),
             records = result.records;

         if (result.success) {
             me.loadRecords(records, { addRecords: append });
             me.fireEvent('load', me, records, true);
         }
     },


    /**
     * Loads an array of {@link Ext.data.Model model} instances into the store, fires the datachanged event. This should only usually
     * be called internally when loading from the {@link Ext.data.proxy.Proxy Proxy}, when adding records manually use {@link #add} instead
     * @param {Ext.data.Model[]} records The array of records to load
     * @param {Object} options {addRecords: true} to add these records to the existing records, false to remove the Store's existing records first
     */
    loadRecords: function(records, options) {
        var me     = this,
            i      = 0,
            length = records.length;

        options = options || {};


        if (!options.addRecords) {
            delete me.snapshot;
            me.clearData();
        }

        me.data.addAll(records);

        //FIXME: this is not a good solution. Ed Spencer is totally responsible for this and should be forced to fix it immediately.
        for (; i < length; i++) {
            if (options.start !== undefined) {
                records[i].index = options.start + i;

            }
            records[i].join(me);
        }

        /*
         * this rather inelegant suspension and resumption of events is required because both the filter and sort functions
         * fire an additional datachanged event, which is not wanted. Ideally we would do this a different way. The first
         * datachanged event is fired by the call to this.add, above.
         */
        me.suspendEvents();

        if (me.filterOnLoad && !me.remoteFilter) {
            me.filter();
        }

        if (me.sortOnLoad && !me.remoteSort) {
            me.sort();
        }

        me.resumeEvents();
        me.fireEvent('datachanged', me, records);
    },

    // PAGING METHODS
    /**
     * Loads a given 'page' of data by setting the start and limit values appropriately. Internally this just causes a normal
     * load operation, passing in calculated 'start' and 'limit' params
     * @param {Number} page The number of the page to load
     * @param {Object} options See options for {@link #load}
     */
    loadPage: function(page, options) {
        var me = this;
        options = Ext.apply({}, options);

        me.currentPage = page;

        me.read(Ext.applyIf(options, {
            page: page,
            start: (page - 1) * me.pageSize,
            limit: me.pageSize,
            addRecords: !me.clearOnPageLoad
        }));
    },

    /**
     * Loads the next 'page' in the current data set
     * @param {Object} options See options for {@link #load}
     */
    nextPage: function(options) {
        this.loadPage(this.currentPage + 1, options);
    },

    /**
     * Loads the previous 'page' in the current data set
     * @param {Object} options See options for {@link #load}
     */
    previousPage: function(options) {
        this.loadPage(this.currentPage - 1, options);
    },

    // private
    clearData: function() {
        var me = this;
        me.data.each(function(record) {
            record.unjoin(me);
        });

        me.data.clear();
    },

    // Buffering
    /**
     * Prefetches data into the store using its configured {@link #proxy}.
     * @param {Object} options (Optional) config object, passed into the Ext.data.Operation object before loading.
     * See {@link #load}
     */
    prefetch: function(options) {
        var me = this,
            operation,
            requestId = me.getRequestId();

        options = options || {};

        Ext.applyIf(options, {
            action : 'read',
            filters: me.filters.items,
            sorters: me.sorters.items,
            requestId: requestId
        });
        me.pendingRequests.push(requestId);

        operation = Ext.create('Ext.data.Operation', options);

        // HACK to implement loadMask support.
        //if (operation.blocking) {
        //    me.fireEvent('beforeload', me, operation);
        //}
        if (me.fireEvent('beforeprefetch', me, operation) !== false) {
            me.loading = true;
            me.proxy.read(operation, me.onProxyPrefetch, me);
        }

        return me;
    },

    /**
     * Prefetches a page of data.
     * @param {Number} page The page to prefetch
     * @param {Object} options (Optional) config object, passed into the Ext.data.Operation object before loading.
     * See {@link #load}
     */
    prefetchPage: function(page, options) {
        var me = this,
            pageSize = me.pageSize,
            start = (page - 1) * me.pageSize,
            end = start + pageSize;

        // Currently not requesting this page and range isn't already satisified
        if (Ext.Array.indexOf(me.pagesRequested, page) === -1 && !me.rangeSatisfied(start, end)) {
            options = options || {};
            me.pagesRequested.push(page);
            Ext.applyIf(options, {
                page : page,
                start: start,
                limit: pageSize,
                callback: me.onWaitForGuarantee,
                scope: me
            });

            me.prefetch(options);
        }

    },

    /**
     * Returns a unique requestId to track requests.
     * @private
     */
    getRequestId: function() {
        this.requestSeed = this.requestSeed || 1;
        return this.requestSeed++;
    },

    /**
     * Called after the configured proxy completes a prefetch operation.
     * @private
     * @param {Ext.data.Operation} operation The operation that completed
     */
    onProxyPrefetch: function(operation) {
        var me         = this,
            resultSet  = operation.getResultSet(),
            records    = operation.getRecords(),

            successful = operation.wasSuccessful();

        if (resultSet) {
            me.totalCount = resultSet.total;
            me.fireEvent('totalcountchange', me.totalCount);
        }

        if (successful) {
            me.cacheRecords(records, operation);
        }
        Ext.Array.remove(me.pendingRequests, operation.requestId);
        if (operation.page) {
            Ext.Array.remove(me.pagesRequested, operation.page);
        }

        me.loading = false;
        me.fireEvent('prefetch', me, records, successful, operation);

        // HACK to support loadMask
        if (operation.blocking) {
            me.fireEvent('load', me, records, successful);
        }

        //this is a callback that would have been passed to the 'read' function and is optional
        Ext.callback(operation.callback, operation.scope || me, [records, operation, successful]);
    },

    /**
     * Caches the records in the prefetch and stripes them with their server-side
     * index.
     * @private
     * @param {Ext.data.Model[]} records The records to cache
     * @param {Ext.data.Operation} The associated operation
     */
    cacheRecords: function(records, operation) {
        var me     = this,
            i      = 0,
            length = records.length,
            start  = operation ? operation.start : 0;

        if (!Ext.isDefined(me.totalCount)) {
            me.totalCount = records.length;
            me.fireEvent('totalcountchange', me.totalCount);
        }

        for (; i < length; i++) {
            // this is the true index, not the viewIndex
            records[i].index = start + i;
        }

        me.prefetchData.addAll(records);
        if (me.purgePageCount) {
            me.purgeRecords();
        }

    },


    /**
     * Purge the least recently used records in the prefetch if the purgeCount
     * has been exceeded.
     */
    purgeRecords: function() {
        var me = this,
            prefetchCount = me.prefetchData.getCount(),
            purgeCount = me.purgePageCount * me.pageSize,
            numRecordsToPurge = prefetchCount - purgeCount - 1,
            i = 0;

        for (; i <= numRecordsToPurge; i++) {
            me.prefetchData.removeAt(0);
        }
    },

    /**
     * Determines if the range has already been satisfied in the prefetchData.
     * @private
     * @param {Number} start The start index
     * @param {Number} end The end index in the range
     */
    rangeSatisfied: function(start, end) {
        var me = this,
            i = start,
            satisfied = true;

        for (; i < end; i++) {
            if (!me.prefetchData.getByKey(i)) {
                satisfied = false;
                //<debug>
                if (end - i > me.pageSize) {
                    Ext.Error.raise("A single page prefetch could never satisfy this request.");
                }
                //</debug>
                break;
            }
        }
        return satisfied;
    },

    /**
     * Determines the page from a record index
     * @param {Number} index The record index
     * @return {Number} The page the record belongs to
     */
    getPageFromRecordIndex: function(index) {
        return Math.floor(index / this.pageSize) + 1;
    },

    /**
     * Handles a guaranteed range being loaded
     * @private
     */
    onGuaranteedRange: function() {
        var me = this,
            totalCount = me.getTotalCount(),
            start = me.requestStart,
            end = ((totalCount - 1) < me.requestEnd) ? totalCount - 1 : me.requestEnd,
            range = [],
            record,
            i = start;

        end = Math.max(0, end);

        //<debug>
        if (start > end) {
            Ext.log({
                level: 'warn',
                msg: 'Start (' + start + ') was greater than end (' + end +
                    ') for the range of records requested (' + me.requestStart + '-' +
                    me.requestEnd + ')' + (this.storeId ? ' from store "' + this.storeId + '"' : '')
            });
        }
        //</debug>

        if (start !== me.guaranteedStart && end !== me.guaranteedEnd) {
            me.guaranteedStart = start;
            me.guaranteedEnd = end;

            for (; i <= end; i++) {
                record = me.prefetchData.getByKey(i);
                //<debug>
//                if (!record) {
//                    Ext.log('Record with key "' + i + '" was not found and store said it was guaranteed');
//                }
                //</debug>
                if (record) {
                    range.push(record);
                }
            }
            me.fireEvent('guaranteedrange', range, start, end);
            if (me.cb) {
                me.cb.call(me.scope || me, range);
            }
        }

        me.unmask();
    },

    // hack to support loadmask
    mask: function() {
        this.masked = true;
        this.fireEvent('beforeload');
    },

    // hack to support loadmask
    unmask: function() {
        if (this.masked) {
            this.fireEvent('load');
        }
    },

    /**
     * Returns the number of pending requests out.
     */
    hasPendingRequests: function() {
        return this.pendingRequests.length;
    },


    // wait until all requests finish, until guaranteeing the range.
    onWaitForGuarantee: function() {
        if (!this.hasPendingRequests()) {
            this.onGuaranteedRange();
        }
    },

    /**
     * Guarantee a specific range, this will load the store with a range (that
     * must be the pageSize or smaller) and take care of any loading that may
     * be necessary.
     */
    guaranteeRange: function(start, end, cb, scope) {
        //<debug>
        if (start && end) {
            if (end - start > this.pageSize) {
                Ext.Error.raise({
                    start: start,
                    end: end,
                    pageSize: this.pageSize,
                    msg: "Requested a bigger range than the specified pageSize"
                });
            }
        }
        //</debug>

        end = (end > this.totalCount) ? this.totalCount - 1 : end;

        var me = this,
            i = start,
            prefetchData = me.prefetchData,
            range = [],
            startLoaded = !!prefetchData.getByKey(start),
            endLoaded = !!prefetchData.getByKey(end),
            startPage = me.getPageFromRecordIndex(start),
            endPage = me.getPageFromRecordIndex(end);

        me.cb = cb;
        me.scope = scope;

        me.requestStart = start;
        me.requestEnd = end;
        // neither beginning or end are loaded
        if (!startLoaded || !endLoaded) {
            // same page, lets load it
            if (startPage === endPage) {
                me.mask();
                me.prefetchPage(startPage, {
                    //blocking: true,
                    callback: me.onWaitForGuarantee,
                    scope: me
                });
            // need to load two pages
            } else {
                me.mask();
                me.prefetchPage(startPage, {
                    //blocking: true,
                    callback: me.onWaitForGuarantee,
                    scope: me
                });
                me.prefetchPage(endPage, {
                    //blocking: true,
                    callback: me.onWaitForGuarantee,
                    scope: me
                });
            }
        // Request was already satisfied via the prefetch
        } else {
            me.onGuaranteedRange();
        }
    },

    // because prefetchData is stored by index
    // this invalidates all of the prefetchedData
    sort: function() {
        var me = this,
            prefetchData = me.prefetchData,
            sorters,
            start,
            end,
            range;

        if (me.buffered) {
            if (me.remoteSort) {
                prefetchData.clear();
                me.callParent(arguments);
            } else {
                sorters = me.getSorters();
                start = me.guaranteedStart;
                end = me.guaranteedEnd;

                if (sorters.length) {
                    prefetchData.sort(sorters);
                    range = prefetchData.getRange();
                    prefetchData.clear();
                    me.cacheRecords(range);
                    delete me.guaranteedStart;
                    delete me.guaranteedEnd;
                    me.guaranteeRange(start, end);
                }
                me.callParent(arguments);
            }
        } else {
            me.callParent(arguments);
        }
    },

    // overriden to provide striping of the indexes as sorting occurs.
    // this cannot be done inside of sort because datachanged has already
    // fired and will trigger a repaint of the bound view.
    doSort: function(sorterFn) {
        var me = this;
        if (me.remoteSort) {
            //the load function will pick up the new sorters and request the sorted data from the proxy
            me.load();
        } else {
            me.data.sortBy(sorterFn);
            if (!me.buffered) {
                var range = me.getRange(),
                    ln = range.length,
                    i  = 0;
                for (; i < ln; i++) {
                    range[i].index = i;
                }
            }
            me.fireEvent('datachanged', me);
        }
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} startIndex (optional) The index to start searching at
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison
     * @param {Boolean} exactMatch (optional) True to force exact match (^ and $ characters added to the regex). Defaults to false.
     * @return {Number} The matched index or -1
     */
    find: function(property, value, start, anyMatch, caseSensitive, exactMatch) {
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },

    /**
     * Finds the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} startIndex (optional) The index to start searching at
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison
     * @param {Boolean} exactMatch (optional) True to force exact match (^ and $ characters added to the regex). Defaults to false.
     * @return {Ext.data.Model} The matched record or null
     */
    findRecord: function() {
        var me = this,
            index = me.find.apply(me, arguments);
        return index !== -1 ? me.getAt(index) : null;
    },

    /**
     * @private
     * Returns a filter function used to test a the given property's value. Defers most of the work to
     * Ext.util.MixedCollection's createValueMatcher function
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} [anyMatch=false] True if we don't care if the filter value is not the full value.
     * @param {Boolean} [caseSensitive=false] True to create a case-sensitive regex.
     * @param {Boolean} [exactMatch=false] True to force exact match (^ and $ characters added to the regex).
     * Ignored if anyMatch is true.
     */
    createFilterFn: function(property, value, anyMatch, caseSensitive, exactMatch) {
        if (Ext.isEmpty(value)) {
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {Object} value The value to match the field against.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findExact: function(property, value, start) {
        return this.data.findIndexBy(function(rec) {
            return rec.get(property) == value;
        },
        this, start);
    },

    /**
     * Find the index of the first matching Record in this Store by a function.
     * If the function returns <tt>true</tt> it is considered a match.
     * @param {Function} fn The function to be called. It will be passed the following parameters:<ul>
     * <li><b>record</b> : Ext.data.Model<p class="sub-desc">The {@link Ext.data.Model record}
     * to test for filtering. Access field values using {@link Ext.data.Model#get}.</p></li>
     * <li><b>id</b> : Object<p class="sub-desc">The ID of the Record passed.</p></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Store.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findBy: function(fn, scope, start) {
        return this.data.findIndexBy(fn, scope, start);
    },

    /**
     * Collects unique values for a particular dataIndex from this store.
     * @param {String} dataIndex The property to collect
     * @param {Boolean} allowNull (optional) Pass true to allow null, undefined or empty string values
     * @param {Boolean} bypassFilter (optional) Pass true to collect from all records, even ones which are filtered
     * @return {Object[]} An array of the unique values
     **/
    collect: function(dataIndex, allowNull, bypassFilter) {
        var me = this,
            data = (bypassFilter === true && me.snapshot) ? me.snapshot: me.data;

        return data.collect(dataIndex, 'data', allowNull);
    },

    /**
     * Gets the number of cached records.
     * <p>If using paging, this may not be the total size of the dataset. If the data object
     * used by the Reader contains the dataset size, then the {@link #getTotalCount} function returns
     * the dataset size.  <b>Note</b>: see the Important note in {@link #load}.</p>
     * @return {Number} The number of Records in the Store's cache.
     */
    getCount: function() {
        return this.data.length || 0;
    },

    /**
     * Returns the total number of {@link Ext.data.Model Model} instances that the {@link Ext.data.proxy.Proxy Proxy}
     * indicates exist. This will usually differ from {@link #getCount} when using paging - getCount returns the
     * number of records loaded into the Store at the moment, getTotalCount returns the number of records that
     * could be loaded into the Store if the Store contained all data
     * @return {Number} The total number of Model instances available via the Proxy
     */
    getTotalCount: function() {
        return this.totalCount;
    },

    /**
     * Get the Record at the specified index.
     * @param {Number} index The index of the Record to find.
     * @return {Ext.data.Model} The Record at the passed index. Returns undefined if not found.
     */
    getAt: function(index) {
        return this.data.getAt(index);
    },

    /**
     * Returns a range of Records between specified indices.
     * @param {Number} [startIndex=0] The starting index
     * @param {Number} [endIndex] The ending index. Defaults to the last Record in the Store.
     * @return {Ext.data.Model[]} An array of Records
     */
    getRange: function(start, end) {
        return this.data.getRange(start, end);
    },

    /**
     * Get the Record with the specified id.
     * @param {String} id The id of the Record to find.
     * @return {Ext.data.Model} The Record with the passed id. Returns null if not found.
     */
    getById: function(id) {
        return (this.snapshot || this.data).findBy(function(record) {
            return record.getId() === id;
        });
    },

    /**
     * Get the index within the cache of the passed Record.
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOf: function(record) {
        return this.data.indexOf(record);
    },


    /**
     * Get the index within the entire dataset. From 0 to the totalCount.
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOfTotal: function(record) {
        var index = record.index;
        if (index || index === 0) {
            return index;
        }
        return this.indexOf(record);
    },

    /**
     * Get the index within the cache of the Record with the passed id.
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId: function(id) {
        return this.indexOf(this.getById(id));
    },

    /**
     * Remove all items from the store.
     * @param {Boolean} silent Prevent the `clear` event from being fired.
     */
    removeAll: function(silent) {
        var me = this;

        me.clearData();
        if (me.snapshot) {
            me.snapshot.clear();
        }
        if (silent !== true) {
            me.fireEvent('clear', me);
        }
    },

    /*
     * Aggregation methods
     */

    /**
     * Convenience function for getting the first model instance in the store
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the first record being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Ext.data.Model/undefined} The first model instance in the store, or undefined
     */
    first: function(grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(function(records) {
                return records.length ? records[0] : undefined;
            }, me, true);
        } else {
            return me.data.first();
        }
    },

    /**
     * Convenience function for getting the last model instance in the store
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the last record being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Ext.data.Model/undefined} The last model instance in the store, or undefined
     */
    last: function(grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(function(records) {
                var len = records.length;
                return len ? records[len - 1] : undefined;
            }, me, true);
        } else {
            return me.data.last();
        }
    },

    /**
     * Sums the value of <tt>property</tt> for each {@link Ext.data.Model record} between <tt>start</tt>
     * and <tt>end</tt> and returns the result.
     * @param {String} field A field in each record
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the sum for that group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Number} The sum
     */
    sum: function(field, grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getSum, me, true, [field]);
        } else {
            return me.getSum(me.data.items, field);
        }
    },

    // @private, see sum
    getSum: function(records, field) {
        var total = 0,
            i = 0,
            len = records.length;

        for (; i < len; ++i) {
            total += records[i].get(field);
        }

        return total;
    },

    /**
     * Gets the count of items in the store.
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the count for each group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Number} the count
     */
    count: function(grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(function(records) {
                return records.length;
            }, me, true);
        } else {
            return me.getCount();
        }
    },

    /**
     * Gets the minimum value in the store.
     * @param {String} field The field in each record
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the minimum in the group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Object} The minimum value, if no items exist, undefined.
     */
    min: function(field, grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getMin, me, true, [field]);
        } else {
            return me.getMin(me.data.items, field);
        }
    },

    // @private, see min
    getMin: function(records, field){
        var i = 1,
            len = records.length,
            value, min;

        if (len > 0) {
            min = records[0].get(field);
        }

        for (; i < len; ++i) {
            value = records[i].get(field);
            if (value < min) {
                min = value;
            }
        }
        return min;
    },

    /**
     * Gets the maximum value in the store.
     * @param {String} field The field in each record
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the maximum in the group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Object} The maximum value, if no items exist, undefined.
     */
    max: function(field, grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getMax, me, true, [field]);
        } else {
            return me.getMax(me.data.items, field);
        }
    },

    // @private, see max
    getMax: function(records, field) {
        var i = 1,
            len = records.length,
            value,
            max;

        if (len > 0) {
            max = records[0].get(field);
        }

        for (; i < len; ++i) {
            value = records[i].get(field);
            if (value > max) {
                max = value;
            }
        }
        return max;
    },

    /**
     * Gets the average value in the store.
     * @param {String} field The field in each record
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the group average being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Object} The average value, if no items exist, 0.
     */
    average: function(field, grouped) {
        var me = this;
        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getAverage, me, true, [field]);
        } else {
            return me.getAverage(me.data.items, field);
        }
    },

    // @private, see average
    getAverage: function(records, field) {
        var i = 0,
            len = records.length,
            sum = 0;

        if (records.length > 0) {
            for (; i < len; ++i) {
                sum += records[i].get(field);
            }
            return sum / len;
        }
        return 0;
    },

    /**
     * Runs the aggregate function for all the records in the store.
     * @param {Function} fn The function to execute. The function is called with a single parameter,
     * an array of records for that group.
     * @param {Object} scope (optional) The scope to execute the function in. Defaults to the store.
     * @param {Boolean} grouped (Optional) True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the group average being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @param {Array} args (optional) Any arguments to append to the function call
     * @return {Object} An object literal with the group names and their appropriate values.
     */
    aggregate: function(fn, scope, grouped, args) {
        args = args || [];
        if (grouped && this.isGrouped()) {
            var groups = this.getGroups(),
                i = 0,
                len = groups.length,
                out = {},
                group;

            for (; i < len; ++i) {
                group = groups[i];
                out[group.name] = fn.apply(scope || this, [group.children].concat(args));
            }
            return out;
        } else {
            return fn.apply(scope || this, [this.data.items].concat(args));
        }
    }
}, function() {
    // A dummy empty store with a fieldless Model defined in it.
    // Just for binding to Views which are instantiated with no Store defined.
    // They will be able to run and render fine, and be bound to a generated Store later.
    Ext.regStore('ext-empty-store', {fields: [], proxy: 'proxy'});
});

