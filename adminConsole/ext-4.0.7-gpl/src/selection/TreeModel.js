/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.selection.TreeModel
 * @extends Ext.selection.RowModel
 *
 * Adds custom behavior for left/right keyboard navigation for use with a tree.
 * Depends on the view having an expand and collapse method which accepts a
 * record.
 * 
 * @private
 */
Ext.define('Ext.selection.TreeModel', {
    extend: 'Ext.selection.RowModel',
    alias: 'selection.treemodel',
    
    // typically selection models prune records from the selection
    // model when they are removed, because the TreeView constantly
    // adds/removes records as they are expanded/collapsed
    pruneRemoved: false,
    
    onKeyRight: function(e, t) {
        var focused = this.getLastFocused(),
            view    = this.view;
            
        if (focused) {
            // tree node is already expanded, go down instead
            // this handles both the case where we navigate to firstChild and if
            // there are no children to the nextSibling
            if (focused.isExpanded()) {
                this.onKeyDown(e, t);
            // if its not a leaf node, expand it
            } else if (!focused.isLeaf()) {
                view.expand(focused);
            }
        }
    },
    
    onKeyLeft: function(e, t) {
        var focused = this.getLastFocused(),
            view    = this.view,
            viewSm  = view.getSelectionModel(),
            parentNode, parentRecord;

        if (focused) {
            parentNode = focused.parentNode;
            // if focused node is already expanded, collapse it
            if (focused.isExpanded()) {
                view.collapse(focused);
            // has a parentNode and its not root
            // TODO: this needs to cover the case where the root isVisible
            } else if (parentNode && !parentNode.isRoot()) {
                // Select a range of records when doing multiple selection.
                if (e.shiftKey) {
                    viewSm.selectRange(parentNode, focused, e.ctrlKey, 'up');
                    viewSm.setLastFocused(parentNode);
                // just move focus, not selection
                } else if (e.ctrlKey) {
                    viewSm.setLastFocused(parentNode);
                // select it
                } else {
                    viewSm.select(parentNode);
                }
            }
        }
    },
    
    onKeyPress: function(e, t) {
        var key = e.getKey(),
            selected, 
            checked;
        
        if (key === e.SPACE || key === e.ENTER) {
            e.stopEvent();
            selected = this.getLastSelected();
            if (selected) {
                this.view.onCheckChange(selected);
            }
        } else {
            this.callParent(arguments);
        }
    }
});

