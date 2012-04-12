/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A specialized container representing the viewable application area (the browser viewport).
 *
 * The Viewport renders itself to the document body, and automatically sizes itself to the size of
 * the browser viewport and manages window resizing. There may only be one Viewport created
 * in a page.
 *
 * Like any {@link Ext.container.Container Container}, a Viewport will only perform sizing and positioning
 * on its child Components if you configure it with a {@link #layout}.
 *
 * A Common layout used with Viewports is {@link Ext.layout.container.Border border layout}, but if the
 * required layout is simpler, a different layout should be chosen.
 *
 * For example, to simply make a single child item occupy all available space, use
 * {@link Ext.layout.container.Fit fit layout}.
 *
 * To display one "active" item at full size from a choice of several child items, use
 * {@link Ext.layout.container.Card card layout}.
 *
 * Inner layouts are available by virtue of the fact that all {@link Ext.panel.Panel Panel}s
 * added to the Viewport, either through its {@link #items}, or through the items, or the {@link #add}
 * method of any of its child Panels may themselves have a layout.
 *
 * The Viewport does not provide scrolling, so child Panels within the Viewport should provide
 * for scrolling if needed using the {@link #autoScroll} config.
 *
 * An example showing a classic application border layout:
 *
 *     @example
 *     Ext.create('Ext.container.Viewport', {
 *         layout: 'border',
 *         items: [{
 *             region: 'north',
 *             html: '<h1 class="x-panel-header">Page Title</h1>',
 *             autoHeight: true,
 *             border: false,
 *             margins: '0 0 5 0'
 *         }, {
 *             region: 'west',
 *             collapsible: true,
 *             title: 'Navigation',
 *             width: 150
 *             // could use a TreePanel or AccordionLayout for navigational items
 *         }, {
 *             region: 'south',
 *             title: 'South Panel',
 *             collapsible: true,
 *             html: 'Information goes here',
 *             split: true,
 *             height: 100,
 *             minHeight: 100
 *         }, {
 *             region: 'east',
 *             title: 'East Panel',
 *             collapsible: true,
 *             split: true,
 *             width: 150
 *         }, {
 *             region: 'center',
 *             xtype: 'tabpanel', // TabPanel itself has no title
 *             activeTab: 0,      // First tab active by default
 *             items: {
 *                 title: 'Default Tab',
 *                 html: 'The first tab\'s content. Others may be added dynamically'
 *             }
 *         }]
 *     });
 */
Ext.define('Ext.container.Viewport', {
    extend: 'Ext.container.Container',
    alias: 'widget.viewport',
    requires: ['Ext.EventManager'],
    alternateClassName: 'Ext.Viewport',

    // Privatize config options which, if used, would interfere with the
    // correct operation of the Viewport as the sole manager of the
    // layout of the document body.

    /**
     * @cfg {String/HTMLElement/Ext.Element} applyTo
     * Not applicable.
     */

    /**
     * @cfg {Boolean} allowDomMove
     * Not applicable.
     */

    /**
     * @cfg {Boolean} hideParent
     * Not applicable.
     */

    /**
     * @cfg {String/HTMLElement/Ext.Element} renderTo
     * Not applicable. Always renders to document body.
     */

    /**
     * @cfg {Boolean} hideParent
     * Not applicable.
     */

    /**
     * @cfg {Number} height
     * Not applicable. Sets itself to viewport width.
     */

    /**
     * @cfg {Number} width
     * Not applicable. Sets itself to viewport height.
     */

    /**
     * @cfg {Boolean} autoHeight
     * Not applicable.
     */

    /**
     * @cfg {Boolean} autoWidth
     * Not applicable.
     */

    /**
     * @cfg {Boolean} deferHeight
     * Not applicable.
     */

    /**
     * @cfg {Boolean} monitorResize
     * Not applicable.
     */

    isViewport: true,

    ariaRole: 'application',

    initComponent : function() {
        var me = this,
            html = Ext.fly(document.body.parentNode),
            el;
        me.callParent(arguments);
        html.addCls(Ext.baseCSSPrefix + 'viewport');
        if (me.autoScroll) {
            html.setStyle('overflow', 'auto');
        }
        me.el = el = Ext.getBody();
        el.setHeight = Ext.emptyFn;
        el.setWidth = Ext.emptyFn;
        el.setSize = Ext.emptyFn;
        el.dom.scroll = 'no';
        me.allowDomMove = false;
        Ext.EventManager.onWindowResize(me.fireResize, me);
        me.renderTo = me.el;
        me.width = Ext.Element.getViewportWidth();
        me.height = Ext.Element.getViewportHeight();
    },

    fireResize : function(w, h){
        // setSize is the single entry point to layouts
        this.setSize(w, h);
    }
});

