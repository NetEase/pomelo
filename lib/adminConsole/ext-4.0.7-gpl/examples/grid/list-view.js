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
    'Ext.panel.*'
]);
Ext.onReady(function(){
    Ext.define('ImageModel', {
        extend: 'Ext.data.Model',
        fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date', dateFormat:'timestamp'}]
    });
    var store = Ext.create('Ext.data.JsonStore', {
        model: 'ImageModel',
        proxy: {
            type: 'ajax',
            url: 'get-images.php',
            reader: {
                type: 'json',
                root: 'images'
            }
        }
    });
    store.load();

    var listView = Ext.create('Ext.grid.Panel', {
        width:425,
        height:250,
        collapsible:true,
        title:'Simple ListView <i>(0 items selected)</i>',
        renderTo: Ext.getBody(),

        store: store,
        multiSelect: true,
        viewConfig: {
            emptyText: 'No images to display'
        },

        columns: [{
            text: 'File',
            flex: 50,
            dataIndex: 'name'
        },{
            text: 'Last Modified',
            xtype: 'datecolumn',
            format: 'm-d h:i a',
            flex: 35,
            dataIndex: 'lastmod'
        },{
            text: 'Size',
            dataIndex: 'size',
            tpl: '{size:fileSize}',
            align: 'right',
            flex: 15,
            cls: 'listview-filesize'
        }]
    });

    // little bit of feedback
    listView.on('selectionchange', function(view, nodes){
        var l = nodes.length;
        var s = l != 1 ? 's' : '';
        listView.setTitle('Simple ListView <i>('+l+' item'+s+' selected)</i>');
    });
});

