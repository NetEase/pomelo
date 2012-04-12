/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Component layout for {@link Ext.view.BoundList}. Handles constraining the height to the configured maxHeight.
 * @class Ext.layout.component.BoundList
 * @extends Ext.layout.component.Component
 * @private
 */
Ext.define('Ext.layout.component.BoundList', {
    extend: 'Ext.layout.component.Component',
    alias: 'layout.boundlist',

    type: 'component',

    beforeLayout: function() {
        return this.callParent(arguments) || this.owner.refreshed > 0;
    },

    onLayout : function(width, height) {
        var me = this,
            owner = me.owner,
            floating = owner.floating,
            el = owner.el,
            xy = el.getXY(),
            isNumber = Ext.isNumber,
            minWidth, maxWidth, minHeight, maxHeight,
            naturalWidth, naturalHeight, constrainedWidth, constrainedHeight, undef;

        if (floating) {
            // Position offscreen so the natural width is not affected by the viewport's right edge
            el.setXY([-9999,-9999]);
        }

        // Calculate initial layout
        me.setTargetSize(width, height);

        // Handle min/maxWidth for auto-width
        if (!isNumber(width)) {
            minWidth = owner.minWidth;
            maxWidth = owner.maxWidth;
            if (isNumber(minWidth) || isNumber(maxWidth)) {
                naturalWidth = el.getWidth();
                if (naturalWidth < minWidth) {
                    constrainedWidth = minWidth;
                }
                else if (naturalWidth > maxWidth) {
                    constrainedWidth = maxWidth;
                }
                if (constrainedWidth) {
                    me.setTargetSize(constrainedWidth);
                }
            }
        }
        // Handle min/maxHeight for auto-height
        if (!isNumber(height)) {
            minHeight = owner.minHeight;
            maxHeight = owner.maxHeight;
            if (isNumber(minHeight) || isNumber(maxHeight)) {
                naturalHeight = el.getHeight();
                if (naturalHeight < minHeight) {
                    constrainedHeight = minHeight;
                }
                else if (naturalHeight > maxHeight) {
                    constrainedHeight = maxHeight;
                }
                if (constrainedHeight) {
                    me.setTargetSize(undef, constrainedHeight);
                }
            }
        }

        if (floating) {
            // Restore position
            el.setXY(xy);
        }
    },

    afterLayout: function() {
        var me = this,
            toolbar = me.owner.pagingToolbar;
        me.callParent();
        if (toolbar) {
            toolbar.doComponentLayout();
        }
    },

    setTargetSize : function(width, height) {
        var me = this,
            owner = me.owner,
            listHeight = null,
            toolbar;

        // Size the listEl
        if (Ext.isNumber(height)) {
            listHeight = height - owner.el.getFrameWidth('tb');
            toolbar = owner.pagingToolbar;
            if (toolbar) {
                listHeight -= toolbar.getHeight();
            }
        }
        me.setElementSize(owner.listEl, null, listHeight);

        me.callParent(arguments);
    }

});

