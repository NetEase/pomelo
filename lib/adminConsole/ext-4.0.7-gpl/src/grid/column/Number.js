/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A Column definition class which renders a numeric data field according to a {@link #format} string.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *        storeId:'sampleStore',
 *        fields:[
 *            { name: 'symbol', type: 'string' },
 *            { name: 'price',  type: 'number' },
 *            { name: 'change', type: 'number' },
 *            { name: 'volume', type: 'number' },            
 *        ],
 *        data:[
 *            { symbol: "msft",   price: 25.76,  change: 2.43, volume: 61606325 },
 *            { symbol: "goog",   price: 525.73, change: 0.81, volume: 3053782  },
 *            { symbol: "apple",  price: 342.41, change: 1.35, volume: 24484858 },            
 *            { symbol: "sencha", price: 142.08, change: 8.85, volume: 5556351  }            
 *        ]
 *     });
 *     
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Number Column Demo',
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Symbol',         dataIndex: 'symbol', flex: 1 },
 *             { text: 'Current Price',  dataIndex: 'price',  renderer: Ext.util.Format.usMoney },
 *             { text: 'Change',         dataIndex: 'change', xtype: 'numbercolumn', format:'0.00' },
 *             { text: 'Volume',         dataIndex: 'volume', xtype: 'numbercolumn', format:'0,000' }
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.grid.column.Number', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.numbercolumn'],
    requires: ['Ext.util.Format'],
    alternateClassName: 'Ext.grid.NumberColumn',

    /**
     * @cfg {String} format
     * A formatting string as used by {@link Ext.util.Format#number} to format a numeric value for this Column.
     */
    format : '0,000.00',

    constructor: function(cfg) {
        this.callParent(arguments);
        this.renderer = Ext.util.Format.numberRenderer(this.format);
    }
});
