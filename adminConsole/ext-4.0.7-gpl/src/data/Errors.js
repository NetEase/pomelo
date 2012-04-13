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
 * @class Ext.data.Errors
 * @extends Ext.util.MixedCollection
 *
 * <p>Wraps a collection of validation error responses and provides convenient functions for
 * accessing and errors for specific fields.</p>
 *
 * <p>Usually this class does not need to be instantiated directly - instances are instead created
 * automatically when {@link Ext.data.Model#validate validate} on a model instance:</p>
 *
<pre><code>
//validate some existing model instance - in this case it returned 2 failures messages
var errors = myModel.validate();

errors.isValid(); //false

errors.length; //2
errors.getByField('name');  // [{field: 'name',  message: 'must be present'}]
errors.getByField('title'); // [{field: 'title', message: 'is too short'}]
</code></pre>
 */
Ext.define('Ext.data.Errors', {
    extend: 'Ext.util.MixedCollection',

    /**
     * Returns true if there are no errors in the collection
     * @return {Boolean}
     */
    isValid: function() {
        return this.length === 0;
    },

    /**
     * Returns all of the errors for the given field
     * @param {String} fieldName The field to get errors for
     * @return {Object[]} All errors for the given field
     */
    getByField: function(fieldName) {
        var errors = [],
            error, field, i;

        for (i = 0; i < this.length; i++) {
            error = this.items[i];

            if (error.field == fieldName) {
                errors.push(error);
            }
        }

        return errors;
    }
});

