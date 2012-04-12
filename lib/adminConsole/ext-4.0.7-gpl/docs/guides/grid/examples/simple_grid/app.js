/**
 * @example Simple Grid
 *
 * A basic grid that renders itself to the document body.
 */
Ext.require('Ext.data.Store');
Ext.require('Ext.grid.Panel');

Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: [ 'name', 'email', 'phone' ]
});

Ext.onReady(function() {

    var userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        data: [
            { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
            { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
            { name: 'Homer', email: 'home@simpsons.com', phone: '555-222-1244' },
            { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
        ]
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
                width: 100,
                sortable: false,
                hideable: false,
                dataIndex: 'name'
            },
            {
                text: 'Email Address',
                width: 150,
                dataIndex: 'email',
                hidden: true
            },
            {
                text: 'Phone Number',
                flex: 1,
                dataIndex: 'phone'
            }
        ]
    });

});
