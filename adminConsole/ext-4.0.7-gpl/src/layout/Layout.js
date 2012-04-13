/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Base Layout class - extended by ComponentLayout and ContainerLayout
 */
Ext.define('Ext.layout.Layout', {

    /* Begin Definitions */

    /* End Definitions */

    isLayout: true,
    initialized: false,

    statics: {
        create: function(layout, defaultType) {
            var type;
            if (layout instanceof Ext.layout.Layout) {
                return Ext.createByAlias('layout.' + layout);
            } else {
                if (!layout || typeof layout === 'string') {
                    type = layout || defaultType;
                    layout = {};                    
                }
                else {
                    type = layout.type || defaultType;
                }
                return Ext.createByAlias('layout.' + type, layout || {});
            }
        }
    },

    constructor : function(config) {
        this.id = Ext.id(null, this.type + '-');
        Ext.apply(this, config);
    },

    /**
     * @private
     */
    layout : function() {
        var me = this;
        me.layoutBusy = true;
        me.initLayout();

        if (me.beforeLayout.apply(me, arguments) !== false) {
            me.layoutCancelled = false;
            me.onLayout.apply(me, arguments);
            me.childrenChanged = false;
            me.owner.needsLayout = false;
            me.layoutBusy = false;
            me.afterLayout.apply(me, arguments);
        }
        else {
            me.layoutCancelled = true;
        }
        me.layoutBusy = false;
        me.doOwnerCtLayouts();
    },

    beforeLayout : function() {
        this.renderChildren();
        return true;
    },

    renderChildren: function () {
        this.renderItems(this.getLayoutItems(), this.getRenderTarget());
    },

    /**
     * @private
     * Iterates over all passed items, ensuring they are rendered.  If the items are already rendered,
     * also determines if the items are in the proper place dom.
     */
    renderItems : function(items, target) {
        var me = this,
            ln = items.length,
            i = 0,
            item;

        for (; i < ln; i++) {
            item = items[i];
            if (item && !item.rendered) {
                me.renderItem(item, target, i);
            } else if (!me.isValidParent(item, target, i)) {
                me.moveItem(item, target, i);
            } else {
                // still need to configure the item, it may have moved in the container.
                me.configureItem(item);
            }
        }
    },

    // @private - Validates item is in the proper place in the dom.
    isValidParent : function(item, target, position) {
        var dom = item.el ? item.el.dom : Ext.getDom(item);
        if (dom && target && target.dom) {
            if (Ext.isNumber(position) && dom !== target.dom.childNodes[position]) {
                return false;
            }
            return (dom.parentNode == (target.dom || target));
        }
        return false;
    },

    /**
     * @private
     * Renders the given Component into the target Element.
     * @param {Ext.Component} item The Component to render
     * @param {Ext.Element} target The target Element
     * @param {Number} position The position within the target to render the item to
     */
    renderItem : function(item, target, position) {
        var me = this;
        if (!item.rendered) {
            if (me.itemCls) {
                item.addCls(me.itemCls);
            }
            if (me.owner.itemCls) {
                item.addCls(me.owner.itemCls);
            }
            item.render(target, position);
            me.configureItem(item);
            me.childrenChanged = true;
        }
    },

    /**
     * @private
     * Moved Component to the provided target instead.
     */
    moveItem : function(item, target, position) {
        // Make sure target is a dom element
        target = target.dom || target;
        if (typeof position == 'number') {
            position = target.childNodes[position];
        }
        target.insertBefore(item.el.dom, position || null);
        item.container = Ext.get(target);
        this.configureItem(item);
        this.childrenChanged = true;
    },

    /**
     * @private
     * Adds the layout's targetCls if necessary and sets
     * initialized flag when complete.
     */
    initLayout : function() {
        var me = this,
            targetCls = me.targetCls;
            
        if (!me.initialized && !Ext.isEmpty(targetCls)) {
            me.getTarget().addCls(targetCls);
        }
        me.initialized = true;
    },

    // @private Sets the layout owner
    setOwner : function(owner) {
        this.owner = owner;
    },

    // @private - Returns empty array
    getLayoutItems : function() {
        return [];
    },

    /**
     * @private
     * Applies itemCls
     * Empty template method
     */
    configureItem: Ext.emptyFn,
    
    // Placeholder empty functions for subclasses to extend
    onLayout : Ext.emptyFn,
    afterLayout : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,
    doOwnerCtLayouts : Ext.emptyFn,

    /**
     * @private
     * Removes itemCls
     */
    afterRemove : function(item) {
        var el = item.el,
            owner = this.owner,
            itemCls = this.itemCls,
            ownerCls = owner.itemCls;
            
        // Clear managed dimensions flag when removed from the layout.
        if (item.rendered && !item.isDestroyed) {
            if (itemCls) {
                el.removeCls(itemCls);
            }
            if (ownerCls) {
                el.removeCls(ownerCls);
            }
        }

        // These flags are set at the time a child item is added to a layout.
        // The layout must decide if it is managing the item's width, or its height, or both.
        // See AbstractComponent for docs on these properties.
        delete item.layoutManagedWidth;
        delete item.layoutManagedHeight;
    },

    /**
     * Destroys this layout. This is a template method that is empty by default, but should be implemented
     * by subclasses that require explicit destruction to purge event handlers or remove DOM nodes.
     * @template
     */
    destroy : function() {
        var targetCls = this.targetCls,
            target;
        
        if (!Ext.isEmpty(targetCls)) {
            target = this.getTarget();
            if (target) {
                target.removeCls(targetCls);
            }
        }
        this.onDestroy();
    }
});
