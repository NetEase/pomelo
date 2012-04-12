/**
 * @example Renderers
 *
 * This grid demonstrates the use of a couple different custom renderers.
 * The birth date field is rendered using a date formatter, and the email address is rendered as a hyperlink.
 */
Ext.require('Ext.data.Store');
Ext.require('Ext.grid.Panel');

Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'birthDate', type: 'date' }
    ]
});

Ext.onReady(function() {

    var userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        data: [
            { name: 'Lisa', email: 'lisa@simpsons.com', birthDate: new Date(1981, 9, 28) },
            { name: 'Bart', email: 'bart@simpsons.com', birthDate: new Date(1979, 4, 1) },
            { name: 'Homer', email: 'home@simpsons.com', birthDate: new Date(1956, 3, 15) },
            { name: 'Marge', email: 'marge@simpsons.com', birthDate: new Date(1954, 10, 1) }
        ]
    });

    Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        store: userStore,
        width: 500,
        height: 300,
        title: 'Application Users',
        columns: [
            {
                text: 'Name',
                width: 150,
                dataIndex: 'name'
            },
            {
                text: 'Birth Date',
                width: 75,
                dataIndex: 'birthDate',
                // format the date using a renderer from the Ext.util.Format class
                renderer: Ext.util.Format.dateRenderer('m/d/Y')
            },
            {
                text: 'Email Address',
                flex: 1,
                dataIndex: 'email',
                // format the email address using a custom renderer
                renderer: function(value) {
                    return Ext.String.format('<a href="mailto:{0}">{1}</a>', value, value);
                }
            }
        ]
    });

});
