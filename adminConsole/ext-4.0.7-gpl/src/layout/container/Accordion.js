/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.Accordion
 * @extends Ext.layout.container.VBox
 *
 * This is a layout that manages multiple Panels in an expandable accordion style such that only
 * **one Panel can be expanded at any given time**. Each Panel has built-in support for expanding and collapsing.
 *
 * Note: Only Ext Panels and all subclasses of Ext.panel.Panel may be used in an accordion layout Container.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Accordion Layout',
 *         width: 300,
 *         height: 300,
 *         layout:'accordion',
 *         defaults: {
 *             // applied to each contained panel
 *             bodyStyle: 'padding:15px'
 *         },
 *         layoutConfig: {
 *             // layout-specific configs go here
 *             titleCollapse: false,
 *             animate: true,
 *             activeOnTop: true
 *         },
 *         items: [{
 *             title: 'Panel 1',
 *             html: 'Panel content!'
 *         },{
 *             title: 'Panel 2',
 *             html: 'Panel content!'
 *         },{
 *             title: 'Panel 3',
 *             html: 'Panel content!'
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Accordion', {
    extend: 'Ext.layout.container.VBox',
    alias: ['layout.accordion'],
    alternateClassName: 'Ext.layout.AccordionLayout',

    itemCls: Ext.baseCSSPrefix + 'box-item ' + Ext.baseCSSPrefix + 'accordion-item',

    align: 'stretch',

    /**
     * @cfg {Boolean} fill
     * True to adjust the active item's height to fill the available space in the container, false to use the
     * item's current height, or auto height if not explicitly set.
     */
    fill : true,

    /**
     * @cfg {Boolean} autoWidth
     * Child Panels have their width actively managed to fit within the accordion's width.
     * @deprecated This config is ignored in ExtJS 4
     */
    autoWidth : true,

    /**
     * @cfg {Boolean} titleCollapse
     * True to allow expand/collapse of each contained panel by clicking anywhere on the title bar, false to allow
     * expand/collapse only when the toggle tool button is clicked.  When set to false,
     * {@link #hideCollapseTool} should be false also.
     */
    titleCollapse : true,

    /**
     * @cfg {Boolean} hideCollapseTool
     * True to hide the contained Panels' collapse/expand toggle buttons, false to display them.
     * When set to true, {@link #titleCollapse} is automatically set to <code>true</code>.
     */
    hideCollapseTool : false,

    /**
     * @cfg {Boolean} collapseFirst
     * True to make sure the collapse/expand toggle button always renders first (to the left of) any other tools
     * in the contained Panels' title bars, false to render it last.
     */
    collapseFirst : false,

    /**
     * @cfg {Boolean} animate
     * True to slide the contained panels open and closed during expand/collapse using animation, false to open and
     * close directly with no animation. Note: The layout performs animated collapsing
     * and expanding, <i>not</i> the child Panels.
     */
    animate : true,
    /**
     * @cfg {Boolean} activeOnTop
     * Only valid when {@link #multi} is `false` and {@link #animate} is `false`.
     *
     * True to swap the position of each panel as it is expanded so that it becomes the first item in the container,
     * false to keep the panels in the rendered order.
     */
    activeOnTop : false,
    /**
     * @cfg {Boolean} multi
     * Set to <code>true</code> to enable multiple accordion items to be open at once.
     */
    multi: false,

    constructor: function() {
        var me = this;

        me.callParent(arguments);

        // animate flag must be false during initial render phase so we don't get animations.
        me.initialAnimate = me.animate;
        me.animate = false;

        // Child Panels are not absolutely positioned if we are not filling, so use a different itemCls.
        if (me.fill === false) {
            me.itemCls = Ext.baseCSSPrefix + 'accordion-item';
        }
    },

    // Cannot lay out a fitting accordion before we have been allocated a height.
    // So during render phase, layout will not be performed.
    beforeLayout: function() {
        var me = this;

        me.callParent(arguments);
        if (me.fill) {
            if (!(me.owner.el.dom.style.height || me.getLayoutTargetSize().height)) {
                return false;
            }
        } else {
            me.owner.componentLayout.monitorChildren = false;
            me.autoSize = true;
            me.owner.setAutoScroll(true);
        }
    },

    renderItems : function(items, target) {
        var me = this,
            ln = items.length,
            i = 0,
            comp,
            targetSize = me.getLayoutTargetSize(),
            renderedPanels = [];

        for (; i < ln; i++) {
            comp = items[i];
            if (!comp.rendered) {
                renderedPanels.push(comp);

                // Set up initial properties for Panels in an accordion.
                if (me.collapseFirst) {
                    comp.collapseFirst = me.collapseFirst;
                }
                if (me.hideCollapseTool) {
                    comp.hideCollapseTool = me.hideCollapseTool;
                    comp.titleCollapse = true;
                }
                else if (me.titleCollapse) {
                    comp.titleCollapse = me.titleCollapse;
                }

                delete comp.hideHeader;
                comp.collapsible = true;
                comp.title = comp.title || '&#160;';

                // Set initial sizes
                comp.width = targetSize.width;
                if (me.fill) {
                    delete comp.height;
                    delete comp.flex;

                    // If there is an expanded item, all others must be rendered collapsed.
                    if (me.expandedItem !== undefined) {
                        comp.collapsed = true;
                    }
                    // Otherwise expand the first item with collapsed explicitly configured as false
                    else if (comp.hasOwnProperty('collapsed') && comp.collapsed === false) {
                        comp.flex = 1;
                        me.expandedItem = i;
                    } else {
                        comp.collapsed = true;
                    }
                    // If we are fitting, then intercept expand/collapse requests.
                    me.owner.mon(comp, {
                        show: me.onComponentShow,
                        beforeexpand: me.onComponentExpand,
                        beforecollapse: me.onComponentCollapse,
                        scope: me
                    });
                } else {
                    delete comp.flex;
                    comp.animCollapse = me.initialAnimate;
                    comp.autoHeight = true;
                    comp.autoScroll = false;
                }
                comp.border = comp.collapsed;
            }
        }

        // If no collapsed:false Panels found, make the first one expanded.
        if (ln && me.expandedItem === undefined) {
            me.expandedItem = 0;
            comp = items[0];
            comp.collapsed = comp.border = false;
            if (me.fill) {
                comp.flex = 1;
            }
        }

        // Render all Panels.
        me.callParent(arguments);

        // Postprocess rendered Panels.
        ln = renderedPanels.length;
        for (i = 0; i < ln; i++) {
            comp = renderedPanels[i];

            // Delete the dimension property so that our align: 'stretch' processing manages the width from here
            delete comp.width;

            comp.header.addCls(Ext.baseCSSPrefix + 'accordion-hd');
            comp.body.addCls(Ext.baseCSSPrefix + 'accordion-body');
        }
    },

    onLayout: function() {
        var me = this;


        if (me.fill) {
            me.callParent(arguments);
        } else {
            var targetSize = me.getLayoutTargetSize(),
                items = me.getVisibleItems(),
                len = items.length,
                i = 0, comp;

            for (; i < len; i++) {
                comp = items[i];
                if (comp.collapsed) {
                    items[i].setWidth(targetSize.width);
                } else {
                    items[i].setSize(null, null);
                }
            }
        }
        me.updatePanelClasses();

        return me;
    },

    updatePanelClasses: function() {
        var children = this.getLayoutItems(),
            ln = children.length,
            siblingCollapsed = true,
            i, child;

        for (i = 0; i < ln; i++) {
            child = children[i];

            // Fix for EXTJSIV-3724. Windows only.
            // Collapsing the Psnel's el to a size which only allows a single hesder to be visible, scrolls the header out of view.
            if (Ext.isWindows) {
                child.el.dom.scrollTop = 0;
            }

            if (siblingCollapsed) {
                child.header.removeCls(Ext.baseCSSPrefix + 'accordion-hd-sibling-expanded');
            }
            else {
                child.header.addCls(Ext.baseCSSPrefix + 'accordion-hd-sibling-expanded');
            }

            if (i + 1 == ln && child.collapsed) {
                child.header.addCls(Ext.baseCSSPrefix + 'accordion-hd-last-collapsed');
            }
            else {
                child.header.removeCls(Ext.baseCSSPrefix + 'accordion-hd-last-collapsed');
            }
            siblingCollapsed = child.collapsed;
        }
    },
    
    animCallback: function(){
        Ext.Array.forEach(this.toCollapse, function(comp){
            comp.fireEvent('collapse', comp);
        });
        
        Ext.Array.forEach(this.toExpand, function(comp){
            comp.fireEvent('expand', comp);
        });    
    },
    
    setupEvents: function(){
        this.toCollapse = [];
        this.toExpand = [];    
    },

    // When a Component expands, adjust the heights of the other Components to be just enough to accommodate
    // their headers.
    // The expanded Component receives the only flex value, and so gets all remaining space.
    onComponentExpand: function(toExpand) {
        var me = this,
            it = me.owner.items.items,
            len = it.length,
            i = 0,
            comp;

        me.setupEvents();
        for (; i < len; i++) {
            comp = it[i];
            if (comp === toExpand && comp.collapsed) {
                me.setExpanded(comp);
            } else if (!me.multi && (comp.rendered && comp.header.rendered && comp !== toExpand && !comp.collapsed)) {
                me.setCollapsed(comp);
            }
        }

        me.animate = me.initialAnimate;
        if (me.activeOnTop) {
            // insert will trigger a layout
            me.owner.insert(0, toExpand); 
        } else {
            me.layout();
        }
        me.animate = false;
        return false;
    },

    onComponentCollapse: function(comp) {
        var me = this,
            toExpand = comp.next() || comp.prev(),
            expanded = me.multi ? me.owner.query('>panel:not([collapsed])') : [];

        me.setupEvents();
        // If we are allowing multi, and the "toCollapse" component is NOT the only expanded Component,
        // then ask the box layout to collapse it to its header.
        if (me.multi) {
            me.setCollapsed(comp);

            // If the collapsing Panel is the only expanded one, expand the following Component.
            // All this is handling fill: true, so there must be at least one expanded,
            if (expanded.length === 1 && expanded[0] === comp) {
                me.setExpanded(toExpand);
            }

            me.animate = me.initialAnimate;
            me.layout();
            me.animate = false;
        }
        // Not allowing multi: expand the next sibling if possible, prev sibling if we collapsed the last
        else if (toExpand) {
            me.onComponentExpand(toExpand);
        }
        return false;
    },

    onComponentShow: function(comp) {
        // Showing a Component means that you want to see it, so expand it.
        this.onComponentExpand(comp);
    },

    setCollapsed: function(comp) {
        var otherDocks = comp.getDockedItems(),
            dockItem,
            len = otherDocks.length,
            i = 0;

        // Hide all docked items except the header
        comp.hiddenDocked = [];
        for (; i < len; i++) {
            dockItem = otherDocks[i];
            if ((dockItem !== comp.header) && !dockItem.hidden) {
                dockItem.hidden = true;
                comp.hiddenDocked.push(dockItem);
            }
        }
        comp.addCls(comp.collapsedCls);
        comp.header.addCls(comp.collapsedHeaderCls);
        comp.height = comp.header.getHeight();
        comp.el.setHeight(comp.height);
        comp.collapsed = true;
        delete comp.flex;
        if (this.initialAnimate) {
            this.toCollapse.push(comp);
        } else {
            comp.fireEvent('collapse', comp);
        }
        if (comp.collapseTool) {
            comp.collapseTool.setType('expand-' + comp.getOppositeDirection(comp.collapseDirection));
        }
    },

    setExpanded: function(comp) {
        var otherDocks = comp.hiddenDocked,
            len = otherDocks ? otherDocks.length : 0,
            i = 0;

        // Show temporarily hidden docked items
        for (; i < len; i++) {
            otherDocks[i].show();
        }

        // If it was an initial native collapse which hides the body
        if (!comp.body.isVisible()) {
            comp.body.show();
        }
        delete comp.collapsed;
        delete comp.height;
        delete comp.componentLayout.lastComponentSize;
        comp.suspendLayout = false;
        comp.flex = 1;
        comp.removeCls(comp.collapsedCls);
        comp.header.removeCls(comp.collapsedHeaderCls);
         if (this.initialAnimate) {
            this.toExpand.push(comp);
        } else {
            comp.fireEvent('expand', comp);
        }
        if (comp.collapseTool) {
            comp.collapseTool.setType('collapse-' + comp.collapseDirection);
        }
        comp.setAutoScroll(comp.initialConfig.autoScroll);
    }
});
