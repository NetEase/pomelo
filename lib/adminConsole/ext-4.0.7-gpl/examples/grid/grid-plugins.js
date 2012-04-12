/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({
    enabled: true
});
Ext.Loader.setPath('Ext.ux', '../ux');

Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.ux.RowExpander',
    'Ext.selection.CheckboxModel'
]);

Ext.onReady(function(){
    Ext.define('Company', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'company'},
            {name: 'price', type: 'float'},
            {name: 'change', type: 'float'},
            {name: 'pctChange', type: 'float'},
            {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'},
            {name: 'industry'},
            {name: 'desc'}
         ]
    });
    // Array data for the grids
    Ext.grid.dummyData = [
        ['3m Co',71.72,0.02,0.03,'9/1 12:00am', 'Manufacturing'],
        ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am', 'Manufacturing'],
        ['Altria Group Inc',83.81,0.28,0.34,'9/1 12:00am', 'Manufacturing'],
        ['American Express Company',52.55,0.01,0.02,'9/1 12:00am', 'Finance'],
        ['American International Group, Inc.',64.13,0.31,0.49,'9/1 12:00am', 'Services'],
        ['AT&T Inc.',31.61,-0.48,-1.54,'9/1 12:00am', 'Services'],
        ['Boeing Co.',75.43,0.53,0.71,'9/1 12:00am', 'Manufacturing'],
        ['Caterpillar Inc.',67.27,0.92,1.39,'9/1 12:00am', 'Services'],
        ['Citigroup, Inc.',49.37,0.02,0.04,'9/1 12:00am', 'Finance'],
        ['E.I. du Pont de Nemours and Company',40.48,0.51,1.28,'9/1 12:00am', 'Manufacturing'],
        ['Exxon Mobil Corp',68.1,-0.43,-0.64,'9/1 12:00am', 'Manufacturing'],
        ['General Electric Company',34.14,-0.08,-0.23,'9/1 12:00am', 'Manufacturing'],
        ['General Motors Corporation',30.27,1.09,3.74,'9/1 12:00am', 'Automotive'],
        ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am', 'Computer'],
        ['Honeywell Intl Inc',38.77,0.05,0.13,'9/1 12:00am', 'Manufacturing'],
        ['Intel Corporation',19.88,0.31,1.58,'9/1 12:00am', 'Computer'],
        ['International Business Machines',81.41,0.44,0.54,'9/1 12:00am', 'Computer'],
        ['Johnson & Johnson',64.72,0.06,0.09,'9/1 12:00am', 'Medical'],
        ['JP Morgan & Chase & Co',45.73,0.07,0.15,'9/1 12:00am', 'Finance'],
        ['McDonald\'s Corporation',36.76,0.86,2.40,'9/1 12:00am', 'Food'],
        ['Merck & Co., Inc.',40.96,0.41,1.01,'9/1 12:00am', 'Medical'],
        ['Microsoft Corporation',25.84,0.14,0.54,'9/1 12:00am', 'Computer'],
        ['Pfizer Inc',27.96,0.4,1.45,'9/1 12:00am', 'Services', 'Medical'],
        ['The Coca-Cola Company',45.07,0.26,0.58,'9/1 12:00am', 'Food'],
        ['The Home Depot, Inc.',34.64,0.35,1.02,'9/1 12:00am', 'Retail'],
        ['The Procter & Gamble Company',61.91,0.01,0.02,'9/1 12:00am', 'Manufacturing'],
        ['United Technologies Corporation',63.26,0.55,0.88,'9/1 12:00am', 'Computer'],
        ['Verizon Communications',35.57,0.39,1.11,'9/1 12:00am', 'Services'],
        ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am', 'Retail'],
        ['Walt Disney Company (The) (Holding Company)',29.89,0.24,0.81,'9/1 12:00am', 'Services']
    ];

    // add in some dummy descriptions
    for(var i = 0; i < Ext.grid.dummyData.length; i++){
        Ext.grid.dummyData[i].push('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. ');
    }


    Ext.QuickTips.init();

    var getLocalStore = function() {
        return Ext.create('Ext.data.ArrayStore', {
            model: 'Company',
            data: Ext.grid.dummyData
        });
    };


    ////////////////////////////////////////////////////////////////////////////////////////
    // Grid 1
    ////////////////////////////////////////////////////////////////////////////////////////
    // row expander

    var grid1 = Ext.create('Ext.grid.Panel', {
        store: getLocalStore(),
        columns: [
            {text: "Company", flex: 1, dataIndex: 'company'},
            {text: "Price", renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
            {text: "Change", dataIndex: 'change'},
            {text: "% Change", dataIndex: 'pctChange'},
            {text: "Last Updated", renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
        ],
        width: 600,
        height: 300,
        plugins: [{
            ptype: 'rowexpander',
            rowBodyTpl : [
                '<p><b>Company:</b> {company}</p><br>',
                '<p><b>Summary:</b> {desc}</p>'
            ]
        }],
        collapsible: true,
        animCollapse: false,
        title: 'Expander Rows in a Collapsible Grid',
        iconCls: 'icon-grid',
        renderTo: Ext.getBody()
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    // Grid 2
    ////////////////////////////////////////////////////////////////////////////////////////
    var sm = Ext.create('Ext.selection.CheckboxModel');
    var grid2 = Ext.create('Ext.grid.Panel', {
        store: getLocalStore(),
        selModel: sm,
        columns: [
            {text: "Company", width: 200, dataIndex: 'company'},
            {text: "Price", renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
            {text: "Change", dataIndex: 'change'},
            {text: "% Change", dataIndex: 'pctChange'},
            {text: "Last Updated", width: 135, renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
        ],
        columnLines: true,
        width: 600,
        height: 300,
        frame: true,
        title: 'Framed with Checkbox Selection and Horizontal Scrolling',
        iconCls: 'icon-grid',
        renderTo: Ext.getBody()
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    // Grid 3
    ////////////////////////////////////////////////////////////////////////////////////////
    var grid3 = Ext.create('Ext.grid.Panel', {
        store: getLocalStore(),
        columns: [
            Ext.create('Ext.grid.RowNumberer'),
            {text: "Company", flex: 1, sortable: true, dataIndex: 'company'},
            {text: "Price", width: 120, sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
            {text: "Change", width: 120, sortable: true, dataIndex: 'change'},
            {text: "% Change", width: 120, sortable: true, dataIndex: 'pctChange'},
            {text: "Last Updated", width: 120, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
        ],
        columnLines: true,
        width:600,
        height:300,
        title:'Grid with Numbered Rows',
        iconCls:'icon-grid',
        renderTo: Ext.getBody()
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    // Grid 4
    ////////////////////////////////////////////////////////////////////////////////////////
    var selModel = Ext.create('Ext.selection.CheckboxModel', {
        listeners: {
            selectionchange: function(sm, selections) {
                grid4.down('#removeButton').setDisabled(selections.length == 0);
            }
        }
    });
    
    var grid4 = Ext.create('Ext.grid.Panel', {
        id:'button-grid',
        store: getLocalStore(),
        columns: [
            {text: "Company", flex: 1, sortable: true, dataIndex: 'company'},
            {text: "Price", width: 120, sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
            {text: "Change", width: 120, sortable: true, dataIndex: 'change'},
            {text: "% Change", width: 120, sortable: true, dataIndex: 'pctChange'},
            {text: "Last Updated", width: 120, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
        ],
        columnLines: true,
        selModel: selModel,

        // inline buttons
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            layout: {
                pack: 'center'
            },
            items: [{
                minWidth: 80,
                text: 'Save'
            },{
                minWidth: 80,
                text: 'Cancel'
            }]
        }, {
            xtype: 'toolbar',
            items: [{
                text:'Add Something',
                tooltip:'Add a new row',
                iconCls:'add'
            }, '-', {
                text:'Options',
                tooltip:'Set options',
                iconCls:'option'
            },'-',{
                itemId: 'removeButton',
                text:'Remove Something',
                tooltip:'Remove the selected item',
                iconCls:'remove',
                disabled: true
            }]
        }],

        width: 600,
        height: 300,
        frame: true,
        title: 'Support for standard Panel features such as framing, buttons and toolbars',
        iconCls: 'icon-grid',
        renderTo: Ext.getBody()
    });
});

