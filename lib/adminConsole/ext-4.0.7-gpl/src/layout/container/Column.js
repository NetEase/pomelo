/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This is the layout style of choice for creating structural layouts in a multi-column format where the width of each
 * column can be specified as a percentage or fixed width, but the height is allowed to vary based on the content. This
 * class is intended to be extended or created via the layout:'column' {@link Ext.container.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.
 *
 * ColumnLayout does not have any direct config options (other than inherited ones), but it does support a specific
 * config property of `columnWidth` that can be included in the config of any panel added to it. The layout will use
 * the columnWidth (if present) or width of each panel during layout to determine how to size each panel. If width or
 * columnWidth is not specified for a given panel, its width will default to the panel's width (or auto).
 *
 * The width property is always evaluated as pixels, and must be a number greater than or equal to 1. The columnWidth
 * property is always evaluated as a percentage, and must be a decimal value greater than 0 and less than 1 (e.g., .25).
 *
 * The basic rules for specifying column widths are pretty simple. The logic makes two passes through the set of
 * contained panels. During the first layout pass, all panels that either have a fixed width or none specified (auto)
 * are skipped, but their widths are subtracted from the overall container width.
 *
 * During the second pass, all panels with columnWidths are assigned pixel widths in proportion to their percentages
 * based on the total **remaining** container width. In other words, percentage width panels are designed to fill
 * the space left over by all the fixed-width and/or auto-width panels. Because of this, while you can specify any
 * number of columns with different percentages, the columnWidths must always add up to 1 (or 100%) when added
 * together, otherwise your layout may not render as expected.
 *
 *     @example
 *     // All columns are percentages -- they must add up to 1
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Column Layout - Percentage Only',
 *         width: 350,
 *         height: 250,
 *         layout:'column',
 *         items: [{
 *             title: 'Column 1',
 *             columnWidth: .25
 *         },{
 *             title: 'Column 2',
 *             columnWidth: .55
 *         },{
 *             title: 'Column 3',
 *             columnWidth: .20
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 *
 *     // Mix of width and columnWidth -- all columnWidth values must add up
 *     // to 1. The first column will take up exactly 120px, and the last two
 *     // columns will fill the remaining container width.
 *
 *     Ext.create('Ext.Panel', {
 *         title: 'Column Layout - Mixed',
 *         width: 350,
 *         height: 250,
 *         layout:'column',
 *         items: [{
 *             title: 'Column 1',
 *             width: 120
 *         },{
 *             title: 'Column 2',
 *             columnWidth: .7
 *         },{
 *             title: 'Column 3',
 *             columnWidth: .3
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Column', {

    extend: 'Ext.layout.container.Auto',
    alias: ['layout.column'],
    alternateClassName: 'Ext.layout.ColumnLayout',

    type: 'column',

    itemCls: Ext.baseCSSPrefix + 'column',

    targetCls: Ext.baseCSSPrefix + 'column-layout-ct',

    scrollOffset: 0,

    bindToOwnerCtComponent: false,

    getRenderTarget : function() {
        if (!this.innerCt) {

            // the innerCt prevents wrapping and shuffling while
            // the container is resizing
            this.innerCt = this.getTarget().createChild({
                cls: Ext.baseCSSPrefix + 'column-inner'
            });

            // Column layout uses natural HTML flow to arrange the child items.
            // To ensure that all browsers (I'm looking at you IE!) add the bottom margin of the last child to the
            // containing element height, we create a zero-sized element with style clear:both to force a "new line"
            this.clearEl = this.innerCt.createChild({
                cls: Ext.baseCSSPrefix + 'clear',
                role: 'presentation'
            });
        }
        return this.innerCt;
    },

    // private
    onLayout : function() {
        var me = this,
            target = me.getTarget(),
            items = me.getLayoutItems(),
            len = items.length,
            item,
            i,
            parallelMargins = [],
            itemParallelMargins,
            size,
            availableWidth,
            columnWidth;

        size = me.getLayoutTargetSize();
        if (size.width < len * 10) { // Don't lay out in impossibly small target (probably display:none, or initial, unsized Container)
            return;
        }

        // On the first pass, for all except IE6-7, we lay out the items with no scrollbars visible using style overflow: hidden.
        // If, after the layout, it is detected that there is vertical overflow,
        // we will recurse back through here. Do not adjust overflow style at that time.
        if (me.adjustmentPass) {
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) {
                size.width = me.adjustedWidth;
            }
        } else {
            i = target.getStyle('overflow');
            if (i && i != 'hidden') {
                me.autoScroll = true;
                if (!(Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks)) {
                    target.setStyle('overflow', 'hidden');
                    size = me.getLayoutTargetSize();
                }
            }
        }

        availableWidth = size.width - me.scrollOffset;
        me.innerCt.setWidth(availableWidth);

        // some columns can be percentages while others are fixed
        // so we need to make 2 passes
        for (i = 0; i < len; i++) {
            item = items[i];
            itemParallelMargins = parallelMargins[i] = item.getEl().getMargin('lr');
            if (!item.columnWidth) {
                availableWidth -= (item.getWidth() + itemParallelMargins);
            }
        }

        availableWidth = availableWidth < 0 ? 0 : availableWidth;
        for (i = 0; i < len; i++) {
            item = items[i];
            if (item.columnWidth) {
                columnWidth = Math.floor(item.columnWidth * availableWidth) - parallelMargins[i];
                me.setItemSize(item, columnWidth, item.height);
            } else {
                me.layoutItem(item);
            }
        }

        // After the first pass on an autoScroll layout, restore the overflow settings if it had been changed (only changed for non-IE6)
        if (!me.adjustmentPass && me.autoScroll) {

            // If there's a vertical overflow, relay with scrollbars
            target.setStyle('overflow', 'auto');
            me.adjustmentPass = (target.dom.scrollHeight > size.height);
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) {
                me.adjustedWidth = size.width - Ext.getScrollBarWidth();
            } else {
                target.setStyle('overflow', 'auto');
            }

            // If the layout caused height overflow, recurse back and recalculate (with overflow setting restored on non-IE6)
            if (me.adjustmentPass) {
                me.onLayout();
            }
        }
        delete me.adjustmentPass;
    },

    configureItem: function(item) {
        this.callParent(arguments);

        if (item.columnWidth) {
            item.layoutManagedWidth = 1;
        }
    }
});
