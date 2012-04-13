/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.Basic
 * @extends Ext.util.Observable
 *
 * Provides input field management, validation, submission, and form loading services for the collection
 * of {@link Ext.form.field.Field Field} instances within a {@link Ext.container.Container}. It is recommended
 * that you use a {@link Ext.form.Panel} as the form container, as that has logic to automatically
 * hook up an instance of {@link Ext.form.Basic} (plus other conveniences related to field configuration.)
 *
 * ## Form Actions
 *
 * The Basic class delegates the handling of form loads and submits to instances of {@link Ext.form.action.Action}.
 * See the various Action implementations for specific details of each one's functionality, as well as the
 * documentation for {@link #doAction} which details the configuration options that can be specified in
 * each action call.
 *
 * The default submit Action is {@link Ext.form.action.Submit}, which uses an Ajax request to submit the
 * form's values to a configured URL. To enable normal browser submission of an Ext form, use the
 * {@link #standardSubmit} config option.
 *
 * ## File uploads
 *
 * File uploads are not performed using normal 'Ajax' techniques; see the description for
 * {@link #hasUpload} for details. If you're using file uploads you should read the method description.
 *
 * ## Example usage:
 *
 *     Ext.create('Ext.form.Panel', {
 *         title: 'Basic Form',
 *         renderTo: Ext.getBody(),
 *         bodyPadding: 5,
 *         width: 350,
 *
 *         // Any configuration items here will be automatically passed along to
 *         // the Ext.form.Basic instance when it gets created.
 *
 *         // The form will submit an AJAX request to this URL when submitted
 *         url: 'save-form.php',
 *
 *         items: [{
 *             fieldLabel: 'Field',
 *             name: 'theField'
 *         }],
 *
 *         buttons: [{
 *             text: 'Submit',
 *             handler: function() {
 *                 // The getForm() method returns the Ext.form.Basic instance:
 *                 var form = this.up('form').getForm();
 *                 if (form.isValid()) {
 *                     // Submit the Ajax request and handle the response
 *                     form.submit({
 *                         success: function(form, action) {
 *                            Ext.Msg.alert('Success', action.result.msg);
 *                         },
 *                         failure: function(form, action) {
 *                             Ext.Msg.alert('Failed', action.result.msg);
 *                         }
 *                     });
 *                 }
 *             }
 *         }]
 *     });
 *
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define('Ext.form.Basic', {
    extend: 'Ext.util.Observable',
    alternateClassName: 'Ext.form.BasicForm',
    requires: ['Ext.util.MixedCollection', 'Ext.form.action.Load', 'Ext.form.action.Submit',
               'Ext.window.MessageBox', 'Ext.data.Errors', 'Ext.util.DelayedTask'],

    /**
     * Creates new form.
     * @param {Ext.container.Container} owner The component that is the container for the form, usually a {@link Ext.form.Panel}
     * @param {Object} config Configuration options. These are normally specified in the config to the
     * {@link Ext.form.Panel} constructor, which passes them along to the BasicForm automatically.
     */
    constructor: function(owner, config) {
        var me = this,
            onItemAddOrRemove = me.onItemAddOrRemove;

        /**
         * @property owner
         * @type Ext.container.Container
         * The container component to which this BasicForm is attached.
         */
        me.owner = owner;

        // Listen for addition/removal of fields in the owner container
        me.mon(owner, {
            add: onItemAddOrRemove,
            remove: onItemAddOrRemove,
            scope: me
        });

        Ext.apply(me, config);

        // Normalize the paramOrder to an Array
        if (Ext.isString(me.paramOrder)) {
            me.paramOrder = me.paramOrder.split(/[\s,|]/);
        }

        me.checkValidityTask = Ext.create('Ext.util.DelayedTask', me.checkValidity, me);

        me.addEvents(
            /**
             * @event beforeaction
             * Fires before any action is performed. Return false to cancel the action.
             * @param {Ext.form.Basic} this
             * @param {Ext.form.action.Action} action The {@link Ext.form.action.Action} to be performed
             */
            'beforeaction',
            /**
             * @event actionfailed
             * Fires when an action fails.
             * @param {Ext.form.Basic} this
             * @param {Ext.form.action.Action} action The {@link Ext.form.action.Action} that failed
             */
            'actionfailed',
            /**
             * @event actioncomplete
             * Fires when an action is completed.
             * @param {Ext.form.Basic} this
             * @param {Ext.form.action.Action} action The {@link Ext.form.action.Action} that completed
             */
            'actioncomplete',
            /**
             * @event validitychange
             * Fires when the validity of the entire form changes.
             * @param {Ext.form.Basic} this
             * @param {Boolean} valid <tt>true</tt> if the form is now valid, <tt>false</tt> if it is now invalid.
             */
            'validitychange',
            /**
             * @event dirtychange
             * Fires when the dirty state of the entire form changes.
             * @param {Ext.form.Basic} this
             * @param {Boolean} dirty <tt>true</tt> if the form is now dirty, <tt>false</tt> if it is no longer dirty.
             */
            'dirtychange'
        );
        me.callParent();
    },

    /**
     * Do any post constructor initialization
     * @private
     */
    initialize: function(){
        this.initialized = true;
        this.onValidityChange(!this.hasInvalidField());
    },

    /**
     * @cfg {String} method
     * The request method to use (GET or POST) for form actions if one isn't supplied in the action options.
     */

    /**
     * @cfg {Ext.data.reader.Reader} reader
     * An Ext.data.DataReader (e.g. {@link Ext.data.reader.Xml}) to be used to read
     * data when executing 'load' actions. This is optional as there is built-in
     * support for processing JSON responses.
     */

    /**
     * @cfg {Ext.data.reader.Reader} errorReader
     * <p>An Ext.data.DataReader (e.g. {@link Ext.data.reader.Xml}) to be used to
     * read field error messages returned from 'submit' actions. This is optional
     * as there is built-in support for processing JSON responses.</p>
     * <p>The Records which provide messages for the invalid Fields must use the
     * Field name (or id) as the Record ID, and must contain a field called 'msg'
     * which contains the error message.</p>
     * <p>The errorReader does not have to be a full-blown implementation of a
     * Reader. It simply needs to implement a <tt>read(xhr)</tt> function
     * which returns an Array of Records in an object with the following
     * structure:</p><pre><code>
{
    records: recordArray
}
</code></pre>
     */

    /**
     * @cfg {String} url
     * The URL to use for form actions if one isn't supplied in the
     * {@link #doAction doAction} options.
     */

    /**
     * @cfg {Object} baseParams
     * <p>Parameters to pass with all requests. e.g. baseParams: {id: '123', foo: 'bar'}.</p>
     * <p>Parameters are encoded as standard HTTP parameters using {@link Ext.Object#toQueryString}.</p>
     */

    /**
     * @cfg {Number} timeout Timeout for form actions in seconds (default is 30 seconds).
     */
    timeout: 30,

    /**
     * @cfg {Object} api (Optional) If specified, load and submit actions will be handled
     * with {@link Ext.form.action.DirectLoad} and {@link Ext.form.action.DirectLoad}.
     * Methods which have been imported by {@link Ext.direct.Manager} can be specified here to load and submit
     * forms.
     * Such as the following:<pre><code>
api: {
    load: App.ss.MyProfile.load,
    submit: App.ss.MyProfile.submit
}
</code></pre>
     * <p>Load actions can use <code>{@link #paramOrder}</code> or <code>{@link #paramsAsHash}</code>
     * to customize how the load method is invoked.
     * Submit actions will always use a standard form submit. The <tt>formHandler</tt> configuration must
     * be set on the associated server-side method which has been imported by {@link Ext.direct.Manager}.</p>
     */

    /**
     * @cfg {String/String[]} paramOrder <p>A list of params to be executed server side.
     * Defaults to <tt>undefined</tt>. Only used for the <code>{@link #api}</code>
     * <code>load</code> configuration.</p>
     * <p>Specify the params in the order in which they must be executed on the
     * server-side as either (1) an Array of String values, or (2) a String of params
     * delimited by either whitespace, comma, or pipe. For example,
     * any of the following would be acceptable:</p><pre><code>
paramOrder: ['param1','param2','param3']
paramOrder: 'param1 param2 param3'
paramOrder: 'param1,param2,param3'
paramOrder: 'param1|param2|param'
     </code></pre>
     */

    /**
     * @cfg {Boolean} paramsAsHash
     * Only used for the <code>{@link #api}</code>
     * <code>load</code> configuration. If <tt>true</tt>, parameters will be sent as a
     * single hash collection of named arguments. Providing a
     * <tt>{@link #paramOrder}</tt> nullifies this configuration.
     */
    paramsAsHash: false,

    /**
     * @cfg {String} waitTitle
     * The default title to show for the waiting message box
     */
    waitTitle: 'Please Wait...',

    /**
     * @cfg {Boolean} trackResetOnLoad
     * If set to true, {@link #reset}() resets to the last loaded or {@link #setValues}() data instead of
     * when the form was first created.
     */
    trackResetOnLoad: false,

    /**
     * @cfg {Boolean} standardSubmit
     * If set to true, a standard HTML form submit is used instead of a XHR (Ajax) style form submission.
     * All of the field values, plus any additional params configured via {@link #baseParams}
     * and/or the `options` to {@link #submit}, will be included in the values submitted in the form.
     */

    /**
     * @cfg {String/HTMLElement/Ext.Element} waitMsgTarget
     * By default wait messages are displayed with Ext.MessageBox.wait. You can target a specific
     * element by passing it or its id or mask the form itself by passing in true.
     */


    // Private
    wasDirty: false,


    /**
     * Destroys this object.
     */
    destroy: function() {
        this.clearListeners();
        this.checkValidityTask.cancel();
    },

    /**
     * @private
     * Handle addition or removal of descendant items. Invalidates the cached list of fields
     * so that {@link #getFields} will do a fresh query next time it is called. Also adds listeners
     * for state change events on added fields, and tracks components with formBind=true.
     */
    onItemAddOrRemove: function(parent, child) {
        var me = this,
            isAdding = !!child.ownerCt,
            isContainer = child.isContainer;

        function handleField(field) {
            // Listen for state change events on fields
            me[isAdding ? 'mon' : 'mun'](field, {
                validitychange: me.checkValidity,
                dirtychange: me.checkDirty,
                scope: me,
                buffer: 100 //batch up sequential calls to avoid excessive full-form validation
            });
            // Flush the cached list of fields
            delete me._fields;
        }

        if (child.isFormField) {
            handleField(child);
        } else if (isContainer) {
            // Walk down
            if (child.isDestroyed) {
                // the container is destroyed, this means we may have child fields, so here
                // we just invalidate all the fields to be sure.
                delete me._fields;
            } else {
                Ext.Array.forEach(child.query('[isFormField]'), handleField);
            }
        }

        // Flush the cached list of formBind components
        delete this._boundItems;

        // Check form bind, but only after initial add. Batch it to prevent excessive validation
        // calls when many fields are being added at once.
        if (me.initialized) {
            me.checkValidityTask.delay(10);
        }
    },

    /**
     * Return all the {@link Ext.form.field.Field} components in the owner container.
     * @return {Ext.util.MixedCollection} Collection of the Field objects
     */
    getFields: function() {
        var fields = this._fields;
        if (!fields) {
            fields = this._fields = Ext.create('Ext.util.MixedCollection');
            fields.addAll(this.owner.query('[isFormField]'));
        }
        return fields;
    },

    /**
     * @private
     * Finds and returns the set of all items bound to fields inside this form
     * @return {Ext.util.MixedCollection} The set of all bound form field items
     */
    getBoundItems: function() {
        var boundItems = this._boundItems;
        
        if (!boundItems || boundItems.getCount() === 0) {
            boundItems = this._boundItems = Ext.create('Ext.util.MixedCollection');
            boundItems.addAll(this.owner.query('[formBind]'));
        }
        
        return boundItems;
    },

    /**
     * Returns true if the form contains any invalid fields. No fields will be marked as invalid
     * as a result of calling this; to trigger marking of fields use {@link #isValid} instead.
     */
    hasInvalidField: function() {
        return !!this.getFields().findBy(function(field) {
            var preventMark = field.preventMark,
                isValid;
            field.preventMark = true;
            isValid = field.isValid();
            field.preventMark = preventMark;
            return !isValid;
        });
    },

    /**
     * Returns true if client-side validation on the form is successful. Any invalid fields will be
     * marked as invalid. If you only want to determine overall form validity without marking anything,
     * use {@link #hasInvalidField} instead.
     * @return Boolean
     */
    isValid: function() {
        var me = this,
            invalid;
        me.batchLayouts(function() {
            invalid = me.getFields().filterBy(function(field) {
                return !field.validate();
            });
        });
        return invalid.length < 1;
    },

    /**
     * Check whether the validity of the entire form has changed since it was last checked, and
     * if so fire the {@link #validitychange validitychange} event. This is automatically invoked
     * when an individual field's validity changes.
     */
    checkValidity: function() {
        var me = this,
            valid = !me.hasInvalidField();
        if (valid !== me.wasValid) {
            me.onValidityChange(valid);
            me.fireEvent('validitychange', me, valid);
            me.wasValid = valid;
        }
    },

    /**
     * @private
     * Handle changes in the form's validity. If there are any sub components with
     * formBind=true then they are enabled/disabled based on the new validity.
     * @param {Boolean} valid
     */
    onValidityChange: function(valid) {
        var boundItems = this.getBoundItems();
        if (boundItems) {
            boundItems.each(function(cmp) {
                if (cmp.disabled === valid) {
                    cmp.setDisabled(!valid);
                }
            });
        }
    },

    /**
     * <p>Returns true if any fields in this form have changed from their original values.</p>
     * <p>Note that if this BasicForm was configured with {@link #trackResetOnLoad} then the
     * Fields' <em>original values</em> are updated when the values are loaded by {@link #setValues}
     * or {@link #loadRecord}.</p>
     * @return Boolean
     */
    isDirty: function() {
        return !!this.getFields().findBy(function(f) {
            return f.isDirty();
        });
    },

    /**
     * Check whether the dirty state of the entire form has changed since it was last checked, and
     * if so fire the {@link #dirtychange dirtychange} event. This is automatically invoked
     * when an individual field's dirty state changes.
     */
    checkDirty: function() {
        var dirty = this.isDirty();
        if (dirty !== this.wasDirty) {
            this.fireEvent('dirtychange', this, dirty);
            this.wasDirty = dirty;
        }
    },

    /**
     * <p>Returns true if the form contains a file upload field. This is used to determine the
     * method for submitting the form: File uploads are not performed using normal 'Ajax' techniques,
     * that is they are <b>not</b> performed using XMLHttpRequests. Instead a hidden <tt>&lt;form></tt>
     * element containing all the fields is created temporarily and submitted with its
     * <a href="http://www.w3.org/TR/REC-html40/present/frames.html#adef-target">target</a> set to refer
     * to a dynamically generated, hidden <tt>&lt;iframe></tt> which is inserted into the document
     * but removed after the return data has been gathered.</p>
     * <p>The server response is parsed by the browser to create the document for the IFRAME. If the
     * server is using JSON to send the return object, then the
     * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17">Content-Type</a> header
     * must be set to "text/html" in order to tell the browser to insert the text unchanged into the document body.</p>
     * <p>Characters which are significant to an HTML parser must be sent as HTML entities, so encode
     * "&lt;" as "&amp;lt;", "&amp;" as "&amp;amp;" etc.</p>
     * <p>The response text is retrieved from the document, and a fake XMLHttpRequest object
     * is created containing a <tt>responseText</tt> property in order to conform to the
     * requirements of event handlers and callbacks.</p>
     * <p>Be aware that file upload packets are sent with the content type <a href="http://www.faqs.org/rfcs/rfc2388.html">multipart/form</a>
     * and some server technologies (notably JEE) may require some custom processing in order to
     * retrieve parameter names and parameter values from the packet content.</p>
     * @return Boolean
     */
    hasUpload: function() {
        return !!this.getFields().findBy(function(f) {
            return f.isFileUpload();
        });
    },

    /**
     * Performs a predefined action (an implementation of {@link Ext.form.action.Action})
     * to perform application-specific processing.
     * @param {String/Ext.form.action.Action} action The name of the predefined action type,
     * or instance of {@link Ext.form.action.Action} to perform.
     * @param {Object} options (optional) The options to pass to the {@link Ext.form.action.Action}
     * that will get created, if the <tt>action</tt> argument is a String.
     * <p>All of the config options listed below are supported by both the
     * {@link Ext.form.action.Submit submit} and {@link Ext.form.action.Load load}
     * actions unless otherwise noted (custom actions could also accept
     * other config options):</p><ul>
     *
     * <li><b>url</b> : String<div class="sub-desc">The url for the action (defaults
     * to the form's {@link #url}.)</div></li>
     *
     * <li><b>method</b> : String<div class="sub-desc">The form method to use (defaults
     * to the form's method, or POST if not defined)</div></li>
     *
     * <li><b>params</b> : String/Object<div class="sub-desc"><p>The params to pass
     * (defaults to the form's baseParams, or none if not defined)</p>
     * <p>Parameters are encoded as standard HTTP parameters using {@link Ext#urlEncode Ext.Object.toQueryString}.</p></div></li>
     *
     * <li><b>headers</b> : Object<div class="sub-desc">Request headers to set for the action.</div></li>
     *
     * <li><b>success</b> : Function<div class="sub-desc">The callback that will
     * be invoked after a successful response (see top of
     * {@link Ext.form.action.Submit submit} and {@link Ext.form.action.Load load}
     * for a description of what constitutes a successful response).
     * The function is passed the following parameters:<ul>
     * <li><tt>form</tt> : The {@link Ext.form.Basic} that requested the action.</li>
     * <li><tt>action</tt> : The {@link Ext.form.action.Action Action} object which performed the operation.
     * <div class="sub-desc">The action object contains these properties of interest:<ul>
     * <li><tt>{@link Ext.form.action.Action#response response}</tt></li>
     * <li><tt>{@link Ext.form.action.Action#result result}</tt> : interrogate for custom postprocessing</li>
     * <li><tt>{@link Ext.form.action.Action#type type}</tt></li>
     * </ul></div></li></ul></div></li>
     *
     * <li><b>failure</b> : Function<div class="sub-desc">The callback that will be invoked after a
     * failed transaction attempt. The function is passed the following parameters:<ul>
     * <li><tt>form</tt> : The {@link Ext.form.Basic} that requested the action.</li>
     * <li><tt>action</tt> : The {@link Ext.form.action.Action Action} object which performed the operation.
     * <div class="sub-desc">The action object contains these properties of interest:<ul>
     * <li><tt>{@link Ext.form.action.Action#failureType failureType}</tt></li>
     * <li><tt>{@link Ext.form.action.Action#response response}</tt></li>
     * <li><tt>{@link Ext.form.action.Action#result result}</tt> : interrogate for custom postprocessing</li>
     * <li><tt>{@link Ext.form.action.Action#type type}</tt></li>
     * </ul></div></li></ul></div></li>
     *
     * <li><b>scope</b> : Object<div class="sub-desc">The scope in which to call the
     * callback functions (The <tt>this</tt> reference for the callback functions).</div></li>
     *
     * <li><b>clientValidation</b> : Boolean<div class="sub-desc">Submit Action only.
     * Determines whether a Form's fields are validated in a final call to
     * {@link Ext.form.Basic#isValid isValid} prior to submission. Set to <tt>false</tt>
     * to prevent this. If undefined, pre-submission field validation is performed.</div></li></ul>
     *
     * @return {Ext.form.Basic} this
     */
    doAction: function(action, options) {
        if (Ext.isString(action)) {
            action = Ext.ClassManager.instantiateByAlias('formaction.' + action, Ext.apply({}, options, {form: this}));
        }
        if (this.fireEvent('beforeaction', this, action) !== false) {
            this.beforeAction(action);
            Ext.defer(action.run, 100, action);
        }
        return this;
    },

    /**
     * Shortcut to {@link #doAction do} a {@link Ext.form.action.Submit submit action}. This will use the
     * {@link Ext.form.action.Submit AJAX submit action} by default. If the {@link #standardSubmit} config is
     * enabled it will use a standard form element to submit, or if the {@link #api} config is present it will
     * use the {@link Ext.form.action.DirectLoad Ext.direct.Direct submit action}.
     * @param {Object} options The options to pass to the action (see {@link #doAction} for details).<br>
     * <p>The following code:</p><pre><code>
myFormPanel.getForm().submit({
    clientValidation: true,
    url: 'updateConsignment.php',
    params: {
        newStatus: 'delivered'
    },
    success: function(form, action) {
       Ext.Msg.alert('Success', action.result.msg);
    },
    failure: function(form, action) {
        switch (action.failureType) {
            case Ext.form.action.Action.CLIENT_INVALID:
                Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                break;
            case Ext.form.action.Action.CONNECT_FAILURE:
                Ext.Msg.alert('Failure', 'Ajax communication failed');
                break;
            case Ext.form.action.Action.SERVER_INVALID:
               Ext.Msg.alert('Failure', action.result.msg);
       }
    }
});
</code></pre>
     * would process the following server response for a successful submission:<pre><code>
{
    "success":true, // note this is Boolean, not string
    "msg":"Consignment updated"
}
</code></pre>
     * and the following server response for a failed submission:<pre><code>
{
    "success":false, // note this is Boolean, not string
    "msg":"You do not have permission to perform this operation"
}
</code></pre>
     * @return {Ext.form.Basic} this
     */
    submit: function(options) {
        return this.doAction(this.standardSubmit ? 'standardsubmit' : this.api ? 'directsubmit' : 'submit', options);
    },

    /**
     * Shortcut to {@link #doAction do} a {@link Ext.form.action.Load load action}.
     * @param {Object} options The options to pass to the action (see {@link #doAction} for details)
     * @return {Ext.form.Basic} this
     */
    load: function(options) {
        return this.doAction(this.api ? 'directload' : 'load', options);
    },

    /**
     * Persists the values in this form into the passed {@link Ext.data.Model} object in a beginEdit/endEdit block.
     * @param {Ext.data.Model} record The record to edit
     * @return {Ext.form.Basic} this
     */
    updateRecord: function(record) {
        var fields = record.fields,
            values = this.getFieldValues(),
            name,
            obj = {};

        fields.each(function(f) {
            name = f.name;
            if (name in values) {
                obj[name] = values[name];
            }
        });

        record.beginEdit();
        record.set(obj);
        record.endEdit();

        return this;
    },

    /**
     * Loads an {@link Ext.data.Model} into this form by calling {@link #setValues} with the
     * {@link Ext.data.Model#raw record data}.
     * See also {@link #trackResetOnLoad}.
     * @param {Ext.data.Model} record The record to load
     * @return {Ext.form.Basic} this
     */
    loadRecord: function(record) {
        this._record = record;
        return this.setValues(record.data);
    },

    /**
     * Returns the last Ext.data.Model instance that was loaded via {@link #loadRecord}
     * @return {Ext.data.Model} The record
     */
    getRecord: function() {
        return this._record;
    },

    /**
     * @private
     * Called before an action is performed via {@link #doAction}.
     * @param {Ext.form.action.Action} action The Action instance that was invoked
     */
    beforeAction: function(action) {
        var waitMsg = action.waitMsg,
            maskCls = Ext.baseCSSPrefix + 'mask-loading',
            waitMsgTarget;

        // Call HtmlEditor's syncValue before actions
        this.getFields().each(function(f) {
            if (f.isFormField && f.syncValue) {
                f.syncValue();
            }
        });

        if (waitMsg) {
            waitMsgTarget = this.waitMsgTarget;
            if (waitMsgTarget === true) {
                this.owner.el.mask(waitMsg, maskCls);
            } else if (waitMsgTarget) {
                waitMsgTarget = this.waitMsgTarget = Ext.get(waitMsgTarget);
                waitMsgTarget.mask(waitMsg, maskCls);
            } else {
                Ext.MessageBox.wait(waitMsg, action.waitTitle || this.waitTitle);
            }
        }
    },

    /**
     * @private
     * Called after an action is performed via {@link #doAction}.
     * @param {Ext.form.action.Action} action The Action instance that was invoked
     * @param {Boolean} success True if the action completed successfully, false, otherwise.
     */
    afterAction: function(action, success) {
        if (action.waitMsg) {
            var MessageBox = Ext.MessageBox,
                waitMsgTarget = this.waitMsgTarget;
            if (waitMsgTarget === true) {
                this.owner.el.unmask();
            } else if (waitMsgTarget) {
                waitMsgTarget.unmask();
            } else {
                MessageBox.updateProgress(1);
                MessageBox.hide();
            }
        }
        if (success) {
            if (action.reset) {
                this.reset();
            }
            Ext.callback(action.success, action.scope || action, [this, action]);
            this.fireEvent('actioncomplete', this, action);
        } else {
            Ext.callback(action.failure, action.scope || action, [this, action]);
            this.fireEvent('actionfailed', this, action);
        }
    },


    /**
     * Find a specific {@link Ext.form.field.Field} in this form by id or name.
     * @param {String} id The value to search for (specify either a {@link Ext.Component#id id} or
     * {@link Ext.form.field.Field#getName name or hiddenName}).
     * @return Ext.form.field.Field The first matching field, or <tt>null</tt> if none was found.
     */
    findField: function(id) {
        return this.getFields().findBy(function(f) {
            return f.id === id || f.getName() === id;
        });
    },


    /**
     * Mark fields in this form invalid in bulk.
     * @param {Object/Object[]/Ext.data.Errors} errors
     * Either an array in the form <code>[{id:'fieldId', msg:'The message'}, ...]</code>,
     * an object hash of <code>{id: msg, id2: msg2}</code>, or a {@link Ext.data.Errors} object.
     * @return {Ext.form.Basic} this
     */
    markInvalid: function(errors) {
        var me = this;

        function mark(fieldId, msg) {
            var field = me.findField(fieldId);
            if (field) {
                field.markInvalid(msg);
            }
        }

        if (Ext.isArray(errors)) {
            Ext.each(errors, function(err) {
                mark(err.id, err.msg);
            });
        }
        else if (errors instanceof Ext.data.Errors) {
            errors.each(function(err) {
                mark(err.field, err.message);
            });
        }
        else {
            Ext.iterate(errors, mark);
        }
        return this;
    },

    /**
     * Set values for fields in this form in bulk.
     * @param {Object/Object[]} values Either an array in the form:<pre><code>
[{id:'clientName', value:'Fred. Olsen Lines'},
 {id:'portOfLoading', value:'FXT'},
 {id:'portOfDischarge', value:'OSL'} ]</code></pre>
     * or an object hash of the form:<pre><code>
{
    clientName: 'Fred. Olsen Lines',
    portOfLoading: 'FXT',
    portOfDischarge: 'OSL'
}</code></pre>
     * @return {Ext.form.Basic} this
     */
    setValues: function(values) {
        var me = this;

        function setVal(fieldId, val) {
            var field = me.findField(fieldId);
            if (field) {
                field.setValue(val);
                if (me.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        }

        if (Ext.isArray(values)) {
            // array of objects
            Ext.each(values, function(val) {
                setVal(val.id, val.value);
            });
        } else {
            // object hash
            Ext.iterate(values, setVal);
        }
        return this;
    },

    /**
     * Retrieves the fields in the form as a set of key/value pairs, using their
     * {@link Ext.form.field.Field#getSubmitData getSubmitData()} method to collect the values.
     * If multiple fields return values under the same name those values will be combined into an Array.
     * This is similar to {@link #getFieldValues} except that this method collects only String values for
     * submission, while getFieldValues collects type-specific data values (e.g. Date objects for date fields.)
     * @param {Boolean} asString (optional) If true, will return the key/value collection as a single
     * URL-encoded param string. Defaults to false.
     * @param {Boolean} dirtyOnly (optional) If true, only fields that are dirty will be included in the result.
     * Defaults to false.
     * @param {Boolean} includeEmptyText (optional) If true, the configured emptyText of empty fields will be used.
     * Defaults to false.
     * @return {String/Object}
     */
    getValues: function(asString, dirtyOnly, includeEmptyText, useDataValues) {
        var values = {};

        this.getFields().each(function(field) {
            if (!dirtyOnly || field.isDirty()) {
                var data = field[useDataValues ? 'getModelData' : 'getSubmitData'](includeEmptyText);
                if (Ext.isObject(data)) {
                    Ext.iterate(data, function(name, val) {
                        if (includeEmptyText && val === '') {
                            val = field.emptyText || '';
                        }
                        if (name in values) {
                            var bucket = values[name],
                                isArray = Ext.isArray;
                            if (!isArray(bucket)) {
                                bucket = values[name] = [bucket];
                            }
                            if (isArray(val)) {
                                values[name] = bucket.concat(val);
                            } else {
                                bucket.push(val);
                            }
                        } else {
                            values[name] = val;
                        }
                    });
                }
            }
        });

        if (asString) {
            values = Ext.Object.toQueryString(values);
        }
        return values;
    },

    /**
     * Retrieves the fields in the form as a set of key/value pairs, using their
     * {@link Ext.form.field.Field#getModelData getModelData()} method to collect the values.
     * If multiple fields return values under the same name those values will be combined into an Array.
     * This is similar to {@link #getValues} except that this method collects type-specific data values
     * (e.g. Date objects for date fields) while getValues returns only String values for submission.
     * @param {Boolean} dirtyOnly (optional) If true, only fields that are dirty will be included in the result.
     * Defaults to false.
     * @return {Object}
     */
    getFieldValues: function(dirtyOnly) {
        return this.getValues(false, dirtyOnly, false, true);
    },

    /**
     * Clears all invalid field messages in this form.
     * @return {Ext.form.Basic} this
     */
    clearInvalid: function() {
        var me = this;
        me.batchLayouts(function() {
            me.getFields().each(function(f) {
                f.clearInvalid();
            });
        });
        return me;
    },

    /**
     * Resets all fields in this form.
     * @return {Ext.form.Basic} this
     */
    reset: function() {
        var me = this;
        me.batchLayouts(function() {
            me.getFields().each(function(f) {
                f.reset();
            });
        });
        return me;
    },

    /**
     * Calls {@link Ext#apply Ext.apply} for all fields in this form with the passed object.
     * @param {Object} obj The object to be applied
     * @return {Ext.form.Basic} this
     */
    applyToFields: function(obj) {
        this.getFields().each(function(f) {
            Ext.apply(f, obj);
        });
        return this;
    },

    /**
     * Calls {@link Ext#applyIf Ext.applyIf} for all field in this form with the passed object.
     * @param {Object} obj The object to be applied
     * @return {Ext.form.Basic} this
     */
    applyIfToFields: function(obj) {
        this.getFields().each(function(f) {
            Ext.applyIf(f, obj);
        });
        return this;
    },

    /**
     * @private
     * Utility wrapper that suspends layouts of all field parent containers for the duration of a given
     * function. Used during full-form validation and resets to prevent huge numbers of layouts.
     * @param {Function} fn
     */
    batchLayouts: function(fn) {
        var me = this,
            suspended = new Ext.util.HashMap();

        // Temporarily suspend layout on each field's immediate owner so we don't get a huge layout cascade
        me.getFields().each(function(field) {
            var ownerCt = field.ownerCt;
            if (!suspended.contains(ownerCt)) {
                suspended.add(ownerCt);
                ownerCt.oldSuspendLayout = ownerCt.suspendLayout;
                ownerCt.suspendLayout = true;
            }
        });

        // Invoke the function
        fn();

        // Un-suspend the container layouts
        suspended.each(function(id, ct) {
            ct.suspendLayout = ct.oldSuspendLayout;
            delete ct.oldSuspendLayout;
        });

        // Trigger a single layout
        me.owner.doComponentLayout();
    }
});

