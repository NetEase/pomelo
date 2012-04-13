/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A layout that arranges items horizontally across a Container. This layout optionally divides available horizontal
 * space between child items containing a numeric `flex` configuration.
 *
 * This layout may also be used to set the heights of child items by configuring it with the {@link #align} option.
 *
 *     @example
 *     Ext.create('Ext.Panel', {
 *         width: 500,
 *         height: 300,
 *         title: "HBoxLayout Panel",
 *         layout: {
 *             type: 'hbox',
 *             align: 'stretch'
 *         },
 *         renderTo: document.body,
 *         items: [{
 *             xtype: 'panel',
 *             title: 'Inner Panel One',
 *             flex: 2
 *         },{
 *             xtype: 'panel',
 *             title: 'Inner Panel Two',
 *             flex: 1
 *         },{
 *             xtype: 'panel',
 *             title: 'Inner Panel Three',
 *             flex: 1
 *         }]
 *     });
 */
Ext.define('Ext.layout.container.HBox', {

    /* Begin Definitions */

    alias: ['layout.hbox'],
    extend: 'Ext.layout.container.Box',
    alternateClassName: 'Ext.layout.HBoxLayout',

    /* End Definitions */

    /**
     * @cfg {String} align
     * Controls how the child items of the container are aligned. Acceptable configuration values for this property are:
     *
     * - **top** : **Default** child items are aligned vertically at the **top** of the container
     * - **middle** : child items are aligned vertically in the **middle** of the container
     * - **stretch** : child items are stretched vertically to fill the height of the container
     * - **stretchmax** : child items are stretched vertically to the height of the largest item.
     */
    align: 'top', // top, middle, stretch, strechmax

    //@private
    alignCenteringString: 'middle',

    type : 'hbox',

    direction: 'horizontal',

    // When creating an argument list to setSize, use this order
    parallelSizeIndex: 0,
    perpendicularSizeIndex: 1,

    parallelPrefix: 'width',
    parallelPrefixCap: 'Width',
    parallelLT: 'l',
    parallelRB: 'r',
    parallelBefore: 'left',
    parallelBeforeCap: 'Left',
    parallelAfter: 'right',
    parallelPosition: 'x',

    perpendicularPrefix: 'height',
    perpendicularPrefixCap: 'Height',
    perpendicularLT: 't',
    perpendicularRB: 'b',
    perpendicularLeftTop: 'top',
    perpendicularRightBottom: 'bottom',
    perpendicularPosition: 'y',
    configureItem: function(item) {
        if (item.flex) {
            item.layoutManagedWidth = 1;
        } else {
            item.layoutManagedWidth = 2;
        }

        if (this.align === 'stretch' || this.align === 'stretchmax') {
            item.layoutManagedHeight = 1;
        } else {
            item.layoutManagedHeight = 2;
        }
        this.callParent(arguments);
    }
});
