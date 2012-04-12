/**
 * @example Lazy Associations
 *
 * This example demonstrates lazy loading of a {@link Ext.data.Model}'s associations only when requested.
 * a `User` model is loaded, then a separate request is made for the `User`'s associated `Post`s
 * See console for output.
 */

// define the User model
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name', 'age', 'gender'],

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
    // Loads User with ID 1 User's Proxy
    User.load(1, {
        success: function(user) {
            console.log("User: " + user.get('name'));

            // Loads posts for user 1 using Post's Proxy
            user.posts().load({
                callback: function(posts, operation) {
                    Ext.each(posts, function(post) {
                        console.log("Comments for post: " + post.get('title'));

                        post.comments().each(function(comment) {
                            console.log(comment.get('message'));
                        });
                    });
                }
            });
        }
    });
});

