/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.data.Tree
 *
 * This class is used as a container for a series of nodes. The nodes themselves maintain
 * the relationship between parent/child. The tree itself acts as a manager. It gives functionality
 * to retrieve a node by its identifier: {@link #getNodeById}.
 *
 * The tree also relays events from any of it's child nodes, allowing them to be handled in a
 * centralized fashion. In general this class is not used directly, rather used internally
 * by other parts of the framework.
 *
 */
Ext.define('Ext.data.Tree', {
    alias: 'data.tree',

    mixins: {
        observable: "Ext.util.Observable"
    },

    /**
     * @property {Ext.data.NodeInterface}
     * The root node for this tree
     */
    root: null,

    /**
     * Creates new Tree object.
     * @param {Ext.data.NodeInterface} root (optional) The root node
     */
    constructor: function(root) {
        var me = this;

        

        me.mixins.observable.constructor.call(me);

        if (root) {
            me.setRootNode(root);
        }
    },

    /**
     * Returns the root node for this tree.
     * @return {Ext.data.NodeInterface}
     */
    getRootNode : function() {
        return this.root;
    },

    /**
     * Sets the root node for this tree.
     * @param {Ext.data.NodeInterface} node
     * @return {Ext.data.NodeInterface} The root node
     */
    setRootNode : function(node) {
        var me = this;

        me.root = node;
        Ext.data.NodeInterface.decorate(node);

        if (me.fireEvent('beforeappend', null, node) !== false) {
            node.set('root', true);
            node.updateInfo();

            me.relayEvents(node, [
                /**
                 * @event append
                 * @alias Ext.data.NodeInterface#append
                 */
                "append",

                /**
                 * @event remove
                 * @alias Ext.data.NodeInterface#remove
                 */
                "remove",

                /**
                 * @event move
                 * @alias Ext.data.NodeInterface#move
                 */
                "move",

                /**
                 * @event insert
                 * @alias Ext.data.NodeInterface#insert
                 */
                "insert",

                /**
                 * @event beforeappend
                 * @alias Ext.data.NodeInterface#beforeappend
                 */
                "beforeappend",

                /**
                 * @event beforeremove
                 * @alias Ext.data.NodeInterface#beforeremove
                 */
                "beforeremove",

                /**
                 * @event beforemove
                 * @alias Ext.data.NodeInterface#beforemove
                 */
                "beforemove",

                /**
                 * @event beforeinsert
                 * @alias Ext.data.NodeInterface#beforeinsert
                 */
                "beforeinsert",

                 /**
                  * @event expand
                  * @alias Ext.data.NodeInterface#expand
                  */
                 "expand",

                 /**
                  * @event collapse
                  * @alias Ext.data.NodeInterface#collapse
                  */
                 "collapse",

                 /**
                  * @event beforeexpand
                  * @alias Ext.data.NodeInterface#beforeexpand
                  */
                 "beforeexpand",

                 /**
                  * @event beforecollapse
                  * @alias Ext.data.NodeInterface#beforecollapse
                  */
                 "beforecollapse" ,

                 /**
                  * @event rootchange
                  * Fires whenever the root node is changed in the tree.
                  * @param {Ext.data.Model} root The new root
                  */
                 "rootchange"
            ]);

            node.on({
                scope: me,
                insert: me.onNodeInsert,
                append: me.onNodeAppend,
                remove: me.onNodeRemove
            });

            me.nodeHash = {};
            me.registerNode(node);
            me.fireEvent('append', null, node);
            me.fireEvent('rootchange', node);
        }

        return node;
    },

    /**
     * Flattens all the nodes in the tree into an array.
     * @private
     * @return {Ext.data.NodeInterface[]} The flattened nodes.
     */
    flatten: function(){
        var nodes = [],
            hash = this.nodeHash,
            key;

        for (key in hash) {
            if (hash.hasOwnProperty(key)) {
                nodes.push(hash[key]);
            }
        }
        return nodes;
    },

    /**
     * Fired when a node is inserted into the root or one of it's children
     * @private
     * @param {Ext.data.NodeInterface} parent The parent node
     * @param {Ext.data.NodeInterface} node The inserted node
     */
    onNodeInsert: function(parent, node) {
        this.registerNode(node, true);
    },

    /**
     * Fired when a node is appended into the root or one of it's children
     * @private
     * @param {Ext.data.NodeInterface} parent The parent node
     * @param {Ext.data.NodeInterface} node The appended node
     */
    onNodeAppend: function(parent, node) {
        this.registerNode(node, true);
    },

    /**
     * Fired when a node is removed from the root or one of it's children
     * @private
     * @param {Ext.data.NodeInterface} parent The parent node
     * @param {Ext.data.NodeInterface} node The removed node
     */
    onNodeRemove: function(parent, node) {
        this.unregisterNode(node, true);
    },

    /**
     * Gets a node in this tree by its id.
     * @param {String} id
     * @return {Ext.data.NodeInterface} The match node.
     */
    getNodeById : function(id) {
        return this.nodeHash[id];
    },

    /**
     * Registers a node with the tree
     * @private
     * @param {Ext.data.NodeInterface} The node to register
     * @param {Boolean} [includeChildren] True to unregister any child nodes
     */
    registerNode : function(node, includeChildren) {
        this.nodeHash[node.getId() || node.internalId] = node;
        if (includeChildren === true) {
            node.eachChild(function(child){
                this.registerNode(child, true);
            }, this);
        }
    },

    /**
     * Unregisters a node with the tree
     * @private
     * @param {Ext.data.NodeInterface} The node to unregister
     * @param {Boolean} [includeChildren] True to unregister any child nodes
     */
    unregisterNode : function(node, includeChildren) {
        delete this.nodeHash[node.getId() || node.internalId];
        if (includeChildren === true) {
            node.eachChild(function(child){
                this.unregisterNode(child, true);
            }, this);
        }
    },

    /**
     * Sorts this tree
     * @private
     * @param {Function} sorterFn The function to use for sorting
     * @param {Boolean} recursive True to perform recursive sorting
     */
    sort: function(sorterFn, recursive) {
        this.getRootNode().sort(sorterFn, recursive);
    },

     /**
     * Filters this tree
     * @private
     * @param {Function} sorterFn The function to use for filtering
     * @param {Boolean} recursive True to perform recursive filtering
     */
    filter: function(filters, recursive) {
        this.getRootNode().filter(filters, recursive);
    }
});
