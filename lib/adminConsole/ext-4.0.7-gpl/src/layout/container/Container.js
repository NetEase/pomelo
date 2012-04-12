/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
* @class Ext.layout.container.Container
* @extends Ext.layout.container.AbstractContainer
* <p>This class is intended to be extended or created via the {@link Ext.container.Container#layout layout}
* configuration property.  See {@link Ext.container.Container#layout} for additional details.</p>
*/
Ext.define('Ext.layout.container.Container', {

    /* Begin Definitions */

    extend: 'Ext.layout.container.AbstractContainer',
    alternateClassName: 'Ext.layout.ContainerLayout',

    /* End Definitions */

    layoutItem: function(item, box) {
        if (box) {
            item.doComponentLayout(box.width, box.height);
        } else {
            item.doComponentLayout();
        }
    },

    getLayoutTargetSize : function() {
        var target = this.getTarget(),
            ret;

        if (target) {
            ret = target.getViewSize();

            // IE in will sometimes return a width of 0 on the 1st pass of getViewSize.
            // Use getStyleSize to verify the 0 width, the adjustment pass will then work properly
            // with getViewSize
            if (Ext.isIE && ret.width == 0){
                ret = target.getStyleSize();
            }

            ret.width -= target.getPadding('lr');
            ret.height -= target.getPadding('tb');
        }
        return ret;
    },

    beforeLayout: function() {
        if (this.owner.beforeLayout(arguments) !== false) {
            return this.callParent(arguments);
        }
        else {
            return false;
        }
    },

    /**
     * @protected
     * Returns all items that are rendered
     * @return {Array} All matching items
     */
    getRenderedItems: function() {
        var me = this,
            target = me.getTarget(),
            items = me.getLayoutItems(),
            ln = items.length,
            renderedItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && me.isValidParent(item, target, i)) {
                renderedItems.push(item);
            }
        }

        return renderedItems;
    },

    /**
     * @protected
     * Returns all items that are both rendered and visible
     * @return {Array} All matching items
     */
    getVisibleItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            visibleItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target, i) && item.hidden !== true) {
                visibleItems.push(item);
            }
        }

        return visibleItems;
    }
});
