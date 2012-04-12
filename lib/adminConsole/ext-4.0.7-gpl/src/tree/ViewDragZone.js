/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('Ext.tree.ViewDragZone', {
    extend: 'Ext.view.DragZone',

    isPreventDrag: function(e, record) {
        return (record.get('allowDrag') === false) || !!e.getTarget(this.view.expanderSelector);
    },
    
    afterRepair: function() {
        var me = this,
            view = me.view,
            selectedRowCls = view.selectedItemCls,
            records = me.dragData.records,
            fly = Ext.fly;
        
        if (Ext.enableFx && me.repairHighlight) {
            // Roll through all records and highlight all the ones we attempted to drag.
            Ext.Array.forEach(records, function(record) {
                // anonymous fns below, don't hoist up unless below is wrapped in
                // a self-executing function passing in item.
                var item = view.getNode(record);
                
                // We must remove the selected row class before animating, because
                // the selected row class declares !important on its background-color.
                fly(item.firstChild).highlight(me.repairHighlightColor, {
                    listeners: {
                        beforeanimate: function() {
                            if (view.isSelected(item)) {
                                fly(item).removeCls(selectedRowCls);
                            }
                        },
                        afteranimate: function() {
                            if (view.isSelected(item)) {
                                fly(item).addCls(selectedRowCls);
                            }
                        }
                    }
                });
            });
        }
        me.dragging = false;
    }
});
