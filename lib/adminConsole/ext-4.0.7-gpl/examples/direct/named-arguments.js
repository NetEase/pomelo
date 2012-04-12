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
    'Ext.form.Panel',
    'Ext.form.field.Text',
    'Ext.form.field.Number'
]);

Ext.onReady(function(){
    Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
    
    var form = Ext.create('Ext.form.Panel', {
        width: 300,
        height: 130,
        renderTo: document.body,
        bodyPadding: 5,
        items: [{
            xtype: 'textfield',
            fieldLabel: 'First Name',
            name: 'firstName',
            value: 'Evan',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Last Name',
            name: 'lastName',
            value: 'Trimboli',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Age',
            name: 'age',
            value: 25,
            allowBlank: false
        }],
        dockedItems: [{
            dock: 'bottom',
            ui: 'footer',
            xtype: 'toolbar',
            items: ['->', {
                formBind: true,
                text: 'Send',
                handler: function(){
                    var values = form.getForm().getValues();
                    TestAction.showDetails(values, function(value){
                        Ext.example.msg('Server Response', value);
                    });
                }
            }]
        }]  
    });
});

