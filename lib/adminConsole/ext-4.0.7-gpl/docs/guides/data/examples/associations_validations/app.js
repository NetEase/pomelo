/**
 * @example Associations and Validations
 *
 * This example demonstrates associations and validations on a {@link Ext.data.Model}.
 * See console for output.
 */

// define the User model
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name', 'age', 'gender'],
    validations: [
        {type: 'presence', name: 'name'},
        {type: 'length',   name: 'name', min: 5},
        {type: 'format',   name: 'age', matcher: /\d+/},
        {type: 'inclusion', name: 'gender', list: ['male', 'female']},
        {type: 'exclusion', name: 'name', list: ['admin']}
    ],

    proxy: {
        type: 'rest',
        url : 'data/users',
        reader: {
            type: 'json',
            root: 'users'
        }
    },

    hasMany: 'Post' // shorthand for {model: 'Post', name: 'posts'}
});

//define the Post model
Ext.define('Post', {
    extend: 'Ext.data.Model',
    fields: ['id', 'user_id', 'title', 'body'],

    proxy: {
        type: 'rest',
        url : 'data/posts',
        reader: {
            type: 'json',
            root: 'posts'
        }
    },
    belongsTo: 'User',
    hasMany: {model: 'Comment', name: 'comments'}
});

//define the Comment model
Ext.define('Comment', {
    extend: 'Ext.data.Model',
    fields: ['id', 'post_id', 'name', 'message'],

    belongsTo: 'Post'
});

Ext.require('Ext.data.Store');
Ext.onReady(function() {
    // Loads User with ID 1 and related posts and comments using User's Proxy
    User.load(1, {
        success: function(user) {
            console.log("User: " + user.get('name'));

            // loop through the user's posts and print out the comments
            user.posts().each(function(post) {
                console.log("Comments for post: " + post.get('title'));

                post.comments().each(function(comment) {
                    console.log(comment.get('message'));
                });

                // get the user reference from the post's belongsTo association
                post.getUser(function(user) {
                    console.log('Just got the user reference from the post: ' + user.get('name'))
                });

                // try to change the post's user
                post.setUser(100, {
                    callback: function(product, operation) {
                        if (operation.wasSuccessful()) {
                            console.log('Post\'s user was updated');
                        } else {
                            console.log('Post\'s user could not be updated');
                        }
                    }
                });

            });

            // create a new post
            user.posts().add({
                title: 'Ext JS 4.0 MVC Architecture',
                body: 'It\'s a great Idea to structure your Ext JS Applications using the built in MVC Architecture...'
            });

            // save the new post
            user.posts().sync();

        }
    });

    // now lets try to create a new user with as many validation errors as we can
    var newUser = Ext.create('User', {
        name: 'admin',
        age: 'twenty-nine',
        gender: 'not a valid gender'
    });

    // run some validation on the new user we just created
    var errors = newUser.validate();

    console.log('Is User valid?', errors.isValid()); //returns 'false' as there were validation errors
    console.log('All Errors:', errors.items); //returns the array of all errors found on this model instance

    console.log('Age Errors:', errors.getByField('age')); //returns the errors for the age field

});

