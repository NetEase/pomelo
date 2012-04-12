/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @docauthor Jason Johnston <jason@sencha.com>
 *
 * A file upload field which has custom styling and allows control over the button text and other
 * features of {@link Ext.form.field.Text text fields} like {@link Ext.form.field.Text#emptyText empty text}.
 * It uses a hidden file input element behind the scenes to allow user selection of a file and to
 * perform the actual upload during {@link Ext.form.Basic#submit form submit}.
 *
 * Because there is no secure cross-browser way to programmatically set the value of a file input,
 * the standard Field `setValue` method is not implemented. The `{@link #getValue}` method will return
 * a value that is browser-dependent; some have just the file name, some have a full path, some use
 * a fake path.
 *
 * **IMPORTANT:** File uploads are not performed using normal 'Ajax' techniques; see the description for
 * {@link Ext.form.Basic#hasUpload} for details.
 *
 * # Example Usage
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         title: 'Upload a Photo',
 *         width: 400,
 *         bodyPadding: 10,
 *         frame: true,
 *         renderTo: Ext.getBody(),
 *         items: [{
 *             xtype: 'filefield',
 *             name: 'photo',
 *             fieldLabel: 'Photo',
 *             labelWidth: 50,
 *             msgTarget: 'side',
 *             allowBlank: false,
 *             anchor: '100%',
 *             buttonText: 'Select Photo...'
 *         }],
 *
 *         buttons: [{
 *             text: 'Upload',
 *             handler: function() {
 *                 var form = this.up('form').getForm();
 *                 if(form.isValid()){
 *                     form.submit({
 *                         url: 'photo-upload.php',
 *                         waitMsg: 'Uploading your photo...',
 *                         success: function(fp, o) {
 *                             Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
 *                         }
 *                     });
 *                 }
 *             }
 *         }]
 *     });
 */
Ext.define("Ext.form.field.File", {
    extend: 'Ext.form.field.Text',
    alias: ['widget.filefield', 'widget.fileuploadfield'],
    alternateClassName: ['Ext.form.FileUploadField', 'Ext.ux.form.FileUploadField', 'Ext.form.File'],
    uses: ['Ext.button.Button', 'Ext.layout.component.field.File'],

    /**
     * @cfg {String} buttonText
     * The button text to display on the upload button. Note that if you supply a value for
     * {@link #buttonConfig}, the buttonConfig.text value will be used instead if available.
     */
    buttonText: 'Browse...',

    /**
     * @cfg {Boolean} buttonOnly
     * True to display the file upload field as a button with no visible text field. If true, all
     * inherited Text members will still be available.
     */
    buttonOnly: false,

    /**
     * @cfg {Number} buttonMargin
     * The number of pixels of space reserved between the button and the text field. Note that this only
     * applies if {@link #buttonOnly} = false.
     */
    buttonMargin: 3,

    /**
     * @cfg {Object} buttonConfig
     * A standard {@link Ext.button.Button} config object.
     */

    /**
     * @event change
     * Fires when the underlying file input field's value has changed from the user selecting a new file from the system
     * file selection dialog.
     * @param {Ext.ux.form.FileUploadField} this
     * @param {String} value The file value returned by the underlying file input field
     */

    /**
     * @property {Ext.Element} fileInputEl
     * A reference to the invisible file input element created for this upload field. Only populated after this
     * component is rendered.
     */

    /**
     * @property {Ext.button.Button} button
     * A reference to the trigger Button component created for this upload field. Only populated after this component is
     * rendered.
     */

    /**
     * @cfg {String} [fieldBodyCls='x-form-file-wrap']
     * An extra CSS class to be applied to the body content element in addition to {@link #fieldBodyCls}.
     */
    fieldBodyCls: Ext.baseCSSPrefix + 'form-file-wrap',

    /**
     * @cfg {Boolean} readOnly
     * Unlike with other form fields, the readOnly config defaults to true in File field.
     */
    readOnly: true,

    // private
    componentLayout: 'filefield',

    // private
    onRender: function() {
        var me = this,
            inputEl;

        me.callParent(arguments);

        me.createButton();
        me.createFileInput();
        
        // we don't create the file/button til after onRender, the initial disable() is
        // called in the onRender of the component.
        if (me.disabled) {
            me.disableItems();
        }

        inputEl = me.inputEl;
        inputEl.dom.removeAttribute('name'); //name goes on the fileInput, not the text input
        if (me.buttonOnly) {
            inputEl.setDisplayed(false);
        }
    },

    /**
     * @private
     * Creates the custom trigger Button component. The fileInput will be inserted into this.
     */
    createButton: function() {
        var me = this;
        me.button = Ext.widget('button', Ext.apply({
            ui: me.ui,
            renderTo: me.bodyEl,
            text: me.buttonText,
            cls: Ext.baseCSSPrefix + 'form-file-btn',
            preventDefault: false,
            style: me.buttonOnly ? '' : 'margin-left:' + me.buttonMargin + 'px'
        }, me.buttonConfig));
    },

    /**
     * @private
     * Creates the file input element. It is inserted into the trigger button component, made
     * invisible, and floated on top of the button's other content so that it will receive the
     * button's clicks.
     */
    createFileInput : function() {
        var me = this;
        me.fileInputEl = me.button.el.createChild({
            name: me.getName(),
            cls: Ext.baseCSSPrefix + 'form-file-input',
            tag: 'input',
            type: 'file',
            size: 1
        }).on('change', me.onFileChange, me);
    },

    /**
     * @private Event handler fired when the user selects a file.
     */
    onFileChange: function() {
        this.lastValue = null; // force change event to get fired even if the user selects a file with the same name
        Ext.form.field.File.superclass.setValue.call(this, this.fileInputEl.dom.value);
    },

    /**
     * Overridden to do nothing
     * @hide
     */
    setValue: Ext.emptyFn,

    reset : function(){
        var me = this;
        if (me.rendered) {
            me.fileInputEl.remove();
            me.createFileInput();
            me.inputEl.dom.value = '';
        }
        me.callParent();
    },

    onDisable: function(){
        this.callParent();
        this.disableItems();
    },
    
    disableItems: function(){
        var file = this.fileInputEl,
            button = this.button;
             
        if (file) {
            file.dom.disabled = true;
        }
        if (button) {
            button.disable();
        }    
    },

    onEnable: function(){
        var me = this;
        me.callParent();
        me.fileInputEl.dom.disabled = false;
        me.button.enable();
    },

    isFileUpload: function() {
        return true;
    },

    extractFileInput: function() {
        var fileInput = this.fileInputEl.dom;
        this.reset();
        return fileInput;
    },

    onDestroy: function(){
        Ext.destroyMembers(this, 'fileInputEl', 'button');
        this.callParent();
    }


});

