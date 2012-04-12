/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.form.*'
]);

Ext.onReady(function() {

    var formPanel = Ext.create('Ext.form.Panel', {
        frame: true,
        title: 'Form Fields',
        width: 340,
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'left',
            labelWidth: 90,
            anchor: '100%'
        },

        items: [{
            xtype: 'textfield',
            name: 'textfield1',
            fieldLabel: 'Text field',
            value: 'Text field value'
        }, {
            xtype: 'textfield',
            name: 'password1',
            inputType: 'password',
            fieldLabel: 'Password field'
        }, {
            xtype: 'filefield',
            name: 'file1',
            fieldLabel: 'File upload'
        }, {
            xtype: 'textareafield',
            name: 'textarea1',
            fieldLabel: 'TextArea',
            value: 'Textarea value'
        }, {
            xtype: 'displayfield',
            name: 'displayfield1',
            fieldLabel: 'Display field',
            value: 'Display field <span style="color:green;">value</span>'
        }, {
            xtype: 'numberfield',
            name: 'numberfield1',
            fieldLabel: 'Number field',
            value: 5,
            minValue: 0,
            maxValue: 50
        }, {
            xtype: 'checkboxfield',
            name: 'checkbox1',
            fieldLabel: 'Checkbox',
            boxLabel: 'box label'
        }, {
            xtype: 'radiofield',
            name: 'radio1',
            value: 'radiovalue1',
            fieldLabel: 'Radio buttons',
            boxLabel: 'radio 1'
        }, {
            xtype: 'radiofield',
            name: 'radio1',
            value: 'radiovalue2',
            fieldLabel: '',
            labelSeparator: '',
            hideEmptyLabel: false,
            boxLabel: 'radio 2'
        }, {
            xtype: 'datefield',
            name: 'date1',
            fieldLabel: 'Date Field'
        }, {
            xtype: 'timefield',
            name: 'time1',
            fieldLabel: 'Time Field',
            minValue: '1:30 AM',
            maxValue: '9:15 PM'
        }]
    });

    formPanel.render('form-ct');

});

