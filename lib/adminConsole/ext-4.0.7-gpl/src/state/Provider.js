/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.state.Provider
 * <p>Abstract base class for state provider implementations. The provider is responsible
 * for setting values  and extracting values to/from the underlying storage source. The 
 * storage source can vary and the details should be implemented in a subclass. For example
 * a provider could use a server side database or the browser localstorage where supported.</p>
 *
 * <p>This class provides methods for encoding and decoding <b>typed</b> variables including 
 * dates and defines the Provider interface. By default these methods put the value and the
 * type information into a delimited string that can be stored. These should be overridden in 
 * a subclass if you want to change the format of the encoded value and subsequent decoding.</p>
 */
Ext.define('Ext.state.Provider', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    /**
     * @cfg {String} prefix A string to prefix to items stored in the underlying state store. 
     * Defaults to <tt>'ext-'</tt>
     */
    prefix: 'ext-',
    
    constructor : function(config){
        config = config || {};
        var me = this;
        Ext.apply(me, config);
        /**
         * @event statechange
         * Fires when a state change occurs.
         * @param {Ext.state.Provider} this This state provider
         * @param {String} key The state key which was changed
         * @param {String} value The encoded value for the state
         */
        me.addEvents("statechange");
        me.state = {};
        me.mixins.observable.constructor.call(me);
    },
    
    /**
     * Returns the current value for a key
     * @param {String} name The key name
     * @param {Object} defaultValue A default value to return if the key's value is not found
     * @return {Object} The state data
     */
    get : function(name, defaultValue){
        return typeof this.state[name] == "undefined" ?
            defaultValue : this.state[name];
    },

    /**
     * Clears a value from the state
     * @param {String} name The key name
     */
    clear : function(name){
        var me = this;
        delete me.state[name];
        me.fireEvent("statechange", me, name, null);
    },

    /**
     * Sets the value for a key
     * @param {String} name The key name
     * @param {Object} value The value to set
     */
    set : function(name, value){
        var me = this;
        me.state[name] = value;
        me.fireEvent("statechange", me, name, value);
    },

    /**
     * Decodes a string previously encoded with {@link #encodeValue}.
     * @param {String} value The value to decode
     * @return {Object} The decoded value
     */
    decodeValue : function(value){

        // a -> Array
        // n -> Number
        // d -> Date
        // b -> Boolean
        // s -> String
        // o -> Object
        // -> Empty (null)

        var me = this,
            re = /^(a|n|d|b|s|o|e)\:(.*)$/,
            matches = re.exec(unescape(value)),
            all,
            type,
            value,
            keyValue;
            
        if(!matches || !matches[1]){
            return; // non state
        }
        
        type = matches[1];
        value = matches[2];
        switch (type) {
            case 'e':
                return null;
            case 'n':
                return parseFloat(value);
            case 'd':
                return new Date(Date.parse(value));
            case 'b':
                return (value == '1');
            case 'a':
                all = [];
                if(value != ''){
                    Ext.each(value.split('^'), function(val){
                        all.push(me.decodeValue(val));
                    }, me);
                }
                return all;
           case 'o':
                all = {};
                if(value != ''){
                    Ext.each(value.split('^'), function(val){
                        keyValue = val.split('=');
                        all[keyValue[0]] = me.decodeValue(keyValue[1]);
                    }, me);
                }
                return all;
           default:
                return value;
        }
    },

    /**
     * Encodes a value including type information.  Decode with {@link #decodeValue}.
     * @param {Object} value The value to encode
     * @return {String} The encoded value
     */
    encodeValue : function(value){
        var flat = '',
            i = 0,
            enc,
            len,
            key;
            
        if (value == null) {
            return 'e:1';    
        } else if(typeof value == 'number') {
            enc = 'n:' + value;
        } else if(typeof value == 'boolean') {
            enc = 'b:' + (value ? '1' : '0');
        } else if(Ext.isDate(value)) {
            enc = 'd:' + value.toGMTString();
        } else if(Ext.isArray(value)) {
            for (len = value.length; i < len; i++) {
                flat += this.encodeValue(value[i]);
                if (i != len - 1) {
                    flat += '^';
                }
            }
            enc = 'a:' + flat;
        } else if (typeof value == 'object') {
            for (key in value) {
                if (typeof value[key] != 'function' && value[key] !== undefined) {
                    flat += key + '=' + this.encodeValue(value[key]) + '^';
                }
            }
            enc = 'o:' + flat.substring(0, flat.length-1);
        } else {
            enc = 's:' + value;
        }
        return escape(enc);
    }
});
