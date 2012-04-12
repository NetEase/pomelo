/**
 * @example Model with Proxy
 *
 * This example demonstrates using a {@link Ext.data.proxy.Proxy} directly on a {@link Ext.data.Model}
 * The data is loaded and saved using a dummy rest api at url `data/users`.  You should see messages appear
 * in your console when the data is loaded and saved.
 * A global variable called "userStore" is created which is an instance of {@link Ext.data.Store}.
 * Feel free to experiment with the "userStore" object on the console command line.
 */
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name', 'age'],
    proxy: {
        type: 'rest',
        url : 'data/users',
        reader: {
            type: 'json',
            root: 'users'
        }
    }
});

var userStore;
Ext.require('Ext.data.Store');
Ext.onReady(function() {
    // Uses the User Model's Proxy
    userStore = Ext.create('Ext.data.Store', {
        model: 'User',
        autoLoad: true
    });

    // Gives us a reference to the User class
    var User = Ext.ModelMgr.getModel('User');

    var ed = Ext.create('User', {
        name: 'Ed Spencer',
        age : 25
    });

    // We can save Ed directly without having to add him to a Store first because we
    // configured a RestProxy this will automatically send a POST request to the url data/users
    ed.save({
        success: function(ed) {
            console.log("Saved Ed! His ID is "+ ed.getId());
        }
    });

    // Load User 1 and do something with it (performs a GET request to /users/1)
    User.load(1, {
        success: function(user) {
            console.log("Loaded user 1: " + user.get('name'));
        }
    });

});

