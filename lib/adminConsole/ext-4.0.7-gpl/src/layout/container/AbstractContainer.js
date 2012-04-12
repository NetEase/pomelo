/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.AbstractContainer
 * @extends Ext.layout.Layout
 * Please refer to sub classes documentation
 * @private
 */
Ext.define('Ext.layout.container.AbstractContainer', {

    /* Begin Definitions */

    extend: 'Ext.layout.Layout',

    /* End Definitions */

    type: 'container',

    /**
     * @cfg {Boolean} bindToOwnerCtComponent
     * Flag to notify the ownerCt Component on afterLayout of a change
     */
    bindToOwnerCtComponent: false,

    /**
     * @cfg {Boolean} bindToOwnerCtContainer
     * Flag to notify the ownerCt Container on afterLayout of a change
     */
    bindToOwnerCtContainer: false,

    /**
     * @cfg {String} itemCls
     * <p>An optional extra CSS class that will be added to the container. This can be useful for adding
     * customized styles to the container or any of its children using standard CSS rules. See
     * {@link Ext.Component}.{@link Ext.Component#componentCls componentCls} also.</p>
     * </p>
     */

    /**
    * Set the size of an item within the Container.  We should always use setCalculatedSize.
    * @private
    */
    setItemSize: function(item, width, height) {
        if (Ext.isObject(width)) {
            height = width.height;
            width = width.width;
        }
        item.setCalculatedSize(width, height, this.owner);
    },

    /**
     * <p>Returns an array of child components either for a render phase (Performed in the beforeLayout method of the layout's
     * base class), or the layout phase (onLayout).</p>
     * @return {Ext.Component[]} of child components
     */
    getLayoutItems: function() {
        return this.owner && this.owner.items && this.owner.items.items || [];
    },

    /**
     * Containers should not lay out child components when collapsed.
     */
    beforeLayout: function() {
        return !this.owner.collapsed && this.callParent(arguments);
    },

    afterLayout: function() {
        this.owner.afterLayout(this);
    },
    /**
     * Returns the owner component's resize element.
     * @return {Ext.Element}
     */
     getTarget: function() {
         return this.owner.getTargetEl();
     },
    /**
     * <p>Returns the element into which rendering must take place. Defaults to the owner Container's target element.</p>
     * May be overridden in layout managers which implement an inner element.
     * @return {Ext.Element}
     */
     getRenderTarget: function() {
         return this.owner.getTargetEl();
     }
});

