/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.data.SortTypes
 * This class defines a series of static methods that are used on a
 * {@link Ext.data.Field} for performing sorting. The methods cast the 
 * underlying values into a data type that is appropriate for sorting on
 * that particular field.  If a {@link Ext.data.Field#type} is specified, 
 * the sortType will be set to a sane default if the sortType is not 
 * explicitly defined on the field. The sortType will make any necessary
 * modifications to the value and return it.
 * <ul>
 * <li><b>asText</b> - Removes any tags and converts the value to a string</li>
 * <li><b>asUCText</b> - Removes any tags and converts the value to an uppercase string</li>
 * <li><b>asUCText</b> - Converts the value to an uppercase string</li>
 * <li><b>asDate</b> - Converts the value into Unix epoch time</li>
 * <li><b>asFloat</b> - Converts the value to a floating point number</li>
 * <li><b>asInt</b> - Converts the value to an integer number</li>
 * </ul>
 * <p>
 * It is also possible to create a custom sortType that can be used throughout
 * an application.
 * <pre><code>
Ext.apply(Ext.data.SortTypes, {
    asPerson: function(person){
        // expects an object with a first and last name property
        return person.lastName.toUpperCase() + person.firstName.toLowerCase();
    }    
});

Ext.define('Employee', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'person',
        sortType: 'asPerson'
    }, {
        name: 'salary',
        type: 'float' // sortType set to asFloat
    }]
});
 * </code></pre>
 * </p>
 * @singleton
 * @docauthor Evan Trimboli <evan@sencha.com>
 */
Ext.define('Ext.data.SortTypes', {
    
    singleton: true,
    
    /**
     * Default sort that does nothing
     * @param {Object} s The value being converted
     * @return {Object} The comparison value
     */
    none : function(s) {
        return s;
    },

    /**
     * The regular expression used to strip tags
     * @type {RegExp}
     * @property
     */
    stripTagsRE : /<\/?[^>]+>/gi,

    /**
     * Strips all HTML tags to sort on text only
     * @param {Object} s The value being converted
     * @return {String} The comparison value
     */
    asText : function(s) {
        return String(s).replace(this.stripTagsRE, "");
    },

    /**
     * Strips all HTML tags to sort on text only - Case insensitive
     * @param {Object} s The value being converted
     * @return {String} The comparison value
     */
    asUCText : function(s) {
        return String(s).toUpperCase().replace(this.stripTagsRE, "");
    },

    /**
     * Case insensitive string
     * @param {Object} s The value being converted
     * @return {String} The comparison value
     */
    asUCString : function(s) {
        return String(s).toUpperCase();
    },

    /**
     * Date sorting
     * @param {Object} s The value being converted
     * @return {Number} The comparison value
     */
    asDate : function(s) {
        if(!s){
            return 0;
        }
        if(Ext.isDate(s)){
            return s.getTime();
        }
        return Date.parse(String(s));
    },

    /**
     * Float sorting
     * @param {Object} s The value being converted
     * @return {Number} The comparison value
     */
    asFloat : function(s) {
        var val = parseFloat(String(s).replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    },

    /**
     * Integer sorting
     * @param {Object} s The value being converted
     * @return {Number} The comparison value
     */
    asInt : function(s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    }
});
