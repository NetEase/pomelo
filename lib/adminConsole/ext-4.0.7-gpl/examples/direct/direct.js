/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.direct.*',
    'Ext.panel.Panel',
    'Ext.form.field.Text',
    'Ext.toolbar.TextItem'
]);

Ext.onReady(function(){
    
    function doEcho(field){
        TestAction.doEcho(field.getValue(), function(result, event){
            var transaction = event.getTransaction(),
                content = Ext.String.format('<b>Successful call to {0}.{1} with response:</b><pre>{2}</pre>',
                    transaction.action, transaction.method, Ext.encode(result));
            
            updateMain(content);
            field.reset();
        });
    }
    
    function doMultiply(field){
        TestAction.multiply(field.getValue(), function(result, event){
            var transaction = event.getTransaction(),
                content;
                
            if (event.status) {
                content = Ext.String.format('<b>Successful call to {0}.{1} with response:</b><pre>{2}</pre>',
                    transaction.action, transaction.method, Ext.encode(result));
            } else {
                content = Ext.String.format('<b>Call to {0}.{1} failed with message:</b><pre>{2}</pre>',
                    transaction.action, transaction.method, event.message);
            }
            updateMain(content);
            field.reset();
        });
    }
    
    function updateMain(content){
        main.update({
            data: content
        });
        main.body.scroll('b', 100000, true);
    }
    
    Ext.direct.Manager.addProvider(Ext.app.REMOTING_API, {
        type:'polling',
        url: 'php/poll.php',
        listeners: {
            data: function(provider, event){
                updateMain('<i>' + event.data + '</i>');
            }
        }
    });
    
    var main = Ext.create('Ext.panel.Panel', {
        id: 'logger',
        title: 'Remote Call Log',
        renderTo: document.body,
		width: 600,
		height: 300,
        tpl: '<p>{data}</p>',
        tplWriteMode: 'append',
        autoScroll: true,
        bodyStyle: 'padding: 5px;',
        dockedItems: [{
            dock: 'bottom',
            xtype: 'toolbar',
            items: [{
                hideLabel: true,
                itemId: 'echoText',
                xtype: 'textfield',
                width: 300,
                emptyText: 'Echo input',
                listeners: {
                    specialkey: function(field, event){
                        if (event.getKey() === event.ENTER) {
                            doEcho(field);
                        }
                    }
                }
            }, {
                itemId: 'echo',
                text: 'Echo',
                handler: function(){
                    doEcho(main.down('#echoText'));
                }
            }, '-', {
                hideLabel: true,
                itemId: 'multiplyText',
                xtype: 'textfield',
                width: 80,
                emptyText: 'Multiply x 8',
                listeners: {
                    specialkey: function(field, event){
                        if (event.getKey() === event.ENTER) {
                            doMultiply(field);
                        }
                    }
                }
            }, {
                itemId: 'multiply',
                text: 'Multiply',
                handler: function(){
                    doMultiply(main.down('#multiplyText'));
                }
            }]
        }]
	});
});

