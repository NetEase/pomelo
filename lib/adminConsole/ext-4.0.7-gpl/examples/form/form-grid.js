/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.form.*',
    'Ext.data.*',
    'Ext.grid.Panel',
    'Ext.layout.container.Column'
]);


Ext.onReady(function(){

    Ext.QuickTips.init();

    var bd = Ext.getBody();

    // sample static data for the store
    var myData = [
        ['3m Co',                               71.72, 0.02,  0.03,  '9/1 12:00am'],
        ['Alcoa Inc',                           29.01, 0.42,  1.47,  '9/1 12:00am'],
        ['Altria Group Inc',                    83.81, 0.28,  0.34,  '9/1 12:00am'],
        ['American Express Company',            52.55, 0.01,  0.02,  '9/1 12:00am'],
        ['American International Group, Inc.',  64.13, 0.31,  0.49,  '9/1 12:00am'],
        ['AT&T Inc.',                           31.61, -0.48, -1.54, '9/1 12:00am'],
        ['Boeing Co.',                          75.43, 0.53,  0.71,  '9/1 12:00am'],
        ['Caterpillar Inc.',                    67.27, 0.92,  1.39,  '9/1 12:00am'],
        ['Citigroup, Inc.',                     49.37, 0.02,  0.04,  '9/1 12:00am'],
        ['E.I. du Pont de Nemours and Company', 40.48, 0.51,  1.28,  '9/1 12:00am'],
        ['Exxon Mobil Corp',                    68.1,  -0.43, -0.64, '9/1 12:00am'],
        ['General Electric Company',            34.14, -0.08, -0.23, '9/1 12:00am'],
        ['General Motors Corporation',          30.27, 1.09,  3.74,  '9/1 12:00am'],
        ['Hewlett-Packard Co.',                 36.53, -0.03, -0.08, '9/1 12:00am'],
        ['Honeywell Intl Inc',                  38.77, 0.05,  0.13,  '9/1 12:00am'],
        ['Intel Corporation',                   19.88, 0.31,  1.58,  '9/1 12:00am'],
        ['International Business Machines',     81.41, 0.44,  0.54,  '9/1 12:00am'],
        ['Johnson & Johnson',                   64.72, 0.06,  0.09,  '9/1 12:00am'],
        ['JP Morgan & Chase & Co',              45.73, 0.07,  0.15,  '9/1 12:00am'],
        ['McDonald\'s Corporation',             36.76, 0.86,  2.40,  '9/1 12:00am'],
        ['Merck & Co., Inc.',                   40.96, 0.41,  1.01,  '9/1 12:00am'],
        ['Microsoft Corporation',               25.84, 0.14,  0.54,  '9/1 12:00am'],
        ['Pfizer Inc',                          27.96, 0.4,   1.45,  '9/1 12:00am'],
        ['The Coca-Cola Company',               45.07, 0.26,  0.58,  '9/1 12:00am'],
        ['The Home Depot, Inc.',                34.64, 0.35,  1.02,  '9/1 12:00am'],
        ['The Procter & Gamble Company',        61.91, 0.01,  0.02,  '9/1 12:00am'],
        ['United Technologies Corporation',     63.26, 0.55,  0.88,  '9/1 12:00am'],
        ['Verizon Communications',              35.57, 0.39,  1.11,  '9/1 12:00am'],
        ['Wal-Mart Stores, Inc.',               45.45, 0.73,  1.63,  '9/1 12:00am']
    ];

    var ds = Ext.create('Ext.data.ArrayStore', {
        fields: [
            {name: 'company'},
            {name: 'price',      type: 'float'},
            {name: 'change',     type: 'float'},
            {name: 'pctChange',  type: 'float'},
            {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'},
            // Rating dependent upon performance 0 = best, 2 = worst
            {name: 'rating', type: 'int', convert: function(value, record) {
                var pct = record.get('pctChange');
                if (pct < 0) return 2;
                if (pct < 1) return 1;
                return 0;
            }}
        ],
        data: myData
    });


    // example of custom renderer function
    function change(val){
        if(val > 0){
            return '<span style="color:green;">' + val + '</span>';
        }else if(val < 0){
            return '<span style="color:red;">' + val + '</span>';
        }
        return val;
    }
    // example of custom renderer function
    function pctChange(val){
        if(val > 0){
            return '<span style="color:green;">' + val + '%</span>';
        }else if(val < 0){
            return '<span style="color:red;">' + val + '%</span>';
        }
        return val;
    }
    
    // render rating as "A", "B" or "C" depending upon numeric value.
    function rating(v) {
        if (v == 0) return "A";
        if (v == 1) return "B";
        if (v == 2) return "C";
    }


    bd.createChild({tag: 'h2', html: 'Using a Grid with a Form'});

    /*
     * Here is where we create the Form
     */
    var gridForm = Ext.create('Ext.form.Panel', {
        id: 'company-form',
        frame: true,
        title: 'Company data',
        bodyPadding: 5,
        width: 750,
        layout: 'column',    // Specifies that the items will now be arranged in columns

        fieldDefaults: {
            labelAlign: 'left',
            msgTarget: 'side'
        },

        items: [{
            columnWidth: 0.60,
            xtype: 'gridpanel',
            store: ds,
            height: 400,
            title:'Company Data',

            columns: [
                {
                    id       :'company',
                    text   : 'Company',
                    flex: 1,
                    sortable : true,
                    dataIndex: 'company'
                },
                {
                    text   : 'Price',
                    width    : 75,
                    sortable : true,
                    dataIndex: 'price'
                },
                {
                    text   : 'Change',
                    width    : 75,
                    sortable : true,
                    renderer : change,
                    dataIndex: 'change'
                },
                {
                    text   : '% Change',
                    width    : 75,
                    sortable : true,
                    renderer : pctChange,
                    dataIndex: 'pctChange'
                },
                {
                    text   : 'Last Updated',
                    width    : 85,
                    sortable : true,
                    renderer : Ext.util.Format.dateRenderer('m/d/Y'),
                    dataIndex: 'lastChange'
                },
                {
                    text: 'Rating',
                    width: 30,
                    sortable: true,
                    renderer: rating,
                    dataIndex: 'rating'
                }
            ],

            listeners: {
                selectionchange: function(model, records) {
                    if (records[0]) {
                        this.up('form').getForm().loadRecord(records[0]);
                    }
                }
            }
        }, {
            columnWidth: 0.4,
            margin: '0 0 0 10',
            xtype: 'fieldset',
            title:'Company details',
            defaults: {
                width: 240,
                labelWidth: 90
            },
            defaultType: 'textfield',
            items: [{
                fieldLabel: 'Name',
                name: 'company'
            },{
                fieldLabel: 'Price',
                name: 'price'
            },{
                fieldLabel: '% Change',
                name: 'pctChange'
            },{
                xtype: 'datefield',
                fieldLabel: 'Last Updated',
                name: 'lastChange'
            }, {
                xtype: 'radiogroup',
                fieldLabel: 'Rating',
                columns: 3,
                defaults: {
                    name: 'rating' //Each radio has the same name so the browser will make sure only one is checked at once
                },
                items: [{
                    inputValue: '0',
                    boxLabel: 'A'
                }, {
                    inputValue: '1',
                    boxLabel: 'B'
                }, {
                    inputValue: '2',
                    boxLabel: 'C'
                }]
            }]
        }],
        renderTo: bd
    });


    gridForm.child('gridpanel').getSelectionModel().select(0);
});
