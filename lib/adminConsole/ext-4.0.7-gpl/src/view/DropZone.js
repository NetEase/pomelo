/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.view.DropZone
 * @extends Ext.dd.DropZone
 * @private
 */
Ext.define('Ext.view.DropZone', {
    extend: 'Ext.dd.DropZone',

    indicatorHtml: '<div class="x-grid-drop-indicator-left"></div><div class="x-grid-drop-indicator-right"></div>',
    indicatorCls: 'x-grid-drop-indicator',

    constructor: function(config) {
        var me = this;
        Ext.apply(me, config);

        // Create a ddGroup unless one has been configured.
        // User configuration of ddGroups allows users to specify which
        // DD instances can interact with each other. Using one
        // based on the id of the View would isolate it and mean it can only
        // interact with a DragZone on the same View also using a generated ID.
        if (!me.ddGroup) {
            me.ddGroup = 'view-dd-zone-' + me.view.id;
        }

        // The DropZone's encapsulating element is the View's main element. It must be this because drop gestures
        // may require scrolling on hover near a scrolling boundary. In Ext 4.x two DD instances may not use the
        // same element, so a DragZone on this same View must use the View's parent element as its element.
        me.callParent([me.view.el]);
    },

//  Fire an event through the client DataView. Lock this DropZone during the event processing so that
//  its data does not become corrupted by processing mouse events.
    fireViewEvent: function() {
        var me = this,
            result;

        me.lock();
        result = me.view.fireEvent.apply(me.view, arguments);
        me.unlock();
        return result;
    },

    getTargetFromEvent : function(e) {
        var node = e.getTarget(this.view.getItemSelector()),
            mouseY, nodeList, testNode, i, len, box;

//      Not over a row node: The content may be narrower than the View's encapsulating element, so return the closest.
//      If we fall through because the mouse is below the nodes (or there are no nodes), we'll get an onContainerOver call.
        if (!node) {
            mouseY = e.getPageY();
            for (i = 0, nodeList = this.view.getNodes(), len = nodeList.length; i < len; i++) {
                testNode = nodeList[i];
                box = Ext.fly(testNode).getBox();
                if (mouseY <= box.bottom) {
                    return testNode;
                }
            }
        }
        return node;
    },

    getIndicator: function() {
        var me = this;

        if (!me.indicator) {
            me.indicator = Ext.createWidget('component', {
                html: me.indicatorHtml,
                cls: me.indicatorCls,
                ownerCt: me.view,
                floating: true,
                shadow: false
            });
        }
        return me.indicator;
    },

    getPosition: function(e, node) {
        var y      = e.getXY()[1],
            region = Ext.fly(node).getRegion(),
            pos;

        if ((region.bottom - y) >= (region.bottom - region.top) / 2) {
            pos = "before";
        } else {
            pos = "after";
        }
        return pos;
    },

    /**
     * @private Determines whether the record at the specified offset from the passed record
     * is in the drag payload.
     * @param records
     * @param record
     * @param offset
     * @returns {Boolean} True if the targeted record is in the drag payload
     */
    containsRecordAtOffset: function(records, record, offset) {
        if (!record) {
            return false;
        }
        var view = this.view,
            recordIndex = view.indexOf(record),
            nodeBefore = view.getNode(recordIndex + offset),
            recordBefore = nodeBefore ? view.getRecord(nodeBefore) : null;

        return recordBefore && Ext.Array.contains(records, recordBefore);
    },

    positionIndicator: function(node, data, e) {
        var me = this,
            view = me.view,
            pos = me.getPosition(e, node),
            overRecord = view.getRecord(node),
            draggingRecords = data.records,
            indicator, indicatorY;

        if (!Ext.Array.contains(draggingRecords, overRecord) && (
            pos == 'before' && !me.containsRecordAtOffset(draggingRecords, overRecord, -1) ||
            pos == 'after' && !me.containsRecordAtOffset(draggingRecords, overRecord, 1)
        )) {
            me.valid = true;

            if (me.overRecord != overRecord || me.currentPosition != pos) {

                indicatorY = Ext.fly(node).getY() - view.el.getY() - 1;
                if (pos == 'after') {
                    indicatorY += Ext.fly(node).getHeight();
                }
                me.getIndicator().setWidth(Ext.fly(view.el).getWidth()).showAt(0, indicatorY);

                // Cache the overRecord and the 'before' or 'after' indicator.
                me.overRecord = overRecord;
                me.currentPosition = pos;
            }
        } else {
            me.invalidateDrop();
        }
    },

    invalidateDrop: function() {
        if (this.valid) {
            this.valid = false;
            this.getIndicator().hide();
        }
    },

    // The mouse is over a View node
    onNodeOver: function(node, dragZone, e, data) {
        var me = this;

        if (!Ext.Array.contains(data.records, me.view.getRecord(node))) {
            me.positionIndicator(node, data, e);
        }
        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },

    // Moved out of the DropZone without dropping.
    // Remove drop position indicator
    notifyOut: function(node, dragZone, e, data) {
        var me = this;

        me.callParent(arguments);
        delete me.overRecord;
        delete me.currentPosition;
        if (me.indicator) {
            me.indicator.hide();
        }
    },

    // The mouse is past the end of all nodes (or there are no nodes)
    onContainerOver : function(dd, e, data) {
        var me = this,
            view = me.view,
            count = view.store.getCount();

        // There are records, so position after the last one
        if (count) {
            me.positionIndicator(view.getNode(count - 1), data, e);
        }

        // No records, position the indicator at the top
        else {
            delete me.overRecord;
            delete me.currentPosition;
            me.getIndicator().setWidth(Ext.fly(view.el).getWidth()).showAt(0, 0);
            me.valid = true;
        }
        return me.dropAllowed;
    },

    onContainerDrop : function(dd, e, data) {
        return this.onNodeDrop(dd, null, e, data);
    },

    onNodeDrop: function(node, dragZone, e, data) {
        var me = this,
            dropped = false,

            // Create a closure to perform the operation which the event handler may use.
            // Users may now return <code>false</code> from the beforedrop handler, and perform any kind
            // of asynchronous processing such as an Ext.Msg.confirm, or an Ajax request,
            // and complete the drop gesture at some point in the future by calling this function.
            processDrop = function () {
                me.invalidateDrop();
                me.handleNodeDrop(data, me.overRecord, me.currentPosition);
                dropped = true;
                me.fireViewEvent('drop', node, data, me.overRecord, me.currentPosition);
            },
            performOperation = false;

        if (me.valid) {
            performOperation = me.fireViewEvent('beforedrop', node, data, me.overRecord, me.currentPosition, processDrop);
            if (performOperation !== false) {
                // If the processDrop function was called in the event handler, do not do it again.
                if (!dropped) {
                    processDrop();
                }
            }
        }
        return performOperation;
    },
    
    destroy: function(){
        Ext.destroy(this.indicator);
        delete this.indicator;
        this.callParent();
    }
});

