/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 * @class Ext.ModelManager
 * @extends Ext.AbstractManager

The ModelManager keeps track of all {@link Ext.data.Model} types defined in your application.

__Creating Model Instances__

Model instances can be created by using the {@link Ext#create Ext.create} method. Ext.create replaces
the deprecated {@link #create Ext.ModelManager.create} method. It is also possible to create a model instance
this by using the Model type directly. The following 3 snippets are equivalent:

    Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: ['first', 'last']
    });

    // method 1, create using Ext.create (recommended)
    Ext.create('User', {
        first: 'Ed',
        last: 'Spencer'
    });

    // method 2, create through the manager (deprecated)
    Ext.ModelManager.create({
        first: 'Ed',
        last: 'Spencer'
    }, 'User');

    // method 3, create on the type directly
    new User({
        first: 'Ed',
        last: 'Spencer'
    });

__Accessing Model Types__

A reference to a Model type can be obtained by using the {@link #getModel} function. Since models types
are normal classes, you can access the type directly. The following snippets are equivalent:

    Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: ['first', 'last']
    });

    // method 1, access model type through the manager
    var UserType = Ext.ModelManager.getModel('User');

    // method 2, reference the type directly
    var UserType = User;

 * @markdown
 * @singleton
 */
Ext.define('Ext.ModelManager', {
    extend: 'Ext.AbstractManager',
    alternateClassName: 'Ext.ModelMgr',
    requires: ['Ext.data.Association'],

    singleton: true,

    typeName: 'mtype',

    /**
     * Private stack of associations that must be created once their associated model has been defined
     * @property {Ext.data.Association[]} associationStack
     */
    associationStack: [],

    /**
     * Registers a model definition. All model plugins marked with isDefault: true are bootstrapped
     * immediately, as are any addition plugins defined in the model config.
     * @private
     */
    registerType: function(name, config) {
        var proto = config.prototype,
            model;
        if (proto && proto.isModel) {
            // registering an already defined model
            model = config;
        } else {
            // passing in a configuration
            if (!config.extend) {
                config.extend = 'Ext.data.Model';
            }
            model = Ext.define(name, config);
        }
        this.types[name] = model;
        return model;
    },

    /**
     * @private
     * Private callback called whenever a model has just been defined. This sets up any associations
     * that were waiting for the given model to be defined
     * @param {Function} model The model that was just created
     */
    onModelDefined: function(model) {
        var stack  = this.associationStack,
            length = stack.length,
            create = [],
            association, i, created;

        for (i = 0; i < length; i++) {
            association = stack[i];

            if (association.associatedModel == model.modelName) {
                create.push(association);
            }
        }

        for (i = 0, length = create.length; i < length; i++) {
            created = create[i];
            this.types[created.ownerModel].prototype.associations.add(Ext.data.Association.create(created));
            Ext.Array.remove(stack, created);
        }
    },

    /**
     * Registers an association where one of the models defined doesn't exist yet.
     * The ModelManager will check when new models are registered if it can link them
     * together
     * @private
     * @param {Ext.data.Association} association The association
     */
    registerDeferredAssociation: function(association){
        this.associationStack.push(association);
    },

    /**
     * Returns the {@link Ext.data.Model} for a given model name
     * @param {String/Object} id The id of the model or the model instance.
     * @return {Ext.data.Model} a model class.
     */
    getModel: function(id) {
        var model = id;
        if (typeof model == 'string') {
            model = this.types[model];
        }
        return model;
    },

    /**
     * Creates a new instance of a Model using the given data.
     *
     * This method is deprecated.  Use {@link Ext#create Ext.create} instead.  For example:
     *
     *     Ext.create('User', {
     *         first: 'Ed',
     *         last: 'Spencer'
     *     });
     *
     * @param {Object} data Data to initialize the Model's fields with
     * @param {String} name The name of the model to create
     * @param {Number} id (Optional) unique id of the Model instance (see {@link Ext.data.Model})
     */
    create: function(config, name, id) {
        var con = typeof name == 'function' ? name : this.types[name || config.name];

        return new con(config, id);
    }
}, function() {

    /**
     * Old way for creating Model classes.  Instead use:
     *
     *     Ext.define("MyModel", {
     *         extend: "Ext.data.Model",
     *         fields: []
     *     });
     *
     * @param {String} name Name of the Model class.
     * @param {Object} config A configuration object for the Model you wish to create.
     * @return {Ext.data.Model} The newly registered Model
     * @member Ext
     * @deprecated 4.0.0 Use {@link Ext#define} instead.
     */
    Ext.regModel = function() {
        //<debug>
        if (Ext.isDefined(Ext.global.console)) {
            Ext.global.console.warn('Ext.regModel has been deprecated. Models can now be created by extending Ext.data.Model: Ext.define("MyModel", {extend: "Ext.data.Model", fields: []});.');
        }
        //</debug>
        return this.ModelManager.registerType.apply(this.ModelManager, arguments);
    };
});

