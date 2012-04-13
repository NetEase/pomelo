/**
 * @example Inline Data
 *
 * This example creates a simple store that auto-loads its data from an ajax
 * proxy. A global variable called "userStore" is created which is an instance of
 * {@link Ext.data.Store}. Feel free to experiment with the "userStore" object on the console command line.
 */
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: ['firstName', 'lastName']
});

var userStore;
Ext.require('Ext.data.Store');
Ext.onReady(function() {
    userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        data: [
            {firstName: 'Ed',    lastName: 'Spencer'},
            {firstName: 'Tommy', lastName: 'Maintz'},
            {firstName: 'Aaron', lastName: 'Conran'},
            {firstName: 'Jamie', lastName: 'Avins'}
        ]
    });
});

