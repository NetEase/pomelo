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
    'Ext.data.*'
]);

Ext.onReady(function(){

    Ext.define('example.contact', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'first', mapping: 'name > first'},
            {name: 'last', mapping: 'name > last'},
            'company', 'email', 'state',
            {name: 'dob', type: 'date', dateFormat: 'm/d/Y'}
        ]
    });

    Ext.define('example.fielderror', {
        extend: 'Ext.data.Model',
        fields: ['id', 'msg']
    });

    var formPanel = Ext.create('Ext.form.Panel', {
        renderTo: 'form-ct',
        frame: true,
        title:'XML Form',
        width: 340,
        bodyPadding: 5,
        waitMsgTarget: true,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 85,
            msgTarget: 'side'
        },

        // configure how to read the XML data
        reader : Ext.create('Ext.data.reader.Xml', {
            model: 'example.contact',
            record : 'contact',
            successProperty: '@success'
        }),

        // configure how to read the XML errors
        errorReader: Ext.create('Ext.data.reader.Xml', {
            model: 'example.fielderror',
            record : 'field',
            successProperty: '@success'
        }),

        items: [{
            xtype: 'fieldset',
            title: 'Contact Information',
            defaultType: 'textfield',
            defaults: {
                width: 280
            },
            items: [{
                    fieldLabel: 'First Name',
                    emptyText: 'First Name',
                    name: 'first'
                }, {
                    fieldLabel: 'Last Name',
                    emptyText: 'Last Name',
                    name: 'last'
                }, {
                    fieldLabel: 'Company',
                    name: 'company'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }, {
                    xtype: 'combobox',
                    fieldLabel: 'State',
                    name: 'state',
                    store: Ext.create('Ext.data.ArrayStore', {
                        fields: ['abbr', 'state'],
                        data : Ext.example.states // from states.js
                    }),
                    valueField: 'abbr',
                    displayField: 'state',
                    typeAhead: true,
                    queryMode: 'local',
                    emptyText: 'Select a state...'
                }, {
                    xtype: 'datefield',
                    fieldLabel: 'Date of Birth',
                    name: 'dob',
                    allowBlank: false,
                    maxValue: new Date()
                }
            ]
        }],

        buttons: [{
            text: 'Load',
            handler: function(){
                formPanel.getForm().load({
                    url: 'xml-form-data.xml',
                    waitMsg: 'Loading...'
                });
            }
        }, {
            text: 'Submit',
            disabled: true,
            formBind: true,
            handler: function(){
                this.up('form').getForm().submit({
                    url: 'xml-form-errors.xml',
                    submitEmptyText: false,
                    waitMsg: 'Saving Data...'
                });
            }
        }]
    });

});

