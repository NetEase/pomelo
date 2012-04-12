/**
 * @example Sorting Grouping Filtering Store
 *
 * This example demonstrates {@link Ext.data.Store}'s sorting, grouping, and filtering capabilities.
 * The data at url `data/users.json` is auto-loaded into the store.  The data will be sorted first by name then id;
 * it will be filtered to only include Users with the name 'Ed' and the data will be grouped by age.
 * A global variable called "userStore" is created which is an instance of {@link Ext.data.Store}.
 * Feel free to experiment with the "userStore" object on the console command line.
 * `userStore.getGroups()` should return an array of groups.
 */
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'age', type: 'int' },
        { name: 'bob', type: 'int' }

    ]
});

var userStore;
Ext.require('Ext.data.Store');
Ext.onReady(function() {
    userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        autoLoad: true,

        sorters: ['name', 'id'], // sort first by name, then by id
        filters: {
            // filter the data to only include users with the name 'Ed'
            property: 'name',
            value: 'Ed'
        },
        groupField: 'age',
        groupDir: 'DESC',

        proxy: {
            type: 'ajax',
            url: 'data/users.json',
            reader: {
                type: 'json',
                root: 'users',
                successProperty: 'success'
            }
        }
    });
});

