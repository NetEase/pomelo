/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.action.Submit
 * @extends Ext.form.action.Action
 * <p>A class which handles submission of data from {@link Ext.form.Basic Form}s
 * and processes the returned response.</p>
 * <p>Instances of this class are only created by a {@link Ext.form.Basic Form} when
 * {@link Ext.form.Basic#submit submit}ting.</p>
 * <p><u><b>Response Packet Criteria</b></u></p>
 * <p>A response packet may contain:
 * <div class="mdetail-params"><ul>
 * <li><b><code>success</code></b> property : Boolean
 * <div class="sub-desc">The <code>success</code> property is required.</div></li>
 * <li><b><code>errors</code></b> property : Object
 * <div class="sub-desc"><div class="sub-desc">The <code>errors</code> property,
 * which is optional, contains error messages for invalid fields.</div></li>
 * </ul></div>
 * <p><u><b>JSON Packets</b></u></p>
 * <p>By default, response packets are assumed to be JSON, so a typical response
 * packet may look like this:</p><pre><code>
{
    success: false,
    errors: {
        clientCode: "Client not found",
        portOfLoading: "This field must not be null"
    }
}</code></pre>
 * <p>Other data may be placed into the response for processing by the {@link Ext.form.Basic}'s callback
 * or event handler methods. The object decoded from this JSON is available in the
 * {@link Ext.form.action.Action#result result} property.</p>
 * <p>Alternatively, if an {@link Ext.form.Basic#errorReader errorReader} is specified as an {@link Ext.data.reader.Xml XmlReader}:</p><pre><code>
    errorReader: new Ext.data.reader.Xml({
            record : 'field',
            success: '@success'
        }, [
            'id', 'msg'
        ]
    )
</code></pre>
 * <p>then the results may be sent back in XML format:</p><pre><code>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;message success="false"&gt;
&lt;errors&gt;
    &lt;field&gt;
        &lt;id&gt;clientCode&lt;/id&gt;
        &lt;msg&gt;&lt;![CDATA[Code not found. &lt;br /&gt;&lt;i&gt;This is a test validation message from the server &lt;/i&gt;]]&gt;&lt;/msg&gt;
    &lt;/field&gt;
    &lt;field&gt;
        &lt;id&gt;portOfLoading&lt;/id&gt;
        &lt;msg&gt;&lt;![CDATA[Port not found. &lt;br /&gt;&lt;i&gt;This is a test validation message from the server &lt;/i&gt;]]&gt;&lt;/msg&gt;
    &lt;/field&gt;
&lt;/errors&gt;
&lt;/message&gt;
</code></pre>
 * <p>Other elements may be placed into the response XML for processing by the {@link Ext.form.Basic}'s callback
 * or event handler methods. The XML document is available in the {@link Ext.form.Basic#errorReader errorReader}'s
 * {@link Ext.data.reader.Xml#xmlData xmlData} property.</p>
 */
Ext.define('Ext.form.action.Submit', {
    extend:'Ext.form.action.Action',
    alternateClassName: 'Ext.form.Action.Submit',
    alias: 'formaction.submit',

    type: 'submit',

    /**
     * @cfg {Boolean} clientValidation Determines whether a Form's fields are validated
     * in a final call to {@link Ext.form.Basic#isValid isValid} prior to submission.
     * Pass <tt>false</tt> in the Form's submit options to prevent this. Defaults to true.
     */

    // inherit docs
    run : function(){
        var form = this.form;
        if (this.clientValidation === false || form.isValid()) {
            this.doSubmit();
        } else {
            // client validation failed
            this.failureType = Ext.form.action.Action.CLIENT_INVALID;
            form.afterAction(this, false);
        }
    },

    /**
     * @private
     * Perform the submit of the form data.
     */
    doSubmit: function() {
        var formEl,
            ajaxOptions = Ext.apply(this.createCallback(), {
                url: this.getUrl(),
                method: this.getMethod(),
                headers: this.headers
            });

        // For uploads we need to create an actual form that contains the file upload fields,
        // and pass that to the ajax call so it can do its iframe-based submit method.
        if (this.form.hasUpload()) {
            formEl = ajaxOptions.form = this.buildForm();
            ajaxOptions.isUpload = true;
        } else {
            ajaxOptions.params = this.getParams();
        }

        Ext.Ajax.request(ajaxOptions);

        if (formEl) {
            Ext.removeNode(formEl);
        }
    },

    /**
     * @private
     * Build the full set of parameters from the field values plus any additional configured params.
     */
    getParams: function() {
        var nope = false,
            configParams = this.callParent(),
            fieldParams = this.form.getValues(nope, nope, this.submitEmptyText !== nope);
        return Ext.apply({}, fieldParams, configParams);
    },

    /**
     * @private
     * Build a form element containing fields corresponding to all the parameters to be
     * submitted (everything returned by {@link #getParams}.
     * NOTE: the form element is automatically added to the DOM, so any code that uses
     * it must remove it from the DOM after finishing with it.
     * @return HTMLFormElement
     */
    buildForm: function() {
        var fieldsSpec = [],
            formSpec,
            formEl,
            basicForm = this.form,
            params = this.getParams(),
            uploadFields = [];

        basicForm.getFields().each(function(field) {
            if (field.isFileUpload()) {
                uploadFields.push(field);
            }
        });

        function addField(name, val) {
            fieldsSpec.push({
                tag: 'input',
                type: 'hidden',
                name: name,
                value: Ext.String.htmlEncode(val)
            });
        }

        // Add the form field values
        Ext.iterate(params, function(key, val) {
            if (Ext.isArray(val)) {
                Ext.each(val, function(v) {
                    addField(key, v);
                });
            } else {
                addField(key, val);
            }
        });

        formSpec = {
            tag: 'form',
            action: this.getUrl(),
            method: this.getMethod(),
            target: this.target || '_self',
            style: 'display:none',
            cn: fieldsSpec
        };

        // Set the proper encoding for file uploads
        if (uploadFields.length) {
            formSpec.encoding = formSpec.enctype = 'multipart/form-data';
        }

        // Create the form
        formEl = Ext.DomHelper.append(Ext.getBody(), formSpec);

        // Special handling for file upload fields: since browser security measures prevent setting
        // their values programatically, and prevent carrying their selected values over when cloning,
        // we have to move the actual field instances out of their components and into the form.
        Ext.Array.each(uploadFields, function(field) {
            if (field.rendered) { // can only have a selected file value after being rendered
                formEl.appendChild(field.extractFileInput());
            }
        });

        return formEl;
    },



    /**
     * @private
     */
    onSuccess: function(response) {
        var form = this.form,
            success = true,
            result = this.processResponse(response);
        if (result !== true && !result.success) {
            if (result.errors) {
                form.markInvalid(result.errors);
            }
            this.failureType = Ext.form.action.Action.SERVER_INVALID;
            success = false;
        }
        form.afterAction(this, success);
    },

    /**
     * @private
     */
    handleResponse: function(response) {
        var form = this.form,
            errorReader = form.errorReader,
            rs, errors, i, len, records;
        if (errorReader) {
            rs = errorReader.read(response);
            records = rs.records;
            errors = [];
            if (records) {
                for(i = 0, len = records.length; i < len; i++) {
                    errors[i] = records[i].data;
                }
            }
            if (errors.length < 1) {
                errors = null;
            }
            return {
                success : rs.success,
                errors : errors
            };
        }
        return Ext.decode(response.responseText);
    }
});

