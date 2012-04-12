/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.panel.Panel',
    'Ext.Action',
    'Ext.button.Button',
    'Ext.window.MessageBox'
]);

Ext.onReady(function(){
    var action = Ext.create('Ext.Action', {
        text: 'Action 1',
        iconCls: 'icon-add',
        handler: function(){
            Ext.example.msg('Click', 'You clicked on "Action 1".');
        }
    });
    
     var panel = Ext.create('Ext.panel.Panel', {
        title: 'Actions',
        renderTo: document.body,
        width: 600,
        height: 300,
        bodyPadding: 10,
        dockedItems: {
            itemId: 'toolbar',
            xtype: 'toolbar',
            items: [
                action, // Add the action directly to a toolbar
                {
                    text: 'Action menu',
                    menu: [action] // Add the action directly to a menu
                }
            ]
        },
        items: Ext.create('Ext.button.Button', action)       // Add the action as a button
    });
    
    /*
     * Add toolbar items dynamically after creation
     */
    var toolbar = panel.child('#toolbar');
    toolbar.add('->', {
        text: 'Disable',
        handler: function(){
            action.setDisabled(!action.isDisabled());
            this.setText(action.isDisabled() ? 'Enable' : 'Disable');
        }
    }, {
        text: 'Change Text',
        handler: function(){
            Ext.Msg.prompt('Enter Text', 'Enter new text for Action 1:', function(btn, text){
                if(btn == 'ok' && text){
                    action.setText(text);
                    action.setHandler(function(){
                        Ext.example.msg('Click','You clicked on "'+text+'".');
                    });
                }
            });
        }
    }, {
        text: 'Change Icon',
        handler: function(){
            action.setIconCls(action.getIconCls() == 'icon-add' ? 'icon-edit' : 'icon-add');
        }
    });
});

