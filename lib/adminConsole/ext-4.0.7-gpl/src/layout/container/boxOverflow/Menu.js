/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.boxOverflow.Menu
 * @extends Ext.layout.container.boxOverflow.None
 * @private
 */
Ext.define('Ext.layout.container.boxOverflow.Menu', {

    /* Begin Definitions */

    extend: 'Ext.layout.container.boxOverflow.None',
    requires: ['Ext.toolbar.Separator', 'Ext.button.Button'],
    alternateClassName: 'Ext.layout.boxOverflow.Menu',
    
    /* End Definitions */

    /**
     * @cfg {String} afterCtCls
     * CSS class added to the afterCt element. This is the element that holds any special items such as scrollers,
     * which must always be present at the rightmost edge of the Container
     */

    /**
     * @property noItemsMenuText
     * @type String
     * HTML fragment to render into the toolbar overflow menu if there are no items to display
     */
    noItemsMenuText : '<div class="' + Ext.baseCSSPrefix + 'toolbar-no-items">(None)</div>',

    constructor: function(layout) {
        var me = this;

        me.callParent(arguments);

        // Before layout, we need to re-show all items which we may have hidden due to a previous overflow.
        layout.beforeLayout = Ext.Function.createInterceptor(layout.beforeLayout, this.clearOverflow, this);

        me.afterCtCls = me.afterCtCls || Ext.baseCSSPrefix + 'box-menu-' + layout.parallelAfter;
        /**
         * @property menuItems
         * @type Array
         * Array of all items that are currently hidden and should go into the dropdown menu
         */
        me.menuItems = [];
    },
    
    onRemove: function(comp){
        Ext.Array.remove(this.menuItems, comp);
    },

    handleOverflow: function(calculations, targetSize) {
        var me = this,
            layout = me.layout,
            methodName = 'get' + layout.parallelPrefixCap,
            newSize = {},
            posArgs = [null, null];

        me.callParent(arguments);
        this.createMenu(calculations, targetSize);
        newSize[layout.perpendicularPrefix] = targetSize[layout.perpendicularPrefix];
        newSize[layout.parallelPrefix] = targetSize[layout.parallelPrefix] - me.afterCt[methodName]();

        // Center the menuTrigger button.
        // TODO: Should we emulate align: 'middle' like this, or should we 'stretchmax' the menuTrigger?
        posArgs[layout.perpendicularSizeIndex] = (calculations.meta.maxSize - me.menuTrigger['get' + layout.perpendicularPrefixCap]()) / 2;
        me.menuTrigger.setPosition.apply(me.menuTrigger, posArgs);

        return { targetSize: newSize };
    },

    /**
     * @private
     * Called by the layout, when it determines that there is no overflow.
     * Also called as an interceptor to the layout's onLayout method to reshow
     * previously hidden overflowing items.
     */
    clearOverflow: function(calculations, targetSize) {
        var me = this,
            newWidth = targetSize ? targetSize.width + (me.afterCt ? me.afterCt.getWidth() : 0) : 0,
            items = me.menuItems,
            i = 0,
            length = items.length,
            item;

        me.hideTrigger();
        for (; i < length; i++) {
            items[i].show();
        }
        items.length = 0;

        return targetSize ? {
            targetSize: {
                height: targetSize.height,
                width : newWidth
            }
        } : null;
    },

    /**
     * @private
     */
    showTrigger: function() {
        this.menuTrigger.show();
    },

    /**
     * @private
     */
    hideTrigger: function() {
        if (this.menuTrigger !== undefined) {
            this.menuTrigger.hide();
        }
    },

    /**
     * @private
     * Called before the overflow menu is shown. This constructs the menu's items, caching them for as long as it can.
     */
    beforeMenuShow: function(menu) {
        var me = this,
            items = me.menuItems,
            i = 0,
            len   = items.length,
            item,
            prev;

        var needsSep = function(group, prev){
            return group.isXType('buttongroup') && !(prev instanceof Ext.toolbar.Separator);
        };

        me.clearMenu();
        menu.removeAll();

        for (; i < len; i++) {
            item = items[i];

            // Do not show a separator as a first item
            if (!i && (item instanceof Ext.toolbar.Separator)) {
                continue;
            }
            if (prev && (needsSep(item, prev) || needsSep(prev, item))) {
                menu.add('-');
            }

            me.addComponentToMenu(menu, item);
            prev = item;
        }

        // put something so the menu isn't empty if no compatible items found
        if (menu.items.length < 1) {
            menu.add(me.noItemsMenuText);
        }
    },
    
    /**
     * @private
     * Returns a menu config for a given component. This config is used to create a menu item
     * to be added to the expander menu
     * @param {Ext.Component} component The component to create the config for
     * @param {Boolean} hideOnClick Passed through to the menu item
     */
    createMenuConfig : function(component, hideOnClick) {
        var config = Ext.apply({}, component.initialConfig),
            group  = component.toggleGroup;

        Ext.copyTo(config, component, [
            'iconCls', 'icon', 'itemId', 'disabled', 'handler', 'scope', 'menu'
        ]);

        Ext.apply(config, {
            text       : component.overflowText || component.text,
            hideOnClick: hideOnClick,
            destroyMenu: false
        });

        if (group || component.enableToggle) {
            Ext.apply(config, {
                group  : group,
                checked: component.pressed,
                listeners: {
                    checkchange: function(item, checked){
                        component.toggle(checked);
                    }
                }
            });
        }

        delete config.ownerCt;
        delete config.xtype;
        delete config.id;
        return config;
    },

    /**
     * @private
     * Adds the given Toolbar item to the given menu. Buttons inside a buttongroup are added individually.
     * @param {Ext.menu.Menu} menu The menu to add to
     * @param {Ext.Component} component The component to add
     */
    addComponentToMenu : function(menu, component) {
        var me = this;
        if (component instanceof Ext.toolbar.Separator) {
            menu.add('-');
        } else if (component.isComponent) {
            if (component.isXType('splitbutton')) {
                menu.add(me.createMenuConfig(component, true));

            } else if (component.isXType('button')) {
                menu.add(me.createMenuConfig(component, !component.menu));

            } else if (component.isXType('buttongroup')) {
                component.items.each(function(item){
                     me.addComponentToMenu(menu, item);
                });
            } else {
                menu.add(Ext.create(Ext.getClassName(component), me.createMenuConfig(component)));
            }
        }
    },

    /**
     * @private
     * Deletes the sub-menu of each item in the expander menu. Submenus are created for items such as
     * splitbuttons and buttongroups, where the Toolbar item cannot be represented by a single menu item
     */
    clearMenu : function() {
        var menu = this.moreMenu;
        if (menu && menu.items) {
            menu.items.each(function(item) {
                if (item.menu) {
                    delete item.menu;
                }
            });
        }
    },

    /**
     * @private
     * Creates the overflow trigger and menu used when enableOverflow is set to true and the items
     * in the layout are too wide to fit in the space available
     */
    createMenu: function(calculations, targetSize) {
        var me = this,
            layout = me.layout,
            startProp = layout.parallelBefore,
            sizeProp = layout.parallelPrefix,
            available = targetSize[sizeProp],
            boxes = calculations.boxes,
            i = 0,
            len = boxes.length,
            box;

        if (!me.menuTrigger) {
            me.createInnerElements();

            /**
             * @private
             * @property menu
             * @type Ext.menu.Menu
             * The expand menu - holds items for every item that cannot be shown
             * because the container is currently not large enough.
             */
            me.menu = Ext.create('Ext.menu.Menu', {
                listeners: {
                    scope: me,
                    beforeshow: me.beforeMenuShow
                }
            });

            /**
             * @private
             * @property menuTrigger
             * @type Ext.button.Button
             * The expand button which triggers the overflow menu to be shown
             */
            me.menuTrigger = Ext.create('Ext.button.Button', {
                ownerCt : me.layout.owner, // To enable the Menu to ascertain a valid zIndexManager owner in the same tree
                iconCls : me.layout.owner.menuTriggerCls,
                ui      : layout.owner instanceof Ext.toolbar.Toolbar ? 'default-toolbar' : 'default',
                menu    : me.menu,
                getSplitCls: function() { return '';},
                renderTo: me.afterCt
            });
        }
        me.showTrigger();
        available -= me.afterCt.getWidth();

        // Hide all items which are off the end, and store them to allow them to be restored
        // before each layout operation.
        me.menuItems.length = 0;
        for (; i < len; i++) {
            box = boxes[i];
            if (box[startProp] + box[sizeProp] > available) {
                me.menuItems.push(box.component);
                box.component.hide();
            }
        }
    },

    /**
     * @private
     * Creates the beforeCt, innerCt and afterCt elements if they have not already been created
     * @param {Ext.container.Container} container The Container attached to this Layout instance
     * @param {Ext.Element} target The target Element
     */
    createInnerElements: function() {
        var me = this,
            target = me.layout.getRenderTarget();

        if (!this.afterCt) {
            target.addCls(Ext.baseCSSPrefix + me.layout.direction + '-box-overflow-body');
            this.afterCt  = target.insertSibling({cls: Ext.layout.container.Box.prototype.innerCls + ' ' + this.afterCtCls}, 'before');
        }
    },

    /**
     * @private
     */
    destroy: function() {
        Ext.destroy(this.menu, this.menuTrigger);
    }
});
