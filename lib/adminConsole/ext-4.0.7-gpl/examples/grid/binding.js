/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.panel.*',
    'Ext.layout.container.Border'
]);

Ext.onReady(function(){
    Ext.define('Book',{
        extend: 'Ext.data.Model',
        fields: [
            // set up the fields mapping into the xml doc
            // The first needs mapping, the others are very basic
            {name: 'Author', mapping: 'ItemAttributes > Author'},
            'Title',
            'Manufacturer',
            'ProductGroup',
            'DetailPageURL'
        ]
    });

    // create the Data Store
    var store = Ext.create('Ext.data.Store', {
        model: 'Book',
        proxy: {
            // load using HTTP
            type: 'ajax',
            url: 'sheldon.xml',
            // the return will be XML, so lets set up a reader
            reader: {
                type: 'xml',
                record: 'Item',
                totalProperty  : 'total'
            }
        }
    });

    // create the grid
    var grid = Ext.create('Ext.grid.Panel', {
        store: store,
        columns: [
            {text: "Author", width: 120, dataIndex: 'Author', sortable: true},
            {text: "Title", flex: 1, dataIndex: 'Title', sortable: true},
            {text: "Manufacturer", width: 115, dataIndex: 'Manufacturer', sortable: true},
            {text: "Product Group", width: 100, dataIndex: 'ProductGroup', sortable: true}
        ],
        viewConfig: {
            forceFit: true
        },
        height:210,
        split: true,
        region: 'north'
    });
        
    // define a template to use for the detail view
    var bookTplMarkup = [
        'Title: <a href="{DetailPageURL}" target="_blank">{Title}</a><br/>',
        'Author: {Author}<br/>',
        'Manufacturer: {Manufacturer}<br/>',
        'Product Group: {ProductGroup}<br/>'
    ];
    var bookTpl = Ext.create('Ext.Template', bookTplMarkup);

    Ext.create('Ext.Panel', {
        renderTo: 'binding-example',
        frame: true,
        title: 'Book List',
        width: 540,
        height: 400,
        layout: 'border',
        items: [
            grid, {
                id: 'detailPanel',
                region: 'center',
                bodyPadding: 7,
                bodyStyle: "background: #ffffff;",
                html: 'Please select a book to see additional details.'
        }]
    });
    
    // update panel body on selection change
    grid.getSelectionModel().on('selectionchange', function(sm, selectedRecord) {
        if (selectedRecord.length) {
            var detailPanel = Ext.getCmp('detailPanel');
            bookTpl.overwrite(detailPanel.body, selectedRecord[0].data);
        }
    });

    store.load();
});
