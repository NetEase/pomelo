/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Don Griffin
 *
 * This class is a sequential id generator. A simple use of this class would be like so:
 *
 *     Ext.define('MyApp.data.MyModel', {
 *         extend: 'Ext.data.Model',
 *         idgen: 'sequential'
 *     });
 *     // assign id's of 1, 2, 3, etc.
 *
 * An example of a configured generator would be:
 *
 *     Ext.define('MyApp.data.MyModel', {
 *         extend: 'Ext.data.Model',
 *         idgen: {
 *             type: 'sequential',
 *             prefix: 'ID_',
 *             seed: 1000
 *         }
 *     });
 *     // assign id's of ID_1000, ID_1001, ID_1002, etc.
 *
 */
Ext.define('Ext.data.SequentialIdGenerator', {
    extend: 'Ext.data.IdGenerator',
    alias: 'idgen.sequential',

    constructor: function() {
        var me = this;

        me.callParent(arguments);

        me.parts = [ me.prefix, ''];
    },

    /**
     * @cfg {String} prefix
     * The string to place in front of the sequential number for each generated id. The
     * default is blank.
     */
    prefix: '',

    /**
     * @cfg {Number} seed
     * The number at which to start generating sequential id's. The default is 1.
     */
    seed: 1,

    /**
     * Generates and returns the next id.
     * @return {String} The next id.
     */
    generate: function () {
        var me = this,
            parts = me.parts;

        parts[1] = me.seed++;
        return parts.join('');
    }
});

