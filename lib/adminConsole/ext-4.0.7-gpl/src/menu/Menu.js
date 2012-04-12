/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A menu object. This is the container to which you may add {@link Ext.menu.Item menu items}.
 *
 * Menus may contain either {@link Ext.menu.Item menu items}, or general {@link Ext.Component Components}.
 * Menus may also contain {@link Ext.panel.AbstractPanel#dockedItems docked items} because it extends {@link Ext.panel.Panel}.
 *
 * To make a contained general {@link Ext.Component Component} line up with other {@link Ext.menu.Item menu items},
 * specify `{@link Ext.menu.Item#plain plain}: true`. This reserves a space for an icon, and indents the Component
 * in line with the other menu items.
 *
 * By default, Menus are absolutely positioned, floating Components. By configuring a Menu with `{@link #floating}: false`,
 * a Menu may be used as a child of a {@link Ext.container.Container Container}.
 *
 *     @example
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 100,
 *         margin: '0 0 10 0',
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'regular item 1'
 *         },{
 *             text: 'regular item 2'
 *         },{
 *             text: 'regular item 3'
 *         }]
 *     });
 *
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 100,
 *         plain: true,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'plain item 1'
 *         },{
 *             text: 'plain item 2'
 *         },{
 *             text: 'plain item 3'
 *         }]
 *     });
 */
Ext.define('Ext.menu.Menu', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.menu',
    requires: [
        'Ext.layout.container.Fit',
        'Ext.layout.container.VBox',
        'Ext.menu.CheckItem',
        'Ext.menu.Item',
        'Ext.menu.KeyNav',
        'Ext.menu.Manager',
        'Ext.menu.Separator'
    ],

    /**
     * @property {Ext.menu.Menu} parentMenu
     * The parent Menu of this Menu.
     */

    /**
     * @cfg {Boolean} allowOtherMenus
     * True to allow multiple menus to be displayed at the same time.
     */
    allowOtherMenus: false,

    /**
     * @cfg {String} ariaRole @hide
     */
    ariaRole: 'menu',

    /**
     * @cfg {Boolean} autoRender @hide
     * floating is true, so autoRender always happens
     */

    /**
     * @cfg {String} defaultAlign
     * The default {@link Ext.Element#getAlignToXY Ext.Element#getAlignToXY} anchor position value for this menu
     * relative to its element of origin.
     */
    defaultAlign: 'tl-bl?',

    /**
     * @cfg {Boolean} floating
     * A Menu configured as `floating: true` (the default) will be rendered as an absolutely positioned,
     * {@link Ext.Component#floating floating} {@link Ext.Component Component}. If configured as `floating: false`, the Menu may be
     * used as a child item of another {@link Ext.container.Container Container}.
     */
    floating: true,

    /**
     * @cfg {Boolean} @hide
     * Menus are constrained to the document body by default
     */
    constrain: true,

    /**
     * @cfg {Boolean} [hidden=undefined]
     * True to initially render the Menu as hidden, requiring to be shown manually.
     *
     * Defaults to `true` when `floating: true`, and defaults to `false` when `floating: false`.
     */
    hidden: true,

    hideMode: 'visibility',

    /**
     * @cfg {Boolean} ignoreParentClicks
     * True to ignore clicks on any item in this menu that is a parent item (displays a submenu)
     * so that the submenu is not dismissed when clicking the parent item.
     */
    ignoreParentClicks: false,

    isMenu: true,

    /**
     * @cfg {String/Object} layout @hide
     */

    /**
     * @cfg {Boolean} showSeparator
     * True to show the icon separator.
     */
    showSeparator : true,

    /**
     * @cfg {Number} minWidth
     * The minimum width of the Menu.
     */
    minWidth: 120,

    /**
     * @cfg {Boolean} [plain=false]
     * True to remove the incised line down the left side of the menu and to not indent general Component items.
     */

    initComponent: function() {
        var me = this,
            prefix = Ext.baseCSSPrefix,
            cls = [prefix + 'menu'],
            bodyCls = me.bodyCls ? [me.bodyCls] : [];

        me.addEvents(
            /**
             * @event click
             * Fires when this menu is clicked
             * @param {Ext.menu.Menu} menu The menu which has been clicked
             * @param {Ext.Component} item The menu item that was clicked. `undefined` if not applicable.
             * @param {Ext.EventObject} e The underlying {@link Ext.EventObject}.
             */
            'click',

            /**
             * @event mouseenter
             * Fires when the mouse enters this menu
             * @param {Ext.menu.Menu} menu The menu
             * @param {Ext.EventObject} e The underlying {@link Ext.EventObject}
             */
            'mouseenter',

            /**
             * @event mouseleave
             * Fires when the mouse leaves this menu
             * @param {Ext.menu.Menu} menu The menu
             * @param {Ext.EventObject} e The underlying {@link Ext.EventObject}
             */
            'mouseleave',

            /**
             * @event mouseover
             * Fires when the mouse is hovering over this menu
             * @param {Ext.menu.Menu} menu The menu
             * @param {Ext.Component} item The menu item that the mouse is over. `undefined` if not applicable.
             * @param {Ext.EventObject} e The underlying {@link Ext.EventObject}
             */
            'mouseover'
        );

        Ext.menu.Manager.register(me);

        // Menu classes
        if (me.plain) {
            cls.push(prefix + 'menu-plain');
        }
        me.cls = cls.join(' ');

        // Menu body classes
        bodyCls.unshift(prefix + 'menu-body');
        me.bodyCls = bodyCls.join(' ');

        // Internal vbox layout, with scrolling overflow
        // Placed in initComponent (rather than prototype) in order to support dynamic layout/scroller
        // options if we wish to allow for such configurations on the Menu.
        // e.g., scrolling speed, vbox align stretch, etc.
        me.layout = {
            type: 'vbox',
            align: 'stretchmax',
            autoSize: true,
            clearInnerCtOnLayout: true,
            overflowHandler: 'Scroller'
        };

        // hidden defaults to false if floating is configured as false
        if (me.floating === false && me.initialConfig.hidden !== true) {
            me.hidden = false;
        }

        me.callParent(arguments);

        me.on('beforeshow', function() {
            var hasItems = !!me.items.length;
            // FIXME: When a menu has its show cancelled because of no items, it
            // gets a visibility: hidden applied to it (instead of the default display: none)
            // Not sure why, but we remove this style when we want to show again.
            if (hasItems && me.rendered) {
                me.el.setStyle('visibility', null);
            }
            return hasItems;
        });
    },

    afterRender: function(ct) {
        var me = this,
            prefix = Ext.baseCSSPrefix,
            space = '&#160;';

        me.callParent(arguments);

        // TODO: Move this to a subTemplate When we support them in the future
        if (me.showSeparator) {
            me.iconSepEl = me.layout.getRenderTarget().insertFirst({
                cls: prefix + 'menu-icon-separator',
                html: space
            });
        }

        me.focusEl = me.el.createChild({
            cls: prefix + 'menu-focus',
            tabIndex: '-1',
            html: space
        });

        me.mon(me.el, {
            click: me.onClick,
            mouseover: me.onMouseOver,
            scope: me
        });
        me.mouseMonitor = me.el.monitorMouseLeave(100, me.onMouseLeave, me);

        if (me.showSeparator && ((!Ext.isStrict && Ext.isIE) || Ext.isIE6)) {
            me.iconSepEl.setHeight(me.el.getHeight());
        }

        me.keyNav = Ext.create('Ext.menu.KeyNav', me);
    },

    afterLayout: function() {
        var me = this;
        me.callParent(arguments);

        // For IE6 & IE quirks, we have to resize the el and body since position: absolute
        // floating elements inherit their parent's width, making them the width of
        // document.body instead of the width of their contents.
        // This includes left/right dock items.
        if ((!Ext.isStrict && Ext.isIE) || Ext.isIE6) {
            var innerCt = me.layout.getRenderTarget(),
                innerCtWidth = 0,
                dis = me.dockedItems,
                l = dis.length,
                i = 0,
                di, clone, newWidth;

            innerCtWidth = innerCt.getWidth();

            newWidth = innerCtWidth + me.body.getBorderWidth('lr') + me.body.getPadding('lr');

            // First set the body to the new width
            me.body.setWidth(newWidth);

            // Now we calculate additional width (docked items) and set the el's width
            for (; i < l, di = dis.getAt(i); i++) {
                if (di.dock == 'left' || di.dock == 'right') {
                    newWidth += di.getWidth();
                }
            }
            me.el.setWidth(newWidth);
        }
    },
    
    getBubbleTarget: function(){
        return this.parentMenu || this.callParent();
    },

    /**
     * Returns whether a menu item can be activated or not.
     * @return {Boolean}
     */
    canActivateItem: function(item) {
        return item && !item.isDisabled() && item.isVisible() && (item.canActivate || item.getXTypes().indexOf('menuitem') < 0);
    },

    /**
     * Deactivates the current active item on the menu, if one exists.
     */
    deactivateActiveItem: function() {
        var me = this;

        if (me.activeItem) {
            me.activeItem.deactivate();
            if (!me.activeItem.activated) {
                delete me.activeItem;
            }
        }

        // only blur if focusedItem is not a filter
        if (me.focusedItem && !me.filtered) {
            me.focusedItem.blur();
            if (!me.focusedItem.$focused) {
                delete me.focusedItem;
            }
        }
    },

    clearStretch: function () {
        // the vbox/stretchmax will set the el sizes and subsequent layouts will not
        // reconsider them unless we clear the dimensions on the el's here:
        if (this.rendered) {
            this.items.each(function (item) {
                // each menuItem component needs to layout again, so clear its cache
                if (item.componentLayout) {
                    delete item.componentLayout.lastComponentSize;
                }
                if (item.el) {
                    item.el.setWidth(null);
                }
            });
        }
    },

    onAdd: function () {
        var me = this;

        me.clearStretch();
        me.callParent(arguments);

        if (Ext.isIE6 || Ext.isIE7) {
            // TODO - why does this need to be done (and not ok to do now)?
            Ext.Function.defer(me.doComponentLayout, 10, me);
        }
    },

    onRemove: function () {
        this.clearStretch();
        this.callParent(arguments);

    },

    redoComponentLayout: function () {
        if (this.rendered) {
            this.clearStretch();
            this.doComponentLayout();
        }
    },

    // inherit docs
    getFocusEl: function() {
        return this.focusEl;
    },

    // inherit docs
    hide: function() {
        this.deactivateActiveItem();
        this.callParent(arguments);
    },

    // private
    getItemFromEvent: function(e) {
        return this.getChildByElement(e.getTarget());
    },

    lookupComponent: function(cmp) {
        var me = this;

        if (Ext.isString(cmp)) {
            cmp = me.lookupItemFromString(cmp);
        } else if (Ext.isObject(cmp)) {
            cmp = me.lookupItemFromObject(cmp);
        }

        // Apply our minWidth to all of our child components so it's accounted
        // for in our VBox layout
        cmp.minWidth = cmp.minWidth || me.minWidth;

        return cmp;
    },

    // private
    lookupItemFromObject: function(cmp) {
        var me = this,
            prefix = Ext.baseCSSPrefix,
            cls,
            intercept;

        if (!cmp.isComponent) {
            if (!cmp.xtype) {
                cmp = Ext.create('Ext.menu.' + (Ext.isBoolean(cmp.checked) ? 'Check': '') + 'Item', cmp);
            } else {
                cmp = Ext.ComponentManager.create(cmp, cmp.xtype);
            }
        }

        if (cmp.isMenuItem) {
            cmp.parentMenu = me;
        }

        if (!cmp.isMenuItem && !cmp.dock) {
            cls = [prefix + 'menu-item', prefix + 'menu-item-cmp'];
            intercept = Ext.Function.createInterceptor;

            // Wrap focus/blur to control component focus
            cmp.focus = intercept(cmp.focus, function() {
                this.$focused = true;
            }, cmp);
            cmp.blur = intercept(cmp.blur, function() {
                this.$focused = false;
            }, cmp);

            if (!me.plain && (cmp.indent === true || cmp.iconCls === 'no-icon')) {
                cls.push(prefix + 'menu-item-indent');
            }

            if (cmp.rendered) {
                cmp.el.addCls(cls);
            } else {
                cmp.cls = (cmp.cls ? cmp.cls : '') + ' ' + cls.join(' ');
            }
            cmp.isMenuItem = true;
        }
        return cmp;
    },

    // private
    lookupItemFromString: function(cmp) {
        return (cmp == 'separator' || cmp == '-') ?
            Ext.createWidget('menuseparator')
            : Ext.createWidget('menuitem', {
                canActivate: false,
                hideOnClick: false,
                plain: true,
                text: cmp
            });
    },

    onClick: function(e) {
        var me = this,
            item;

        if (me.disabled) {
            e.stopEvent();
            return;
        }

        if ((e.getTarget() == me.focusEl.dom) || e.within(me.layout.getRenderTarget())) {
            item = me.getItemFromEvent(e) || me.activeItem;

            if (item) {
                if (item.getXTypes().indexOf('menuitem') >= 0) {
                    if (!item.menu || !me.ignoreParentClicks) {
                        item.onClick(e);
                    } else {
                        e.stopEvent();
                    }
                }
            }
            me.fireEvent('click', me, item, e);
        }
    },

    onDestroy: function() {
        var me = this;

        Ext.menu.Manager.unregister(me);
        if (me.rendered) {
            me.el.un(me.mouseMonitor);
            me.keyNav.destroy();
            delete me.keyNav;
        }
        me.callParent(arguments);
    },

    onMouseLeave: function(e) {
        var me = this;

        me.deactivateActiveItem();

        if (me.disabled) {
            return;
        }

        me.fireEvent('mouseleave', me, e);
    },

    onMouseOver: function(e) {
        var me = this,
            fromEl = e.getRelatedTarget(),
            mouseEnter = !me.el.contains(fromEl),
            item = me.getItemFromEvent(e);

        if (mouseEnter && me.parentMenu) {
            me.parentMenu.setActiveItem(me.parentItem);
            me.parentMenu.mouseMonitor.mouseenter();
        }

        if (me.disabled) {
            return;
        }

        if (item) {
            me.setActiveItem(item);
            if (item.activated && item.expandMenu) {
                item.expandMenu();
            }
        }
        if (mouseEnter) {
            me.fireEvent('mouseenter', me, e);
        }
        me.fireEvent('mouseover', me, item, e);
    },

    setActiveItem: function(item) {
        var me = this;

        if (item && (item != me.activeItem && item != me.focusedItem)) {
            me.deactivateActiveItem();
            if (me.canActivateItem(item)) {
                if (item.activate) {
                    item.activate();
                    if (item.activated) {
                        me.activeItem = item;
                        me.focusedItem = item;
                        me.focus();
                    }
                } else {
                    item.focus();
                    me.focusedItem = item;
                }
            }
            item.el.scrollIntoView(me.layout.getRenderTarget());
        }
    },

    /**
     * Shows the floating menu by the specified {@link Ext.Component Component} or {@link Ext.Element Element}.
     * @param {Ext.Component/Ext.Element} component The {@link Ext.Component} or {@link Ext.Element} to show the menu by.
     * @param {String} position (optional) Alignment position as used by {@link Ext.Element#getAlignToXY}.
     * Defaults to `{@link #defaultAlign}`.
     * @param {Number[]} offsets (optional) Alignment offsets as used by {@link Ext.Element#getAlignToXY}. Defaults to `undefined`.
     * @return {Ext.menu.Menu} This Menu.
     */
    showBy: function(cmp, pos, off) {
        var me = this,
            xy,
            region;

        if (me.floating && cmp) {
            me.layout.autoSize = true;

            // show off-screen first so that we can calc position without causing a visual jump
            me.doAutoRender();
            delete me.needsLayout;

            // Component or Element
            cmp = cmp.el || cmp;

            // Convert absolute to floatParent-relative coordinates if necessary.
            xy = me.el.getAlignToXY(cmp, pos || me.defaultAlign, off);
            if (me.floatParent) {
                region = me.floatParent.getTargetEl().getViewRegion();
                xy[0] -= region.x;
                xy[1] -= region.y;
            }
            me.showAt(xy);
        }
        return me;
    },

    doConstrain : function() {
        var me = this,
            y = me.el.getY(),
            max, full,
            vector,
            returnY = y, normalY, parentEl, scrollTop, viewHeight;

        delete me.height;
        me.setSize();
        full = me.getHeight();
        if (me.floating) {
            //if our reset css is scoped, there will be a x-reset wrapper on this menu which we need to skip
            parentEl = Ext.fly(me.el.getScopeParent());
            scrollTop = parentEl.getScroll().top;
            viewHeight = parentEl.getViewSize().height;
            //Normalize y by the scroll position for the parent element.  Need to move it into the coordinate space
            //of the view.
            normalY = y - scrollTop;
            max = me.maxHeight ? me.maxHeight : viewHeight - normalY;
            if (full > viewHeight) {
                max = viewHeight;
                //Set returnY equal to (0,0) in view space by reducing y by the value of normalY
                returnY = y - normalY;
            } else if (max < full) {
                returnY = y - (full - max);
                max = full;
            }
        }else{
            max = me.getHeight();
        }
        // Always respect maxHeight
        if (me.maxHeight){
            max = Math.min(me.maxHeight, max);
        }
        if (full > max && max > 0){
            me.layout.autoSize = false;
            me.setHeight(max);
            if (me.showSeparator){
                me.iconSepEl.setHeight(me.layout.getRenderTarget().dom.scrollHeight);
            }
        }
        vector = me.getConstrainVector(me.el.getScopeParent());
        if (vector) {
            me.setPosition(me.getPosition()[0] + vector[0]);
        }
        me.el.setY(returnY);
    }
});

