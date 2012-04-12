/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A mixin which allows a component to be configured and decorated with a label and/or error message as is
 * common for form fields. This is used by e.g. Ext.form.field.Base and Ext.form.FieldContainer
 * to let them be managed by the Field layout.
 *
 * NOTE: This mixin is mainly for internal library use and most users should not need to use it directly. It
 * is more likely you will want to use one of the component classes that import this mixin, such as
 * Ext.form.field.Base or Ext.form.FieldContainer.
 *
 * Use of this mixin does not make a component a field in the logical sense, meaning it does not provide any
 * logic or state related to values or validation; that is handled by the related Ext.form.field.Field
 * mixin. These two mixins may be used separately (for example Ext.form.FieldContainer is Labelable but not a
 * Field), or in combination (for example Ext.form.field.Base implements both and has logic for connecting the
 * two.)
 *
 * Component classes which use this mixin should use the Field layout
 * or a derivation thereof to properly size and position the label and message according to the component config.
 * They must also call the {@link #initLabelable} method during component initialization to ensure the mixin gets
 * set up correctly.
 *
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define("Ext.form.Labelable", {
    requires: ['Ext.XTemplate'],

    /**
     * @cfg {String/String[]/Ext.XTemplate} labelableRenderTpl
     * The rendering template for the field decorations. Component classes using this mixin should include
     * logic to use this as their {@link Ext.AbstractComponent#renderTpl renderTpl}, and implement the
     * {@link #getSubTplMarkup} method to generate the field body content.
     */
    labelableRenderTpl: [
        '<tpl if="!hideLabel && !(!fieldLabel && hideEmptyLabel)">',
            '<label id="{id}-labelEl"<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"',
                '<tpl if="labelStyle"> style="{labelStyle}"</tpl>>',
                '<tpl if="fieldLabel">{fieldLabel}{labelSeparator}</tpl>',
            '</label>',
        '</tpl>',
        '<div class="{baseBodyCls} {fieldBodyCls}" id="{id}-bodyEl" role="presentation">{subTplMarkup}</div>',
        '<div id="{id}-errorEl" class="{errorMsgCls}" style="display:none"></div>',
        '<div class="{clearCls}" role="presentation"><!-- --></div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    /**
     * @cfg {Ext.XTemplate} activeErrorsTpl
     * The template used to format the Array of error messages passed to {@link #setActiveErrors}
     * into a single HTML string. By default this renders each message as an item in an unordered list.
     */
    activeErrorsTpl: [
        '<tpl if="errors && errors.length">',
            '<ul><tpl for="errors"><li<tpl if="xindex == xcount"> class="last"</tpl>>{.}</li></tpl></ul>',
        '</tpl>'
    ],

    /**
     * @property isFieldLabelable
     * @type Boolean
     * Flag denoting that this object is labelable as a field. Always true.
     */
    isFieldLabelable: true,

    /**
     * @cfg {String} [formItemCls='x-form-item']
     * A CSS class to be applied to the outermost element to denote that it is participating in the form
     * field layout.
     */
    formItemCls: Ext.baseCSSPrefix + 'form-item',

    /**
     * @cfg {String} [labelCls='x-form-item-label']
     * The CSS class to be applied to the label element.
     * This (single) CSS class is used to formulate the renderSelector and drives the field
     * layout where it is concatenated with a hyphen ('-') and {@link #labelAlign}. To add
     * additional classes, use {@link #labelClsExtra}.
     */
    labelCls: Ext.baseCSSPrefix + 'form-item-label',

    /**
     * @cfg {String} labelClsExtra
     * An optional string of one or more additional CSS classes to add to the label element.
     * Defaults to empty.
     */

    /**
     * @cfg {String} [errorMsgCls='x-form-error-msg']
     * The CSS class to be applied to the error message element.
     */
    errorMsgCls: Ext.baseCSSPrefix + 'form-error-msg',

    /**
     * @cfg {String} [baseBodyCls='x-form-item-body']
     * The CSS class to be applied to the body content element.
     */
    baseBodyCls: Ext.baseCSSPrefix + 'form-item-body',

    /**
     * @cfg {String} fieldBodyCls
     * An extra CSS class to be applied to the body content element in addition to {@link #fieldBodyCls}.
     */
    fieldBodyCls: '',

    /**
     * @cfg {String} [clearCls='x-clear']
     * The CSS class to be applied to the special clearing div rendered directly after the field
     * contents wrapper to provide field clearing.
     */
    clearCls: Ext.baseCSSPrefix + 'clear',

    /**
     * @cfg {String} [invalidCls='x-form-invalid']
     * The CSS class to use when marking the component invalid.
     */
    invalidCls : Ext.baseCSSPrefix + 'form-invalid',

    /**
     * @cfg {String} fieldLabel
     * The label for the field. It gets appended with the {@link #labelSeparator}, and its position
     * and sizing is determined by the {@link #labelAlign}, {@link #labelWidth}, and {@link #labelPad}
     * configs.
     */
    fieldLabel: undefined,

    /**
     * @cfg {String} labelAlign
     * <p>Controls the position and alignment of the {@link #fieldLabel}. Valid values are:</p>
     * <ul>
     * <li><tt>"left"</tt> (the default) - The label is positioned to the left of the field, with its text
     * aligned to the left. Its width is determined by the {@link #labelWidth} config.</li>
     * <li><tt>"top"</tt> - The label is positioned above the field.</li>
     * <li><tt>"right"</tt> - The label is positioned to the left of the field, with its text aligned
     * to the right. Its width is determined by the {@link #labelWidth} config.</li>
     * </ul>
     */
    labelAlign : 'left',

    /**
     * @cfg {Number} labelWidth
     * The width of the {@link #fieldLabel} in pixels. Only applicable if the {@link #labelAlign} is set
     * to "left" or "right".
     */
    labelWidth: 100,

    /**
     * @cfg {Number} labelPad
     * The amount of space in pixels between the {@link #fieldLabel} and the input field.
     */
    labelPad : 5,

    /**
     * @cfg {String} labelSeparator
     * Character(s) to be inserted at the end of the {@link #fieldLabel label text}.
     */
    labelSeparator : ':',

    /**
     * @cfg {String} labelStyle
     * A CSS style specification string to apply directly to this field's label.
     */

    /**
     * @cfg {Boolean} hideLabel
     * Set to true to completely hide the label element ({@link #fieldLabel} and {@link #labelSeparator}).
     * Also see {@link #hideEmptyLabel}, which controls whether space will be reserved for an empty fieldLabel.
     */
    hideLabel: false,

    /**
     * @cfg {Boolean} hideEmptyLabel
     * <p>When set to <tt>true</tt>, the label element ({@link #fieldLabel} and {@link #labelSeparator}) will be
     * automatically hidden if the {@link #fieldLabel} is empty. Setting this to <tt>false</tt> will cause the empty
     * label element to be rendered and space to be reserved for it; this is useful if you want a field without a label
     * to line up with other labeled fields in the same form.</p>
     * <p>If you wish to unconditionall hide the label even if a non-empty fieldLabel is configured, then set
     * the {@link #hideLabel} config to <tt>true</tt>.</p>
     */
    hideEmptyLabel: true,

    /**
     * @cfg {Boolean} preventMark
     * <tt>true</tt> to disable displaying any {@link #setActiveError error message} set on this object.
     */
    preventMark: false,

    /**
     * @cfg {Boolean} autoFitErrors
     * Whether to adjust the component's body area to make room for 'side' or 'under'
     * {@link #msgTarget error messages}.
     */
    autoFitErrors: true,

    /**
     * @cfg {String} msgTarget <p>The location where the error message text should display.
     * Must be one of the following values:</p>
     * <div class="mdetail-params"><ul>
     * <li><code>qtip</code> Display a quick tip containing the message when the user hovers over the field. This is the default.
     * <div class="subdesc"><b>{@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager.init} must have been called for this setting to work.</b></div></li>
     * <li><code>title</code> Display the message in a default browser title attribute popup.</li>
     * <li><code>under</code> Add a block div beneath the field containing the error message.</li>
     * <li><code>side</code> Add an error icon to the right of the field, displaying the message in a popup on hover.</li>
     * <li><code>none</code> Don't display any error message. This might be useful if you are implementing custom error display.</li>
     * <li><code>[element id]</code> Add the error message directly to the innerHTML of the specified element.</li>
     * </ul></div>
     */
    msgTarget: 'qtip',

    /**
     * @cfg {String} activeError
     * If specified, then the component will be displayed with this value as its active error when
     * first rendered. Use {@link #setActiveError} or {@link #unsetActiveError} to
     * change it after component creation.
     */


    /**
     * Performs initialization of this mixin. Component classes using this mixin should call this method
     * during their own initialization.
     */
    initLabelable: function() {
        this.addCls(this.formItemCls);

        this.addEvents(
            /**
             * @event errorchange
             * Fires when the active error message is changed via {@link #setActiveError}.
             * @param {Ext.form.Labelable} this
             * @param {String} error The active error message
             */
            'errorchange'
        );
    },

    /**
     * Returns the label for the field. Defaults to simply returning the {@link #fieldLabel} config. Can be
     * overridden to provide
     * @return {String} The configured field label, or empty string if not defined
     */
    getFieldLabel: function() {
        return this.fieldLabel || '';
    },

    /**
     * @protected
     * Generates the arguments for the field decorations {@link #labelableRenderTpl rendering template}.
     * @return {Object} The template arguments
     */
    getLabelableRenderData: function() {
        var me = this,
            labelAlign = me.labelAlign,
            labelCls = me.labelCls,
            labelClsExtra = me.labelClsExtra,
            labelPad = me.labelPad,
            labelStyle;

        // Calculate label styles up front rather than in the Field layout for speed; this
        // is safe because label alignment/width/pad are not expected to change.
        if (labelAlign === 'top') {
            labelStyle = 'margin-bottom:' + labelPad + 'px;';
        } else {
            labelStyle = 'margin-right:' + labelPad + 'px;';
            // Add the width for border-box browsers; will be set by the Field layout for content-box
            if (Ext.isBorderBox) {
                labelStyle += 'width:' + me.labelWidth + 'px;';
            }
        }

        return Ext.copyTo(
            {
                inputId: me.getInputId(),
                fieldLabel: me.getFieldLabel(),
                labelCls: labelClsExtra ? labelCls + ' ' + labelClsExtra : labelCls,
                labelStyle: labelStyle + (me.labelStyle || ''),
                subTplMarkup: me.getSubTplMarkup()
            },
            me,
            'hideLabel,hideEmptyLabel,fieldBodyCls,baseBodyCls,errorMsgCls,clearCls,labelSeparator',
            true
        );
    },

    onLabelableRender: function () {
        this.addChildEls(
            /**
             * @property labelEl
             * @type Ext.Element
             * The label Element for this component. Only available after the component has been rendered.
             */
            'labelEl',

            /**
             * @property bodyEl
             * @type Ext.Element
             * The div Element wrapping the component's contents. Only available after the component has been rendered.
             */
            'bodyEl',

            /**
             * @property errorEl
             * @type Ext.Element
             * The div Element that will contain the component's error message(s). Note that depending on the
             * configured {@link #msgTarget}, this element may be hidden in favor of some other form of
             * presentation, but will always be present in the DOM for use by assistive technologies.
             */
            'errorEl'
        );
    },

    /**
     * @protected
     * Gets the markup to be inserted into the outer template's bodyEl. Defaults to empty string, should
     * be implemented by classes including this mixin as needed.
     * @return {String} The markup to be inserted
     */
    getSubTplMarkup: function() {
        return '';
    },

    /**
     * Get the input id, if any, for this component. This is used as the "for" attribute on the label element.
     * Implementing subclasses may also use this as e.g. the id for their own <tt>input</tt> element.
     * @return {String} The input id
     */
    getInputId: function() {
        return '';
    },

    /**
     * Gets the active error message for this component, if any. This does not trigger
     * validation on its own, it merely returns any message that the component may already hold.
     * @return {String} The active error message on the component; if there is no error, an empty string is returned.
     */
    getActiveError : function() {
        return this.activeError || '';
    },

    /**
     * Tells whether the field currently has an active error message. This does not trigger
     * validation on its own, it merely looks for any message that the component may already hold.
     * @return {Boolean}
     */
    hasActiveError: function() {
        return !!this.getActiveError();
    },

    /**
     * Sets the active error message to the given string. This replaces the entire error message
     * contents with the given string. Also see {@link #setActiveErrors} which accepts an Array of
     * messages and formats them according to the {@link #activeErrorsTpl}.
     *
     * Note that this only updates the error message element's text and attributes, you'll have
     * to call doComponentLayout to actually update the field's layout to match. If the field extends
     * {@link Ext.form.field.Base} you should call {@link Ext.form.field.Base#markInvalid markInvalid} instead.
     *
     * @param {String} msg The error message
     */
    setActiveError: function(msg) {
        this.activeError = msg;
        this.activeErrors = [msg];
        this.renderActiveError();
    },

    /**
     * Gets an Array of any active error messages currently applied to the field. This does not trigger
     * validation on its own, it merely returns any messages that the component may already hold.
     * @return {String[]} The active error messages on the component; if there are no errors, an empty Array is returned.
     */
    getActiveErrors: function() {
        return this.activeErrors || [];
    },

    /**
     * Set the active error message to an Array of error messages. The messages are formatted into
     * a single message string using the {@link #activeErrorsTpl}. Also see {@link #setActiveError}
     * which allows setting the entire error contents with a single string.
     *
     * Note that this only updates the error message element's text and attributes, you'll have
     * to call doComponentLayout to actually update the field's layout to match. If the field extends
     * {@link Ext.form.field.Base} you should call {@link Ext.form.field.Base#markInvalid markInvalid} instead.
     *
     * @param {String[]} errors The error messages
     */
    setActiveErrors: function(errors) {
        this.activeErrors = errors;
        this.activeError = this.getTpl('activeErrorsTpl').apply({errors: errors});
        this.renderActiveError();
    },

    /**
     * Clears the active error message(s).
     *
     * Note that this only clears the error message element's text and attributes, you'll have
     * to call doComponentLayout to actually update the field's layout to match. If the field extends
     * {@link Ext.form.field.Base} you should call {@link Ext.form.field.Base#clearInvalid clearInvalid} instead.
     */
    unsetActiveError: function() {
        delete this.activeError;
        delete this.activeErrors;
        this.renderActiveError();
    },

    /**
     * @private
     * Updates the rendered DOM to match the current activeError. This only updates the content and
     * attributes, you'll have to call doComponentLayout to actually update the display.
     */
    renderActiveError: function() {
        var me = this,
            activeError = me.getActiveError(),
            hasError = !!activeError;

        if (activeError !== me.lastActiveError) {
            me.fireEvent('errorchange', me, activeError);
            me.lastActiveError = activeError;
        }

        if (me.rendered && !me.isDestroyed && !me.preventMark) {
            // Add/remove invalid class
            me.el[hasError ? 'addCls' : 'removeCls'](me.invalidCls);

            // Update the aria-invalid attribute
            me.getActionEl().dom.setAttribute('aria-invalid', hasError);

            // Update the errorEl with the error message text
            me.errorEl.dom.innerHTML = activeError;
        }
    },

    /**
     * Applies a set of default configuration values to this Labelable instance. For each of the
     * properties in the given object, check if this component hasOwnProperty that config; if not
     * then it's inheriting a default value from its prototype and we should apply the default value.
     * @param {Object} defaults The defaults to apply to the object.
     */
    setFieldDefaults: function(defaults) {
        var me = this;
        Ext.iterate(defaults, function(key, val) {
            if (!me.hasOwnProperty(key)) {
                me[key] = val;
            }
        });
    },

    /**
     * @protected Calculate and return the natural width of the bodyEl. Override to provide custom logic.
     * Note for implementors: if at all possible this method should be overridden with a custom implementation
     * that can avoid anything that would cause the browser to reflow, e.g. querying offsetWidth.
     */
    getBodyNaturalWidth: function() {
        return this.bodyEl.getWidth();
    }

});

