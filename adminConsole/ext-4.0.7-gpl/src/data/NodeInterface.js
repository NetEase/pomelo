/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This class is used as a set of methods that are applied to the prototype of a
 * Model to decorate it with a Node API. This means that models used in conjunction with a tree
 * will have all of the tree related methods available on the model. In general this class will
 * not be used directly by the developer. This class also creates extra fields on the model if
 * they do not exist, to help maintain the tree state and UI. These fields are documented as
 * config options.
 */
Ext.define('Ext.data.NodeInterface', {
    requires: ['Ext.data.Field'],

    /**
     * @cfg {String} parentId
     * ID of parent node.
     */

    /**
     * @cfg {Number} index
     * The position of the node inside its parent. When parent has 4 children and the node is third amongst them,
     * index will be 2.
     */

    /**
     * @cfg {Number} depth
     * The number of parents this node has. A root node has depth 0, a child of it depth 1, and so on...
     */

    /**
     * @cfg {Boolean} [expanded=false]
     * True if the node is expanded.
     */

    /**
     * @cfg {Boolean} [expandable=false]
     * Set to true to allow for expanding/collapsing of this node.
     */

    /**
     * @cfg {Boolean} [checked=null]
     * Set to true or false to show a checkbox alongside this node.
     */

    /**
     * @cfg {Boolean} [leaf=false]
     * Set to true to indicate that this child can have no children. The expand icon/arrow will then not be
     * rendered for this node.
     */

    /**
     * @cfg {String} cls
     * CSS class to apply for this node.
     */

    /**
     * @cfg {String} iconCls
     * CSS class to apply for this node's icon.
     */

    /**
     * @cfg {String} icon
     * URL for this node's icon.
     */

    /**
     * @cfg {Boolean} root
     * True if this is the root node.
     */

    /**
     * @cfg {Boolean} isLast
     * True if this is the last node.
     */

    /**
     * @cfg {Boolean} isFirst
     * True if this is the first node.
     */

    /**
     * @cfg {Boolean} [allowDrop=true]
     * Set to false to deny dropping on this node.
     */

    /**
     * @cfg {Boolean} [allowDrag=true]
     * Set to false to deny dragging of this node.
     */

    /**
     * @cfg {Boolean} [loaded=false]
     * True if the node has finished loading.
     */

    /**
     * @cfg {Boolean} [loading=false]
     * True if the node is currently loading.
     */

    /**
     * @cfg {String} href
     * An URL for a link that's created when this config is specified.
     */

    /**
     * @cfg {String} hrefTarget
     * Target for link. Only applicable when {@link #href} also specified.
     */

    /**
     * @cfg {String} qtip
     * Tooltip text to show on this node.
     */

    /**
     * @cfg {String} qtitle
     * Tooltip title.
     */

    /**
     * @cfg {String} text
     * The text for to show on node label.
     */

    /**
     * @cfg {Ext.data.NodeInterface[]} children
     * Array of child nodes.
     */


    /**
     * @property nextSibling
     * A reference to this node's next sibling node. `null` if this node does not have a next sibling.
     */

    /**
     * @property previousSibling
     * A reference to this node's previous sibling node. `null` if this node does not have a previous sibling.
     */

    /**
     * @property parentNode
     * A reference to this node's parent node. `null` if this node is the root node.
     */

    /**
     * @property lastChild
     * A reference to this node's last child node. `null` if this node has no children.
     */

    /**
     * @property firstChild
     * A reference to this node's first child node. `null` if this node has no children.
     */

    /**
     * @property childNodes
     * An array of this nodes children.  Array will be empty if this node has no chidren.
     */

    statics: {
        /**
         * This method allows you to decorate a Record's prototype to implement the NodeInterface.
         * This adds a set of methods, new events, new properties and new fields on every Record
         * with the same Model as the passed Record.
         * @param {Ext.data.Model} record The Record you want to decorate the prototype of.
         * @static
         */
        decorate: function(record) {
            if (!record.isNode) {
                // Apply the methods and fields to the prototype
                // @TODO: clean this up to use proper class system stuff
                var mgr = Ext.ModelManager,
                    modelName = record.modelName,
                    modelClass = mgr.getModel(modelName),
                    idName = modelClass.prototype.idProperty,
                    newFields = [],
                    i, newField, len;

                // Start by adding the NodeInterface methods to the Model's prototype
                modelClass.override(this.getPrototypeBody());
                newFields = this.applyFields(modelClass, [
                    {name: idName,       type: 'string',  defaultValue: null},
                    {name: 'parentId',   type: 'string',  defaultValue: null},
                    {name: 'index',      type: 'int',     defaultValue: null},
                    {name: 'depth',      type: 'int',     defaultValue: 0},
                    {name: 'expanded',   type: 'bool',    defaultValue: false, persist: false},
                    {name: 'expandable', type: 'bool',    defaultValue: true, persist: false},
                    {name: 'checked',    type: 'auto',    defaultValue: null},
                    {name: 'leaf',       type: 'bool',    defaultValue: false, persist: false},
                    {name: 'cls',        type: 'string',  defaultValue: null, persist: false},
                    {name: 'iconCls',    type: 'string',  defaultValue: null, persist: false},
                    {name: 'icon',       type: 'string',  defaultValue: null, persist: false},
                    {name: 'root',       type: 'boolean', defaultValue: false, persist: false},
                    {name: 'isLast',     type: 'boolean', defaultValue: false, persist: false},
                    {name: 'isFirst',    type: 'boolean', defaultValue: false, persist: false},
                    {name: 'allowDrop',  type: 'boolean', defaultValue: true, persist: false},
                    {name: 'allowDrag',  type: 'boolean', defaultValue: true, persist: false},
                    {name: 'loaded',     type: 'boolean', defaultValue: false, persist: false},
                    {name: 'loading',    type: 'boolean', defaultValue: false, persist: false},
                    {name: 'href',       type: 'string',  defaultValue: null, persist: false},
                    {name: 'hrefTarget', type: 'string',  defaultValue: null, persist: false},
                    {name: 'qtip',       type: 'string',  defaultValue: null, persist: false},
                    {name: 'qtitle',     type: 'string',  defaultValue: null, persist: false}
                ]);

                len = newFields.length;
                // Set default values
                for (i = 0; i < len; ++i) {
                    newField = newFields[i];
                    if (record.get(newField.name) === undefined) {
                        record.data[newField.name] = newField.defaultValue;
                    }
                }
            }

            Ext.applyIf(record, {
                firstChild: null,
                lastChild: null,
                parentNode: null,
                previousSibling: null,
                nextSibling: null,
                childNodes: []
            });
            // Commit any fields so the record doesn't show as dirty initially
            record.commit(true);

            record.enableBubble([
                /**
                 * @event append
                 * Fires when a new child node is appended
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} node The newly appended node
                 * @param {Number} index The index of the newly appended node
                 */
                "append",

                /**
                 * @event remove
                 * Fires when a child node is removed
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} node The removed node
                 */
                "remove",

                /**
                 * @event move
                 * Fires when this node is moved to a new location in the tree
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} oldParent The old parent of this node
                 * @param {Ext.data.NodeInterface} newParent The new parent of this node
                 * @param {Number} index The index it was moved to
                 */
                "move",

                /**
                 * @event insert
                 * Fires when a new child node is inserted.
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} node The child node inserted
                 * @param {Ext.data.NodeInterface} refNode The child node the node was inserted before
                 */
                "insert",

                /**
                 * @event beforeappend
                 * Fires before a new child is appended, return false to cancel the append.
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} node The child node to be appended
                 */
                "beforeappend",

                /**
                 * @event beforeremove
                 * Fires before a child is removed, return false to cancel the remove.
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} node The child node to be removed
                 */
                "beforeremove",

                /**
                 * @event beforemove
                 * Fires before this node is moved to a new location in the tree. Return false to cancel the move.
                 * @param {Ext.data.NodeInterface} this This node
                 * @param {Ext.data.NodeInterface} oldParent The parent of this node
                 * @param {Ext.data.NodeInterface} newParent The new parent this node is moving to
                 * @param {Number} index The index it is being moved to
                 */
                "beforemove",

                 /**
                  * @event beforeinsert
                  * Fires before a new child is inserted, return false to cancel the insert.
                  * @param {Ext.data.NodeInterface} this This node
                  * @param {Ext.data.NodeInterface} node The child node to be inserted
                  * @param {Ext.data.NodeInterface} refNode The child node the node is being inserted before
                  */
                "beforeinsert",

                /**
                 * @event expand
                 * Fires when this node is expanded.
                 * @param {Ext.data.NodeInterface} this The expanding node
                 */
                "expand",

                /**
                 * @event collapse
                 * Fires when this node is collapsed.
                 * @param {Ext.data.NodeInterface} this The collapsing node
                 */
                "collapse",

                /**
                 * @event beforeexpand
                 * Fires before this node is expanded.
                 * @param {Ext.data.NodeInterface} this The expanding node
                 */
                "beforeexpand",

                /**
                 * @event beforecollapse
                 * Fires before this node is collapsed.
                 * @param {Ext.data.NodeInterface} this The collapsing node
                 */
                "beforecollapse",

                /**
                 * @event sort
                 * Fires when this node's childNodes are sorted.
                 * @param {Ext.data.NodeInterface} this This node.
                 * @param {Ext.data.NodeInterface[]} childNodes The childNodes of this node.
                 */
                "sort"
            ]);

            return record;
        },

        applyFields: function(modelClass, addFields) {
            var modelPrototype = modelClass.prototype,
                fields = modelPrototype.fields,
                keys = fields.keys,
                ln = addFields.length,
                addField, i, name,
                newFields = [];

            for (i = 0; i < ln; i++) {
                addField = addFields[i];
                if (!Ext.Array.contains(keys, addField.name)) {
                    addField = Ext.create('data.field', addField);

                    newFields.push(addField);
                    fields.add(addField);
                }
            }

            return newFields;
        },

        getPrototypeBody: function() {
            return {
                isNode: true,

                /**
                 * Ensures that the passed object is an instance of a Record with the NodeInterface applied
                 * @return {Boolean}
                 */
                createNode: function(node) {
                    if (Ext.isObject(node) && !node.isModel) {
                        node = Ext.ModelManager.create(node, this.modelName);
                    }
                    // Make sure the node implements the node interface
                    return Ext.data.NodeInterface.decorate(node);
                },

                /**
                 * Returns true if this node is a leaf
                 * @return {Boolean}
                 */
                isLeaf : function() {
                    return this.get('leaf') === true;
                },

                /**
                 * Sets the first child of this node
                 * @private
                 * @param {Ext.data.NodeInterface} node
                 */
                setFirstChild : function(node) {
                    this.firstChild = node;
                },

                /**
                 * Sets the last child of this node
                 * @private
                 * @param {Ext.data.NodeInterface} node
                 */
                setLastChild : function(node) {
                    this.lastChild = node;
                },

                /**
                 * Updates general data of this node like isFirst, isLast, depth. This
                 * method is internally called after a node is moved. This shouldn't
                 * have to be called by the developer unless they are creating custom
                 * Tree plugins.
                 * @return {Boolean}
                 */
                updateInfo: function(silent) {
                    var me = this,
                        isRoot = me.isRoot(),
                        parentNode = me.parentNode,
                        isFirst = (!parentNode ? true : parentNode.firstChild == me),
                        isLast = (!parentNode ? true : parentNode.lastChild == me),
                        depth = 0,
                        parent = me,
                        children = me.childNodes,
                        len = children.length,
                        i = 0;

                    while (parent.parentNode) {
                        ++depth;
                        parent = parent.parentNode;
                    }

                    me.beginEdit();
                    me.set({
                        isFirst: isFirst,
                        isLast: isLast,
                        depth: depth,
                        index: parentNode ? parentNode.indexOf(me) : 0,
                        parentId: parentNode ? parentNode.getId() : null
                    });
                    me.endEdit(silent);
                    if (silent) {
                        me.commit();
                    }

                    for (i = 0; i < len; i++) {
                        children[i].updateInfo(silent);
                    }
                },

                /**
                 * Returns true if this node is the last child of its parent
                 * @return {Boolean}
                 */
                isLast : function() {
                   return this.get('isLast');
                },

                /**
                 * Returns true if this node is the first child of its parent
                 * @return {Boolean}
                 */
                isFirst : function() {
                   return this.get('isFirst');
                },

                /**
                 * Returns true if this node has one or more child nodes, else false.
                 * @return {Boolean}
                 */
                hasChildNodes : function() {
                    return !this.isLeaf() && this.childNodes.length > 0;
                },

                /**
                 * Returns true if this node has one or more child nodes, or if the <tt>expandable</tt>
                 * node attribute is explicitly specified as true, otherwise returns false.
                 * @return {Boolean}
                 */
                isExpandable : function() {
                    var me = this;

                    if (me.get('expandable')) {
                        return !(me.isLeaf() || (me.isLoaded() && !me.hasChildNodes()));
                    }
                    return false;
                },

                /**
                 * Inserts node(s) as the last child node of this node.
                 *
                 * If the node was previously a child node of another parent node, it will be removed from that node first.
                 *
                 * @param {Ext.data.NodeInterface/Ext.data.NodeInterface[]} node The node or Array of nodes to append
                 * @return {Ext.data.NodeInterface} The appended node if single append, or null if an array was passed
                 */
                appendChild : function(node, suppressEvents, suppressNodeUpdate) {
                    var me = this,
                        i, ln,
                        index,
                        oldParent,
                        ps;

                    // if passed an array or multiple args do them one by one
                    if (Ext.isArray(node)) {
                        for (i = 0, ln = node.length; i < ln; i++) {
                            me.appendChild(node[i]);
                        }
                    } else {
                        // Make sure it is a record
                        node = me.createNode(node);

                        if (suppressEvents !== true && me.fireEvent("beforeappend", me, node) === false) {
                            return false;
                        }

                        index = me.childNodes.length;
                        oldParent = node.parentNode;

                        // it's a move, make sure we move it cleanly
                        if (oldParent) {
                            if (suppressEvents !== true && node.fireEvent("beforemove", node, oldParent, me, index) === false) {
                                return false;
                            }
                            oldParent.removeChild(node, null, false, true);
                        }

                        index = me.childNodes.length;
                        if (index === 0) {
                            me.setFirstChild(node);
                        }

                        me.childNodes.push(node);
                        node.parentNode = me;
                        node.nextSibling = null;

                        me.setLastChild(node);

                        ps = me.childNodes[index - 1];
                        if (ps) {
                            node.previousSibling = ps;
                            ps.nextSibling = node;
                            ps.updateInfo(suppressNodeUpdate);
                        } else {
                            node.previousSibling = null;
                        }

                        node.updateInfo(suppressNodeUpdate);

                        // As soon as we append a child to this node, we are loaded
                        if (!me.isLoaded()) {
                            me.set('loaded', true);
                        }
                        // If this node didnt have any childnodes before, update myself
                        else if (me.childNodes.length === 1) {
                            me.set('loaded', me.isLoaded());
                        }

                        if (suppressEvents !== true) {
                            me.fireEvent("append", me, node, index);

                            if (oldParent) {
                                node.fireEvent("move", node, oldParent, me, index);
                            }
                        }

                        return node;
                    }
                },

                /**
                 * Returns the bubble target for this node
                 * @private
                 * @return {Object} The bubble target
                 */
                getBubbleTarget: function() {
                    return this.parentNode;
                },

                /**
                 * Removes a child node from this node.
                 * @param {Ext.data.NodeInterface} node The node to remove
                 * @param {Boolean} [destroy=false] True to destroy the node upon removal.
                 * @return {Ext.data.NodeInterface} The removed node
                 */
                removeChild : function(node, destroy, suppressEvents, suppressNodeUpdate) {
                    var me = this,
                        index = me.indexOf(node);

                    if (index == -1 || (suppressEvents !== true && me.fireEvent("beforeremove", me, node) === false)) {
                        return false;
                    }

                    // remove it from childNodes collection
                    Ext.Array.erase(me.childNodes, index, 1);

                    // update child refs
                    if (me.firstChild == node) {
                        me.setFirstChild(node.nextSibling);
                    }
                    if (me.lastChild == node) {
                        me.setLastChild(node.previousSibling);
                    }

                    // update siblings
                    if (node.previousSibling) {
                        node.previousSibling.nextSibling = node.nextSibling;
                        node.previousSibling.updateInfo(suppressNodeUpdate);
                    }
                    if (node.nextSibling) {
                        node.nextSibling.previousSibling = node.previousSibling;
                        node.nextSibling.updateInfo(suppressNodeUpdate);
                    }

                    if (suppressEvents !== true) {
                        me.fireEvent("remove", me, node);
                    }


                    // If this node suddenly doesnt have childnodes anymore, update myself
                    if (!me.childNodes.length) {
                        me.set('loaded', me.isLoaded());
                    }

                    if (destroy) {
                        node.destroy(true);
                    } else {
                        node.clear();
                    }

                    return node;
                },

                /**
                 * Creates a copy (clone) of this Node.
                 * @param {String} [id] A new id, defaults to this Node's id.
                 * @param {Boolean} [deep=false] True to recursively copy all child Nodes into the new Node.
                 * False to copy without child Nodes.
                 * @return {Ext.data.NodeInterface} A copy of this Node.
                 */
                copy: function(newId, deep) {
                    var me = this,
                        result = me.callOverridden(arguments),
                        len = me.childNodes ? me.childNodes.length : 0,
                        i;

                    // Move child nodes across to the copy if required
                    if (deep) {
                        for (i = 0; i < len; i++) {
                            result.appendChild(me.childNodes[i].copy(true));
                        }
                    }
                    return result;
                },

                /**
                 * Clears the node.
                 * @private
                 * @param {Boolean} [destroy=false] True to destroy the node.
                 */
                clear : function(destroy) {
                    var me = this;

                    // clear any references from the node
                    me.parentNode = me.previousSibling = me.nextSibling = null;
                    if (destroy) {
                        me.firstChild = me.lastChild = null;
                    }
                },

                /**
                 * Destroys the node.
                 */
                destroy : function(silent) {
                    /*
                     * Silent is to be used in a number of cases
                     * 1) When setRoot is called.
                     * 2) When destroy on the tree is called
                     * 3) For destroying child nodes on a node
                     */
                    var me = this,
                        options = me.destroyOptions;

                    if (silent === true) {
                        me.clear(true);
                        Ext.each(me.childNodes, function(n) {
                            n.destroy(true);
                        });
                        me.childNodes = null;
                        delete me.destroyOptions;
                        me.callOverridden([options]);
                    } else {
                        me.destroyOptions = silent;
                        // overridden method will be called, since remove will end up calling destroy(true);
                        me.remove(true);
                    }
                },

                /**
                 * Inserts the first node before the second node in this nodes childNodes collection.
                 * @param {Ext.data.NodeInterface} node The node to insert
                 * @param {Ext.data.NodeInterface} refNode The node to insert before (if null the node is appended)
                 * @return {Ext.data.NodeInterface} The inserted node
                 */
                insertBefore : function(node, refNode, suppressEvents) {
                    var me = this,
                        index     = me.indexOf(refNode),
                        oldParent = node.parentNode,
                        refIndex  = index,
                        ps;

                    if (!refNode) { // like standard Dom, refNode can be null for append
                        return me.appendChild(node);
                    }

                    // nothing to do
                    if (node == refNode) {
                        return false;
                    }

                    // Make sure it is a record with the NodeInterface
                    node = me.createNode(node);

                    if (suppressEvents !== true && me.fireEvent("beforeinsert", me, node, refNode) === false) {
                        return false;
                    }

                    // when moving internally, indexes will change after remove
                    if (oldParent == me && me.indexOf(node) < index) {
                        refIndex--;
                    }

                    // it's a move, make sure we move it cleanly
                    if (oldParent) {
                        if (suppressEvents !== true && node.fireEvent("beforemove", node, oldParent, me, index, refNode) === false) {
                            return false;
                        }
                        oldParent.removeChild(node);
                    }

                    if (refIndex === 0) {
                        me.setFirstChild(node);
                    }

                    Ext.Array.splice(me.childNodes, refIndex, 0, node);
                    node.parentNode = me;

                    node.nextSibling = refNode;
                    refNode.previousSibling = node;

                    ps = me.childNodes[refIndex - 1];
                    if (ps) {
                        node.previousSibling = ps;
                        ps.nextSibling = node;
                        ps.updateInfo();
                    } else {
                        node.previousSibling = null;
                    }

                    node.updateInfo();

                    if (!me.isLoaded()) {
                        me.set('loaded', true);
                    }
                    // If this node didnt have any childnodes before, update myself
                    else if (me.childNodes.length === 1) {
                        me.set('loaded', me.isLoaded());
                    }

                    if (suppressEvents !== true) {
                        me.fireEvent("insert", me, node, refNode);

                        if (oldParent) {
                            node.fireEvent("move", node, oldParent, me, refIndex, refNode);
                        }
                    }

                    return node;
                },

                /**
                 * Insert a node into this node
                 * @param {Number} index The zero-based index to insert the node at
                 * @param {Ext.data.Model} node The node to insert
                 * @return {Ext.data.Model} The record you just inserted
                 */
                insertChild: function(index, node) {
                    var sibling = this.childNodes[index];
                    if (sibling) {
                        return this.insertBefore(node, sibling);
                    }
                    else {
                        return this.appendChild(node);
                    }
                },

                /**
                 * Removes this node from its parent
                 * @param {Boolean} [destroy=false] True to destroy the node upon removal.
                 * @return {Ext.data.NodeInterface} this
                 */
                remove : function(destroy, suppressEvents) {
                    var parentNode = this.parentNode;

                    if (parentNode) {
                        parentNode.removeChild(this, destroy, suppressEvents, true);
                    }
                    return this;
                },

                /**
                 * Removes all child nodes from this node.
                 * @param {Boolean} [destroy=false] <True to destroy the node upon removal.
                 * @return {Ext.data.NodeInterface} this
                 */
                removeAll : function(destroy, suppressEvents) {
                    var cn = this.childNodes,
                        n;

                    while ((n = cn[0])) {
                        this.removeChild(n, destroy, suppressEvents);
                    }
                    return this;
                },

                /**
                 * Returns the child node at the specified index.
                 * @param {Number} index
                 * @return {Ext.data.NodeInterface}
                 */
                getChildAt : function(index) {
                    return this.childNodes[index];
                },

                /**
                 * Replaces one child node in this node with another.
                 * @param {Ext.data.NodeInterface} newChild The replacement node
                 * @param {Ext.data.NodeInterface} oldChild The node to replace
                 * @return {Ext.data.NodeInterface} The replaced node
                 */
                replaceChild : function(newChild, oldChild, suppressEvents) {
                    var s = oldChild ? oldChild.nextSibling : null;

                    this.removeChild(oldChild, suppressEvents);
                    this.insertBefore(newChild, s, suppressEvents);
                    return oldChild;
                },

                /**
                 * Returns the index of a child node
                 * @param {Ext.data.NodeInterface} node
                 * @return {Number} The index of the node or -1 if it was not found
                 */
                indexOf : function(child) {
                    return Ext.Array.indexOf(this.childNodes, child);
                },

                /**
                 * Gets the hierarchical path from the root of the current node.
                 * @param {String} [field] The field to construct the path from. Defaults to the model idProperty.
                 * @param {String} [separator="/"] A separator to use.
                 * @return {String} The node path
                 */
                getPath: function(field, separator) {
                    field = field || this.idProperty;
                    separator = separator || '/';

                    var path = [this.get(field)],
                        parent = this.parentNode;

                    while (parent) {
                        path.unshift(parent.get(field));
                        parent = parent.parentNode;
                    }
                    return separator + path.join(separator);
                },

                /**
                 * Returns depth of this node (the root node has a depth of 0)
                 * @return {Number}
                 */
                getDepth : function() {
                    return this.get('depth');
                },

                /**
                 * Bubbles up the tree from this node, calling the specified function with each node. The arguments to the function
                 * will be the args provided or the current node. If the function returns false at any point,
                 * the bubble is stopped.
                 * @param {Function} fn The function to call
                 * @param {Object} [scope] The scope (this reference) in which the function is executed. Defaults to the current Node.
                 * @param {Array} [args] The args to call the function with. Defaults to passing the current Node.
                 */
                bubble : function(fn, scope, args) {
                    var p = this;
                    while (p) {
                        if (fn.apply(scope || p, args || [p]) === false) {
                            break;
                        }
                        p = p.parentNode;
                    }
                },

                //<deprecated since=0.99>
                cascade: function() {
                    if (Ext.isDefined(Ext.global.console)) {
                        Ext.global.console.warn('Ext.data.Node: cascade has been deprecated. Please use cascadeBy instead.');
                    }
                    return this.cascadeBy.apply(this, arguments);
                },
                //</deprecated>

                /**
                 * Cascades down the tree from this node, calling the specified function with each node. The arguments to the function
                 * will be the args provided or the current node. If the function returns false at any point,
                 * the cascade is stopped on that branch.
                 * @param {Function} fn The function to call
                 * @param {Object} [scope] The scope (this reference) in which the function is executed. Defaults to the current Node.
                 * @param {Array} [args] The args to call the function with. Defaults to passing the current Node.
                 */
                cascadeBy : function(fn, scope, args) {
                    if (fn.apply(scope || this, args || [this]) !== false) {
                        var childNodes = this.childNodes,
                            length     = childNodes.length,
                            i;

                        for (i = 0; i < length; i++) {
                            childNodes[i].cascadeBy(fn, scope, args);
                        }
                    }
                },

                /**
                 * Interates the child nodes of this node, calling the specified function with each node. The arguments to the function
                 * will be the args provided or the current node. If the function returns false at any point,
                 * the iteration stops.
                 * @param {Function} fn The function to call
                 * @param {Object} [scope] The scope (this reference) in which the function is executed. Defaults to the current Node in iteration.
                 * @param {Array} [args] The args to call the function with. Defaults to passing the current Node.
                 */
                eachChild : function(fn, scope, args) {
                    var childNodes = this.childNodes,
                        length     = childNodes.length,
                        i;

                    for (i = 0; i < length; i++) {
                        if (fn.apply(scope || this, args || [childNodes[i]]) === false) {
                            break;
                        }
                    }
                },

                /**
                 * Finds the first child that has the attribute with the specified value.
                 * @param {String} attribute The attribute name
                 * @param {Object} value The value to search for
                 * @param {Boolean} [deep=false] True to search through nodes deeper than the immediate children
                 * @return {Ext.data.NodeInterface} The found child or null if none was found
                 */
                findChild : function(attribute, value, deep) {
                    return this.findChildBy(function() {
                        return this.get(attribute) == value;
                    }, null, deep);
                },

                /**
                 * Finds the first child by a custom function. The child matches if the function passed returns true.
                 * @param {Function} fn A function which must return true if the passed Node is the required Node.
                 * @param {Object} [scope] The scope (this reference) in which the function is executed. Defaults to the Node being tested.
                 * @param {Boolean} [deep=false] True to search through nodes deeper than the immediate children
                 * @return {Ext.data.NodeInterface} The found child or null if none was found
                 */
                findChildBy : function(fn, scope, deep) {
                    var cs = this.childNodes,
                        len = cs.length,
                        i = 0, n, res;

                    for (; i < len; i++) {
                        n = cs[i];
                        if (fn.call(scope || n, n) === true) {
                            return n;
                        }
                        else if (deep) {
                            res = n.findChildBy(fn, scope, deep);
                            if (res !== null) {
                                return res;
                            }
                        }
                    }

                    return null;
                },

                /**
                 * Returns true if this node is an ancestor (at any point) of the passed node.
                 * @param {Ext.data.NodeInterface} node
                 * @return {Boolean}
                 */
                contains : function(node) {
                    return node.isAncestor(this);
                },

                /**
                 * Returns true if the passed node is an ancestor (at any point) of this node.
                 * @param {Ext.data.NodeInterface} node
                 * @return {Boolean}
                 */
                isAncestor : function(node) {
                    var p = this.parentNode;
                    while (p) {
                        if (p == node) {
                            return true;
                        }
                        p = p.parentNode;
                    }
                    return false;
                },

                /**
                 * Sorts this nodes children using the supplied sort function.
                 * @param {Function} fn A function which, when passed two Nodes, returns -1, 0 or 1 depending upon required sort order.
                 * @param {Boolean} [recursive=false] True to apply this sort recursively
                 * @param {Boolean} [suppressEvent=false] True to not fire a sort event.
                 */
                sort : function(sortFn, recursive, suppressEvent) {
                    var cs  = this.childNodes,
                        ln = cs.length,
                        i, n;

                    if (ln > 0) {
                        Ext.Array.sort(cs, sortFn);
                        for (i = 0; i < ln; i++) {
                            n = cs[i];
                            n.previousSibling = cs[i-1];
                            n.nextSibling = cs[i+1];

                            if (i === 0) {
                                this.setFirstChild(n);
                                n.updateInfo();
                            }
                            if (i == ln - 1) {
                                this.setLastChild(n);
                                n.updateInfo();
                            }
                            if (recursive && !n.isLeaf()) {
                                n.sort(sortFn, true, true);
                            }
                        }

                        if (suppressEvent !== true) {
                            this.fireEvent('sort', this, cs);
                        }
                    }
                },

                /**
                 * Returns true if this node is expaned
                 * @return {Boolean}
                 */
                isExpanded: function() {
                    return this.get('expanded');
                },

                /**
                 * Returns true if this node is loaded
                 * @return {Boolean}
                 */
                isLoaded: function() {
                    return this.get('loaded');
                },

                /**
                 * Returns true if this node is loading
                 * @return {Boolean}
                 */
                isLoading: function() {
                    return this.get('loading');
                },

                /**
                 * Returns true if this node is the root node
                 * @return {Boolean}
                 */
                isRoot: function() {
                    return !this.parentNode;
                },

                /**
                 * Returns true if this node is visible
                 * @return {Boolean}
                 */
                isVisible: function() {
                    var parent = this.parentNode;
                    while (parent) {
                        if (!parent.isExpanded()) {
                            return false;
                        }
                        parent = parent.parentNode;
                    }
                    return true;
                },

                /**
                 * Expand this node.
                 * @param {Boolean} [recursive=false] True to recursively expand all the children
                 * @param {Function} [callback] The function to execute once the expand completes
                 * @param {Object} [scope] The scope to run the callback in
                 */
                expand: function(recursive, callback, scope) {
                    var me = this;

                    // all paths must call the callback (eventually) or things like
                    // selectPath fail

                    // First we start by checking if this node is a parent
                    if (!me.isLeaf()) {
                        // If it's loaded, wait until it loads before proceeding
                        if (me.isLoading()) {
                            me.on('expand', function(){
                                me.expand(recursive, callback, scope);
                            }, me, {single: true});
                        } else {
                            // Now we check if this record is already expanding or expanded
                            if (!me.isExpanded()) {
                                // The TreeStore actually listens for the beforeexpand method and checks
                                // whether we have to asynchronously load the children from the server
                                // first. Thats why we pass a callback function to the event that the
                                // store can call once it has loaded and parsed all the children.
                                me.fireEvent('beforeexpand', me, function(){
                                    me.set('expanded', true);
                                    me.fireEvent('expand', me, me.childNodes, false);

                                    // Call the expandChildren method if recursive was set to true
                                    if (recursive) {
                                        me.expandChildren(true, callback, scope);
                                    } else {
                                        Ext.callback(callback, scope || me, [me.childNodes]);
                                    }
                                }, me);
                            } else if (recursive) {
                                // If it is is already expanded but we want to recursively expand then call expandChildren
                                me.expandChildren(true, callback, scope);
                            } else {
                                Ext.callback(callback, scope || me, [me.childNodes]);
                            }
                        }
                    } else {
                        // If it's not then we fire the callback right away
                        Ext.callback(callback, scope || me); // leaf = no childNodes
                    }
                },

                /**
                 * Expand all the children of this node.
                 * @param {Boolean} [recursive=false] True to recursively expand all the children
                 * @param {Function} [callback] The function to execute once all the children are expanded
                 * @param {Object} [scope] The scope to run the callback in
                 */
                expandChildren: function(recursive, callback, scope) {
                    var me = this,
                        i = 0,
                        nodes = me.childNodes,
                        ln = nodes.length,
                        node,
                        expanding = 0;

                    for (; i < ln; ++i) {
                        node = nodes[i];
                        if (!node.isLeaf() && !node.isExpanded()) {
                            expanding++;
                            nodes[i].expand(recursive, function () {
                                expanding--;
                                if (callback && !expanding) {
                                    Ext.callback(callback, scope || me, [me.childNodes]);
                                }
                            });
                        }
                    }

                    if (!expanding && callback) {
                        Ext.callback(callback, scope || me, [me.childNodes]);                    }
                },

                /**
                 * Collapse this node.
                 * @param {Boolean} [recursive=false] True to recursively collapse all the children
                 * @param {Function} [callback] The function to execute once the collapse completes
                 * @param {Object} [scope] The scope to run the callback in
                 */
                collapse: function(recursive, callback, scope) {
                    var me = this;

                    // First we start by checking if this node is a parent
                    if (!me.isLeaf()) {
                        // Now we check if this record is already collapsing or collapsed
                        if (!me.collapsing && me.isExpanded()) {
                            me.fireEvent('beforecollapse', me, function() {
                                me.set('expanded', false);
                                me.fireEvent('collapse', me, me.childNodes, false);

                                // Call the collapseChildren method if recursive was set to true
                                if (recursive) {
                                    me.collapseChildren(true, callback, scope);
                                }
                                else {
                                    Ext.callback(callback, scope || me, [me.childNodes]);
                                }
                            }, me);
                        }
                        // If it is is already collapsed but we want to recursively collapse then call collapseChildren
                        else if (recursive) {
                            me.collapseChildren(true, callback, scope);
                        }
                    }
                    // If it's not then we fire the callback right away
                    else {
                        Ext.callback(callback, scope || me, [me.childNodes]);
                    }
                },

                /**
                 * Collapse all the children of this node.
                 * @param {Function} [recursive=false] True to recursively collapse all the children
                 * @param {Function} [callback] The function to execute once all the children are collapsed
                 * @param {Object} [scope] The scope to run the callback in
                 */
                collapseChildren: function(recursive, callback, scope) {
                    var me = this,
                        i = 0,
                        nodes = me.childNodes,
                        ln = nodes.length,
                        node,
                        collapsing = 0;

                    for (; i < ln; ++i) {
                        node = nodes[i];
                        if (!node.isLeaf() && node.isExpanded()) {
                            collapsing++;
                            nodes[i].collapse(recursive, function () {
                                collapsing--;
                                if (callback && !collapsing) {
                                    Ext.callback(callback, scope || me, [me.childNodes]);
                                }
                            });
                        }
                    }

                    if (!collapsing && callback) {
                        Ext.callback(callback, scope || me, [me.childNodes]);
                    }
                }
            };
        }
    }
});
