/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.View
 * @extends Ext.view.Table
 *
 * The grid View class provides extra {@link Ext.grid.Panel} specific functionality to the
 * {@link Ext.view.Table}. In general, this class is not instanced directly, instead a viewConfig
 * option is passed to the grid:
 *
 *     Ext.create('Ext.grid.Panel', {
 *         // other options
 *         viewConfig: {
 *             stripeRows: false
 *         }
 *     });
 *
 * ## Drag Drop
 *
 * Drag and drop functionality can be achieved in the grid by attaching a {@link Ext.grid.plugin.DragDrop} plugin
 * when creating the view.
 *
 *     Ext.create('Ext.grid.Panel', {
 *         // other options
 *         viewConfig: {
 *             plugins: {
 *                 ddGroup: 'people-group',
 *                 ptype: 'gridviewdragdrop',
 *                 enableDrop: false
 *             }
 *         }
 *     });
 */
Ext.define('Ext.grid.View', {
    extend: 'Ext.view.Table',
    alias: 'widget.gridview',

    /**
     * @cfg {Boolean} stripeRows <tt>true</tt> to stripe the rows. Default is <tt>true</tt>.
     * <p>This causes the CSS class <tt><b>x-grid-row-alt</b></tt> to be added to alternate rows of
     * the grid. A default CSS rule is provided which sets a background color, but you can override this
     * with a rule which either overrides the <b>background-color</b> style using the '!important'
     * modifier, or which uses a CSS selector of higher specificity.</p>
     */
    stripeRows: true,

    invalidateScrollerOnRefresh: true,

    /**
     * Scroll the GridView to the top by scrolling the scroller.
     * @private
     */
    scrollToTop : function(){
        if (this.rendered) {
            var section = this.ownerCt,
                verticalScroller = section.verticalScroller;

            if (verticalScroller) {
                verticalScroller.scrollToTop();
            }
        }
    },

    // after adding a row stripe rows from then on
    onAdd: function(ds, records, index) {
        this.callParent(arguments);
        this.doStripeRows(index);
    },

    // after removing a row stripe rows from then on
    onRemove: function(ds, records, index) {
        this.callParent(arguments);
        this.doStripeRows(index);
    },

    onUpdate: function(ds, record, operation) {
        var index = ds.indexOf(record);
        this.callParent(arguments);
        this.doStripeRows(index, index);
    },

    /**
     * Stripe rows from a particular row index
     * @param {Number} startRow
     * @param {Number} endRow (Optional) argument specifying the last row to process. By default process up to the last row.
     * @private
     */
    doStripeRows: function(startRow, endRow) {
        // ensure stripeRows configuration is turned on
        if (this.stripeRows) {
            var rows   = this.getNodes(startRow, endRow),
                rowsLn = rows.length,
                i      = 0,
                row;

            for (; i < rowsLn; i++) {
                row = rows[i];
                // Remove prior applied row classes.
                row.className = row.className.replace(this.rowClsRe, ' ');
                startRow++;
                // Every odd row will get an additional cls
                if (startRow % 2 === 0) {
                    row.className += (' ' + this.altRowCls);
                }
            }
        }
    },

    refresh: function(firstPass) {
        this.callParent(arguments);
        this.doStripeRows(0);
        // TODO: Remove gridpanel dependency
        var g = this.up('gridpanel');
        if (g && this.invalidateScrollerOnRefresh) {
            g.invalidateScroller();
        }
    }
});

