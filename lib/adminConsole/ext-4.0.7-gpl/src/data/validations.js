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
 *
 * This singleton contains a set of validation functions that can be used to validate any type of data. They are most
 * often used in {@link Ext.data.Model Models}, where they are automatically set up and executed.
 */
Ext.define('Ext.data.validations', {
    singleton: true,
    
    /**
     * @property {String} presenceMessage
     * The default error message used when a presence validation fails.
     */
    presenceMessage: 'must be present',
    
    /**
     * @property {String} lengthMessage
     * The default error message used when a length validation fails.
     */
    lengthMessage: 'is the wrong length',
    
    /**
     * @property {Boolean} formatMessage
     * The default error message used when a format validation fails.
     */
    formatMessage: 'is the wrong format',
    
    /**
     * @property {String} inclusionMessage
     * The default error message used when an inclusion validation fails.
     */
    inclusionMessage: 'is not included in the list of acceptable values',
    
    /**
     * @property {String} exclusionMessage
     * The default error message used when an exclusion validation fails.
     */
    exclusionMessage: 'is not an acceptable value',
    
    /**
     * @property {String} emailMessage
     * The default error message used when an email validation fails
     */
    emailMessage: 'is not a valid email address',
    
    /**
     * @property {RegExp} emailRe
     * The regular expression used to validate email addresses
     */
    emailRe: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    
    /**
     * Validates that the given value is present.
     * For example:
     *
     *     validations: [{type: 'presence', field: 'age'}]
     *
     * @param {Object} config Config object
     * @param {Object} value The value to validate
     * @return {Boolean} True if validation passed
     */
    presence: function(config, value) {
        if (value === undefined) {
            value = config;
        }
        
        //we need an additional check for zero here because zero is an acceptable form of present data
        return !!value || value === 0;
    },
    
    /**
     * Returns true if the given value is between the configured min and max values.
     * For example:
     *
     *     validations: [{type: 'length', field: 'name', min: 2}]
     *
     * @param {Object} config Config object
     * @param {String} value The value to validate
     * @return {Boolean} True if the value passes validation
     */
    length: function(config, value) {
        if (value === undefined || value === null) {
            return false;
        }
        
        var length = value.length,
            min    = config.min,
            max    = config.max;
        
        if ((min && length < min) || (max && length > max)) {
            return false;
        } else {
            return true;
        }
    },
    
    /**
     * Validates that an email string is in the correct format
     * @param {Object} config Config object
     * @param {String} email The email address
     * @return {Boolean} True if the value passes validation
     */
    email: function(config, email) {
        return Ext.data.validations.emailRe.test(email);
    },
    
    /**
     * Returns true if the given value passes validation against the configured `matcher` regex.
     * For example:
     *
     *     validations: [{type: 'format', field: 'username', matcher: /([a-z]+)[0-9]{2,3}/}]
     *
     * @param {Object} config Config object
     * @param {String} value The value to validate
     * @return {Boolean} True if the value passes the format validation
     */
    format: function(config, value) {
        return !!(config.matcher && config.matcher.test(value));
    },
    
    /**
     * Validates that the given value is present in the configured `list`.
     * For example:
     *
     *     validations: [{type: 'inclusion', field: 'gender', list: ['Male', 'Female']}]
     *
     * @param {Object} config Config object
     * @param {String} value The value to validate
     * @return {Boolean} True if the value is present in the list
     */
    inclusion: function(config, value) {
        return config.list && Ext.Array.indexOf(config.list,value) != -1;
    },
    
    /**
     * Validates that the given value is present in the configured `list`.
     * For example:
     *
     *     validations: [{type: 'exclusion', field: 'username', list: ['Admin', 'Operator']}]
     *
     * @param {Object} config Config object
     * @param {String} value The value to validate
     * @return {Boolean} True if the value is not present in the list
     */
    exclusion: function(config, value) {
        return config.list && Ext.Array.indexOf(config.list,value) == -1;
    }
});
