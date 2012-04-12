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
    'Ext.form.field.Number'
]);

Ext.onReady(function(){
    var main = Ext.create('Ext.panel.Panel', {
        renderTo: document.body,
        width: 800,
        height: 400,
        layout: {
            type: 'hbox',
            align: 'stretch',
            padding: 5
        },
        items: [{
            flex: 1,
            margins: '0 2 0 0',
            title: 'Load raw html',
            styleHtmlContent: true,
            bodyPadding: 5,
            loader: {
                autoLoad: true,
                url: 'content.htm'
            }
        }, {
            flex: 1,
            margins: '0 2 0 3',
            title: 'Load data for template',
            bodyPadding: 5,
            tpl: 'Favorite Colors<br /><br /><tpl for="."><b>{name}</b> - <span style="color: #{hex};">{color}</span><br /></tpl>',
            loader: {
                autoLoad: true,
                url: 'data.json',
                renderer: 'data'
            }
        }, {
            flex: 1,
            margins: '0 0 0 3',
            layout: {
                type: 'vbox',
                align: 'stretch',
                padding: '5 5 0 5'
            },
            defaults: {
                margins: '0 0 5 0'
            },
            title: 'Load Dynamic Components - No autoLoad',
            itemId: 'dynamic',
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [' ',{
                    fieldLabel: '# to load',
                    labelWidth: 60,
                    xtype: 'numberfield',
                    value: 5,
                    minValue: 1,
                    size: 5,
                    itemId: 'toLoad'
                }, {
                    text: 'Load!',
                    handler: function(){
                        var dynamic = main.child('#dynamic'),
                            value = dynamic.down('#toLoad').getValue();
                            
                        dynamic.getLoader().load({
                            params: {
                                total: value
                            }
                        });
                    }
                }]
            }],
            loader: {
                loadMask: true,
                removeAll: true,
                url: 'boxes.php',
                renderer: 'component',
                success: function(loader){
                    var panel = loader.getTarget();
                    panel.setTitle('Loaded ' + panel.items.getCount() + ' items');
                }
            }
        }]    
    });
});

