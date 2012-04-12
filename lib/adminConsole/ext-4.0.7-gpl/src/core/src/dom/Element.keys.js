/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Convenience method for constructing a KeyMap
     * @param {String/Number/Number[]/Object} key Either a string with the keys to listen for, the numeric key code, array of key codes or an object with the following options:
     * <code>{key: (number or array), shift: (true/false), ctrl: (true/false), alt: (true/false)}</code>
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the specified function is executed. Defaults to this Element.
     * @return {Ext.util.KeyMap} The KeyMap created
     */
    addKeyListener : function(key, fn, scope){
        var config;
        if(typeof key != 'object' || Ext.isArray(key)){
            config = {
                key: key,
                fn: fn,
                scope: scope
            };
        }else{
            config = {
                key : key.key,
                shift : key.shift,
                ctrl : key.ctrl,
                alt : key.alt,
                fn: fn,
                scope: scope
            };
        }
        return Ext.create('Ext.util.KeyMap', this, config);
    },

    /**
     * Creates a KeyMap for this element
     * @param {Object} config The KeyMap config. See {@link Ext.util.KeyMap} for more details
     * @return {Ext.util.KeyMap} The KeyMap created
     */
    addKeyMap : function(config){
        return Ext.create('Ext.util.KeyMap', this, config);
    }
});

//Import the newly-added Ext.Element functions into CompositeElementLite. We call this here because
//Element.keys.js is the last extra Ext.Element include in the ext-all.js build
Ext.CompositeElementLite.importElementMethods();

