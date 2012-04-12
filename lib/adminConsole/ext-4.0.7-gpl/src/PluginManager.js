/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @singleton
 *
 * Provides a registry of available Plugin classes indexed by a mnemonic code known as the Plugin's ptype.
 *
 * A plugin may be specified simply as a *config object* as long as the correct `ptype` is specified:
 *
 *     {
 *         ptype: 'gridviewdragdrop',
 *         dragText: 'Drag and drop to reorganize'
 *     }
 *
 * Or just use the ptype on its own:
 *
 *     'gridviewdragdrop'
 *
 * Alternatively you can instantiate the plugin with Ext.create:
 *
 *     Ext.create('Ext.view.plugin.AutoComplete', {
 *         ptype: 'gridviewdragdrop',
 *         dragText: 'Drag and drop to reorganize'
 *     })
 */
Ext.define('Ext.PluginManager', {
    extend: 'Ext.AbstractManager',
    alternateClassName: 'Ext.PluginMgr',
    singleton: true,
    typeName: 'ptype',

    /**
     * Creates a new Plugin from the specified config object using the config object's ptype to determine the class to
     * instantiate.
     * @param {Object} config A configuration object for the Plugin you wish to create.
     * @param {Function} defaultType (optional) The constructor to provide the default Plugin type if the config object does not
     * contain a `ptype`. (Optional if the config contains a `ptype`).
     * @return {Ext.Component} The newly instantiated Plugin.
     */
    //create: function(plugin, defaultType) {
    //    if (plugin instanceof this) {
    //        return plugin;
    //    } else {
    //        var type, config = {};
    //
    //        if (Ext.isString(plugin)) {
    //            type = plugin;
    //        }
    //        else {
    //            type = plugin[this.typeName] || defaultType;
    //            config = plugin;
    //        }
    //
    //        return Ext.createByAlias('plugin.' + type, config);
    //    }
    //},

    create : function(config, defaultType){
        if (config.init) {
            return config;
        } else {
            return Ext.createByAlias('plugin.' + (config.ptype || defaultType), config);
        }

        // Prior system supported Singleton plugins.
        //var PluginCls = this.types[config.ptype || defaultType];
        //if (PluginCls.init) {
        //    return PluginCls;
        //} else {
        //    return new PluginCls(config);
        //}
    },

    /**
     * Returns all plugins registered with the given type. Here, 'type' refers to the type of plugin, not its ptype.
     * @param {String} type The type to search for
     * @param {Boolean} defaultsOnly True to only return plugins of this type where the plugin's isDefault property is
     * truthy
     * @return {Ext.AbstractPlugin[]} All matching plugins
     */
    findByType: function(type, defaultsOnly) {
        var matches = [],
            types   = this.types;

        for (var name in types) {
            if (!types.hasOwnProperty(name)) {
                continue;
            }
            var item = types[name];

            if (item.type == type && (!defaultsOnly || (defaultsOnly === true && item.isDefault))) {
                matches.push(item);
            }
        }

        return matches;
    }
}, function() {
    /**
     * Shorthand for {@link Ext.PluginManager#registerType}
     * @param {String} ptype The ptype mnemonic string by which the Plugin class
     * may be looked up.
     * @param {Function} cls The new Plugin class.
     * @member Ext
     * @method preg
     */
    Ext.preg = function() {
        return Ext.PluginManager.registerType.apply(Ext.PluginManager, arguments);
    };
});

