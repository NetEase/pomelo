/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.KeyNav
 * <p>Provides a convenient wrapper for normalized keyboard navigation.  KeyNav allows you to bind
 * navigation keys to function calls that will get called when the keys are pressed, providing an easy
 * way to implement custom navigation schemes for any UI component.</p>
 * <p>The following are all of the possible keys that can be implemented: enter, space, left, right, up, down, tab, esc,
 * pageUp, pageDown, del, backspace, home, end.  Usage:</p>
 <pre><code>
var nav = new Ext.util.KeyNav("my-element", {
    "left" : function(e){
        this.moveLeft(e.ctrlKey);
    },
    "right" : function(e){
        this.moveRight(e.ctrlKey);
    },
    "enter" : function(e){
        this.save();
    },
    scope : this
});
</code></pre>
 */
Ext.define('Ext.util.KeyNav', {
    
    alternateClassName: 'Ext.KeyNav',
    
    requires: ['Ext.util.KeyMap'],
    
    statics: {
        keyOptions: {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            space: 32,
            pageUp: 33,
            pageDown: 34,
            del: 46,
            backspace: 8,
            home: 36,
            end: 35,
            enter: 13,
            esc: 27,
            tab: 9
        }
    },

    /**
     * Creates new KeyNav.
     * @param {String/HTMLElement/Ext.Element} el The element or its ID to bind to
     * @param {Object} config The config
     */
    constructor: function(el, config){
        this.setConfig(el, config || {});
    },
    
    /**
     * Sets up a configuration for the KeyNav.
     * @private
     * @param {String/HTMLElement/Ext.Element} el The element or its ID to bind to
     * @param {Object} config A configuration object as specified in the constructor.
     */
    setConfig: function(el, config) {
        if (this.map) {
            this.map.destroy();
        }
        
        var map = Ext.create('Ext.util.KeyMap', el, null, this.getKeyEvent('forceKeyDown' in config ? config.forceKeyDown : this.forceKeyDown)),
            keys = Ext.util.KeyNav.keyOptions,
            scope = config.scope || this,
            key;
        
        this.map = map;
        for (key in keys) {
            if (keys.hasOwnProperty(key)) {
                if (config[key]) {
                    map.addBinding({
                        scope: scope,
                        key: keys[key],
                        handler: Ext.Function.bind(this.handleEvent, scope, [config[key]], true),
                        defaultEventAction: config.defaultEventAction || this.defaultEventAction
                    });
                }
            }
        }
        
        map.disable();
        if (!config.disabled) {
            map.enable();
        }
    },
    
    /**
     * Method for filtering out the map argument
     * @private
     * @param {Ext.util.KeyMap} map
     * @param {Ext.EventObject} event
     * @param {Object} options Contains the handler to call
     */
    handleEvent: function(map, event, handler){
        return handler.call(this, event);
    },
    
    /**
     * @cfg {Boolean} disabled
     * True to disable this KeyNav instance.
     */
    disabled: false,
    
    /**
     * @cfg {String} defaultEventAction
     * The method to call on the {@link Ext.EventObject} after this KeyNav intercepts a key.  Valid values are
     * {@link Ext.EventObject#stopEvent}, {@link Ext.EventObject#preventDefault} and
     * {@link Ext.EventObject#stopPropagation}.
     */
    defaultEventAction: "stopEvent",
    
    /**
     * @cfg {Boolean} forceKeyDown
     * Handle the keydown event instead of keypress.  KeyNav automatically does this for IE since
     * IE does not propagate special keys on keypress, but setting this to true will force other browsers to also
     * handle keydown instead of keypress.
     */
    forceKeyDown: false,
    
    /**
     * Destroy this KeyNav (this is the same as calling disable).
     * @param {Boolean} removeEl True to remove the element associated with this KeyNav.
     */
    destroy: function(removeEl){
        this.map.destroy(removeEl);
        delete this.map;
    },

    /**
     * Enable this KeyNav
     */
    enable: function() {
        this.map.enable();
        this.disabled = false;
    },

    /**
     * Disable this KeyNav
     */
    disable: function() {
        this.map.disable();
        this.disabled = true;
    },
    
    /**
     * Convenience function for setting disabled/enabled by boolean.
     * @param {Boolean} disabled
     */
    setDisabled : function(disabled){
        this.map.setDisabled(disabled);
        this.disabled = disabled;
    },
    
    /**
     * Determines the event to bind to listen for keys. Depends on the {@link #forceKeyDown} setting,
     * as well as the useKeyDown option on the EventManager.
     * @return {String} The type of event to listen for.
     */
    getKeyEvent: function(forceKeyDown){
        return (forceKeyDown || Ext.EventManager.useKeyDown) ? 'keydown' : 'keypress';
    }
});

