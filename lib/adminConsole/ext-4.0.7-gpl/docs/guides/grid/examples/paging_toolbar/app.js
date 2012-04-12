/**
 * @example Paging Toolbar
 *
 * This example demonstrates loading data in pages dynamically from the server using a {@link Ext.toolbar.Paging Paging Toolbar}.
 * Note, that since there is no back end (data is loaded from a static file at `data/users.json`) each page will show the same data set.
 */
Ext.require('Ext.data.Store');
Ext.require('Ext.grid.Panel');
Ext.require('Ext.toolbar.Paging');

Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: [ 'name', 'email', 'phone' ]
});

Ext.onReady(function() {

    var userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        autoLoad: true,
        pageSize: 4,
        proxy: {
            type: 'ajax',
            url : 'data/users.json',
            reader: {
                type: 'json',
                root: 'users',
                totalProperty: 'total'
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
                width: 100,
                dataIndex: 'name'
            },
            {
                text: 'Email Address',
                width: 150,
                dataIndex: 'email'
            },
            {
                text: 'Phone Number',
                flex: 1,
                dataIndex: 'phone'
            }
        ],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            store: userStore,   // same store GridPanel is using
            dock: 'bottom',
            displayInfo: true
        }]
    });

});
