/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.data.writer.Json
 * @extends Ext.data.writer.Writer

This class is used to write {@link Ext.data.Model} data to the server in a JSON format.
The {@link #allowSingle} configuration can be set to false to force the records to always be
encoded in an array, even if there is only a single record being sent.

 * @markdown
 */
Ext.define('Ext.data.writer.Json', {
    extend: 'Ext.data.writer.Writer',
    alternateClassName: 'Ext.data.JsonWriter',
    alias: 'writer.json',
    
    /**
     * @cfg {String} root The key under which the records in this Writer will be placed. Defaults to <tt>undefined</tt>.
     * Example generated request, using root: 'records':
<pre><code>
{'records': [{name: 'my record'}, {name: 'another record'}]}
</code></pre>
     */
    root: undefined,
    
    /**
     * @cfg {Boolean} encode True to use Ext.encode() on the data before sending. Defaults to <tt>false</tt>.
     * The encode option should only be set to true when a {@link #root} is defined, because the values will be
     * sent as part of the request parameters as opposed to a raw post. The root will be the name of the parameter
     * sent to the server.
     */
    encode: false,
    
    /**
     * @cfg {Boolean} allowSingle False to ensure that records are always wrapped in an array, even if there is only
     * one record being sent. When there is more than one record, they will always be encoded into an array.
     * Defaults to <tt>true</tt>. Example:
     * <pre><code>
// with allowSingle: true
"root": {
    "first": "Mark",
    "last": "Corrigan"
}

// with allowSingle: false
"root": [{
    "first": "Mark",
    "last": "Corrigan"
}]
     * </code></pre>
     */
    allowSingle: true,
    
    //inherit docs
    writeRecords: function(request, data) {
        var root = this.root;
        
        if (this.allowSingle && data.length == 1) {
            // convert to single object format
            data = data[0];
        }
        
        if (this.encode) {
            if (root) {
                // sending as a param, need to encode
                request.params[root] = Ext.encode(data);
            } else {
                //<debug>
                Ext.Error.raise('Must specify a root when using encode');
                //</debug>
            }
        } else {
            // send as jsonData
            request.jsonData = request.jsonData || {};
            if (root) {
                request.jsonData[root] = data;
            } else {
                request.jsonData = data;
            }
        }
        return request;
    }
});

