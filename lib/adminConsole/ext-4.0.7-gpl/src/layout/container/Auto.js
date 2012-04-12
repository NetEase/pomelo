/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.Auto
 * @extends Ext.layout.container.Container
 *
 * The AutoLayout is the default layout manager delegated by {@link Ext.container.Container} to
 * render any child Components when no `{@link Ext.container.Container#layout layout}` is configured into
 * a `{@link Ext.container.Container Container}.` AutoLayout provides only a passthrough of any layout calls
 * to any child containers.
 *
 *     @example
 *     Ext.create('Ext.Panel', {
 *         width: 500,
 *         height: 280,
 *         title: "AutoLayout Panel",
 *         layout: 'auto',
 *         renderTo: document.body,
 *         items: [{
 *             xtype: 'panel',
 *             title: 'Top Inner Panel',
 *             width: '75%',
 *             height: 90
 *         },
 *         {
 *             xtype: 'panel',
 *             title: 'Bottom Inner Panel',
 *             width: '75%',
 *             height: 90
 *         }]
 *     });
 */
Ext.define('Ext.layout.container.Auto', {

    /* Begin Definitions */

    alias: ['layout.auto', 'layout.autocontainer'],

    extend: 'Ext.layout.container.Container',

    /* End Definitions */

    type: 'autocontainer',

    bindToOwnerCtComponent: true,

    // @private
    onLayout : function(owner, target) {
        var me = this,
            items = me.getLayoutItems(),
            ln = items.length,
            i;

        // Ensure the Container is only primed with the clear element if there are child items.
        if (ln) {
            // Auto layout uses natural HTML flow to arrange the child items.
            // To ensure that all browsers (I'm looking at you IE!) add the bottom margin of the last child to the
            // containing element height, we create a zero-sized element with style clear:both to force a "new line"
            if (!me.clearEl) {
                me.clearEl = me.getRenderTarget().createChild({
                    cls: Ext.baseCSSPrefix + 'clear',
                    role: 'presentation'
                });
            }

            // Auto layout allows CSS to size its child items.
            for (i = 0; i < ln; i++) {
                me.setItemSize(items[i]);
            }
        }
    },

    configureItem: function(item) {
        this.callParent(arguments);

        // Auto layout does not manage any dimensions.
        item.layoutManagedHeight = 2;
        item.layoutManagedWidth = 2;
    }
});
