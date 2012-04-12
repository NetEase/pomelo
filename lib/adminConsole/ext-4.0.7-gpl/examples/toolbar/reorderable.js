/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', '../ux/');

Ext.require([
    'Ext.panel.*',
    'Ext.fx.*',
    'Ext.toolbar.*',
    'Ext.button.*',
    'Ext.ux.BoxReorderer'
]);

Ext.onReady(function() {
    var toolbar = Ext.createWidget('toolbar', {
        renderTo: Ext.getBody(),
        defaults: {
            reorderable: true
        },
        plugins : Ext.create('Ext.ux.BoxReorderer', {}),
        items   : [
            {
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                menu: [{text: 'Menu Item 1'}],
                reorderable: false
            },
            {
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },
            {
                text: 'Copy',
                iconCls: 'add16'
            },
            {
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },
            {
                text: 'Format',
                iconCls: 'add16'
            }
        ]
    });
    
    Ext.createWidget('panel', {
        renderTo: Ext.getBody(),
        tbar    : toolbar,
        border  : true,
        width   : 600,
        height  : 400
    });
});
