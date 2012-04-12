/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.feature.RowBody
 * @extends Ext.grid.feature.Feature
 *
 * The rowbody feature enhances the grid's markup to have an additional
 * tr -> td -> div which spans the entire width of the original row.
 *
 * This is useful to to associate additional information with a particular
 * record in a grid.
 *
 * Rowbodies are initially hidden unless you override getAdditionalData.
 *
 * Will expose additional events on the gridview with the prefix of 'rowbody'.
 * For example: 'rowbodyclick', 'rowbodydblclick', 'rowbodycontextmenu'.
 *
 * @ftype rowbody
 */
Ext.define('Ext.grid.feature.RowBody', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.rowbody',
    rowBodyHiddenCls: Ext.baseCSSPrefix + 'grid-row-body-hidden',
    rowBodyTrCls: Ext.baseCSSPrefix + 'grid-rowbody-tr',
    rowBodyTdCls: Ext.baseCSSPrefix + 'grid-cell-rowbody',
    rowBodyDivCls: Ext.baseCSSPrefix + 'grid-rowbody',

    eventPrefix: 'rowbody',
    eventSelector: '.' + Ext.baseCSSPrefix + 'grid-rowbody-tr',
    
    getRowBody: function(values) {
        return [
            '<tr class="' + this.rowBodyTrCls + ' {rowBodyCls}">',
                '<td class="' + this.rowBodyTdCls + '" colspan="{rowBodyColspan}">',
                    '<div class="' + this.rowBodyDivCls + '">{rowBody}</div>',
                '</td>',
            '</tr>'
        ].join('');
    },
    
    // injects getRowBody into the metaRowTpl.
    getMetaRowTplFragments: function() {
        return {
            getRowBody: this.getRowBody,
            rowBodyTrCls: this.rowBodyTrCls,
            rowBodyTdCls: this.rowBodyTdCls,
            rowBodyDivCls: this.rowBodyDivCls
        };
    },

    mutateMetaRowTpl: function(metaRowTpl) {
        metaRowTpl.push('{[this.getRowBody(values)]}');
    },

    /**
     * Provide additional data to the prepareData call within the grid view.
     * The rowbody feature adds 3 additional variables into the grid view's template.
     * These are rowBodyCls, rowBodyColspan, and rowBody.
     * @param {Object} data The data for this particular record.
     * @param {Number} idx The row index for this record.
     * @param {Ext.data.Model} record The record instance
     * @param {Object} orig The original result from the prepareData call to massage.
     */
    getAdditionalData: function(data, idx, record, orig) {
        var headerCt = this.view.headerCt,
            colspan  = headerCt.getColumnCount();

        return {
            rowBody: "",
            rowBodyCls: this.rowBodyCls,
            rowBodyColspan: colspan
        };
    }
});
