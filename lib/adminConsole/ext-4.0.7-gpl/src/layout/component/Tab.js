/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Component layout for tabs
 * @class Ext.layout.component.Tab
 * @extends Ext.layout.component.Button
 * @private
 */
Ext.define('Ext.layout.component.Tab', {

    alias: ['layout.tab'],

    extend: 'Ext.layout.component.Button',

    //type: 'button',

    beforeLayout: function() {
        var me = this, dirty = me.lastClosable !== me.owner.closable;

        if (dirty) {
            delete me.adjWidth;
        }

        return this.callParent(arguments) || dirty;
    },

    onLayout: function () {
        var me = this;

        me.callParent(arguments);

        me.lastClosable = me.owner.closable;
    }
});
