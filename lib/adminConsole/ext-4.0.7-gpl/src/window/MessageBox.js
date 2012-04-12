/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Utility class for generating different styles of message boxes.  The singleton instance, Ext.MessageBox
 * alias `Ext.Msg` can also be used.
 *
 * Note that a MessageBox is asynchronous.  Unlike a regular JavaScript `alert` (which will halt
 * browser execution), showing a MessageBox will not cause the code to stop.  For this reason, if you have code
 * that should only run *after* some user feedback from the MessageBox, you must use a callback function
 * (see the `function` parameter for {@link #show} for more details).
 *
 * Basic alert
 *
 *     @example
 *     Ext.Msg.alert('Status', 'Changes saved successfully.');
 *
 * Prompt for user data and process the result using a callback
 *
 *     @example
 *     Ext.Msg.prompt('Name', 'Please enter your name:', function(btn, text){
 *         if (btn == 'ok'){
 *             // process text value and close...
 *         }
 *     });
 *
 * Show a dialog using config options
 *
 *     @example
 *     Ext.Msg.show({
 *          title:'Save Changes?',
 *          msg: 'You are closing a tab that has unsaved changes. Would you like to save your changes?',
 *          buttons: Ext.Msg.YESNOCANCEL,
 *          icon: Ext.Msg.QUESTION
 *     });
 */
Ext.define('Ext.window.MessageBox', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.toolbar.Toolbar',
        'Ext.form.field.Text',
        'Ext.form.field.TextArea',
        'Ext.button.Button',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.HBox',
        'Ext.ProgressBar'
    ],

    alias: 'widget.messagebox',

    /**
     * Button config that displays a single OK button
     * @type Number
     */
    OK : 1,
    /**
     * Button config that displays a single Yes button
     * @type Number
     */
    YES : 2,
    /**
     * Button config that displays a single No button
     * @type Number
     */
    NO : 4,
    /**
     * Button config that displays a single Cancel button
     * @type Number
     */
    CANCEL : 8,
    /**
     * Button config that displays OK and Cancel buttons
     * @type Number
     */
    OKCANCEL : 9,
    /**
     * Button config that displays Yes and No buttons
     * @type Number
     */
    YESNO : 6,
    /**
     * Button config that displays Yes, No and Cancel buttons
     * @type Number
     */
    YESNOCANCEL : 14,
    /**
     * The CSS class that provides the INFO icon image
     * @type String
     */
    INFO : 'ext-mb-info',
    /**
     * The CSS class that provides the WARNING icon image
     * @type String
     */
    WARNING : 'ext-mb-warning',
    /**
     * The CSS class that provides the QUESTION icon image
     * @type String
     */
    QUESTION : 'ext-mb-question',
    /**
     * The CSS class that provides the ERROR icon image
     * @type String
     */
    ERROR : 'ext-mb-error',

    // hide it by offsets. Windows are hidden on render by default.
    hideMode: 'offsets',
    closeAction: 'hide',
    resizable: false,
    title: '&#160;',

    width: 600,
    height: 500,
    minWidth: 250,
    maxWidth: 600,
    minHeight: 110,
    maxHeight: 500,
    constrain: true,

    cls: Ext.baseCSSPrefix + 'message-box',

    layout: {
        type: 'anchor'
    },

    /**
     * The default height in pixels of the message box's multiline textarea if displayed.
     * @type Number
     */
    defaultTextHeight : 75,
    /**
     * The minimum width in pixels of the message box if it is a progress-style dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need.
     * @type Number
     */
    minProgressWidth : 250,
    /**
     * The minimum width in pixels of the message box if it is a prompt dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need.
     * @type Number
     */
    minPromptWidth: 250,
    /**
     * An object containing the default button text strings that can be overriden for localized language support.
     * Supported properties are: ok, cancel, yes and no.  Generally you should include a locale-specific
     * resource file for handling language support across the framework.
     * Customize the default text like so: Ext.window.MessageBox.buttonText.yes = "oui"; //french
     * @type Object
     */
    buttonText: {
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
    },

    buttonIds: [
        'ok', 'yes', 'no', 'cancel'
    ],

    titleText: {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
    },

    iconHeight: 35,

    makeButton: function(btnIdx) {
        var btnId = this.buttonIds[btnIdx];
        return Ext.create('Ext.button.Button', {
            handler: this.btnCallback,
            itemId: btnId,
            scope: this,
            text: this.buttonText[btnId],
            minWidth: 75
        });
    },

    btnCallback: function(btn) {
        var me = this,
            value,
            field;

        if (me.cfg.prompt || me.cfg.multiline) {
            if (me.cfg.multiline) {
                field = me.textArea;
            } else {
                field = me.textField;
            }
            value = field.getValue();
            field.reset();
        }

        // Important not to have focus remain in the hidden Window; Interferes with DnD.
        btn.blur();
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    },

    hide: function() {
        var me = this;
        me.dd.endDrag();
        me.progressBar.reset();
        me.removeCls(me.cfg.cls);
        me.callParent();
    },

    initComponent: function() {
        var me = this,
            i, button;

        me.title = '&#160;';

        me.topContainer = Ext.create('Ext.container.Container', {
            anchor: '100%',
            style: {
                padding: '10px',
                overflow: 'hidden'
            },
            items: [
                me.iconComponent = Ext.create('Ext.Component', {
                    cls: 'ext-mb-icon',
                    width: 50,
                    height: me.iconHeight,
                    style: {
                        'float': 'left'
                    }
                }),
                me.promptContainer = Ext.create('Ext.container.Container', {
                    layout: {
                        type: 'anchor'
                    },
                    items: [
                        me.msg = Ext.create('Ext.Component', {
                            autoEl: { tag: 'span' },
                            cls: 'ext-mb-text'
                        }),
                        me.textField = Ext.create('Ext.form.field.Text', {
                            anchor: '100%',
                            enableKeyEvents: true,
                            listeners: {
                                keydown: me.onPromptKey,
                                scope: me
                            }
                        }),
                        me.textArea = Ext.create('Ext.form.field.TextArea', {
                            anchor: '100%',
                            height: 75
                        })
                    ]
                })
            ]
        });
        me.progressBar = Ext.create('Ext.ProgressBar', {
            anchor: '-10',
            style: 'margin-left:10px'
        });

        me.items = [me.topContainer, me.progressBar];

        // Create the buttons based upon passed bitwise config
        me.msgButtons = [];
        for (i = 0; i < 4; i++) {
            button = me.makeButton(i);
            me.msgButtons[button.itemId] = button;
            me.msgButtons.push(button);
        }
        me.bottomTb = Ext.create('Ext.toolbar.Toolbar', {
            ui: 'footer',
            dock: 'bottom',
            layout: {
                pack: 'center'
            },
            items: [
                me.msgButtons[0],
                me.msgButtons[1],
                me.msgButtons[2],
                me.msgButtons[3]
            ]
        });
        me.dockedItems = [me.bottomTb];

        me.callParent();
    },

    onPromptKey: function(textField, e) {
        var me = this,
            blur;

        if (e.keyCode === Ext.EventObject.RETURN || e.keyCode === 10) {
            if (me.msgButtons.ok.isVisible()) {
                blur = true;
                me.msgButtons.ok.handler.call(me, me.msgButtons.ok);
            } else if (me.msgButtons.yes.isVisible()) {
                me.msgButtons.yes.handler.call(me, me.msgButtons.yes);
                blur = true;
            }

            if (blur) {
                me.textField.blur();
            }
        }
    },

    reconfigure: function(cfg) {
        var me = this,
            buttons = cfg.buttons || 0,
            hideToolbar = true,
            initialWidth = me.maxWidth,
            i;

        cfg = cfg || {};
        me.cfg = cfg;
        if (cfg.width) {
            initialWidth = cfg.width;
        }

        // Default to allowing the Window to take focus.
        delete me.defaultFocus;

        // clear any old animateTarget
        me.animateTarget = cfg.animateTarget || undefined;

        // Defaults to modal
        me.modal = cfg.modal !== false;

        // Show the title
        if (cfg.title) {
            me.setTitle(cfg.title||'&#160;');
        }

        if (!me.rendered) {
            me.width = initialWidth;
            me.render(Ext.getBody());
        } else {
            me.setSize(initialWidth, me.maxHeight);
        }
        me.setPosition(-10000, -10000);

        // Hide or show the close tool
        me.closable = cfg.closable && !cfg.wait;
        me.header.child('[type=close]').setVisible(cfg.closable !== false);

        // Hide or show the header
        if (!cfg.title && !me.closable) {
            me.header.hide();
        } else {
            me.header.show();
        }

        // Default to dynamic drag: drag the window, not a ghost
        me.liveDrag = !cfg.proxyDrag;

        // wrap the user callback
        me.userCallback = Ext.Function.bind(cfg.callback ||cfg.fn || Ext.emptyFn, cfg.scope || Ext.global);

        // Hide or show the icon Component
        me.setIcon(cfg.icon);

        // Hide or show the message area
        if (cfg.msg) {
            me.msg.update(cfg.msg);
            me.msg.show();
        } else {
            me.msg.hide();
        }

        // Hide or show the input field
        if (cfg.prompt || cfg.multiline) {
            me.multiline = cfg.multiline;
            if (cfg.multiline) {
                me.textArea.setValue(cfg.value);
                me.textArea.setHeight(cfg.defaultTextHeight || me.defaultTextHeight);
                me.textArea.show();
                me.textField.hide();
                me.defaultFocus = me.textArea;
            } else {
                me.textField.setValue(cfg.value);
                me.textArea.hide();
                me.textField.show();
                me.defaultFocus = me.textField;
            }
        } else {
            me.textArea.hide();
            me.textField.hide();
        }

        // Hide or show the progress bar
        if (cfg.progress || cfg.wait) {
            me.progressBar.show();
            me.updateProgress(0, cfg.progressText);
            if(cfg.wait === true){
                me.progressBar.wait(cfg.waitConfig);
            }
        } else {
            me.progressBar.hide();
        }

        // Hide or show buttons depending on flag value sent.
        for (i = 0; i < 4; i++) {
            if (buttons & Math.pow(2, i)) {

                // Default to focus on the first visible button if focus not already set
                if (!me.defaultFocus) {
                    me.defaultFocus = me.msgButtons[i];
                }
                me.msgButtons[i].show();
                hideToolbar = false;
            } else {
                me.msgButtons[i].hide();
            }
        }

        // Hide toolbar if no buttons to show
        if (hideToolbar) {
            me.bottomTb.hide();
        } else {
            me.bottomTb.show();
        }
    },

    /**
     * Displays a new message box, or reinitializes an existing message box, based on the config options
     * passed in. All display functions (e.g. prompt, alert, etc.) on MessageBox call this function internally,
     * although those calls are basic shortcuts and do not support all of the config options allowed here.
     * @param {Object} config The following config options are supported: <ul>
     * <li><b>animateTarget</b> : String/Element<div class="sub-desc">An id or Element from which the message box should animate as it
     * opens and closes (defaults to undefined)</div></li>
     * <li><b>buttons</b> : Number<div class="sub-desc">A bitwise button specifier consisting of the sum of any of the following constants:<ul>
     * <li>Ext.window.MessageBox.OK</li>
     * <li>Ext.window.MessageBox.YES</li>
     * <li>Ext.window.MessageBox.NO</li>
     * <li>Ext.window.MessageBox.CANCEL</li>
     * </ul>Or false to not show any buttons (defaults to false)</div></li>
     * <li><b>closable</b> : Boolean<div class="sub-desc">False to hide the top-right close button (defaults to true). Note that
     * progress and wait dialogs will ignore this property and always hide the close button as they can only
     * be closed programmatically.</div></li>
     * <li><b>cls</b> : String<div class="sub-desc">A custom CSS class to apply to the message box's container element</div></li>
     * <li><b>defaultTextHeight</b> : Number<div class="sub-desc">The default height in pixels of the message box's multiline textarea
     * if displayed (defaults to 75)</div></li>
     * <li><b>fn</b> : Function<div class="sub-desc">A callback function which is called when the dialog is dismissed either
     * by clicking on the configured buttons, or on the dialog close button, or by pressing
     * the return button to enter input.
     * <p>Progress and wait dialogs will ignore this option since they do not respond to user
     * actions and can only be closed programmatically, so any required function should be called
     * by the same code after it closes the dialog. Parameters passed:<ul>
     * <li><b>buttonId</b> : String<div class="sub-desc">The ID of the button pressed, one of:<div class="sub-desc"><ul>
     * <li><tt>ok</tt></li>
     * <li><tt>yes</tt></li>
     * <li><tt>no</tt></li>
     * <li><tt>cancel</tt></li>
     * </ul></div></div></li>
     * <li><b>text</b> : String<div class="sub-desc">Value of the input field if either <tt><a href="#show-option-prompt" ext:member="show-option-prompt" ext:cls="Ext.window.MessageBox">prompt</a></tt>
     * or <tt><a href="#show-option-multiline" ext:member="show-option-multiline" ext:cls="Ext.window.MessageBox">multiline</a></tt> is true</div></li>
     * <li><b>opt</b> : Object<div class="sub-desc">The config object passed to show.</div></li>
     * </ul></p></div></li>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code>this</code> reference) in which the function will be executed.</div></li>
     * <li><b>icon</b> : String<div class="sub-desc">A CSS class that provides a background image to be used as the body icon for the
     * dialog (e.g. Ext.window.MessageBox.WARNING or 'custom-class') (defaults to '')</div></li>
     * <li><b>iconCls</b> : String<div class="sub-desc">The standard {@link Ext.window.Window#iconCls} to
     * add an optional header icon (defaults to '')</div></li>
     * <li><b>maxWidth</b> : Number<div class="sub-desc">The maximum width in pixels of the message box (defaults to 600)</div></li>
     * <li><b>minWidth</b> : Number<div class="sub-desc">The minimum width in pixels of the message box (defaults to 100)</div></li>
     * <li><b>modal</b> : Boolean<div class="sub-desc">False to allow user interaction with the page while the message box is
     * displayed (defaults to true)</div></li>
     * <li><b>msg</b> : String<div class="sub-desc">A string that will replace the existing message box body text (defaults to the
     * XHTML-compliant non-breaking space character '&amp;#160;')</div></li>
     * <li><a id="show-option-multiline"></a><b>multiline</b> : Boolean<div class="sub-desc">
     * True to prompt the user to enter multi-line text (defaults to false)</div></li>
     * <li><b>progress</b> : Boolean<div class="sub-desc">True to display a progress bar (defaults to false)</div></li>
     * <li><b>progressText</b> : String<div class="sub-desc">The text to display inside the progress bar if progress = true (defaults to '')</div></li>
     * <li><a id="show-option-prompt"></a><b>prompt</b> : Boolean<div class="sub-desc">True to prompt the user to enter single-line text (defaults to false)</div></li>
     * <li><b>proxyDrag</b> : Boolean<div class="sub-desc">True to display a lightweight proxy while dragging (defaults to false)</div></li>
     * <li><b>title</b> : String<div class="sub-desc">The title text</div></li>
     * <li><b>value</b> : String<div class="sub-desc">The string value to set into the active textbox element if displayed</div></li>
     * <li><b>wait</b> : Boolean<div class="sub-desc">True to display a progress bar (defaults to false)</div></li>
     * <li><b>waitConfig</b> : Object<div class="sub-desc">A {@link Ext.ProgressBar#wait} config object (applies only if wait = true)</div></li>
     * <li><b>width</b> : Number<div class="sub-desc">The width of the dialog in pixels</div></li>
     * </ul>
     * Example usage:
     * <pre><code>
Ext.Msg.show({
title: 'Address',
msg: 'Please enter your address:',
width: 300,
buttons: Ext.Msg.OKCANCEL,
multiline: true,
fn: saveAddress,
animateTarget: 'addAddressBtn',
icon: Ext.window.MessageBox.INFO
});
</code></pre>
     * @return {Ext.window.MessageBox} this
     */
    show: function(cfg) {
        var me = this;

        me.reconfigure(cfg);
        me.addCls(cfg.cls);
        if (cfg.animateTarget) {
            me.doAutoSize(true);
            me.callParent();
        } else {
            me.callParent();
            me.doAutoSize(true);
        }
        return me;
    },

    afterShow: function(){
        if (this.animateTarget) {
            this.center();
        }
        this.callParent(arguments);
    },

    doAutoSize: function(center) {
        var me = this,
            icon = me.iconComponent,
            iconHeight = me.iconHeight;

        if (!Ext.isDefined(me.frameWidth)) {
            me.frameWidth = me.el.getWidth() - me.body.getWidth();
        }

        // reset to the original dimensions
        icon.setHeight(iconHeight);

        // Allow per-invocation override of minWidth
        me.minWidth = me.cfg.minWidth || Ext.getClass(this).prototype.minWidth;

        // Set best possible size based upon allowing the text to wrap in the maximized Window, and
        // then constraining it to within the max with. Then adding up constituent element heights.
        me.topContainer.doLayout();
        if (Ext.isIE6 || Ext.isIEQuirks) {
            // In IE quirks, the initial full width of the prompt fields will prevent the container element
            // from collapsing once sized down, so temporarily force them to a small width. They'll get
            // layed out to their final width later when setting the final window size.
            me.textField.setCalculatedSize(9);
            me.textArea.setCalculatedSize(9);
        }
        var width = me.cfg.width || me.msg.getWidth() + icon.getWidth() + 25, /* topContainer's layout padding */
            height = (me.header.rendered ? me.header.getHeight() : 0) +
            Math.max(me.promptContainer.getHeight(), icon.getHeight()) +
            me.progressBar.getHeight() +
            (me.bottomTb.rendered ? me.bottomTb.getHeight() : 0) + 20 ;/* topContainer's layout padding */

        // Update to the size of the content, this way the text won't wrap under the icon.
        icon.setHeight(Math.max(iconHeight, me.msg.getHeight()));
        me.setSize(width + me.frameWidth, height + me.frameWidth);
        if (center) {
            me.center();
        }
        return me;
    },

    updateText: function(text) {
        this.msg.update(text);
        return this.doAutoSize(true);
    },

    /**
     * Adds the specified icon to the dialog.  By default, the class 'ext-mb-icon' is applied for default
     * styling, and the class passed in is expected to supply the background image url. Pass in empty string ('')
     * to clear any existing icon. This method must be called before the MessageBox is shown.
     * The following built-in icon classes are supported, but you can also pass in a custom class name:
     * <pre>
Ext.window.MessageBox.INFO
Ext.window.MessageBox.WARNING
Ext.window.MessageBox.QUESTION
Ext.window.MessageBox.ERROR
     *</pre>
     * @param {String} icon A CSS classname specifying the icon's background image url, or empty string to clear the icon
     * @return {Ext.window.MessageBox} this
     */
    setIcon : function(icon) {
        var me = this;
        me.iconComponent.removeCls(me.iconCls);
        if (icon) {
            me.iconComponent.show();
            me.iconComponent.addCls(Ext.baseCSSPrefix + 'dlg-icon');
            me.iconComponent.addCls(me.iconCls = icon);
        } else {
            me.iconComponent.removeCls(Ext.baseCSSPrefix + 'dlg-icon');
            me.iconComponent.hide();
        }
        return me;
    },

    /**
     * Updates a progress-style message box's text and progress bar. Only relevant on message boxes
     * initiated via {@link Ext.window.MessageBox#progress} or {@link Ext.window.MessageBox#wait},
     * or by calling {@link Ext.window.MessageBox#show} with progress: true.
     * @param {Number} [value=0] Any number between 0 and 1 (e.g., .5)
     * @param {String} [progressText=''] The progress text to display inside the progress bar.
     * @param {String} [msg] The message box's body text is replaced with the specified string (defaults to undefined
     * so that any existing body text will not get overwritten by default unless a new value is passed in)
     * @return {Ext.window.MessageBox} this
     */
    updateProgress : function(value, progressText, msg){
        this.progressBar.updateProgress(value, progressText);
        if (msg){
            this.updateText(msg);
        }
        return this;
    },

    onEsc: function() {
        if (this.closable !== false) {
            this.callParent(arguments);
        }
    },

    /**
     * Displays a confirmation message box with Yes and No buttons (comparable to JavaScript's confirm).
     * If a callback function is passed it will be called after the user clicks either button,
     * and the id of the button that was clicked will be passed as the only parameter to the callback
     * (could also be the top-right close button).
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} fn (optional) The callback function invoked after the message box is closed
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the callback is executed. Defaults to the browser wnidow.
     * @return {Ext.window.MessageBox} this
     */
    confirm: function(cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                icon: 'ext-mb-question',
                msg: msg,
                buttons: this.YESNO,
                callback: fn,
                scope: scope
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with OK and Cancel buttons prompting the user to enter some text (comparable to JavaScript's prompt).
     * The prompt can be a single-line or multi-line textbox.  If a callback function is passed it will be called after the user
     * clicks either button, and the id of the button that was clicked (could also be the top-right
     * close button) and the text that was entered will be passed as the two parameters to the callback.
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} [fn] The callback function invoked after the message box is closed
     * @param {Object} [scope] The scope (<code>this</code> reference) in which the callback is executed. Defaults to the browser wnidow.
     * @param {Boolean/Number} [multiline=false] True to create a multiline textbox using the defaultTextHeight
     * property, or the height in pixels to create the textbox/
     * @param {String} [value=''] Default value of the text input element
     * @return {Ext.window.MessageBox} this
     */
    prompt : function(cfg, msg, fn, scope, multiline, value){
        if (Ext.isString(cfg)) {
            cfg = {
                prompt: true,
                title: cfg,
                minWidth: this.minPromptWidth,
                msg: msg,
                buttons: this.OKCANCEL,
                callback: fn,
                scope: scope,
                multiline: multiline,
                value: value
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with an infinitely auto-updating progress bar.  This can be used to block user
     * interaction while waiting for a long-running process to complete that does not have defined intervals.
     * You are responsible for closing the message box when the process is complete.
     * @param {String} msg The message box body text
     * @param {String} title (optional) The title bar text
     * @param {Object} config (optional) A {@link Ext.ProgressBar#wait} config object
     * @return {Ext.window.MessageBox} this
     */
    wait : function(cfg, title, config){
        if (Ext.isString(cfg)) {
            cfg = {
                title : title,
                msg : cfg,
                closable: false,
                wait: true,
                modal: true,
                minWidth: this.minProgressWidth,
                waitConfig: config
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a standard read-only message box with an OK button (comparable to the basic JavaScript alert prompt).
     * If a callback function is passed it will be called after the user clicks the button, and the
     * id of the button that was clicked will be passed as the only parameter to the callback
     * (could also be the top-right close button).
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} fn (optional) The callback function invoked after the message box is closed
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the callback is executed. Defaults to the browser wnidow.
     * @return {Ext.window.MessageBox} this
     */
    alert: function(cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title : cfg,
                msg : msg,
                buttons: this.OK,
                fn: fn,
                scope : scope,
                minWidth: this.minWidth
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with a progress bar.  This message box has no buttons and is not closeable by
     * the user.  You are responsible for updating the progress bar as needed via {@link Ext.window.MessageBox#updateProgress}
     * and closing the message box when the process is complete.
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {String} [progressText=''] The text to display inside the progress bar
     * @return {Ext.window.MessageBox} this
     */
    progress : function(cfg, msg, progressText){
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                msg: msg,
                progress: true,
                progressText: progressText
            };
        }
        return this.show(cfg);
    }
}, function() {
    /**
     * @class Ext.MessageBox
     * @alternateClassName Ext.Msg
     * @extends Ext.window.MessageBox
     * @singleton
     * Singleton instance of {@link Ext.window.MessageBox}.
     */
    Ext.MessageBox = Ext.Msg = new this();
});
