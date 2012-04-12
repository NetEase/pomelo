/**
 * @example Simple Form
 *
 */
Ext.require('Ext.form.Panel');
Ext.require('Ext.form.field.Date');
Ext.onReady(function() {
    Ext.create('Ext.form.Panel', {
        renderTo: Ext.getBody(),
        title: 'User Form',
        height: 100,
        width: 515,
        defaults: {
            xtype: 'textfield',
            labelAlign: 'top',
            padding: 10
        },
        layout: {
            type: 'hbox'
        },
        items: [
            {
                fieldLabel: 'First Name',
                name: 'firstName'
            },
            {
                fieldLabel: 'Last Name',
                name: 'lastName'
            },
            {
                xtype: 'datefield',
                fieldLabel: 'Date of Birth',
                name: 'birthDate'
            }
        ]
    });

});
