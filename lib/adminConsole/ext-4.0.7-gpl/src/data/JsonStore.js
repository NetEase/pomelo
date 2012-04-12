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
 * @class Ext.data.JsonStore
 * @extends Ext.data.Store
 * @ignore
 *
 * <p>Small helper class to make creating {@link Ext.data.Store}s from JSON data easier.
 * A JsonStore will be automatically configured with a {@link Ext.data.reader.Json}.</p>
 *
 * <p>A store configuration would be something like:</p>
 *
<pre><code>
var store = new Ext.data.JsonStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore',

    proxy: {
        type: 'ajax',
        url: 'get-images.php',
        reader: {
            type: 'json',
            root: 'images',
            idProperty: 'name'
        }
    },

    //alternatively, a {@link Ext.data.Model} name can be given (see {@link Ext.data.Store} for an example)
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
});
</code></pre>
 *
 * <p>This store is configured to consume a returned object of the form:<pre><code>
{
    images: [
        {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
        {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
    ]
}
</code></pre>
 *
 * <p>An object literal of this form could also be used as the {@link #data} config option.</p>
 *
 * @xtype jsonstore
 */
Ext.define('Ext.data.JsonStore',  {
    extend: 'Ext.data.Store',
    alias: 'store.json',

    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config) {
        config = config || {};

        Ext.applyIf(config, {
            proxy: {
                type  : 'ajax',
                reader: 'json',
                writer: 'json'
            }
        });

        this.callParent([config]);
    }
});

