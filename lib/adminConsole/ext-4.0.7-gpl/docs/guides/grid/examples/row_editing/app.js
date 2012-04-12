/**
 * @example Row Editing
 *
 * This grid demonstrates row editing capabilities.
 */
Ext.require('Ext.data.Store');
Ext.require('Ext.grid.Panel');
Ext.require('Ext.form.field.Text');
Ext.require('Ext.form.field.Date');
Ext.require('Ext.form.field.Display');
Ext.require('Ext.grid.plugin.RowEditing');

Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'birthDate', type: 'date' }
    ]
});

Ext.onReady(function() {

    var userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        data: {
            items: [
                { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224', birthDate: new Date(1981, 9, 28) },
                { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234', birthDate: new Date(1979, 4, 1) },
                { name: 'Homer', email: 'home@simpsons.com', phone: '555-222-1244', birthDate: new Date(1956, 3, 15) },
                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254', birthDate: new Date(1954, 10, 1) }
            ]
        },
        
        proxy: {
            type: 'memory',
            reader: {
                type: 'json',
                root: 'items'
            }
        }

    });

    Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        store: userStore,
        width: 400,
        height: 200,
        title: 'Application Users',
        columns: [
            {
                text: 'Name',
                flex: 1,
                hideable: false,
                dataIndex: 'name',
                editor: {
                    //use a Ext.form.field.Text as the editor
                    xtype: 'textfield',
                    //prevent empty values from being inserted into this field
                    allowBlank: false
                }
            },
            {
                text: 'Email Address',
                width: 130,
                dataIndex: 'email',
                //use a Ext.form.field.Text as the editor
                editor: 'textfield'
            },
            {
                text: 'Phone Number',
                width: 85,
                dataIndex: 'phone'
            },
            {
                text: 'Birth Date',
                width: 90,
                dataIndex: 'birthDate',
                //use a Ext.form.field.Date as the editor
                editor: 'datefield',
                // format the date using a renderer from the Ext.util.Format class
                renderer: Ext.util.Format.dateRenderer('m/d/Y')
            }
        ],
        selType: 'rowmodel',
        plugins: [
            Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToEdit: 1
            })
        ]
    });

});
