/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.data.NodeStore
 * @extends Ext.data.AbstractStore
 * Node Store
 * @ignore
 */
Ext.define('Ext.data.NodeStore', {
    extend: 'Ext.data.Store',
    alias: 'store.node',
    requires: ['Ext.data.NodeInterface'],
    
    /**
     * @cfg {Ext.data.Model} node
     * The Record you want to bind this Store to. Note that
     * this record will be decorated with the Ext.data.NodeInterface if this is not the
     * case yet.
     */
    node: null,
    
    /**
     * @cfg {Boolean} recursive
     * Set this to true if you want this NodeStore to represent
     * all the descendents of the node in its flat data collection. This is useful for
     * rendering a tree structure to a DataView and is being used internally by
     * the TreeView. Any records that are moved, removed, inserted or appended to the
     * node at any depth below the node this store is bound to will be automatically
     * updated in this Store's internal flat data structure.
     */
    recursive: false,
    
    /** 
     * @cfg {Boolean} rootVisible
     * False to not include the root node in this Stores collection.
     */    
    rootVisible: false,
    
    constructor: function(config) {
        var me = this,
            node;
            
        config = config || {};
        Ext.apply(me, config);
        
        //<debug>
        if (Ext.isDefined(me.proxy)) {
            Ext.Error.raise("A NodeStore cannot be bound to a proxy. Instead bind it to a record " +
                            "decorated with the NodeInterface by setting the node config.");
        }
        //</debug>

        config.proxy = {type: 'proxy'};
        me.callParent([config]);

        me.addEvents('expand', 'collapse', 'beforeexpand', 'beforecollapse');
        
        node = me.node;
        if (node) {
            me.node = null;
            me.setNode(node);
        }
    },
    
    setNode: function(node) {
        var me = this;
        
        if (me.node && me.node != node) {
            // We want to unbind our listeners on the old node
            me.mun(me.node, {
                expand: me.onNodeExpand,
                collapse: me.onNodeCollapse,
                append: me.onNodeAppend,
                insert: me.onNodeInsert,
                remove: me.onNodeRemove,
                sort: me.onNodeSort,
                scope: me
            });
            me.node = null;
        }
        
        if (node) {
            Ext.data.NodeInterface.decorate(node);
            me.removeAll();
            if (me.rootVisible) {
                me.add(node);
            }
            me.mon(node, {
                expand: me.onNodeExpand,
                collapse: me.onNodeCollapse,
                append: me.onNodeAppend,
                insert: me.onNodeInsert,
                remove: me.onNodeRemove,
                sort: me.onNodeSort,
                scope: me
            });
            me.node = node;
            if (node.isExpanded() && node.isLoaded()) {
                me.onNodeExpand(node, node.childNodes, true);
            }
        }
    },
    
    onNodeSort: function(node, childNodes) {
        var me = this;
        
        if ((me.indexOf(node) !== -1 || (node === me.node && !me.rootVisible) && node.isExpanded())) {
            me.onNodeCollapse(node, childNodes, true);
            me.onNodeExpand(node, childNodes, true);
        }
    },
    
    onNodeExpand: function(parent, records, suppressEvent) {
        var me = this,
            insertIndex = me.indexOf(parent) + 1,
            ln = records ? records.length : 0,
            i, record;
            
        if (!me.recursive && parent !== me.node) {
            return;
        }
        
        if (!me.isVisible(parent)) {
            return;
        }

        if (!suppressEvent && me.fireEvent('beforeexpand', parent, records, insertIndex) === false) {
            return;
        }
        
        if (ln) {
            me.insert(insertIndex, records);
            for (i = 0; i < ln; i++) {
                record = records[i];
                if (record.isExpanded()) {
                    if (record.isLoaded()) {
                        // Take a shortcut                        
                        me.onNodeExpand(record, record.childNodes, true);
                    }
                    else {
                        record.set('expanded', false);
                        record.expand();
                    }
                }
            }
        }

        if (!suppressEvent) {
            me.fireEvent('expand', parent, records);
        }
    },

    onNodeCollapse: function(parent, records, suppressEvent) {
        var me = this,
            ln = records.length,
            collapseIndex = me.indexOf(parent) + 1,
            i, record;
            
        if (!me.recursive && parent !== me.node) {
            return;
        }
        
        if (!suppressEvent && me.fireEvent('beforecollapse', parent, records, collapseIndex) === false) {
            return;
        }

        for (i = 0; i < ln; i++) {
            record = records[i];
            me.remove(record);
            if (record.isExpanded()) {
                me.onNodeCollapse(record, record.childNodes, true);
            }
        }
        
        if (!suppressEvent) {
            me.fireEvent('collapse', parent, records, collapseIndex);
        }
    },
    
    onNodeAppend: function(parent, node, index) {
        var me = this,
            refNode, sibling;

        if (me.isVisible(node)) {
            if (index === 0) {
                refNode = parent;
            } else {
                sibling = node.previousSibling;
                while (sibling.isExpanded() && sibling.lastChild) {
                    sibling = sibling.lastChild;
                }
                refNode = sibling;
            }
            me.insert(me.indexOf(refNode) + 1, node);
            if (!node.isLeaf() && node.isExpanded()) {
                if (node.isLoaded()) {
                    // Take a shortcut                        
                    me.onNodeExpand(node, node.childNodes, true);
                }
                else {
                    node.set('expanded', false);
                    node.expand();
                }
            }
        } 
    },
    
    onNodeInsert: function(parent, node, refNode) {
        var me = this,
            index = this.indexOf(refNode);
            
        if (index != -1 && me.isVisible(node)) {
            me.insert(index, node);
            if (!node.isLeaf() && node.isExpanded()) {
                if (node.isLoaded()) {
                    // Take a shortcut                        
                    me.onNodeExpand(node, node.childNodes, true);
                }
                else {
                    node.set('expanded', false);
                    node.expand();
                }
            }
        }
    },
    
    onNodeRemove: function(parent, node, index) {
        var me = this;
        if (me.indexOf(node) != -1) {
            if (!node.isLeaf() && node.isExpanded()) {
                me.onNodeCollapse(node, node.childNodes, true);
            }            
            me.remove(node);
        }
    },
    
    isVisible: function(node) {
        var parent = node.parentNode;
        while (parent) {
            if (parent === this.node && !this.rootVisible && parent.isExpanded()) {
                return true;
            }
            
            if (this.indexOf(parent) === -1 || !parent.isExpanded()) {
                return false;
            }
            
            parent = parent.parentNode;
        }
        return true;
    }
});
