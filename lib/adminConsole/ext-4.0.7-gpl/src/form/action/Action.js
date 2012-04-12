/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.action.Action
 * @extends Ext.Base
 * <p>The subclasses of this class provide actions to perform upon {@link Ext.form.Basic Form}s.</p>
 * <p>Instances of this class are only created by a {@link Ext.form.Basic Form} when
 * the Form needs to perform an action such as submit or load. The Configuration options
 * listed for this class are set through the Form's action methods: {@link Ext.form.Basic#submit submit},
 * {@link Ext.form.Basic#load load} and {@link Ext.form.Basic#doAction doAction}</p>
 * <p>The instance of Action which performed the action is passed to the success
 * and failure callbacks of the Form's action methods ({@link Ext.form.Basic#submit submit},
 * {@link Ext.form.Basic#load load} and {@link Ext.form.Basic#doAction doAction}),
 * and to the {@link Ext.form.Basic#actioncomplete actioncomplete} and
 * {@link Ext.form.Basic#actionfailed actionfailed} event handlers.</p>
 */
Ext.define('Ext.form.action.Action', {
    alternateClassName: 'Ext.form.Action',

    /**
     * @cfg {Ext.form.Basic} form The {@link Ext.form.Basic BasicForm} instance that
     * is invoking this Action. Required.
     */

    /**
     * @cfg {String} url The URL that the Action is to invoke. Will default to the {@link Ext.form.Basic#url url}
     * configured on the {@link #form}.
     */

    /**
     * @cfg {Boolean} reset When set to <tt><b>true</b></tt>, causes the Form to be
     * {@link Ext.form.Basic#reset reset} on Action success. If specified, this happens
     * before the {@link #success} callback is called and before the Form's
     * {@link Ext.form.Basic#actioncomplete actioncomplete} event fires.
     */

    /**
     * @cfg {String} method The HTTP method to use to access the requested URL. Defaults to the
     * {@link Ext.form.Basic#method BasicForm's method}, or 'POST' if not specified.
     */

    /**
     * @cfg {Object/String} params <p>Extra parameter values to pass. These are added to the Form's
     * {@link Ext.form.Basic#baseParams} and passed to the specified URL along with the Form's
     * input fields.</p>
     * <p>Parameters are encoded as standard HTTP parameters using {@link Ext#urlEncode Ext.Object.toQueryString}.</p>
     */

    /**
     * @cfg {Object} headers <p>Extra headers to be sent in the AJAX request for submit and load actions. See
     * {@link Ext.data.proxy.Ajax#headers}.</p>
     */

    /**
     * @cfg {Number} timeout The number of seconds to wait for a server response before
     * failing with the {@link #failureType} as {@link Ext.form.action.Action#CONNECT_FAILURE}. If not specified,
     * defaults to the configured <tt>{@link Ext.form.Basic#timeout timeout}</tt> of the
     * {@link #form}.
     */

    /**
     * @cfg {Function} success The function to call when a valid success return packet is received.
     * The function is passed the following parameters:<ul class="mdetail-params">
     * <li><b>form</b> : Ext.form.Basic<div class="sub-desc">The form that requested the action</div></li>
     * <li><b>action</b> : Ext.form.action.Action<div class="sub-desc">The Action class. The {@link #result}
     * property of this object may be examined to perform custom postprocessing.</div></li>
     * </ul>
     */

    /**
     * @cfg {Function} failure The function to call when a failure packet was received, or when an
     * error ocurred in the Ajax communication.
     * The function is passed the following parameters:<ul class="mdetail-params">
     * <li><b>form</b> : Ext.form.Basic<div class="sub-desc">The form that requested the action</div></li>
     * <li><b>action</b> : Ext.form.action.Action<div class="sub-desc">The Action class. If an Ajax
     * error ocurred, the failure type will be in {@link #failureType}. The {@link #result}
     * property of this object may be examined to perform custom postprocessing.</div></li>
     * </ul>
     */

    /**
     * @cfg {Object} scope The scope in which to call the configured <tt>success</tt> and <tt>failure</tt>
     * callback functions (the <tt>this</tt> reference for the callback functions).
     */

    /**
     * @cfg {String} waitMsg The message to be displayed by a call to {@link Ext.window.MessageBox#wait}
     * during the time the action is being processed.
     */

    /**
     * @cfg {String} waitTitle The title to be displayed by a call to {@link Ext.window.MessageBox#wait}
     * during the time the action is being processed.
     */

    /**
     * @cfg {Boolean} submitEmptyText If set to <tt>true</tt>, the emptyText value will be sent with the form
     * when it is submitted. Defaults to <tt>true</tt>.
     */
    submitEmptyText : true,
    /**
     * @property type
     * The type of action this Action instance performs.
     * Currently only "submit" and "load" are supported.
     * @type {String}
     */

    /**
     * The type of failure detected will be one of these: {@link Ext.form.action.Action#CLIENT_INVALID},
     * {@link Ext.form.action.Action#SERVER_INVALID}, {@link Ext.form.action.Action#CONNECT_FAILURE}, or
     * {@link Ext.form.action.Action#LOAD_FAILURE}.  Usage:
     * <pre><code>
var fp = new Ext.form.Panel({
...
buttons: [{
    text: 'Save',
    formBind: true,
    handler: function(){
        if(fp.getForm().isValid()){
            fp.getForm().submit({
                url: 'form-submit.php',
                waitMsg: 'Submitting your data...',
                success: function(form, action){
                    // server responded with success = true
                    var result = action.{@link #result};
                },
                failure: function(form, action){
                    if (action.{@link #failureType} === {@link Ext.form.action.Action#CONNECT_FAILURE}) {
                        Ext.Msg.alert('Error',
                            'Status:'+action.{@link #response}.status+': '+
                            action.{@link #response}.statusText);
                    }
                    if (action.failureType === {@link Ext.form.action.Action#SERVER_INVALID}){
                        // server responded with success = false
                        Ext.Msg.alert('Invalid', action.{@link #result}.errormsg);
                    }
                }
            });
        }
    }
},{
    text: 'Reset',
    handler: function(){
        fp.getForm().reset();
    }
}]
     * </code></pre>
     * @property failureType
     * @type {String}
     */

    /**
     * The raw XMLHttpRequest object used to perform the action.
     * @property response
     * @type {Object}
     */

    /**
     * The decoded response object containing a boolean <tt>success</tt> property and
     * other, action-specific properties.
     * @property result
     * @type {Object}
     */

    /**
     * Creates new Action.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        if (config) {
            Ext.apply(this, config);
        }

        // Normalize the params option to an Object
        var params = config.params;
        if (Ext.isString(params)) {
            this.params = Ext.Object.fromQueryString(params);
        }
    },

    /**
     * Invokes this action using the current configuration.
     */
    run: Ext.emptyFn,

    /**
     * @private
     * @method onSuccess
     * Callback method that gets invoked when the action completes successfully. Must be implemented by subclasses.
     * @param {Object} response
     */

    /**
     * @private
     * @method handleResponse
     * Handles the raw response and builds a result object from it. Must be implemented by subclasses.
     * @param {Object} response
     */

    /**
     * @private
     * Handles a failure response.
     * @param {Object} response
     */
    onFailure : function(response){
        this.response = response;
        this.failureType = Ext.form.action.Action.CONNECT_FAILURE;
        this.form.afterAction(this, false);
    },

    /**
     * @private
     * Validates that a response contains either responseText or responseXML and invokes
     * {@link #handleResponse} to build the result object.
     * @param {Object} response The raw response object.
     * @return {Object/Boolean} result The result object as built by handleResponse, or <tt>true</tt> if
     *                         the response had empty responseText and responseXML.
     */
    processResponse : function(response){
        this.response = response;
        if (!response.responseText && !response.responseXML) {
            return true;
        }
        return (this.result = this.handleResponse(response));
    },

    /**
     * @private
     * Build the URL for the AJAX request. Used by the standard AJAX submit and load actions.
     * @return {String} The URL.
     */
    getUrl: function() {
        return this.url || this.form.url;
    },

    /**
     * @private
     * Determine the HTTP method to be used for the request.
     * @return {String} The HTTP method
     */
    getMethod: function() {
        return (this.method || this.form.method || 'POST').toUpperCase();
    },

    /**
     * @private
     * Get the set of parameters specified in the BasicForm's baseParams and/or the params option.
     * Items in params override items of the same name in baseParams.
     * @return {Object} the full set of parameters
     */
    getParams: function() {
        return Ext.apply({}, this.params, this.form.baseParams);
    },

    /**
     * @private
     * Creates a callback object.
     */
    createCallback: function() {
        var me = this,
            undef,
            form = me.form;
        return {
            success: me.onSuccess,
            failure: me.onFailure,
            scope: me,
            timeout: (this.timeout * 1000) || (form.timeout * 1000),
            upload: form.fileUpload ? me.onSuccess : undef
        };
    },

    statics: {
        /**
         * @property CLIENT_INVALID
         * Failure type returned when client side validation of the Form fails
         * thus aborting a submit action. Client side validation is performed unless
         * {@link Ext.form.action.Submit#clientValidation} is explicitly set to <tt>false</tt>.
         * @type {String}
         * @static
         */
        CLIENT_INVALID: 'client',

        /**
         * @property SERVER_INVALID
         * <p>Failure type returned when server side processing fails and the {@link #result}'s
         * <tt>success</tt> property is set to <tt>false</tt>.</p>
         * <p>In the case of a form submission, field-specific error messages may be returned in the
         * {@link #result}'s <tt>errors</tt> property.</p>
         * @type {String}
         * @static
         */
        SERVER_INVALID: 'server',

        /**
         * @property CONNECT_FAILURE
         * Failure type returned when a communication error happens when attempting
         * to send a request to the remote server. The {@link #response} may be examined to
         * provide further information.
         * @type {String}
         * @static
         */
        CONNECT_FAILURE: 'connect',

        /**
         * @property LOAD_FAILURE
         * Failure type returned when the response's <tt>success</tt>
         * property is set to <tt>false</tt>, or no field values are returned in the response's
         * <tt>data</tt> property.
         * @type {String}
         * @static
         */
        LOAD_FAILURE: 'load'


    }
});

