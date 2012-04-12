/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A display-only text field which is not validated and not submitted. This is useful for when you want to display a
 * value from a form's {@link Ext.form.Basic#load loaded data} but do not want to allow the user to edit or submit that
 * value. The value can be optionally {@link #htmlEncode HTML encoded} if it contains HTML markup that you do not want
 * to be rendered.
 *
 * If you have more complex content, or need to include components within the displayed content, also consider using a
 * {@link Ext.form.FieldContainer} instead.
 *
 * Example:
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         renderTo: Ext.getBody(),
 *         width: 175,
 *         height: 120,
 *         bodyPadding: 10,
 *         title: 'Final Score',
 *         items: [{
 *             xtype: 'displayfield',
 *             fieldLabel: 'Home',
 *             name: 'home_score',
 *             value: '10'
 *         }, {
 *             xtype: 'displayfield',
 *             fieldLabel: 'Visitor',
 *             name: 'visitor_score',
 *             value: '11'
 *         }],
 *         buttons: [{
 *             text: 'Update',
 *         }]
 *     });
 */
Ext.define('Ext.form.field.Display', {
    extend:'Ext.form.field.Base',
    alias: 'widget.displayfield',
    requires: ['Ext.util.Format', 'Ext.XTemplate'],
    alternateClassName: ['Ext.form.DisplayField', 'Ext.form.Display'],
    fieldSubTpl: [
        '<div id="{id}" class="{fieldCls}"></div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    /**
     * @cfg {String} [fieldCls="x-form-display-field"]
     * The default CSS class for the field.
     */
    fieldCls: Ext.baseCSSPrefix + 'form-display-field',

    /**
     * @cfg {Boolean} htmlEncode
     * false to skip HTML-encoding the text when rendering it. This might be useful if you want to
     * include tags in the field's innerHTML rather than rendering them as string literals per the default logic.
     */
    htmlEncode: false,

    validateOnChange: false,

    initEvents: Ext.emptyFn,

    submitValue: false,

    isValid: function() {
        return true;
    },

    validate: function() {
        return true;
    },

    getRawValue: function() {
        return this.rawValue;
    },

    setRawValue: function(value) {
        var me = this;
        value = Ext.value(value, '');
        me.rawValue = value;
        if (me.rendered) {
            me.inputEl.dom.innerHTML = me.htmlEncode ? Ext.util.Format.htmlEncode(value) : value;
        }
        return value;
    },

    // private
    getContentTarget: function() {
        return this.inputEl;
    }

    /**
     * @cfg {String} inputType
     * @hide
     */
    /**
     * @cfg {Boolean} disabled
     * @hide
     */
    /**
     * @cfg {Boolean} readOnly
     * @hide
     */
    /**
     * @cfg {Boolean} validateOnChange
     * @hide
     */
    /**
     * @cfg {Number} checkChangeEvents
     * @hide
     */
    /**
     * @cfg {Number} checkChangeBuffer
     * @hide
     */
});

