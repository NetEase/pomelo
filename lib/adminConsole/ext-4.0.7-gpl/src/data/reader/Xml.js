/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 * @class Ext.data.reader.Xml
 * @extends Ext.data.reader.Reader
 *
 * <p>The XML Reader is used by a Proxy to read a server response that is sent back in XML format. This usually
 * happens as a result of loading a Store - for example we might create something like this:</p>
 *
<pre><code>
Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name', 'email']
});

var store = Ext.create('Ext.data.Store', {
    model: 'User',
    proxy: {
        type: 'ajax',
        url : 'users.xml',
        reader: {
            type: 'xml',
            record: 'user'
        }
    }
});
</code></pre>
 *
 * <p>The example above creates a 'User' model. Models are explained in the {@link Ext.data.Model Model} docs if you're
 * not already familiar with them.</p>
 *
 * <p>We created the simplest type of XML Reader possible by simply telling our {@link Ext.data.Store Store}'s
 * {@link Ext.data.proxy.Proxy Proxy} that we want a XML Reader. The Store automatically passes the configured model to the
 * Store, so it is as if we passed this instead:
 *
<pre><code>
reader: {
    type : 'xml',
    model: 'User',
    record: 'user'
}
</code></pre>
 *
 * <p>The reader we set up is ready to read data from our server - at the moment it will accept a response like this:</p>
 *
<pre><code>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;user&gt;
    &lt;id&gt;1&lt;/id&gt;
    &lt;name&gt;Ed Spencer&lt;/name&gt;
    &lt;email&gt;ed@sencha.com&lt;/email&gt;
&lt;/user&gt;
&lt;user&gt;
    &lt;id&gt;2&lt;/id&gt;
    &lt;name&gt;Abe Elias&lt;/name&gt;
    &lt;email&gt;abe@sencha.com&lt;/email&gt;
&lt;/user&gt;
</code></pre>
 *
 * <p>The XML Reader uses the configured {@link #record} option to pull out the data for each record - in this case we
 * set record to 'user', so each &lt;user&gt; above will be converted into a User model.</p>
 *
 * <p><u>Reading other XML formats</u></p>
 *
 * <p>If you already have your XML format defined and it doesn't look quite like what we have above, you can usually
 * pass XmlReader a couple of configuration options to make it parse your format. For example, we can use the
 * {@link #root} configuration to parse data that comes back like this:</p>
 *
<pre><code>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;users&gt;
    &lt;user&gt;
        &lt;id&gt;1&lt;/id&gt;
        &lt;name&gt;Ed Spencer&lt;/name&gt;
        &lt;email&gt;ed@sencha.com&lt;/email&gt;
    &lt;/user&gt;
    &lt;user&gt;
        &lt;id&gt;2&lt;/id&gt;
        &lt;name&gt;Abe Elias&lt;/name&gt;
        &lt;email&gt;abe@sencha.com&lt;/email&gt;
    &lt;/user&gt;
&lt;/users&gt;
</code></pre>
 *
 * <p>To parse this we just pass in a {@link #root} configuration that matches the 'users' above:</p>
 *
<pre><code>
reader: {
    type  : 'xml',
    root  : 'users',
    record: 'user'
}
</code></pre>
 *
 * <p>Note that XmlReader doesn't care whether your {@link #root} and {@link #record} elements are nested deep inside
 * a larger structure, so a response like this will still work:
 *
<pre><code>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;deeply&gt;
    &lt;nested&gt;
        &lt;xml&gt;
            &lt;users&gt;
                &lt;user&gt;
                    &lt;id&gt;1&lt;/id&gt;
                    &lt;name&gt;Ed Spencer&lt;/name&gt;
                    &lt;email&gt;ed@sencha.com&lt;/email&gt;
                &lt;/user&gt;
                &lt;user&gt;
                    &lt;id&gt;2&lt;/id&gt;
                    &lt;name&gt;Abe Elias&lt;/name&gt;
                    &lt;email&gt;abe@sencha.com&lt;/email&gt;
                &lt;/user&gt;
            &lt;/users&gt;
        &lt;/xml&gt;
    &lt;/nested&gt;
&lt;/deeply&gt;
</code></pre>
 *
 * <p><u>Response metadata</u></p>
 *
 * <p>The server can return additional data in its response, such as the {@link #totalProperty total number of records}
 * and the {@link #successProperty success status of the response}. These are typically included in the XML response
 * like this:</p>
 *
<pre><code>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;total&gt;100&lt;/total&gt;
&lt;success&gt;true&lt;/success&gt;
&lt;users&gt;
    &lt;user&gt;
        &lt;id&gt;1&lt;/id&gt;
        &lt;name&gt;Ed Spencer&lt;/name&gt;
        &lt;email&gt;ed@sencha.com&lt;/email&gt;
    &lt;/user&gt;
    &lt;user&gt;
        &lt;id&gt;2&lt;/id&gt;
        &lt;name&gt;Abe Elias&lt;/name&gt;
        &lt;email&gt;abe@sencha.com&lt;/email&gt;
    &lt;/user&gt;
&lt;/users&gt;
</code></pre>
 *
 * <p>If these properties are present in the XML response they can be parsed out by the XmlReader and used by the
 * Store that loaded it. We can set up the names of these properties by specifying a final pair of configuration
 * options:</p>
 *
<pre><code>
reader: {
    type: 'xml',
    root: 'users',
    totalProperty  : 'total',
    successProperty: 'success'
}
</code></pre>
 *
 * <p>These final options are not necessary to make the Reader work, but can be useful when the server needs to report
 * an error or if it needs to indicate that there is a lot of data available of which only a subset is currently being
 * returned.</p>
 *
 * <p><u>Response format</u></p>
 *
 * <p><b>Note:</b> in order for the browser to parse a returned XML document, the Content-Type header in the HTTP
 * response must be set to "text/xml" or "application/xml". This is very important - the XmlReader will not
 * work correctly otherwise.</p>
 */
Ext.define('Ext.data.reader.Xml', {
    extend: 'Ext.data.reader.Reader',
    alternateClassName: 'Ext.data.XmlReader',
    alias : 'reader.xml',

    /**
     * @cfg {String} record (required)
     * The DomQuery path to the repeated element which contains record information.
     */

    /**
     * @private
     * Creates a function to return some particular key of data from a response. The totalProperty and
     * successProperty are treated as special cases for type casting, everything else is just a simple selector.
     * @param {String} key
     * @return {Function}
     */
    createAccessor: function(expr) {
        var me = this;

        if (Ext.isEmpty(expr)) {
            return Ext.emptyFn;
        }

        if (Ext.isFunction(expr)) {
            return expr;
        }

        return function(root) {
            return me.getNodeValue(Ext.DomQuery.selectNode(expr, root));
        };
    },

    getNodeValue: function(node) {
        if (node && node.firstChild) {
            return node.firstChild.nodeValue;
        }
        return undefined;
    },

    //inherit docs
    getResponseData: function(response) {
        var xml = response.responseXML;

        //<debug>
        if (!xml) {
            Ext.Error.raise({
                response: response,
                msg: 'XML data not found in the response'
            });
        }
        //</debug>

        return xml;
    },

    /**
     * Normalizes the data object
     * @param {Object} data The raw data object
     * @return {Object} Returns the documentElement property of the data object if present, or the same object if not
     */
    getData: function(data) {
        return data.documentElement || data;
    },

    /**
     * @private
     * Given an XML object, returns the Element that represents the root as configured by the Reader's meta data
     * @param {Object} data The XML data object
     * @return {XMLElement} The root node element
     */
    getRoot: function(data) {
        var nodeName = data.nodeName,
            root     = this.root;

        if (!root || (nodeName && nodeName == root)) {
            return data;
        } else if (Ext.DomQuery.isXml(data)) {
            // This fix ensures we have XML data
            // Related to TreeStore calling getRoot with the root node, which isn't XML
            // Probably should be resolved in TreeStore at some point
            return Ext.DomQuery.selectNode(root, data);
        }
    },

    /**
     * @private
     * We're just preparing the data for the superclass by pulling out the record nodes we want
     * @param {XMLElement} root The XML root node
     * @return {Ext.data.Model[]} The records
     */
    extractData: function(root) {
        var recordName = this.record;

        //<debug>
        if (!recordName) {
            Ext.Error.raise('Record is a required parameter');
        }
        //</debug>

        if (recordName != root.nodeName) {
            root = Ext.DomQuery.select(recordName, root);
        } else {
            root = [root];
        }
        return this.callParent([root]);
    },

    /**
     * @private
     * See Ext.data.reader.Reader's getAssociatedDataRoot docs
     * @param {Object} data The raw data object
     * @param {String} associationName The name of the association to get data for (uses associationKey if present)
     * @return {XMLElement} The root
     */
    getAssociatedDataRoot: function(data, associationName) {
        return Ext.DomQuery.select(associationName, data)[0];
    },

    /**
     * Parses an XML document and returns a ResultSet containing the model instances
     * @param {Object} doc Parsed XML document
     * @return {Ext.data.ResultSet} The parsed result set
     */
    readRecords: function(doc) {
        //it's possible that we get passed an array here by associations. Make sure we strip that out (see Ext.data.reader.Reader#readAssociated)
        if (Ext.isArray(doc)) {
            doc = doc[0];
        }

        /**
         * @deprecated will be removed in Ext JS 5.0. This is just a copy of this.rawData - use that instead
         * @property xmlData
         * @type Object
         */
        this.xmlData = doc;
        return this.callParent([doc]);
    }
});
