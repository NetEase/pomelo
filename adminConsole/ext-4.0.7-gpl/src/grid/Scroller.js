/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Docked in an Ext.grid.Panel, controls virtualized scrolling and synchronization
 * across different sections.
 */
Ext.define('Ext.grid.Scroller', {
    extend: 'Ext.Component',
    alias: 'widget.gridscroller',
    weight: 110,
    baseCls: Ext.baseCSSPrefix + 'scroller',
    focusable: false,
    reservedSpace: 0,

    renderTpl: [
        '<div class="' + Ext.baseCSSPrefix + 'scroller-ct" id="{baseId}_ct">',
            '<div class="' + Ext.baseCSSPrefix + 'stretcher" id="{baseId}_stretch"></div>',
        '</div>'
    ],

    initComponent: function() {
        var me       = this,
            dock     = me.dock,
            cls      = Ext.baseCSSPrefix + 'scroller-vertical';

        me.offsets = {bottom: 0};
        me.scrollProp = 'scrollTop';
        me.vertical = true;
        me.sizeProp = 'width';

        if (dock === 'top' || dock === 'bottom') {
            cls = Ext.baseCSSPrefix + 'scroller-horizontal';
            me.sizeProp = 'height';
            me.scrollProp = 'scrollLeft';
            me.vertical = false;
            me.weight += 5;
        }

        me.cls += (' ' + cls);

        Ext.applyIf(me.renderSelectors, {
            stretchEl: '.' + Ext.baseCSSPrefix + 'stretcher',
            scrollEl: '.' + Ext.baseCSSPrefix + 'scroller-ct'
        });
        me.callParent();
    },
    
    ensureDimension: function(){
        var me = this,
            sizeProp = me.sizeProp;
            
        me[sizeProp] = me.scrollerSize = Ext.getScrollbarSize()[sizeProp];  
    },

    initRenderData: function () {
        var me = this,
            ret = me.callParent(arguments) || {};

        ret.baseId = me.id;

        return ret;
    },

    afterRender: function() {
        var me = this;
        me.callParent();
        
        me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
        Ext.cache[me.el.id].skipGarbageCollection = true;
    },

    onAdded: function(container) {
        // Capture the controlling grid Panel so that we can use it even when we are undocked, and don't have an ownerCt
        this.ownerGrid = container;
        this.callParent(arguments);
    },

    getSizeCalculation: function() {
        var me     = this,
            owner  = me.getPanel(),
            width  = 1,
            height = 1,
            view, tbl;

        if (!me.vertical) {
            // TODO: Must gravitate to a single region..
            // Horizontal scrolling only scrolls virtualized region
            var items  = owner.query('tableview'),
                center = items[1] || items[0];

            if (!center) {
                return false;
            }
            // center is not guaranteed to have content, such as when there
            // are zero rows in the grid/tree. We read the width from the
            // headerCt instead.
            width = center.headerCt.getFullWidth();

            if (Ext.isIEQuirks) {
                width--;
            }
        } else {
            view = owner.down('tableview:not([lockableInjected])');
            if (!view || !view.el) {
                return false;
            }
            tbl = view.el.child('table', true);
            if (!tbl) {
                return false;
            }

            // needs to also account for header and scroller (if still in picture)
            // should calculate from headerCt.
            height = tbl.offsetHeight;
        }
        if (isNaN(width)) {
            width = 1;
        }
        if (isNaN(height)) {
            height = 1;
        }
        return {
            width: width,
            height: height
        };
    },

    invalidate: function(firstPass) {
        var me = this,
            stretchEl = me.stretchEl;

        if (!stretchEl || !me.ownerCt) {
            return;
        }

        var size  = me.getSizeCalculation(),
            scrollEl = me.scrollEl,
            elDom = scrollEl.dom,
            reservedSpace = me.reservedSpace,
            pos,
            extra = 5;

        if (size) {
            stretchEl.setSize(size);

            size = me.el.getSize(true);

            if (me.vertical) {
                size.width += extra;
                size.height -= reservedSpace;
                pos = 'left';
            } else {
                size.width -= reservedSpace;
                size.height += extra;
                pos = 'top';
            }

            scrollEl.setSize(size);
            elDom.style[pos] = (-extra) + 'px';

            // BrowserBug: IE7
            // This makes the scroller enabled, when initially rendering.
            elDom.scrollTop = elDom.scrollTop;
        }
    },

    afterComponentLayout: function() {
        this.callParent(arguments);
        this.invalidate();
    },

    restoreScrollPos: function () {
        var me = this,
            el = this.scrollEl,
            elDom = el && el.dom;

        if (me._scrollPos !== null && elDom) {
            elDom[me.scrollProp] = me._scrollPos;
            me._scrollPos = null;
        }
    },

    setReservedSpace: function (reservedSpace) {
        var me = this;
        if (me.reservedSpace !== reservedSpace) {
            me.reservedSpace = reservedSpace;
            me.invalidate();
        }
    },

    saveScrollPos: function () {
        var me = this,
            el = this.scrollEl,
            elDom = el && el.dom;

        me._scrollPos = elDom ? elDom[me.scrollProp] : null;
    },

    /**
     * Sets the scrollTop and constrains the value between 0 and max.
     * @param {Number} scrollTop
     * @return {Number} The resulting scrollTop value after being constrained
     */
    setScrollTop: function(scrollTop) {
        var el = this.scrollEl,
            elDom = el && el.dom;

        if (elDom) {
            return elDom.scrollTop = Ext.Number.constrain(scrollTop, 0, elDom.scrollHeight - elDom.clientHeight);
        }
    },

    /**
     * Sets the scrollLeft and constrains the value between 0 and max.
     * @param {Number} scrollLeft
     * @return {Number} The resulting scrollLeft value after being constrained
     */
    setScrollLeft: function(scrollLeft) {
        var el = this.scrollEl,
            elDom = el && el.dom;

        if (elDom) {
            return elDom.scrollLeft = Ext.Number.constrain(scrollLeft, 0, elDom.scrollWidth - elDom.clientWidth);
        }
    },

    /**
     * Scroll by deltaY
     * @param {Number} delta
     * @return {Number} The resulting scrollTop value
     */
    scrollByDeltaY: function(delta) {
        var el = this.scrollEl,
            elDom = el && el.dom;

        if (elDom) {
            return this.setScrollTop(elDom.scrollTop + delta);
        }
    },

    /**
     * Scroll by deltaX
     * @param {Number} delta
     * @return {Number} The resulting scrollLeft value
     */
    scrollByDeltaX: function(delta) {
        var el = this.scrollEl,
            elDom = el && el.dom;

        if (elDom) {
            return this.setScrollLeft(elDom.scrollLeft + delta);
        }
    },


    /**
     * Scroll to the top.
     */
    scrollToTop : function(){
        this.setScrollTop(0);
    },

    // synchronize the scroller with the bound gridviews
    onElScroll: function(event, target) {
        this.fireEvent('bodyscroll', event, target);
    },

    getPanel: function() {
        var me = this;
        if (!me.panel) {
            me.panel = this.up('[scrollerOwner]');
        }
        return me.panel;
    }
});


