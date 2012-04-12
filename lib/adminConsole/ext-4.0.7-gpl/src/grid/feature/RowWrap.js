/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.feature.RowWrap
 * @extends Ext.grid.feature.Feature
 * @private
 */
Ext.define('Ext.grid.feature.RowWrap', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.rowwrap',

    // turn off feature events.
    hasFeatureEvent: false,
    
    mutateMetaRowTpl: function(metaRowTpl) {        
        // Remove "x-grid-row" from the first row, note this could be wrong
        // if some other feature unshifted things in front.
        metaRowTpl[0] = metaRowTpl[0].replace(Ext.baseCSSPrefix + 'grid-row', '');
        metaRowTpl[0] = metaRowTpl[0].replace("{[this.embedRowCls()]}", "");
        // 2
        metaRowTpl.unshift('<table class="' + Ext.baseCSSPrefix + 'grid-table ' + Ext.baseCSSPrefix + 'grid-table-resizer" style="width: {[this.embedFullWidth()]}px;">');
        // 1
        metaRowTpl.unshift('<tr class="' + Ext.baseCSSPrefix + 'grid-row {[this.embedRowCls()]}"><td colspan="{[this.embedColSpan()]}"><div class="' + Ext.baseCSSPrefix + 'grid-rowwrap-div">');
        
        // 3
        metaRowTpl.push('</table>');
        // 4
        metaRowTpl.push('</div></td></tr>');
    },
    
    embedColSpan: function() {
        return '{colspan}';
    },
    
    embedFullWidth: function() {
        return '{fullWidth}';
    },
    
    getAdditionalData: function(data, idx, record, orig) {
        var headerCt = this.view.headerCt,
            colspan  = headerCt.getColumnCount(),
            fullWidth = headerCt.getFullWidth(),
            items    = headerCt.query('gridcolumn'),
            itemsLn  = items.length,
            i = 0,
            o = {
                colspan: colspan,
                fullWidth: fullWidth
            },
            id,
            tdClsKey,
            colResizerCls;

        for (; i < itemsLn; i++) {
            id = items[i].id;
            tdClsKey = id + '-tdCls';
            colResizerCls = Ext.baseCSSPrefix + 'grid-col-resizer-'+id;
            // give the inner td's the resizer class
            // while maintaining anything a user may have injected via a custom
            // renderer
            o[tdClsKey] = colResizerCls + " " + (orig[tdClsKey] ? orig[tdClsKey] : '');
            // TODO: Unhackify the initial rendering width's
            o[id+'-tdAttr'] = " style=\"width: " + (items[i].hidden ? 0 : items[i].getDesiredWidth()) + "px;\" "/* + (i === 0 ? " rowspan=\"2\"" : "")*/;
            if (orig[id+'-tdAttr']) {
                o[id+'-tdAttr'] += orig[id+'-tdAttr'];
            }
            
        }

        return o;
    },
    
    getMetaRowTplFragments: function() {
        return {
            embedFullWidth: this.embedFullWidth,
            embedColSpan: this.embedColSpan
        };
    }
    
});
