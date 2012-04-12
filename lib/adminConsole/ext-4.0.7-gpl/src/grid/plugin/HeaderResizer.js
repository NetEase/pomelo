/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.plugin.HeaderResizer
 * @extends Ext.util.Observable
 *
 * Plugin to add header resizing functionality to a HeaderContainer.
 * Always resizing header to the left of the splitter you are resizing.
 */
Ext.define('Ext.grid.plugin.HeaderResizer', {
    extend: 'Ext.util.Observable',
    requires: ['Ext.dd.DragTracker', 'Ext.util.Region'],
    alias: 'plugin.gridheaderresizer',

    disabled: false,

    /**
     * @cfg {Boolean} dynamic
     * Set to true to resize on the fly rather than using a proxy marker. Defaults to false.
     */
    configs: {
        dynamic: true
    },

    colHeaderCls: Ext.baseCSSPrefix + 'column-header',

    minColWidth: 40,
    maxColWidth: 1000,
    wResizeCursor: 'col-resize',
    eResizeCursor: 'col-resize',
    // not using w and e resize bc we are only ever resizing one
    // column
    //wResizeCursor: Ext.isWebKit ? 'w-resize' : 'col-resize',
    //eResizeCursor: Ext.isWebKit ? 'e-resize' : 'col-resize',

    init: function(headerCt) {
        this.headerCt = headerCt;
        headerCt.on('render', this.afterHeaderRender, this, {single: true});
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        if (this.tracker) {
            this.tracker.destroy();
        }
    },

    afterHeaderRender: function() {
        var headerCt = this.headerCt,
            el = headerCt.el;

        headerCt.mon(el, 'mousemove', this.onHeaderCtMouseMove, this);

        this.tracker = Ext.create('Ext.dd.DragTracker', {
            disabled: this.disabled,
            onBeforeStart: Ext.Function.bind(this.onBeforeStart, this),
            onStart: Ext.Function.bind(this.onStart, this),
            onDrag: Ext.Function.bind(this.onDrag, this),
            onEnd: Ext.Function.bind(this.onEnd, this),
            tolerance: 3,
            autoStart: 300,
            el: el
        });
    },

    // As we mouse over individual headers, change the cursor to indicate
    // that resizing is available, and cache the resize target header for use
    // if/when they mousedown.
    onHeaderCtMouseMove: function(e, t) {
        if (this.headerCt.dragging) {
            if (this.activeHd) {
                this.activeHd.el.dom.style.cursor = '';
                delete this.activeHd;
            }
        } else {
            var headerEl = e.getTarget('.' + this.colHeaderCls, 3, true),
                overHeader, resizeHeader;

            if (headerEl){
                overHeader = Ext.getCmp(headerEl.id);

                // On left edge, go back to the previous non-hidden header.
                if (overHeader.isOnLeftEdge(e)) {
                    resizeHeader = overHeader.previousNode('gridcolumn:not([hidden])');

                }
                // Else, if on the right edge, we're resizing the column we are over
                else if (overHeader.isOnRightEdge(e)) {
                    resizeHeader = overHeader;
                }
                // Between the edges: we are not resizing
                else {
                    resizeHeader = null;
                }

                // We *are* resizing
                if (resizeHeader) {
                    // If we're attempting to resize a group header, that cannot be resized,
                    // so find its last visible leaf header; Group headers are sized
                    // by the size of their child headers.
                    if (resizeHeader.isGroupHeader) {
                        resizeHeader = resizeHeader.down(':not([isGroupHeader]):not([hidden]):last');
                    }

                    // Check if the header is resizable. Continue checking the old "fixed" property, bug also
                    // check whether the resizablwe property is set to false.
                    if (resizeHeader && !(resizeHeader.fixed || (resizeHeader.resizable === false) || this.disabled)) {
                        this.activeHd = resizeHeader;
                        overHeader.el.dom.style.cursor = this.eResizeCursor;
                    }
                // reset
                } else {
                    overHeader.el.dom.style.cursor = '';
                    delete this.activeHd;
                }
            }
        }
    },

    // only start when there is an activeHd
    onBeforeStart : function(e){
        var t = e.getTarget();
        // cache the activeHd because it will be cleared.
        this.dragHd = this.activeHd;

        if (!!this.dragHd && !Ext.fly(t).hasCls('x-column-header-trigger') && !this.headerCt.dragging) {
            //this.headerCt.dragging = true;
            this.tracker.constrainTo = this.getConstrainRegion();
            return true;
        } else {
            this.headerCt.dragging = false;
            return false;
        }
    },

    // get the region to constrain to, takes into account max and min col widths
    getConstrainRegion: function() {
        var dragHdEl = this.dragHd.el,
            region   = Ext.util.Region.getRegion(dragHdEl);

        return region.adjust(
            0,
            this.maxColWidth - dragHdEl.getWidth(),
            0,
            this.minColWidth
        );
    },

    // initialize the left and right hand side markers around
    // the header that we are resizing
    onStart: function(e){
        var me       = this,
            dragHd   = me.dragHd,
            dragHdEl = dragHd.el,
            width    = dragHdEl.getWidth(),
            headerCt = me.headerCt,
            t        = e.getTarget();

        if (me.dragHd && !Ext.fly(t).hasCls('x-column-header-trigger')) {
            headerCt.dragging = true;
        }

        me.origWidth = width;

        // setup marker proxies
        if (!me.dynamic) {
            var xy           = dragHdEl.getXY(),
                gridSection  = headerCt.up('[scrollerOwner]'),
                dragHct      = me.dragHd.up(':not([isGroupHeader])'),
                firstSection = dragHct.up(),
                lhsMarker    = gridSection.getLhsMarker(),
                rhsMarker    = gridSection.getRhsMarker(),
                el           = rhsMarker.parent(),
                offsetLeft   = el.getLeft(true),
                offsetTop    = el.getTop(true),
                topLeft      = el.translatePoints(xy),
                markerHeight = firstSection.body.getHeight() + headerCt.getHeight(),
                top = topLeft.top - offsetTop;

            lhsMarker.setTop(top);
            rhsMarker.setTop(top);
            lhsMarker.setHeight(markerHeight);
            rhsMarker.setHeight(markerHeight);
            lhsMarker.setLeft(topLeft.left - offsetLeft);
            rhsMarker.setLeft(topLeft.left + width - offsetLeft);
        }
    },

    // synchronize the rhsMarker with the mouse movement
    onDrag: function(e){
        if (!this.dynamic) {
            var xy          = this.tracker.getXY('point'),
                gridSection = this.headerCt.up('[scrollerOwner]'),
                rhsMarker   = gridSection.getRhsMarker(),
                el          = rhsMarker.parent(),
                topLeft     = el.translatePoints(xy),
                offsetLeft  = el.getLeft(true);

            rhsMarker.setLeft(topLeft.left - offsetLeft);
        // Resize as user interacts
        } else {
            this.doResize();
        }
    },

    onEnd: function(e){
        this.headerCt.dragging = false;
        if (this.dragHd) {
            if (!this.dynamic) {
                var dragHd      = this.dragHd,
                    gridSection = this.headerCt.up('[scrollerOwner]'),
                    lhsMarker   = gridSection.getLhsMarker(),
                    rhsMarker   = gridSection.getRhsMarker(),
                    currWidth   = dragHd.getWidth(),
                    offset      = this.tracker.getOffset('point'),
                    offscreen   = -9999;

                // hide markers
                lhsMarker.setLeft(offscreen);
                rhsMarker.setLeft(offscreen);
            }
            this.doResize();
        }
    },

    doResize: function() {
        if (this.dragHd) {
            var dragHd = this.dragHd,
                nextHd,
                offset = this.tracker.getOffset('point');

            // resize the dragHd
            if (dragHd.flex) {
                delete dragHd.flex;
            }

            this.headerCt.suspendLayout = true;
            dragHd.setWidth(this.origWidth + offset[0], false);

            // In the case of forceFit, change the following Header width.
            // Then apply the two width changes by laying out the owning HeaderContainer
            // If HeaderContainer is configured forceFit, inhibit upstream layout notification, so that
            // we can also shrink the following Header by an equal amount, and *then* inform the upstream layout.
            if (this.headerCt.forceFit) {
                nextHd = dragHd.nextNode('gridcolumn:not([hidden]):not([isGroupHeader])');
                if (nextHd) {
                    delete nextHd.flex;
                    nextHd.setWidth(nextHd.getWidth() - offset[0], false);
                }
            }
            this.headerCt.suspendLayout = false;
            this.headerCt.doComponentLayout(this.headerCt.getFullWidth());
        }
    },

    disable: function() {
        this.disabled = true;
        if (this.tracker) {
            this.tracker.disable();
        }
    },

    enable: function() {
        this.disabled = false;
        if (this.tracker) {
            this.tracker.enable();
        }
    }
});
