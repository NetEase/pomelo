/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.action.Load
 * @extends Ext.form.action.Action
 * <p>A class which handles loading of data from a server into the Fields of an {@link Ext.form.Basic}.</p>
 * <p>Instances of this class are only created by a {@link Ext.form.Basic Form} when
 * {@link Ext.form.Basic#load load}ing.</p>
 * <p><u><b>Response Packet Criteria</b></u></p>
 * <p>A response packet <b>must</b> contain:
 * <div class="mdetail-params"><ul>
 * <li><b><code>success</code></b> property : Boolean</li>
 * <li><b><code>data</code></b> property : Object</li>
 * <div class="sub-desc">The <code>data</code> property contains the values of Fields to load.
 * The individual value object for each Field is passed to the Field's
 * {@link Ext.form.field.Field#setValue setValue} method.</div></li>
 * </ul></div>
 * <p><u><b>JSON Packets</b></u></p>
 * <p>By default, response packets are assumed to be JSON, so for the following form load call:<pre><code>
var myFormPanel = new Ext.form.Panel({
    title: 'Client and routing info',
    items: [{
        fieldLabel: 'Client',
        name: 'clientName'
    }, {
        fieldLabel: 'Port of loading',
        name: 'portOfLoading'
    }, {
        fieldLabel: 'Port of discharge',
        name: 'portOfDischarge'
    }]
});
myFormPanel.{@link Ext.form.Panel#getForm getForm}().{@link Ext.form.Basic#load load}({
    url: '/getRoutingInfo.php',
    params: {
        consignmentRef: myConsignmentRef
    },
    failure: function(form, action) {
        Ext.Msg.alert("Load failed", action.result.errorMessage);
    }
});
</code></pre>
 * a <b>success response</b> packet may look like this:</p><pre><code>
{
    success: true,
    data: {
        clientName: "Fred. Olsen Lines",
        portOfLoading: "FXT",
        portOfDischarge: "OSL"
    }
}</code></pre>
 * while a <b>failure response</b> packet may look like this:</p><pre><code>
{
    success: false,
    errorMessage: "Consignment reference not found"
}</code></pre>
 * <p>Other data may be placed into the response for processing the {@link Ext.form.Basic Form}'s
 * callback or event handler methods. The object decoded from this JSON is available in the
 * {@link Ext.form.action.Action#result result} property.</p>
 */
Ext.define('Ext.form.action.Load', {
    extend:'Ext.form.action.Action',
    requires: ['Ext.data.Connection'],
    alternateClassName: 'Ext.form.Action.Load',
    alias: 'formaction.load',

    type: 'load',

    /**
     * @private
     */
    run: function() {
        Ext.Ajax.request(Ext.apply(
            this.createCallback(),
            {
                method: this.getMethod(),
                url: this.getUrl(),
                headers: this.headers,
                params: this.getParams()
            }
        ));
    },

    /**
     * @private
     */
    onSuccess: function(response){
        var result = this.processResponse(response),
            form = this.form;
        if (result === true || !result.success || !result.data) {
            this.failureType = Ext.form.action.Action.LOAD_FAILURE;
            form.afterAction(this, false);
            return;
        }
        form.clearInvalid();
        form.setValues(result.data);
        form.afterAction(this, true);
    },

    /**
     * @private
     */
    handleResponse: function(response) {
        var reader = this.form.reader,
            rs, data;
        if (reader) {
            rs = reader.read(response);
            data = rs.records && rs.records[0] ? rs.records[0].data : null;
            return {
                success : rs.success,
                data : data
            };
        }
        return Ext.decode(response.responseText);
    }
});


