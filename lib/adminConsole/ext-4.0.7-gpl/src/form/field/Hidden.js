/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A basic hidden field for storing hidden values in forms that need to be passed in the form submit.
 *
 * This creates an actual input element with type="submit" in the DOM. While its label is
 * {@link #hideLabel not rendered} by default, it is still a real component and may be sized according
 * to its owner container's layout.
 *
 * Because of this, in most cases it is more convenient and less problematic to simply
 * {@link Ext.form.action.Action#params pass hidden parameters} directly when
 * {@link Ext.form.Basic#submit submitting the form}.
 *
 * Example:
 *
 *     new Ext.form.Panel({
 *         title: 'My Form',
 *         items: [{
 *             xtype: 'textfield',
 *             fieldLabel: 'Text Field',
 *             name: 'text_field',
 *             value: 'value from text field'
 *         }, {
 *             xtype: 'hiddenfield',
 *             name: 'hidden_field_1',
 *             value: 'value from hidden field'
 *         }],
 *
 *         buttons: [{
 *             text: 'Submit',
 *             handler: function() {
 *                 this.up('form').getForm().submit({
 *                     params: {
 *                         hidden_field_2: 'value from submit call'
 *                     }
 *                 });
 *             }
 *         }]
 *     });
 *
 * Submitting the above form will result in three values sent to the server:
 *
 *     text_field=value+from+text+field&hidden;_field_1=value+from+hidden+field&hidden_field_2=value+from+submit+call
 *
 */
Ext.define('Ext.form.field.Hidden', {
    extend:'Ext.form.field.Base',
    alias: ['widget.hiddenfield', 'widget.hidden'],
    alternateClassName: 'Ext.form.Hidden',

    // private
    inputType : 'hidden',
    hideLabel: true,
    
    initComponent: function(){
        this.formItemCls += '-hidden';
        this.callParent();    
    },
    
    /**
     * @private
     * Override. Treat undefined and null values as equal to an empty string value.
     */
    isEqual: function(value1, value2) {
        return this.isEqualAsString(value1, value2);
    },

    // These are all private overrides
    initEvents: Ext.emptyFn,
    setSize : Ext.emptyFn,
    setWidth : Ext.emptyFn,
    setHeight : Ext.emptyFn,
    setPosition : Ext.emptyFn,
    setPagePosition : Ext.emptyFn,
    markInvalid : Ext.emptyFn,
    clearInvalid : Ext.emptyFn
});

