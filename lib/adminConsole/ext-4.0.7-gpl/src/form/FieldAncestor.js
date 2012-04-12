/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.FieldAncestor

A mixin for {@link Ext.container.Container} components that are likely to have form fields in their
items subtree. Adds the following capabilities:

- Methods for handling the addition and removal of {@link Ext.form.Labelable} and {@link Ext.form.field.Field}
  instances at any depth within the container.
- Events ({@link #fieldvaliditychange} and {@link #fielderrorchange}) for handling changes to the state
  of individual fields at the container level.
- Automatic application of {@link #fieldDefaults} config properties to each field added within the
  container, to facilitate uniform configuration of all fields.

This mixin is primarily for internal use by {@link Ext.form.Panel} and {@link Ext.form.FieldContainer},
and should not normally need to be used directly.

 * @markdown
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define('Ext.form.FieldAncestor', {

    /**
     * @cfg {Object} fieldDefaults
     * <p>If specified, the properties in this object are used as default config values for each
     * {@link Ext.form.Labelable} instance (e.g. {@link Ext.form.field.Base} or {@link Ext.form.FieldContainer})
     * that is added as a descendant of this container. Corresponding values specified in an individual field's
     * own configuration, or from the {@link Ext.container.Container#defaults defaults config} of its parent container,
     * will take precedence. See the documentation for {@link Ext.form.Labelable} to see what config
     * options may be specified in the <tt>fieldDefaults</tt>.</p>
     * <p>Example:</p>
     * <pre><code>new Ext.form.Panel({
    fieldDefaults: {
        labelAlign: 'left',
        labelWidth: 100
    },
    items: [{
        xtype: 'fieldset',
        defaults: {
            labelAlign: 'top'
        },
        items: [{
            name: 'field1'
        }, {
            name: 'field2'
        }]
    }, {
        xtype: 'fieldset',
        items: [{
            name: 'field3',
            labelWidth: 150
        }, {
            name: 'field4'
        }]
    }]
});</code></pre>
     * <p>In this example, field1 and field2 will get labelAlign:'top' (from the fieldset's <tt>defaults</tt>)
     * and labelWidth:100 (from <tt>fieldDefaults</tt>), field3 and field4 will both get labelAlign:'left' (from
     * <tt>fieldDefaults</tt> and field3 will use the labelWidth:150 from its own config.</p>
     */


    /**
     * @protected Initializes the FieldAncestor's state; this must be called from the initComponent method
     * of any components importing this mixin.
     */
    initFieldAncestor: function() {
        var me = this,
            onSubtreeChange = me.onFieldAncestorSubtreeChange;

        me.addEvents(
            /**
             * @event fieldvaliditychange
             * Fires when the validity state of any one of the {@link Ext.form.field.Field} instances within this
             * container changes.
             * @param {Ext.form.FieldAncestor} this
             * @param {Ext.form.Labelable} The Field instance whose validity changed
             * @param {String} isValid The field's new validity state
             */
            'fieldvaliditychange',

            /**
             * @event fielderrorchange
             * Fires when the active error message is changed for any one of the {@link Ext.form.Labelable}
             * instances within this container.
             * @param {Ext.form.FieldAncestor} this
             * @param {Ext.form.Labelable} The Labelable instance whose active error was changed
             * @param {String} error The active error message
             */
            'fielderrorchange'
        );

        // Catch addition and removal of descendant fields
        me.on('add', onSubtreeChange, me);
        me.on('remove', onSubtreeChange, me);

        me.initFieldDefaults();
    },

    /**
     * @private Initialize the {@link #fieldDefaults} object
     */
    initFieldDefaults: function() {
        if (!this.fieldDefaults) {
            this.fieldDefaults = {};
        }
    },

    /**
     * @private
     * Handle the addition and removal of components in the FieldAncestor component's child tree.
     */
    onFieldAncestorSubtreeChange: function(parent, child) {
        var me = this,
            isAdding = !!child.ownerCt;

        function handleCmp(cmp) {
            var isLabelable = cmp.isFieldLabelable,
                isField = cmp.isFormField;
            if (isLabelable || isField) {
                if (isLabelable) {
                    me['onLabelable' + (isAdding ? 'Added' : 'Removed')](cmp);
                }
                if (isField) {
                    me['onField' + (isAdding ? 'Added' : 'Removed')](cmp);
                }
            }
            else if (cmp.isContainer) {
                Ext.Array.forEach(cmp.getRefItems(), handleCmp);
            }
        }
        handleCmp(child);
    },

    /**
     * @protected Called when a {@link Ext.form.Labelable} instance is added to the container's subtree.
     * @param {Ext.form.Labelable} labelable The instance that was added
     */
    onLabelableAdded: function(labelable) {
        var me = this;

        // buffer slightly to avoid excessive firing while sub-fields are changing en masse
        me.mon(labelable, 'errorchange', me.handleFieldErrorChange, me, {buffer: 10});

        labelable.setFieldDefaults(me.fieldDefaults);
    },

    /**
     * @protected Called when a {@link Ext.form.field.Field} instance is added to the container's subtree.
     * @param {Ext.form.field.Field} field The field which was added
     */
    onFieldAdded: function(field) {
        var me = this;
        me.mon(field, 'validitychange', me.handleFieldValidityChange, me);
    },

    /**
     * @protected Called when a {@link Ext.form.Labelable} instance is removed from the container's subtree.
     * @param {Ext.form.Labelable} labelable The instance that was removed
     */
    onLabelableRemoved: function(labelable) {
        var me = this;
        me.mun(labelable, 'errorchange', me.handleFieldErrorChange, me);
    },

    /**
     * @protected Called when a {@link Ext.form.field.Field} instance is removed from the container's subtree.
     * @param {Ext.form.field.Field} field The field which was removed
     */
    onFieldRemoved: function(field) {
        var me = this;
        me.mun(field, 'validitychange', me.handleFieldValidityChange, me);
    },

    /**
     * @private Handle validitychange events on sub-fields; invoke the aggregated event and method
     */
    handleFieldValidityChange: function(field, isValid) {
        var me = this;
        me.fireEvent('fieldvaliditychange', me, field, isValid);
        me.onFieldValidityChange();
    },

    /**
     * @private Handle errorchange events on sub-fields; invoke the aggregated event and method
     */
    handleFieldErrorChange: function(labelable, activeError) {
        var me = this;
        me.fireEvent('fielderrorchange', me, labelable, activeError);
        me.onFieldErrorChange();
    },

    /**
     * @protected Fired when the validity of any field within the container changes.
     * @param {Ext.form.field.Field} The sub-field whose validity changed
     * @param {String} The new validity state
     */
    onFieldValidityChange: Ext.emptyFn,

    /**
     * @protected Fired when the error message of any field within the container changes.
     * @param {Ext.form.Labelable} The sub-field whose active error changed
     * @param {String} The new active error message
     */
    onFieldErrorChange: Ext.emptyFn

});
