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
 * @alternateClassName Ext.form.VTypes
 *
 * This is a singleton object which contains a set of commonly used field validation functions
 * and provides a mechanism for creating reusable custom field validations.
 * The following field validation functions are provided out of the box:
 *
 * - {@link #alpha}
 * - {@link #alphanum}
 * - {@link #email}
 * - {@link #url}
 *
 * VTypes can be applied to a {@link Ext.form.field.Text Text Field} using the `{@link Ext.form.field.Text#vtype vtype}` configuration:
 *
 *     Ext.create('Ext.form.field.Text', {
 *         fieldLabel: 'Email Address',
 *         name: 'email',
 *         vtype: 'email' // applies email validation rules to this field
 *     });
 *
 * To create custom VTypes:
 *
 *     // custom Vtype for vtype:'time'
 *     var timeTest = /^([1-9]|1[0-9]):([0-5][0-9])(\s[a|p]m)$/i;
 *     Ext.apply(Ext.form.field.VTypes, {
 *         //  vtype validation function
 *         time: function(val, field) {
 *             return timeTest.test(val);
 *         },
 *         // vtype Text property: The error text to display when the validation function returns false
 *         timeText: 'Not a valid time.  Must be in the format "12:34 PM".',
 *         // vtype Mask property: The keystroke filter mask
 *         timeMask: /[\d\s:amp]/i
 *     });
 *
 * In the above example the `time` function is the validator that will run when field validation occurs,
 * `timeText` is the error message, and `timeMask` limits what characters can be typed into the field.
 * Note that the `Text` and `Mask` functions must begin with the same name as the validator function.
 *
 * Using a custom validator is the same as using one of the build-in validators - just use the name of the validator function
 * as the `{@link Ext.form.field.Text#vtype vtype}` configuration on a {@link Ext.form.field.Text Text Field}:
 *
 *     Ext.create('Ext.form.field.Text', {
 *         fieldLabel: 'Departure Time',
 *         name: 'departureTime',
 *         vtype: 'time' // applies custom time validation rules to this field
 *     });
 *
 * Another example of a custom validator:
 *
 *     // custom Vtype for vtype:'IPAddress'
 *     Ext.apply(Ext.form.field.VTypes, {
 *         IPAddress:  function(v) {
 *             return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
 *         },
 *         IPAddressText: 'Must be a numeric IP address',
 *         IPAddressMask: /[\d\.]/i
 *     });
 *
 * It's important to note that using {@link Ext#apply Ext.apply()} means that the custom validator function
 * as well as `Text` and `Mask` fields are added as properties of the `Ext.form.field.VTypes` singleton.
 */
Ext.define('Ext.form.field.VTypes', (function(){
    // closure these in so they are only created once.
    var alpha = /^[a-zA-Z_]+$/,
        alphanum = /^[a-zA-Z0-9_]+$/,
        email = /^(\w+)([\-+.][\w]+)*@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/,
        url = /(((^https?)|(^ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;

    // All these messages and functions are configurable
    return {
        singleton: true,
        alternateClassName: 'Ext.form.VTypes',

        /**
         * The function used to validate email addresses. Note that this is a very basic validation - complete
         * validation per the email RFC specifications is very complex and beyond the scope of this class, although this
         * function can be overridden if a more comprehensive validation scheme is desired. See the validation section
         * of the [Wikipedia article on email addresses][1] for additional information. This implementation is intended
         * to validate the following emails:
         *
         * - `barney@example.de`
         * - `barney.rubble@example.com`
         * - `barney-rubble@example.coop`
         * - `barney+rubble@example.com`
         *
         * [1]: http://en.wikipedia.org/wiki/E-mail_address
         *
         * @param {String} value The email address
         * @return {Boolean} true if the RegExp test passed, and false if not.
         */
        'email' : function(v){
            return email.test(v);
        },
        /**
         * @property {String} emailText
         * The error text to display when the email validation function returns false.
         * Defaults to: 'This field should be an e-mail address in the format "user@example.com"'
         */
        'emailText' : 'This field should be an e-mail address in the format "user@example.com"',
        /**
         * @property {RegExp} emailMask
         * The keystroke filter mask to be applied on email input. See the {@link #email} method for information about
         * more complex email validation. Defaults to: /[a-z0-9_\.\-@]/i
         */
        'emailMask' : /[a-z0-9_\.\-@\+]/i,

        /**
         * The function used to validate URLs
         * @param {String} value The URL
         * @return {Boolean} true if the RegExp test passed, and false if not.
         */
        'url' : function(v){
            return url.test(v);
        },
        /**
         * @property {String} urlText
         * The error text to display when the url validation function returns false.
         * Defaults to: 'This field should be a URL in the format "http:/'+'/www.example.com"'
         */
        'urlText' : 'This field should be a URL in the format "http:/'+'/www.example.com"',

        /**
         * The function used to validate alpha values
         * @param {String} value The value
         * @return {Boolean} true if the RegExp test passed, and false if not.
         */
        'alpha' : function(v){
            return alpha.test(v);
        },
        /**
         * @property {String} alphaText
         * The error text to display when the alpha validation function returns false.
         * Defaults to: 'This field should only contain letters and _'
         */
        'alphaText' : 'This field should only contain letters and _',
        /**
         * @property {RegExp} alphaMask
         * The keystroke filter mask to be applied on alpha input. Defaults to: /[a-z_]/i
         */
        'alphaMask' : /[a-z_]/i,

        /**
         * The function used to validate alphanumeric values
         * @param {String} value The value
         * @return {Boolean} true if the RegExp test passed, and false if not.
         */
        'alphanum' : function(v){
            return alphanum.test(v);
        },
        /**
         * @property {String} alphanumText
         * The error text to display when the alphanumeric validation function returns false.
         * Defaults to: 'This field should only contain letters, numbers and _'
         */
        'alphanumText' : 'This field should only contain letters, numbers and _',
        /**
         * @property {RegExp} alphanumMask
         * The keystroke filter mask to be applied on alphanumeric input. Defaults to: /[a-z0-9_]/i
         */
        'alphanumMask' : /[a-z0-9_]/i
    };
})());

