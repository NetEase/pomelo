/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.action.DirectSubmit
 * @extends Ext.form.action.Submit
 * <p>Provides Ext.direct support for submitting form data.</p>
 * <p>This example illustrates usage of Ext.direct.Direct to <b>submit</b> a form through Ext.Direct.</p>
 * <pre><code>
var myFormPanel = new Ext.form.Panel({
    // configs for FormPanel
    title: 'Basic Information',
    renderTo: document.body,
    width: 300, height: 160,
    padding: 10,
    buttons:[{
        text: 'Submit',
        handler: function(){
            myFormPanel.getForm().submit({
                params: {
                    foo: 'bar',
                    uid: 34
                }
            });
        }
    }],

    // configs apply to child items
    defaults: {anchor: '100%'},
    defaultType: 'textfield',
    items: [{
        fieldLabel: 'Name',
        name: 'name'
    },{
        fieldLabel: 'Email',
        name: 'email'
    },{
        fieldLabel: 'Company',
        name: 'company'
    }],

    // configs for BasicForm
    api: {
        // The server-side method to call for load() requests
        load: Profile.getBasicInfo,
        // The server-side must mark the submit handler as a 'formHandler'
        submit: Profile.updateBasicInfo
    },
    // specify the order for the passed params
    paramOrder: ['uid', 'foo']
});
 * </code></pre>
 * The data packet sent to the server will resemble something like:
 * <pre><code>
{
    "action":"Profile","method":"updateBasicInfo","type":"rpc","tid":"6",
    "result":{
        "success":true,
        "id":{
            "extAction":"Profile","extMethod":"updateBasicInfo",
            "extType":"rpc","extTID":"6","extUpload":"false",
            "name":"Aaron Conran","email":"aaron@sencha.com","company":"Sencha Inc."
        }
    }
}
 * </code></pre>
 * The form will process a data packet returned by the server that is similar
 * to the following:
 * <pre><code>
// sample success packet (batched requests)
[
    {
        "action":"Profile","method":"updateBasicInfo","type":"rpc","tid":3,
        "result":{
            "success":true
        }
    }
]

// sample failure packet (one request)
{
        "action":"Profile","method":"updateBasicInfo","type":"rpc","tid":"6",
        "result":{
            "errors":{
                "email":"already taken"
            },
            "success":false,
            "foo":"bar"
        }
}
 * </code></pre>
 * Also see the discussion in {@link Ext.form.action.DirectLoad}.
 */
Ext.define('Ext.form.action.DirectSubmit', {
    extend:'Ext.form.action.Submit',
    requires: ['Ext.direct.Manager'],
    alternateClassName: 'Ext.form.Action.DirectSubmit',
    alias: 'formaction.directsubmit',

    type: 'directsubmit',

    doSubmit: function() {
        var me = this,
            callback = Ext.Function.bind(me.onSuccess, me),
            formEl = me.buildForm();
        me.form.api.submit(formEl, callback, me);
        Ext.removeNode(formEl);
    },

    // Direct actions have already been processed and therefore
    // we can directly set the result; Direct Actions do not have
    // a this.response property.
    processResponse: function(result) {
        return (this.result = result);
    },

    onSuccess: function(response, trans) {
        if (trans.type === Ext.direct.Manager.self.exceptions.SERVER) {
            response = {};
        }
        this.callParent([response]);
    }
});

