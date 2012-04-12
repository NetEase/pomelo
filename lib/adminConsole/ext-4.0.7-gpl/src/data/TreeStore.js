/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * The TreeStore is a store implementation that is backed by by an {@link Ext.data.Tree}.
 * It provides convenience methods for loading nodes, as well as the ability to use
 * the hierarchical tree structure combined with a store. This class is generally used
 * in conjunction with {@link Ext.tree.Panel}. This class also relays many events from
 * the Tree for convenience.
 *
 * # Using Models
 *
 * If no Model is specified, an implicit model will be created that implements {@link Ext.data.NodeInterface}.
 * The standard Tree fields will also be copied onto the Model for maintaining their state. These fields are listed
 * in the {@link Ext.data.NodeInterface} documentation.
 *
 * # Reading Nested Data
 *
 * For the tree to read nested data, the {@link Ext.data.reader.Reader} must be configured with a root property,
 * so the reader can find nested data for each node. If a root is not specified, it will default to
 * 'children'.
 */
Ext.define('Ext.data.TreeStore', {
    extend: 'Ext.data.AbstractStore',
    alias: 'store.tree',
    requires: ['Ext.data.Tree', 'Ext.data.NodeInterface', 'Ext.data.NodeStore'],

    /**
     * @cfg {Ext.data.Model/Ext.data.NodeInterface/Object} root
     * The root node for this store. For example:
     *
     *     root: {
     *         expanded: true,
     *         text: "My Root",
     *         children: [
     *             { text: "Child 1", leaf: true },
     *             { text: "Child 2", expanded: true, children: [
     *                 { text: "GrandChild", leaf: true }
     *             ] }
     *         ]
     *     }
     *
     * Setting the `root` config option is the same as calling {@link #setRootNode}.
     */

    /**
     * @cfg {Boolean} clearOnLoad
     * Remove previously existing child nodes before loading. Default to true.
     */
    clearOnLoad : true,

    /**
     * @cfg {String} nodeParam
     * The name of the parameter sent to the server which contains the identifier of the node.
     * Defaults to 'node'.
     */
    nodeParam: 'node',

    /**
     * @cfg {String} defaultRootId
     * The default root id. Defaults to 'root'
     */
    defaultRootId: 'root',

    /**
     * @cfg {String} defaultRootProperty
     * The root property to specify on the reader if one is not explicitly defined.
     */
    defaultRootProperty: 'children',

    /**
     * @cfg {Boolean} folderSort
     * Set to true to automatically prepend a leaf sorter. Defaults to `undefined`.
     */
    folderSort: false,

    constructor: function(config) {
        var me = this,
            root,
            fields;

        config = Ext.apply({}, config);

        /**
         * If we have no fields declare for the store, add some defaults.
         * These will be ignored if a model is explicitly specified.
         */
        fields = config.fields || me.fields;
        if (!fields) {
            config.fields = [{name: 'text', type: 'string'}];
        }

        me.callParent([config]);

        // We create our data tree.
        me.tree = Ext.create('Ext.data.Tree');

        me.relayEvents(me.tree, [
            /**
             * @event append
             * @alias Ext.data.Tree#append
             */
            "append",

            /**
             * @event remove
             * @alias Ext.data.Tree#remove
             */
            "remove",

            /**
             * @event move
             * @alias Ext.data.Tree#move
             */
            "move",

            /**
             * @event insert
             * @alias Ext.data.Tree#insert
             */
            "insert",

            /**
             * @event beforeappend
             * @alias Ext.data.Tree#beforeappend
             */
            "beforeappend",

            /**
             * @event beforeremove
             * @alias Ext.data.Tree#beforeremove
             */
            "beforeremove",

            /**
             * @event beforemove
             * @alias Ext.data.Tree#beforemove
             */
            "beforemove",

            /**
             * @event beforeinsert
             * @alias Ext.data.Tree#beforeinsert
             */
            "beforeinsert",

             /**
              * @event expand
              * @alias Ext.data.Tree#expand
              */
             "expand",

             /**
              * @event collapse
              * @alias Ext.data.Tree#collapse
              */
             "collapse",

             /**
              * @event beforeexpand
              * @alias Ext.data.Tree#beforeexpand
              */
             "beforeexpand",

             /**
              * @event beforecollapse
              * @alias Ext.data.Tree#beforecollapse
              */
             "beforecollapse",

             /**
              * @event rootchange
              * @alias Ext.data.Tree#rootchange
              */
             "rootchange"
        ]);

        me.tree.on({
            scope: me,
            remove: me.onNodeRemove,
            // this event must follow the relay to beforeitemexpand to allow users to
            // cancel the expand:
            beforeexpand: me.onBeforeNodeExpand,
            beforecollapse: me.onBeforeNodeCollapse,
            append: me.onNodeAdded,
            insert: me.onNodeAdded
        });

        me.onBeforeSort();

        root = me.root;
        if (root) {
            delete me.root;
            me.setRootNode(root);
        }

        me.addEvents(
            /**
             * @event sort
             * Fires when this TreeStore is sorted.
             * @param {Ext.data.NodeInterface} node The node that is sorted.
             */
            'sort'
        );

        //<deprecated since=0.99>
        if (Ext.isDefined(me.nodeParameter)) {
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Ext.data.TreeStore: nodeParameter has been deprecated. Please use nodeParam instead.');
            }
            me.nodeParam = me.nodeParameter;
            delete me.nodeParameter;
        }
        //</deprecated>
    },

    // inherit docs
    setProxy: function(proxy) {
        var reader,
            needsRoot;

        if (proxy instanceof Ext.data.proxy.Proxy) {
            // proxy instance, check if a root was set
            needsRoot = Ext.isEmpty(proxy.getReader().root);
        } else if (Ext.isString(proxy)) {
            // string type, means a reader can't be set
            needsRoot = true;
        } else {
            // object, check if a reader and a root were specified.
            reader = proxy.reader;
            needsRoot = !(reader && !Ext.isEmpty(reader.root));
        }
        proxy = this.callParent(arguments);
        if (needsRoot) {
            reader = proxy.getReader();
            reader.root = this.defaultRootProperty;
            // force rebuild
            reader.buildExtractors(true);
        }
    },

    // inherit docs
    onBeforeSort: function() {
        if (this.folderSort) {
            this.sort({
                property: 'leaf',
                direction: 'ASC'
            }, 'prepend', false);
        }
    },

    /**
     * Called before a node is expanded.
     * @private
     * @param {Ext.data.NodeInterface} node The node being expanded.
     * @param {Function} callback The function to run after the expand finishes
     * @param {Object} scope The scope in which to run the callback function
     */
    onBeforeNodeExpand: function(node, callback, scope) {
        if (node.isLoaded()) {
            Ext.callback(callback, scope || node, [node.childNodes]);
        }
        else if (node.isLoading()) {
            this.on('load', function() {
                Ext.callback(callback, scope || node, [node.childNodes]);
            }, this, {single: true});
        }
        else {
            this.read({
                node: node,
                callback: function() {
                    Ext.callback(callback, scope || node, [node.childNodes]);
                }
            });
        }
    },

    //inherit docs
    getNewRecords: function() {
        return Ext.Array.filter(this.tree.flatten(), this.filterNew);
    },

    //inherit docs
    getUpdatedRecords: function() {
        return Ext.Array.filter(this.tree.flatten(), this.filterUpdated);
    },

    /**
     * Called before a node is collapsed.
     * @private
     * @param {Ext.data.NodeInterface} node The node being collapsed.
     * @param {Function} callback The function to run after the collapse finishes
     * @param {Object} scope The scope in which to run the callback function
     */
    onBeforeNodeCollapse: function(node, callback, scope) {
        callback.call(scope || node, node.childNodes);
    },

    onNodeRemove: function(parent, node) {
        var removed = this.removed;

        if (!node.isReplace && Ext.Array.indexOf(removed, node) == -1) {
            removed.push(node);
        }
    },

    onNodeAdded: function(parent, node) {
        var proxy = this.getProxy(),
            reader = proxy.getReader(),
            data = node.raw || node.data,
            dataRoot, children;

        Ext.Array.remove(this.removed, node);

        if (!node.isLeaf() && !node.isLoaded()) {
            dataRoot = reader.getRoot(data);
            if (dataRoot) {
                this.fillNode(node, reader.extractData(dataRoot));
                delete data[reader.root];
            }
        }
    },

    /**
     * Sets the root node for this store.  See also the {@link #root} config option.
     * @param {Ext.data.Model/Ext.data.NodeInterface/Object} root
     * @return {Ext.data.NodeInterface} The new root
     */
    setRootNode: function(root) {
        var me = this;

        root = root || {};
        if (!root.isNode) {
            // create a default rootNode and create internal data struct.
            Ext.applyIf(root, {
                id: me.defaultRootId,
                text: 'Root',
                allowDrag: false
            });
            root = Ext.ModelManager.create(root, me.model);
        }
        Ext.data.NodeInterface.decorate(root);

        // Because we have decorated the model with new fields,
        // we need to build new extactor functions on the reader.
        me.getProxy().getReader().buildExtractors(true);

        // When we add the root to the tree, it will automaticaly get the NodeInterface
        me.tree.setRootNode(root);

        // If the user has set expanded: true on the root, we want to call the expand function
        if (!root.isLoaded() && (me.autoLoad === true || root.isExpanded())) {
            me.load({
                node: root
            });
        }

        return root;
    },

    /**
     * Returns the root node for this tree.
     * @return {Ext.data.NodeInterface}
     */
    getRootNode: function() {
        return this.tree.getRootNode();
    },

    /**
     * Returns the record node by id
     * @return {Ext.data.NodeInterface}
     */
    getNodeById: function(id) {
        return this.tree.getNodeById(id);
    },

    /**
     * Loads the Store using its configured {@link #proxy}.
     * @param {Object} options (Optional) config object. This is passed into the {@link Ext.data.Operation Operation}
     * object that is created and then sent to the proxy's {@link Ext.data.proxy.Proxy#read} function.
     * The options can also contain a node, which indicates which node is to be loaded. If not specified, it will
     * default to the root node.
     */
    load: function(options) {
        options = options || {};
        options.params = options.params || {};

        var me = this,
            node = options.node || me.tree.getRootNode(),
            root;

        // If there is not a node it means the user hasnt defined a rootnode yet. In this case lets just
        // create one for them.
        if (!node) {
            node = me.setRootNode({
                expanded: true
            });
        }

        if (me.clearOnLoad) {
            node.removeAll(true);
        }

        Ext.applyIf(options, {
            node: node
        });
        options.params[me.nodeParam] = node ? node.getId() : 'root';

        if (node) {
            node.set('loading', true);
        }

        return me.callParent([options]);
    },


    /**
     * Fills a node with a series of child records.
     * @private
     * @param {Ext.data.NodeInterface} node The node to fill
     * @param {Ext.data.Model[]} records The records to add
     */
    fillNode: function(node, records) {
        var me = this,
            ln = records ? records.length : 0,
            i = 0, sortCollection;

        if (ln && me.sortOnLoad && !me.remoteSort && me.sorters && me.sorters.items) {
            sortCollection = Ext.create('Ext.util.MixedCollection');
            sortCollection.addAll(records);
            sortCollection.sort(me.sorters.items);
            records = sortCollection.items;
        }

        node.set('loaded', true);
        for (; i < ln; i++) {
            node.appendChild(records[i], undefined, true);
        }

        return records;
    },

    // inherit docs
    onProxyLoad: function(operation) {
        var me = this,
            successful = operation.wasSuccessful(),
            records = operation.getRecords(),
            node = operation.node;

        me.loading = false;
        node.set('loading', false);
        if (successful) {
            records = me.fillNode(node, records);
        }
        // The load event has an extra node parameter
        // (differing from the load event described in AbstractStore)
        /**
         * @event load
         * Fires whenever the store reads data from a remote data source.
         * @param {Ext.data.TreeStore} this
         * @param {Ext.data.NodeInterface} node The node that was loaded.
         * @param {Ext.data.Model[]} records An array of records.
         * @param {Boolean} successful True if the operation was successful.
         */
        // deprecate read?
        me.fireEvent('read', me, operation.node, records, successful);
        me.fireEvent('load', me, operation.node, records, successful);
        //this is a callback that would have been passed to the 'read' function and is optional
        Ext.callback(operation.callback, operation.scope || me, [records, operation, successful]);
    },

    /**
     * Creates any new records when a write is returned from the server.
     * @private
     * @param {Ext.data.Model[]} records The array of new records
     * @param {Ext.data.Operation} operation The operation that just completed
     * @param {Boolean} success True if the operation was successful
     */
    onCreateRecords: function(records, operation, success) {
        if (success) {
            var i = 0,
                length = records.length,
                originalRecords = operation.records,
                parentNode,
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
                    parentNode = original.parentNode;
                    if (parentNode) {
                        // prevent being added to the removed cache
                        original.isReplace = true;
                        parentNode.replaceChild(record, original);
                        delete original.isReplace;
                    }
                    record.phantom = false;
                }
            }
        }
    },

    /**
     * Updates any records when a write is returned from the server.
     * @private
     * @param {Ext.data.Model[]} records The array of updated records
     * @param {Ext.data.Operation} operation The operation that just completed
     * @param {Boolean} success True if the operation was successful
     */
    onUpdateRecords: function(records, operation, success){
        if (success) {
            var me = this,
                i = 0,
                length = records.length,
                data = me.data,
                original,
                parentNode,
                record;

            for (; i < length; ++i) {
                record = records[i];
                original = me.tree.getNodeById(record.getId());
                parentNode = original.parentNode;
                if (parentNode) {
                    // prevent being added to the removed cache
                    original.isReplace = true;
                    parentNode.replaceChild(record, original);
                    original.isReplace = false;
                }
            }
        }
    },

    /**
     * Removes any records when a write is returned from the server.
     * @private
     * @param {Ext.data.Model[]} records The array of removed records
     * @param {Ext.data.Operation} operation The operation that just completed
     * @param {Boolean} success True if the operation was successful
     */
    onDestroyRecords: function(records, operation, success){
        if (success) {
            this.removed = [];
        }
    },

    // inherit docs
    removeAll: function() {
        this.getRootNode().destroy(true);
        this.fireEvent('clear', this);
    },

    // inherit docs
    doSort: function(sorterFn) {
        var me = this;
        if (me.remoteSort) {
            //the load function will pick up the new sorters and request the sorted data from the proxy
            me.load();
        } else {
            me.tree.sort(sorterFn, true);
            me.fireEvent('datachanged', me);
        }
        me.fireEvent('sort', me);
    }
});

