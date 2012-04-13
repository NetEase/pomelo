/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.tree.*',
    'Ext.data.*'
]);

Ext.onReady(function() {

    var store = Ext.create('Ext.data.TreeStore', {
        proxy: {
            type: 'ajax',
            url: 'get-nodes.php',
            extraParams: {
                isXml: true
            },
            reader: {
                type: 'xml',
                root: 'nodes',
                record: 'node'
            }
        },
        sorters: [{
            property: 'leaf',
            direction: 'ASC'
        },{
            property: 'text',
            direction: 'ASC'
        }],
        root: {
            text: 'Ext JS',
            id: 'src',
            expanded: true
        }
    });

    // create the Tree
    var tree = Ext.create('Ext.tree.Panel', {
        store: store,
        hideHeaders: true,
        rootVisible: true,
        viewConfig: {
            plugins: [{
                ptype: 'treeviewdragdrop'
            }]
        },
        height: 350,
        width: 400,
        title: 'Directory Listing',
        renderTo: 'tree-example',
        collapsible: true
    });
});

