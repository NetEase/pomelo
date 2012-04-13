/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.tree.ViewDropZone
 * @extends Ext.view.DropZone
 * @private
 */
Ext.define('Ext.tree.ViewDropZone', {
    extend: 'Ext.view.DropZone',

    /**
     * @cfg {Boolean} allowParentInsert
     * Allow inserting a dragged node between an expanded parent node and its first child that will become a
     * sibling of the parent when dropped.
     */
    allowParentInserts: false,
 
    /**
     * @cfg {String} allowContainerDrop
     * True if drops on the tree container (outside of a specific tree node) are allowed.
     */
    allowContainerDrops: false,

    /**
     * @cfg {String} appendOnly
     * True if the tree should only allow append drops (use for trees which are sorted).
     */
    appendOnly: false,

    /**
     * @cfg {String} expandDelay
     * The delay in milliseconds to wait before expanding a target tree node while dragging a droppable node
     * over the target.
     */
    expandDelay : 500,

    indicatorCls: 'x-tree-ddindicator',

    // private
    expandNode : function(node) {
        var view = this.view;
        if (!node.isLeaf() && !node.isExpanded()) {
            view.expand(node);
            this.expandProcId = false;
        }
    },

    // private
    queueExpand : function(node) {
        this.expandProcId = Ext.Function.defer(this.expandNode, this.expandDelay, this, [node]);
    },

    // private
    cancelExpand : function() {
        if (this.expandProcId) {
            clearTimeout(this.expandProcId);
            this.expandProcId = false;
        }
    },

    getPosition: function(e, node) {
        var view = this.view,
            record = view.getRecord(node),
            y = e.getPageY(),
            noAppend = record.isLeaf(),
            noBelow = false,
            region = Ext.fly(node).getRegion(),
            fragment;

        // If we are dragging on top of the root node of the tree, we always want to append.
        if (record.isRoot()) {
            return 'append';
        }

        // Return 'append' if the node we are dragging on top of is not a leaf else return false.
        if (this.appendOnly) {
            return noAppend ? false : 'append';
        }

        if (!this.allowParentInsert) {
            noBelow = record.hasChildNodes() && record.isExpanded();
        }

        fragment = (region.bottom - region.top) / (noAppend ? 2 : 3);
        if (y >= region.top && y < (region.top + fragment)) {
            return 'before';
        }
        else if (!noBelow && (noAppend || (y >= (region.bottom - fragment) && y <= region.bottom))) {
            return 'after';
        }
        else {
            return 'append';
        }
    },

    isValidDropPoint : function(node, position, dragZone, e, data) {
        if (!node || !data.item) {
            return false;
        }

        var view = this.view,
            targetNode = view.getRecord(node),
            draggedRecords = data.records,
            dataLength = draggedRecords.length,
            ln = draggedRecords.length,
            i, record;

        // No drop position, or dragged records: invalid drop point
        if (!(targetNode && position && dataLength)) {
            return false;
        }

        // If the targetNode is within the folder we are dragging
        for (i = 0; i < ln; i++) {
            record = draggedRecords[i];
            if (record.isNode && record.contains(targetNode)) {
                return false;
            }
        }
        
        // Respect the allowDrop field on Tree nodes
        if (position === 'append' && targetNode.get('allowDrop') === false) {
            return false;
        }
        else if (position != 'append' && targetNode.parentNode.get('allowDrop') === false) {
            return false;
        }

        // If the target record is in the dragged dataset, then invalid drop
        if (Ext.Array.contains(draggedRecords, targetNode)) {
             return false;
        }

        // @TODO: fire some event to notify that there is a valid drop possible for the node you're dragging
        // Yes: this.fireViewEvent(blah....) fires an event through the owning View.
        return true;
    },

    onNodeOver : function(node, dragZone, e, data) {
        var position = this.getPosition(e, node),
            returnCls = this.dropNotAllowed,
            view = this.view,
            targetNode = view.getRecord(node),
            indicator = this.getIndicator(),
            indicatorX = 0,
            indicatorY = 0;

        // auto node expand check
        this.cancelExpand();
        if (position == 'append' && !this.expandProcId && !Ext.Array.contains(data.records, targetNode) && !targetNode.isLeaf() && !targetNode.isExpanded()) {
            this.queueExpand(targetNode);
        }
            
            
        if (this.isValidDropPoint(node, position, dragZone, e, data)) {
            this.valid = true;
            this.currentPosition = position;
            this.overRecord = targetNode;

            indicator.setWidth(Ext.fly(node).getWidth());
            indicatorY = Ext.fly(node).getY() - Ext.fly(view.el).getY() - 1;

            /*
             * In the code below we show the proxy again. The reason for doing this is showing the indicator will
             * call toFront, causing it to get a new z-index which can sometimes push the proxy behind it. We always 
             * want the proxy to be above, so calling show on the proxy will call toFront and bring it forward.
             */
            if (position == 'before') {
                returnCls = targetNode.isFirst() ? Ext.baseCSSPrefix + 'tree-drop-ok-above' : Ext.baseCSSPrefix + 'tree-drop-ok-between';
                indicator.showAt(0, indicatorY);
                dragZone.proxy.show();
            } else if (position == 'after') {
                returnCls = targetNode.isLast() ? Ext.baseCSSPrefix + 'tree-drop-ok-below' : Ext.baseCSSPrefix + 'tree-drop-ok-between';
                indicatorY += Ext.fly(node).getHeight();
                indicator.showAt(0, indicatorY);
                dragZone.proxy.show();
            } else {
                returnCls = Ext.baseCSSPrefix + 'tree-drop-ok-append';
                // @TODO: set a class on the parent folder node to be able to style it
                indicator.hide();
            }
        } else {
            this.valid = false;
        }

        this.currentCls = returnCls;
        return returnCls;
    },

    onContainerOver : function(dd, e, data) {
        return e.getTarget('.' + this.indicatorCls) ? this.currentCls : this.dropNotAllowed;
    },
    
    notifyOut: function() {
        this.callParent(arguments);
        this.cancelExpand();
    },

    handleNodeDrop : function(data, targetNode, position) {
        var me = this,
            view = me.view,
            parentNode = targetNode.parentNode,
            store = view.getStore(),
            recordDomNodes = [],
            records, i, len,
            insertionMethod, argList,
            needTargetExpand,
            transferData,
            processDrop;

        // If the copy flag is set, create a copy of the Models with the same IDs
        if (data.copy) {
            records = data.records;
            data.records = [];
            for (i = 0, len = records.length; i < len; i++) {
                data.records.push(Ext.apply({}, records[i].data));
            }
        }

        // Cancel any pending expand operation
        me.cancelExpand();

        // Grab a reference to the correct node insertion method.
        // Create an arg list array intended for the apply method of the
        // chosen node insertion method.
        // Ensure the target object for the method is referenced by 'targetNode'
        if (position == 'before') {
            insertionMethod = parentNode.insertBefore;
            argList = [null, targetNode];
            targetNode = parentNode;
        }
        else if (position == 'after') {
            if (targetNode.nextSibling) {
                insertionMethod = parentNode.insertBefore;
                argList = [null, targetNode.nextSibling];
            }
            else {
                insertionMethod = parentNode.appendChild;
                argList = [null];
            }
            targetNode = parentNode;
        }
        else {
            if (!targetNode.isExpanded()) {
                needTargetExpand = true;
            }
            insertionMethod = targetNode.appendChild;
            argList = [null];
        }

        // A function to transfer the data into the destination tree
        transferData = function() {
            var node;
            for (i = 0, len = data.records.length; i < len; i++) {
                argList[0] = data.records[i];
                node = insertionMethod.apply(targetNode, argList);
                
                if (Ext.enableFx && me.dropHighlight) {
                    recordDomNodes.push(view.getNode(node));
                }
            }
            
            // Kick off highlights after everything's been inserted, so they are
            // more in sync without insertion/render overhead.
            if (Ext.enableFx && me.dropHighlight) {
                //FIXME: the check for n.firstChild is not a great solution here. Ideally the line should simply read 
                //Ext.fly(n.firstChild) but this yields errors in IE6 and 7. See ticket EXTJSIV-1705 for more details
                Ext.Array.forEach(recordDomNodes, function(n) {
                    if (n) {
                        Ext.fly(n.firstChild ? n.firstChild : n).highlight(me.dropHighlightColor);
                    }
                });
            }
        };

        // If dropping right on an unexpanded node, transfer the data after it is expanded.
        if (needTargetExpand) {
            targetNode.expand(false, transferData);
        }
        // Otherwise, call the data transfer function immediately
        else {
            transferData();
        }
    }
});
