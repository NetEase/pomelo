/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @docauthor Robert Dougan <rob@sencha.com>
 *
 * This class creates a multiline text field, which can be used as a direct replacement for traditional
 * textarea fields. In addition, it supports automatically {@link #grow growing} the height of the textarea to
 * fit its content.
 *
 * All of the configuration options from {@link Ext.form.field.Text} can be used on TextArea.
 *
 * Example usage:
 *
 *     @example
 *     Ext.create('Ext.form.FormPanel', {
 *         title      : 'Sample TextArea',
 *         width      : 400,
 *         bodyPadding: 10,
 *         renderTo   : Ext.getBody(),
 *         items: [{
 *             xtype     : 'textareafield',
 *             grow      : true,
 *             name      : 'message',
 *             fieldLabel: 'Message',
 *             anchor    : '100%'
 *         }]
 *     });
 *
 * Some other useful configuration options when using {@link #grow} are {@link #growMin} and {@link #growMax}.
 * These allow you to set the minimum and maximum grow heights for the textarea.
 */
Ext.define('Ext.form.field.TextArea', {
    extend:'Ext.form.field.Text',
    alias: ['widget.textareafield', 'widget.textarea'],
    alternateClassName: 'Ext.form.TextArea',
    requires: ['Ext.XTemplate', 'Ext.layout.component.field.TextArea'],

    fieldSubTpl: [
        '<textarea id="{id}" ',
            '<tpl if="name">name="{name}" </tpl>',
            '<tpl if="rows">rows="{rows}" </tpl>',
            '<tpl if="cols">cols="{cols}" </tpl>',
            '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>',
            'class="{fieldCls} {typeCls}" ',
            'autocomplete="off">',
        '</textarea>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    /**
     * @cfg {Number} growMin
     * The minimum height to allow when {@link #grow}=true
     */
    growMin: 60,

    /**
     * @cfg {Number} growMax
     * The maximum height to allow when {@link #grow}=true
     */
    growMax: 1000,

    /**
     * @cfg {String} growAppend
     * A string that will be appended to the field's current value for the purposes of calculating the target field
     * size. Only used when the {@link #grow} config is true. Defaults to a newline for TextArea to ensure there is
     * always a space below the current line.
     */
    growAppend: '\n-',

    /**
     * @cfg {Number} cols
     * An initial value for the 'cols' attribute on the textarea element. This is only used if the component has no
     * configured {@link #width} and is not given a width by its container's layout.
     */
    cols: 20,

    /**
     * @cfg {Number} cols
     * An initial value for the 'cols' attribute on the textarea element. This is only used if the component has no
     * configured {@link #width} and is not given a width by its container's layout.
     */
    rows: 4,

    /**
     * @cfg {Boolean} enterIsSpecial
     * True if you want the enter key to be classed as a special key. Special keys are generally navigation keys
     * (arrows, space, enter). Setting the config property to true would mean that you could not insert returns into the
     * textarea.
     */
    enterIsSpecial: false,

    /**
     * @cfg {Boolean} preventScrollbars
     * true to prevent scrollbars from appearing regardless of how much text is in the field. This option is only
     * relevant when {@link #grow} is true. Equivalent to setting overflow: hidden.
     */
    preventScrollbars: false,

    // private
    componentLayout: 'textareafield',

    // private
    onRender: function(ct, position) {
        var me = this;
        Ext.applyIf(me.subTplData, {
            cols: me.cols,
            rows: me.rows
        });

        me.callParent(arguments);
    },

    // private
    afterRender: function(){
        var me = this;

        me.callParent(arguments);

        if (me.grow) {
            if (me.preventScrollbars) {
                me.inputEl.setStyle('overflow', 'hidden');
            }
            me.inputEl.setHeight(me.growMin);
        }
    },

    // private
    fireKey: function(e) {
        if (e.isSpecialKey() && (this.enterIsSpecial || (e.getKey() !== e.ENTER || e.hasModifier()))) {
            this.fireEvent('specialkey', this, e);
        }
    },

    /**
     * Automatically grows the field to accomodate the height of the text up to the maximum field height allowed. This
     * only takes effect if {@link #grow} = true, and fires the {@link #autosize} event if the height changes.
     */
    autoSize: function() {
        var me = this,
            height;

        if (me.grow && me.rendered) {
            me.doComponentLayout();
            height = me.inputEl.getHeight();
            if (height !== me.lastInputHeight) {
                me.fireEvent('autosize', height);
                me.lastInputHeight = height;
            }
        }
    },

    // private
    initAria: function() {
        this.callParent(arguments);
        this.getActionEl().dom.setAttribute('aria-multiline', true);
    },

    /**
     * To get the natural width of the textarea element, we do a simple calculation based on the 'cols' config.
     * We use hard-coded numbers to approximate what browsers do natively, to avoid having to read any styles which
     * would hurt performance. Overrides Labelable method.
     * @protected
     */
    getBodyNaturalWidth: function() {
        return Math.round(this.cols * 6.5) + 20;
    }

});


