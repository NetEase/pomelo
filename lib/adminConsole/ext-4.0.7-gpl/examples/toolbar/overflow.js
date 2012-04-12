/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require(['*']);
Ext.onReady(function(){

    var handleAction = function(action){
        Ext.example.msg('<b>Action</b>', 'You clicked "' + action + '"');
    };

    var colorMenu = Ext.create('Ext.menu.ColorPicker', {
        handler: function(cm, color){
            Ext.example.msg('Color Selected', '<span style="color:#' + color + ';">You choose {0}.</span>', color);
        }
    });

    Ext.create('Ext.Window', {
        title: 'Standard',
        closable: false,
        height:250,
        width: 500,
        bodyStyle: 'padding:10px',
        contentEl: 'content',
        autoScroll: true,
        tbar: Ext.create('Ext.toolbar.Toolbar', {
            layout: {
                overflowHandler: 'Menu'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Menu Button'),
                menu: [{text: 'Menu Item 1', handler: Ext.Function.pass(handleAction, 'Menu Item 1')}]
            },'-',{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Cut'),
                menu: [{text: 'Cut menu', handler: Ext.Function.pass(handleAction, 'Cut menu')}]
            },{
                text: 'Copy',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Copy')
            },{
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste menu', handler: Ext.Function.pass(handleAction, 'Paste menu')}]
            },'-',{
                text: 'Format',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Format')
            },'->',{
                text: 'Right',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Right')
            }, {
                text: 'Choose a Color',
                menu: colorMenu // <-- submenu by reference
            }]
        })
    }).show();
});

