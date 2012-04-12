/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.action.DirectLoad
 * @extends Ext.form.action.Load
 * <p>Provides {@link Ext.direct.Manager} support for loading form data.</p>
 * <p>This example illustrates usage of Ext.direct.Direct to <b>load</b> a form through Ext.Direct.</p>
 * <pre><code>
var myFormPanel = new Ext.form.Panel({
    // configs for FormPanel
    title: 'Basic Information',
    renderTo: document.body,
    width: 300, height: 160,
    padding: 10,

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

// load the form
myFormPanel.getForm().load({
    // pass 2 arguments to server side getBasicInfo method (len=2)
    params: {
        foo: 'bar',
        uid: 34
    }
});
 * </code></pre>
 * The data packet sent to the server will resemble something like:
 * <pre><code>
[
    {
        "action":"Profile","method":"getBasicInfo","type":"rpc","tid":2,
        "data":[34,"bar"] // note the order of the params
    }
]
 * </code></pre>
 * The form will process a data packet returned by the server that is similar
 * to the following format:
 * <pre><code>
[
    {
        "action":"Profile","method":"getBasicInfo","type":"rpc","tid":2,
        "result":{
            "success":true,
            "data":{
                "name":"Fred Flintstone",
                "company":"Slate Rock and Gravel",
                "email":"fred.flintstone@slaterg.com"
            }
        }
    }
]
 * </code></pre>
 */
Ext.define('Ext.form.action.DirectLoad', {
    extend:'Ext.form.action.Load',
    requires: ['Ext.direct.Manager'],
    alternateClassName: 'Ext.form.Action.DirectLoad',
    alias: 'formaction.directload',

    type: 'directload',

    run: function() {
        this.form.api.load.apply(window, this.getArgs());
    },

    /**
     * @private
     * Build the arguments to be sent to the Direct call.
     * @return Array
     */
    getArgs: function() {
        var me = this,
            args = [],
            form = me.form,
            paramOrder = form.paramOrder,
            params = me.getParams(),
            i, len;

        // If a paramOrder was specified, add the params into the argument list in that order.
        if (paramOrder) {
            for (i = 0, len = paramOrder.length; i < len; i++) {
                args.push(params[paramOrder[i]]);
            }
        }
        // If paramsAsHash was specified, add all the params as a single object argument.
        else if (form.paramsAsHash) {
            args.push(params);
        }

        // Add the callback and scope to the end of the arguments list
        args.push(me.onSuccess, me);

        return args;
    },

    // Direct actions have already been processed and therefore
    // we can directly set the result; Direct Actions do not have
    // a this.response property.
    processResponse: function(result) {
        return (this.result = result);
    },

    onSuccess: function(result, trans) {
        if (trans.type == Ext.direct.Manager.self.exceptions.SERVER) {
            result = {};
        }
        this.callParent([result]);
    }
});



