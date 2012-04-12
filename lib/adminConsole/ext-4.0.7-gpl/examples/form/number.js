/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require('Ext.form.*');

Ext.onReady(function() {
    Ext.createWidget('form', {
        renderTo: 'example-form',
        title: 'Number fields with spinner',
        bodyPadding: 5,
        frame: true,
        width: 340,
        fieldDefaults: {
            labelAlign: 'left',
            labelWidth: 105,
            anchor: '100%'
        },
        items: [{
                xtype: 'numberfield',
                fieldLabel: 'Default',
                name: 'basic',
                value: 1,
                minValue: 1,
                maxValue: 125
            },{
                xtype: 'numberfield',
                fieldLabel: 'With a step of 0.4',
                name: 'test',
                minValue: -100,
                maxValue: 100,
                allowDecimals: true,
                decimalPrecision: 1,
                step: 0.4
            },{
                xtype: 'numberfield',
                hideTrigger: true,
                fieldLabel: 'Without spinner',
                name: 'without_spinner'
            }]

    });
});


