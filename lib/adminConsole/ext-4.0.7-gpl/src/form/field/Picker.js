/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * An abstract class for fields that have a single trigger which opens a "picker" popup below the field, e.g. a combobox
 * menu list or a date picker. It provides a base implementation for toggling the picker's visibility when the trigger
 * is clicked, as well as keyboard navigation and some basic events. Sizing and alignment of the picker can be
 * controlled via the {@link #matchFieldWidth} and {@link #pickerAlign}/{@link #pickerOffset} config properties
 * respectively.
 *
 * You would not normally use this class directly, but instead use it as the parent class for a specific picker field
 * implementation. Subclasses must implement the {@link #createPicker} method to create a picker component appropriate
 * for the field.
 */
Ext.define('Ext.form.field.Picker', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.pickerfield',
    alternateClassName: 'Ext.form.Picker',
    requires: ['Ext.util.KeyNav'],

    /**
     * @cfg {Boolean} matchFieldWidth
     * Whether the picker dropdown's width should be explicitly set to match the width of the field. Defaults to true.
     */
    matchFieldWidth: true,

    /**
     * @cfg {String} pickerAlign
     * The {@link Ext.Element#alignTo alignment position} with which to align the picker. Defaults to "tl-bl?"
     */
    pickerAlign: 'tl-bl?',

    /**
     * @cfg {Number[]} pickerOffset
     * An offset [x,y] to use in addition to the {@link #pickerAlign} when positioning the picker.
     * Defaults to undefined.
     */

    /**
     * @cfg {String} openCls
     * A class to be added to the field's {@link #bodyEl} element when the picker is opened.
     * Defaults to 'x-pickerfield-open'.
     */
    openCls: Ext.baseCSSPrefix + 'pickerfield-open',

    /**
     * @property {Boolean} isExpanded
     * True if the picker is currently expanded, false if not.
     */

    /**
     * @cfg {Boolean} editable
     * False to prevent the user from typing text directly into the field; the field can only have its value set via
     * selecting a value from the picker. In this state, the picker can also be opened by clicking directly on the input
     * field itself.
     */
    editable: true,


    initComponent: function() {
        this.callParent();

        // Custom events
        this.addEvents(
            /**
             * @event expand
             * Fires when the field's picker is expanded.
             * @param {Ext.form.field.Picker} field This field instance
             */
            'expand',
            /**
             * @event collapse
             * Fires when the field's picker is collapsed.
             * @param {Ext.form.field.Picker} field This field instance
             */
            'collapse',
            /**
             * @event select
             * Fires when a value is selected via the picker.
             * @param {Ext.form.field.Picker} field This field instance
             * @param {Object} value The value that was selected. The exact type of this value is dependent on
             * the individual field and picker implementations.
             */
            'select'
        );
    },


    initEvents: function() {
        var me = this;
        me.callParent();

        // Add handlers for keys to expand/collapse the picker
        me.keyNav = Ext.create('Ext.util.KeyNav', me.inputEl, {
            down: function() {
                if (!me.isExpanded) {
                    // Don't call expand() directly as there may be additional processing involved before
                    // expanding, e.g. in the case of a ComboBox query.
                    me.onTriggerClick();
                }
            },
            esc: me.collapse,
            scope: me,
            forceKeyDown: true
        });

        // Non-editable allows opening the picker by clicking the field
        if (!me.editable) {
            me.mon(me.inputEl, 'click', me.onTriggerClick, me);
        }

        // Disable native browser autocomplete
        if (Ext.isGecko) {
            me.inputEl.dom.setAttribute('autocomplete', 'off');
        }
    },


    /**
     * Expands this field's picker dropdown.
     */
    expand: function() {
        var me = this,
            bodyEl, picker, collapseIf;

        if (me.rendered && !me.isExpanded && !me.isDestroyed) {
            bodyEl = me.bodyEl;
            picker = me.getPicker();
            collapseIf = me.collapseIf;

            // show the picker and set isExpanded flag
            picker.show();
            me.isExpanded = true;
            me.alignPicker();
            bodyEl.addCls(me.openCls);

            // monitor clicking and mousewheel
            me.mon(Ext.getDoc(), {
                mousewheel: collapseIf,
                mousedown: collapseIf,
                scope: me
            });
            Ext.EventManager.onWindowResize(me.alignPicker, me);
            me.fireEvent('expand', me);
            me.onExpand();
        }
    },

    onExpand: Ext.emptyFn,

    /**
     * Aligns the picker to the input element
     * @protected
     */
    alignPicker: function() {
        var me = this,
            picker;

        if (me.isExpanded) {
            picker = me.getPicker();
            if (me.matchFieldWidth) {
                // Auto the height (it will be constrained by min and max width) unless there are no records to display.
                picker.setSize(me.bodyEl.getWidth(), picker.store && picker.store.getCount() ? null : 0);
            }
            if (picker.isFloating()) {
                me.doAlign();
            }
        }
    },

    /**
     * Performs the alignment on the picker using the class defaults
     * @private
     */
    doAlign: function(){
        var me = this,
            picker = me.picker,
            aboveSfx = '-above',
            isAbove;

        me.picker.alignTo(me.inputEl, me.pickerAlign, me.pickerOffset);
        // add the {openCls}-above class if the picker was aligned above
        // the field due to hitting the bottom of the viewport
        isAbove = picker.el.getY() < me.inputEl.getY();
        me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
        picker[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
    },

    /**
     * Collapses this field's picker dropdown.
     */
    collapse: function() {
        if (this.isExpanded && !this.isDestroyed) {
            var me = this,
                openCls = me.openCls,
                picker = me.picker,
                doc = Ext.getDoc(),
                collapseIf = me.collapseIf,
                aboveSfx = '-above';

            // hide the picker and set isExpanded flag
            picker.hide();
            me.isExpanded = false;

            // remove the openCls
            me.bodyEl.removeCls([openCls, openCls + aboveSfx]);
            picker.el.removeCls(picker.baseCls + aboveSfx);

            // remove event listeners
            doc.un('mousewheel', collapseIf, me);
            doc.un('mousedown', collapseIf, me);
            Ext.EventManager.removeResizeListener(me.alignPicker, me);
            me.fireEvent('collapse', me);
            me.onCollapse();
        }
    },

    onCollapse: Ext.emptyFn,


    /**
     * @private
     * Runs on mousewheel and mousedown of doc to check to see if we should collapse the picker
     */
    collapseIf: function(e) {
        var me = this;
        if (!me.isDestroyed && !e.within(me.bodyEl, false, true) && !e.within(me.picker.el, false, true)) {
            me.collapse();
        }
    },

    /**
     * Returns a reference to the picker component for this field, creating it if necessary by
     * calling {@link #createPicker}.
     * @return {Ext.Component} The picker component
     */
    getPicker: function() {
        var me = this;
        return me.picker || (me.picker = me.createPicker());
    },

    /**
     * @method
     * Creates and returns the component to be used as this field's picker. Must be implemented by subclasses of Picker.
     * The current field should also be passed as a configuration option to the picker component as the pickerField
     * property.
     */
    createPicker: Ext.emptyFn,

    /**
     * Handles the trigger click; by default toggles between expanding and collapsing the picker component.
     * @protected
     */
    onTriggerClick: function() {
        var me = this;
        if (!me.readOnly && !me.disabled) {
            if (me.isExpanded) {
                me.collapse();
            } else {
                me.expand();
            }
            me.inputEl.focus();
        }
    },

    mimicBlur: function(e) {
        var me = this,
            picker = me.picker;
        // ignore mousedown events within the picker element
        if (!picker || !e.within(picker.el, false, true)) {
            me.callParent(arguments);
        }
    },

    onDestroy : function(){
        var me = this,
            picker = me.picker;

        Ext.EventManager.removeResizeListener(me.alignPicker, me);
        Ext.destroy(me.keyNav);
        if (picker) {
            delete picker.pickerField;
            picker.destroy();
        }
        me.callParent();
    }

});


