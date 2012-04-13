/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.boxOverflow.Scroller
 * @extends Ext.layout.container.boxOverflow.None
 * @private
 */
Ext.define('Ext.layout.container.boxOverflow.Scroller', {

    /* Begin Definitions */

    extend: 'Ext.layout.container.boxOverflow.None',
    requires: ['Ext.util.ClickRepeater', 'Ext.Element'],
    alternateClassName: 'Ext.layout.boxOverflow.Scroller',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    /* End Definitions */

    /**
     * @cfg {Boolean} animateScroll
     * True to animate the scrolling of items within the layout (ignored if enableScroll is false)
     */
    animateScroll: false,

    /**
     * @cfg {Number} scrollIncrement
     * The number of pixels to scroll by on scroller click
     */
    scrollIncrement: 20,

    /**
     * @cfg {Number} wheelIncrement
     * The number of pixels to increment on mouse wheel scrolling.
     */
    wheelIncrement: 10,

    /**
     * @cfg {Number} scrollRepeatInterval
     * Number of milliseconds between each scroll while a scroller button is held down
     */
    scrollRepeatInterval: 60,

    /**
     * @cfg {Number} scrollDuration
     * Number of milliseconds that each scroll animation lasts
     */
    scrollDuration: 400,

    /**
     * @cfg {String} beforeCtCls
     * CSS class added to the beforeCt element. This is the element that holds any special items such as scrollers,
     * which must always be present at the leftmost edge of the Container
     */

    /**
     * @cfg {String} afterCtCls
     * CSS class added to the afterCt element. This is the element that holds any special items such as scrollers,
     * which must always be present at the rightmost edge of the Container
     */

    /**
     * @cfg {String} [scrollerCls='x-box-scroller']
     * CSS class added to both scroller elements if enableScroll is used
     */
    scrollerCls: Ext.baseCSSPrefix + 'box-scroller',

    /**
     * @cfg {String} beforeScrollerCls
     * CSS class added to the left scroller element if enableScroll is used
     */

    /**
     * @cfg {String} afterScrollerCls
     * CSS class added to the right scroller element if enableScroll is used
     */
    
    constructor: function(layout, config) {
        this.layout = layout;
        Ext.apply(this, config || {});
        
        this.addEvents(
            /**
             * @event scroll
             * @param {Ext.layout.container.boxOverflow.Scroller} scroller The layout scroller
             * @param {Number} newPosition The new position of the scroller
             * @param {Boolean/Object} animate If animating or not. If true, it will be a animation configuration, else it will be false
             */
            'scroll'
        );
    },
    
    initCSSClasses: function() {
        var me = this,
        layout = me.layout;

        if (!me.CSSinitialized) {
            me.beforeCtCls = me.beforeCtCls || Ext.baseCSSPrefix + 'box-scroller-' + layout.parallelBefore;
            me.afterCtCls  = me.afterCtCls  || Ext.baseCSSPrefix + 'box-scroller-' + layout.parallelAfter;
            me.beforeScrollerCls = me.beforeScrollerCls || Ext.baseCSSPrefix + layout.owner.getXType() + '-scroll-' + layout.parallelBefore;
            me.afterScrollerCls  = me.afterScrollerCls  || Ext.baseCSSPrefix + layout.owner.getXType() + '-scroll-' + layout.parallelAfter;
            me.CSSinitializes = true;
        }
    },

    handleOverflow: function(calculations, targetSize) {
        var me = this,
            layout = me.layout,
            methodName = 'get' + layout.parallelPrefixCap,
            newSize = {};

        me.initCSSClasses();
        me.callParent(arguments);
        this.createInnerElements();
        this.showScrollers();
        newSize[layout.perpendicularPrefix] = targetSize[layout.perpendicularPrefix];
        newSize[layout.parallelPrefix] = targetSize[layout.parallelPrefix] - (me.beforeCt[methodName]() + me.afterCt[methodName]());
        return { targetSize: newSize };
    },

    /**
     * @private
     * Creates the beforeCt and afterCt elements if they have not already been created
     */
    createInnerElements: function() {
        var me = this,
            target = me.layout.getRenderTarget();

        //normal items will be rendered to the innerCt. beforeCt and afterCt allow for fixed positioning of
        //special items such as scrollers or dropdown menu triggers
        if (!me.beforeCt) {
            target.addCls(Ext.baseCSSPrefix + me.layout.direction + '-box-overflow-body');
            me.beforeCt = target.insertSibling({cls: Ext.layout.container.Box.prototype.innerCls + ' ' + me.beforeCtCls}, 'before');
            me.afterCt  = target.insertSibling({cls: Ext.layout.container.Box.prototype.innerCls + ' ' + me.afterCtCls},  'after');
            me.createWheelListener();
        }
    },

    /**
     * @private
     * Sets up an listener to scroll on the layout's innerCt mousewheel event
     */
    createWheelListener: function() {
        this.layout.innerCt.on({
            scope     : this,
            mousewheel: function(e) {
                e.stopEvent();

                this.scrollBy(e.getWheelDelta() * this.wheelIncrement * -1, false);
            }
        });
    },

    /**
     * @private
     */
    clearOverflow: function() {
        this.hideScrollers();
    },

    /**
     * @private
     * Shows the scroller elements in the beforeCt and afterCt. Creates the scrollers first if they are not already
     * present. 
     */
    showScrollers: function() {
        this.createScrollers();
        this.beforeScroller.show();
        this.afterScroller.show();
        this.updateScrollButtons();
        
        this.layout.owner.addClsWithUI('scroller');
    },

    /**
     * @private
     * Hides the scroller elements in the beforeCt and afterCt
     */
    hideScrollers: function() {
        if (this.beforeScroller != undefined) {
            this.beforeScroller.hide();
            this.afterScroller.hide();
            
            this.layout.owner.removeClsWithUI('scroller');
        }
    },

    /**
     * @private
     * Creates the clickable scroller elements and places them into the beforeCt and afterCt
     */
    createScrollers: function() {
        if (!this.beforeScroller && !this.afterScroller) {
            var before = this.beforeCt.createChild({
                cls: Ext.String.format("{0} {1} ", this.scrollerCls, this.beforeScrollerCls)
            });

            var after = this.afterCt.createChild({
                cls: Ext.String.format("{0} {1}", this.scrollerCls, this.afterScrollerCls)
            });

            before.addClsOnOver(this.beforeScrollerCls + '-hover');
            after.addClsOnOver(this.afterScrollerCls + '-hover');

            before.setVisibilityMode(Ext.Element.DISPLAY);
            after.setVisibilityMode(Ext.Element.DISPLAY);

            this.beforeRepeater = Ext.create('Ext.util.ClickRepeater', before, {
                interval: this.scrollRepeatInterval,
                handler : this.scrollLeft,
                scope   : this
            });

            this.afterRepeater = Ext.create('Ext.util.ClickRepeater', after, {
                interval: this.scrollRepeatInterval,
                handler : this.scrollRight,
                scope   : this
            });

            /**
             * @property beforeScroller
             * @type Ext.Element
             * The left scroller element. Only created when needed.
             */
            this.beforeScroller = before;

            /**
             * @property afterScroller
             * @type Ext.Element
             * The left scroller element. Only created when needed.
             */
            this.afterScroller = after;
        }
    },

    /**
     * @private
     */
    destroy: function() {
        Ext.destroy(this.beforeRepeater, this.afterRepeater, this.beforeScroller, this.afterScroller, this.beforeCt, this.afterCt);
    },

    /**
     * @private
     * Scrolls left or right by the number of pixels specified
     * @param {Number} delta Number of pixels to scroll to the right by. Use a negative number to scroll left
     */
    scrollBy: function(delta, animate) {
        this.scrollTo(this.getScrollPosition() + delta, animate);
    },

    /**
     * @private
     * @return {Object} Object passed to scrollTo when scrolling
     */
    getScrollAnim: function() {
        return {
            duration: this.scrollDuration, 
            callback: this.updateScrollButtons, 
            scope   : this
        };
    },

    /**
     * @private
     * Enables or disables each scroller button based on the current scroll position
     */
    updateScrollButtons: function() {
        if (this.beforeScroller == undefined || this.afterScroller == undefined) {
            return;
        }

        var beforeMeth = this.atExtremeBefore()  ? 'addCls' : 'removeCls',
            afterMeth  = this.atExtremeAfter() ? 'addCls' : 'removeCls',
            beforeCls  = this.beforeScrollerCls + '-disabled',
            afterCls   = this.afterScrollerCls  + '-disabled';
        
        this.beforeScroller[beforeMeth](beforeCls);
        this.afterScroller[afterMeth](afterCls);
        this.scrolling = false;
    },

    /**
     * @private
     * Returns true if the innerCt scroll is already at its left-most point
     * @return {Boolean} True if already at furthest left point
     */
    atExtremeBefore: function() {
        return this.getScrollPosition() === 0;
    },

    /**
     * @private
     * Scrolls to the left by the configured amount
     */
    scrollLeft: function() {
        this.scrollBy(-this.scrollIncrement, false);
    },

    /**
     * @private
     * Scrolls to the right by the configured amount
     */
    scrollRight: function() {
        this.scrollBy(this.scrollIncrement, false);
    },

    /**
     * Returns the current scroll position of the innerCt element
     * @return {Number} The current scroll position
     */
    getScrollPosition: function(){
        var layout = this.layout;
        return parseInt(layout.innerCt.dom['scroll' + layout.parallelBeforeCap], 10) || 0;
    },

    /**
     * @private
     * Returns the maximum value we can scrollTo
     * @return {Number} The max scroll value
     */
    getMaxScrollPosition: function() {
        var layout = this.layout;
        return layout.innerCt.dom['scroll' + layout.parallelPrefixCap] - this.layout.innerCt['get' + layout.parallelPrefixCap]();
    },

    /**
     * @private
     * Returns true if the innerCt scroll is already at its right-most point
     * @return {Boolean} True if already at furthest right point
     */
    atExtremeAfter: function() {
        return this.getScrollPosition() >= this.getMaxScrollPosition();
    },

    /**
     * @private
     * Scrolls to the given position. Performs bounds checking.
     * @param {Number} position The position to scroll to. This is constrained.
     * @param {Boolean} animate True to animate. If undefined, falls back to value of this.animateScroll
     */
    scrollTo: function(position, animate) {
        var me = this,
            layout = me.layout,
            oldPosition = me.getScrollPosition(),
            newPosition = Ext.Number.constrain(position, 0, me.getMaxScrollPosition());

        if (newPosition != oldPosition && !me.scrolling) {
            if (animate == undefined) {
                animate = me.animateScroll;
            }

            layout.innerCt.scrollTo(layout.parallelBefore, newPosition, animate ? me.getScrollAnim() : false);
            if (animate) {
                me.scrolling = true;
            } else {
                me.scrolling = false;
                me.updateScrollButtons();
            }
            
            me.fireEvent('scroll', me, newPosition, animate ? me.getScrollAnim() : false);
        }
    },

    /**
     * Scrolls to the given component.
     * @param {String/Number/Ext.Component} item The item to scroll to. Can be a numerical index, component id 
     * or a reference to the component itself.
     * @param {Boolean} animate True to animate the scrolling
     */
    scrollToItem: function(item, animate) {
        var me = this,
            layout = me.layout,
            visibility,
            box,
            newPos;

        item = me.getItem(item);
        if (item != undefined) {
            visibility = this.getItemVisibility(item);
            if (!visibility.fullyVisible) {
                box  = item.getBox(true, true);
                newPos = box[layout.parallelPosition];
                if (visibility.hiddenEnd) {
                    newPos -= (this.layout.innerCt['get' + layout.parallelPrefixCap]() - box[layout.parallelPrefix]);
                }
                this.scrollTo(newPos, animate);
            }
        }
    },

    /**
     * @private
     * For a given item in the container, return an object with information on whether the item is visible
     * with the current innerCt scroll value.
     * @param {Ext.Component} item The item
     * @return {Object} Values for fullyVisible, hiddenStart and hiddenEnd
     */
    getItemVisibility: function(item) {
        var me          = this,
            box         = me.getItem(item).getBox(true, true),
            layout      = me.layout,
            itemStart   = box[layout.parallelPosition],
            itemEnd     = itemStart + box[layout.parallelPrefix],
            scrollStart = me.getScrollPosition(),
            scrollEnd   = scrollStart + layout.innerCt['get' + layout.parallelPrefixCap]();

        return {
            hiddenStart : itemStart < scrollStart,
            hiddenEnd   : itemEnd > scrollEnd,
            fullyVisible: itemStart > scrollStart && itemEnd < scrollEnd
        };
    }
});
