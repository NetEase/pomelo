/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * ToolTip is a {@link Ext.tip.Tip} implementation that handles the common case of displaying a
 * tooltip when hovering over a certain element or elements on the page. It allows fine-grained
 * control over the tooltip's alignment relative to the target element or mouse, and the timing
 * of when it is automatically shown and hidden.
 *
 * This implementation does **not** have a built-in method of automatically populating the tooltip's
 * text based on the target element; you must either configure a fixed {@link #html} value for each
 * ToolTip instance, or implement custom logic (e.g. in a {@link #beforeshow} event listener) to
 * generate the appropriate tooltip content on the fly. See {@link Ext.tip.QuickTip} for a more
 * convenient way of automatically populating and configuring a tooltip based on specific DOM
 * attributes of each target element.
 *
 * # Basic Example
 *
 *     var tip = Ext.create('Ext.tip.ToolTip', {
 *         target: 'clearButton',
 *         html: 'Press this button to clear the form'
 *     });
 *
 * {@img Ext.tip.ToolTip/Ext.tip.ToolTip1.png Basic Ext.tip.ToolTip}
 *
 * # Delegation
 *
 * In addition to attaching a ToolTip to a single element, you can also use delegation to attach
 * one ToolTip to many elements under a common parent. This is more efficient than creating many
 * ToolTip instances. To do this, point the {@link #target} config to a common ancestor of all the
 * elements, and then set the {@link #delegate} config to a CSS selector that will select all the
 * appropriate sub-elements.
 *
 * When using delegation, it is likely that you will want to programmatically change the content
 * of the ToolTip based on each delegate element; you can do this by implementing a custom
 * listener for the {@link #beforeshow} event. Example:
 *
 *     var store = Ext.create('Ext.data.ArrayStore', {
 *         fields: ['company', 'price', 'change'],
 *         data: [
 *             ['3m Co',                               71.72, 0.02],
 *             ['Alcoa Inc',                           29.01, 0.42],
 *             ['Altria Group Inc',                    83.81, 0.28],
 *             ['American Express Company',            52.55, 0.01],
 *             ['American International Group, Inc.',  64.13, 0.31],
 *             ['AT&T Inc.',                           31.61, -0.48]
 *         ]
 *     });
 *
 *     var grid = Ext.create('Ext.grid.Panel', {
 *         title: 'Array Grid',
 *         store: store,
 *         columns: [
 *             {text: 'Company', flex: 1, dataIndex: 'company'},
 *             {text: 'Price', width: 75, dataIndex: 'price'},
 *             {text: 'Change', width: 75, dataIndex: 'change'}
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 *
 *     grid.getView().on('render', function(view) {
 *         view.tip = Ext.create('Ext.tip.ToolTip', {
 *             // The overall target element.
 *             target: view.el,
 *             // Each grid row causes its own seperate show and hide.
 *             delegate: view.itemSelector,
 *             // Moving within the row should not hide the tip.
 *             trackMouse: true,
 *             // Render immediately so that tip.body can be referenced prior to the first show.
 *             renderTo: Ext.getBody(),
 *             listeners: {
 *                 // Change content dynamically depending on which element triggered the show.
 *                 beforeshow: function updateTipBody(tip) {
 *                     tip.update('Over company "' + view.getRecord(tip.triggerElement).get('company') + '"');
 *                 }
 *             }
 *         });
 *     });
 *
 * {@img Ext.tip.ToolTip/Ext.tip.ToolTip2.png Ext.tip.ToolTip with delegation}
 *
 * # Alignment
 *
 * The following configuration properties allow control over how the ToolTip is aligned relative to
 * the target element and/or mouse pointer:
 *
 * - {@link #anchor}
 * - {@link #anchorToTarget}
 * - {@link #anchorOffset}
 * - {@link #trackMouse}
 * - {@link #mouseOffset}
 *
 * # Showing/Hiding
 *
 * The following configuration properties allow control over how and when the ToolTip is automatically
 * shown and hidden:
 *
 * - {@link #autoHide}
 * - {@link #showDelay}
 * - {@link #hideDelay}
 * - {@link #dismissDelay}
 *
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define('Ext.tip.ToolTip', {
    extend: 'Ext.tip.Tip',
    alias: 'widget.tooltip',
    alternateClassName: 'Ext.ToolTip',
    /**
     * @property {HTMLElement} triggerElement
     * When a ToolTip is configured with the `{@link #delegate}`
     * option to cause selected child elements of the `{@link #target}`
     * Element to each trigger a seperate show event, this property is set to
     * the DOM element which triggered the show.
     */
    /**
     * @cfg {HTMLElement/Ext.Element/String} target
     * The target element or string id to monitor for mouseover events to trigger
     * showing this ToolTip.
     */
    /**
     * @cfg {Boolean} [autoHide=true]
     * True to automatically hide the tooltip after the
     * mouse exits the target element or after the `{@link #dismissDelay}`
     * has expired if set.  If `{@link #closable} = true`
     * a close tool button will be rendered into the tooltip header.
     */
    /**
     * @cfg {Number} showDelay
     * Delay in milliseconds before the tooltip displays after the mouse enters the target element.
     */
    showDelay: 500,
    /**
     * @cfg {Number} hideDelay
     * Delay in milliseconds after the mouse exits the target element but before the tooltip actually hides.
     * Set to 0 for the tooltip to hide immediately.
     */
    hideDelay: 200,
    /**
     * @cfg {Number} dismissDelay
     * Delay in milliseconds before the tooltip automatically hides. To disable automatic hiding, set
     * dismissDelay = 0.
     */
    dismissDelay: 5000,
    /**
     * @cfg {Number[]} [mouseOffset=[15,18]]
     * An XY offset from the mouse position where the tooltip should be shown.
     */
    /**
     * @cfg {Boolean} trackMouse
     * True to have the tooltip follow the mouse as it moves over the target element.
     */
    trackMouse: false,
    /**
     * @cfg {String} anchor
     * If specified, indicates that the tip should be anchored to a
     * particular side of the target element or mouse pointer ("top", "right", "bottom",
     * or "left"), with an arrow pointing back at the target or mouse pointer. If
     * {@link #constrainPosition} is enabled, this will be used as a preferred value
     * only and may be flipped as needed.
     */
    /**
     * @cfg {Boolean} anchorToTarget
     * True to anchor the tooltip to the target element, false to anchor it relative to the mouse coordinates.
     * When `anchorToTarget` is true, use `{@link #defaultAlign}` to control tooltip alignment to the
     * target element.  When `anchorToTarget` is false, use `{@link #anchor}` instead to control alignment.
     */
    anchorToTarget: true,
    /**
     * @cfg {Number} anchorOffset
     * A numeric pixel value used to offset the default position of the anchor arrow.  When the anchor
     * position is on the top or bottom of the tooltip, `anchorOffset` will be used as a horizontal offset.
     * Likewise, when the anchor position is on the left or right side, `anchorOffset` will be used as
     * a vertical offset.
     */
    anchorOffset: 0,
    /**
     * @cfg {String} delegate
     *
     * A {@link Ext.DomQuery DomQuery} selector which allows selection of individual elements within the
     * `{@link #target}` element to trigger showing and hiding the ToolTip as the mouse moves within the
     * target.
     *
     * When specified, the child element of the target which caused a show event is placed into the
     * `{@link #triggerElement}` property before the ToolTip is shown.
     *
     * This may be useful when a Component has regular, repeating elements in it, each of which need a
     * ToolTip which contains information specific to that element.
     *
     * See the delegate example in class documentation of {@link Ext.tip.ToolTip}.
     */

    // private
    targetCounter: 0,
    quickShowInterval: 250,

    // private
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        me.lastActive = new Date();
        me.setTarget(me.target);
        me.origAnchor = me.anchor;
    },

    // private
    onRender: function(ct, position) {
        var me = this;
        me.callParent(arguments);
        me.anchorCls = Ext.baseCSSPrefix + 'tip-anchor-' + me.getAnchorPosition();
        me.anchorEl = me.el.createChild({
            cls: Ext.baseCSSPrefix + 'tip-anchor ' + me.anchorCls
        });
    },

    // private
    afterRender: function() {
        var me = this,
            zIndex;

        me.callParent(arguments);
        zIndex = parseInt(me.el.getZIndex(), 10) || 0;
        me.anchorEl.setStyle('z-index', zIndex + 1).setVisibilityMode(Ext.Element.DISPLAY);
    },

    /**
     * Binds this ToolTip to the specified element. The tooltip will be displayed when the mouse moves over the element.
     * @param {String/HTMLElement/Ext.Element} t The Element, HtmlElement, or ID of an element to bind to
     */
    setTarget: function(target) {
        var me = this,
            t = Ext.get(target),
            tg;

        if (me.target) {
            tg = Ext.get(me.target);
            me.mun(tg, 'mouseover', me.onTargetOver, me);
            me.mun(tg, 'mouseout', me.onTargetOut, me);
            me.mun(tg, 'mousemove', me.onMouseMove, me);
        }

        me.target = t;
        if (t) {

            me.mon(t, {
                // TODO - investigate why IE6/7 seem to fire recursive resize in e.getXY
                // breaking QuickTip#onTargetOver (EXTJSIV-1608)
                freezeEvent: true,

                mouseover: me.onTargetOver,
                mouseout: me.onTargetOut,
                mousemove: me.onMouseMove,
                scope: me
            });
        }
        if (me.anchor) {
            me.anchorTarget = me.target;
        }
    },

    // private
    onMouseMove: function(e) {
        var me = this,
            t = me.delegate ? e.getTarget(me.delegate) : me.triggerElement = true,
            xy;
        if (t) {
            me.targetXY = e.getXY();
            if (t === me.triggerElement) {
                if (!me.hidden && me.trackMouse) {
                    xy = me.getTargetXY();
                    if (me.constrainPosition) {
                        xy = me.el.adjustForConstraints(xy, me.el.getScopeParent());
                    }
                    me.setPagePosition(xy);
                }
            } else {
                me.hide();
                me.lastActive = new Date(0);
                me.onTargetOver(e);
            }
        } else if ((!me.closable && me.isVisible()) && me.autoHide !== false) {
            me.hide();
        }
    },

    // private
    getTargetXY: function() {
        var me = this,
            mouseOffset;
        if (me.delegate) {
            me.anchorTarget = me.triggerElement;
        }
        if (me.anchor) {
            me.targetCounter++;
                var offsets = me.getOffsets(),
                    xy = (me.anchorToTarget && !me.trackMouse) ? me.el.getAlignToXY(me.anchorTarget, me.getAnchorAlign()) : me.targetXY,
                    dw = Ext.Element.getViewWidth() - 5,
                    dh = Ext.Element.getViewHeight() - 5,
                    de = document.documentElement,
                    bd = document.body,
                    scrollX = (de.scrollLeft || bd.scrollLeft || 0) + 5,
                    scrollY = (de.scrollTop || bd.scrollTop || 0) + 5,
                    axy = [xy[0] + offsets[0], xy[1] + offsets[1]],
                    sz = me.getSize(),
                    constrainPosition = me.constrainPosition;

            me.anchorEl.removeCls(me.anchorCls);

            if (me.targetCounter < 2 && constrainPosition) {
                if (axy[0] < scrollX) {
                    if (me.anchorToTarget) {
                        me.defaultAlign = 'l-r';
                        if (me.mouseOffset) {
                            me.mouseOffset[0] *= -1;
                        }
                    }
                    me.anchor = 'left';
                    return me.getTargetXY();
                }
                if (axy[0] + sz.width > dw) {
                    if (me.anchorToTarget) {
                        me.defaultAlign = 'r-l';
                        if (me.mouseOffset) {
                            me.mouseOffset[0] *= -1;
                        }
                    }
                    me.anchor = 'right';
                    return me.getTargetXY();
                }
                if (axy[1] < scrollY) {
                    if (me.anchorToTarget) {
                        me.defaultAlign = 't-b';
                        if (me.mouseOffset) {
                            me.mouseOffset[1] *= -1;
                        }
                    }
                    me.anchor = 'top';
                    return me.getTargetXY();
                }
                if (axy[1] + sz.height > dh) {
                    if (me.anchorToTarget) {
                        me.defaultAlign = 'b-t';
                        if (me.mouseOffset) {
                            me.mouseOffset[1] *= -1;
                        }
                    }
                    me.anchor = 'bottom';
                    return me.getTargetXY();
                }
            }

            me.anchorCls = Ext.baseCSSPrefix + 'tip-anchor-' + me.getAnchorPosition();
            me.anchorEl.addCls(me.anchorCls);
            me.targetCounter = 0;
            return axy;
        } else {
            mouseOffset = me.getMouseOffset();
            return (me.targetXY) ? [me.targetXY[0] + mouseOffset[0], me.targetXY[1] + mouseOffset[1]] : mouseOffset;
        }
    },

    getMouseOffset: function() {
        var me = this,
        offset = me.anchor ? [0, 0] : [15, 18];
        if (me.mouseOffset) {
            offset[0] += me.mouseOffset[0];
            offset[1] += me.mouseOffset[1];
        }
        return offset;
    },

    // private
    getAnchorPosition: function() {
        var me = this,
            m;
        if (me.anchor) {
            me.tipAnchor = me.anchor.charAt(0);
        } else {
            m = me.defaultAlign.match(/^([a-z]+)-([a-z]+)(\?)?$/);
            //<debug>
            if (!m) {
                Ext.Error.raise('The AnchorTip.defaultAlign value "' + me.defaultAlign + '" is invalid.');
            }
            //</debug>
            me.tipAnchor = m[1].charAt(0);
        }

        switch (me.tipAnchor) {
        case 't':
            return 'top';
        case 'b':
            return 'bottom';
        case 'r':
            return 'right';
        }
        return 'left';
    },

    // private
    getAnchorAlign: function() {
        switch (this.anchor) {
        case 'top':
            return 'tl-bl';
        case 'left':
            return 'tl-tr';
        case 'right':
            return 'tr-tl';
        default:
            return 'bl-tl';
        }
    },

    // private
    getOffsets: function() {
        var me = this,
            mouseOffset,
            offsets,
            ap = me.getAnchorPosition().charAt(0);
        if (me.anchorToTarget && !me.trackMouse) {
            switch (ap) {
            case 't':
                offsets = [0, 9];
                break;
            case 'b':
                offsets = [0, -13];
                break;
            case 'r':
                offsets = [ - 13, 0];
                break;
            default:
                offsets = [9, 0];
                break;
            }
        } else {
            switch (ap) {
            case 't':
                offsets = [ - 15 - me.anchorOffset, 30];
                break;
            case 'b':
                offsets = [ - 19 - me.anchorOffset, -13 - me.el.dom.offsetHeight];
                break;
            case 'r':
                offsets = [ - 15 - me.el.dom.offsetWidth, -13 - me.anchorOffset];
                break;
            default:
                offsets = [25, -13 - me.anchorOffset];
                break;
            }
        }
        mouseOffset = me.getMouseOffset();
        offsets[0] += mouseOffset[0];
        offsets[1] += mouseOffset[1];

        return offsets;
    },

    // private
    onTargetOver: function(e) {
        var me = this,
            t;

        if (me.disabled || e.within(me.target.dom, true)) {
            return;
        }
        t = e.getTarget(me.delegate);
        if (t) {
            me.triggerElement = t;
            me.clearTimer('hide');
            me.targetXY = e.getXY();
            me.delayShow();
        }
    },

    // private
    delayShow: function() {
        var me = this;
        if (me.hidden && !me.showTimer) {
            if (Ext.Date.getElapsed(me.lastActive) < me.quickShowInterval) {
                me.show();
            } else {
                me.showTimer = Ext.defer(me.show, me.showDelay, me);
            }
        }
        else if (!me.hidden && me.autoHide !== false) {
            me.show();
        }
    },

    // private
    onTargetOut: function(e) {
        var me = this;
        if (me.disabled || e.within(me.target.dom, true)) {
            return;
        }
        me.clearTimer('show');
        if (me.autoHide !== false) {
            me.delayHide();
        }
    },

    // private
    delayHide: function() {
        var me = this;
        if (!me.hidden && !me.hideTimer) {
            me.hideTimer = Ext.defer(me.hide, me.hideDelay, me);
        }
    },

    /**
     * Hides this tooltip if visible.
     */
    hide: function() {
        var me = this;
        me.clearTimer('dismiss');
        me.lastActive = new Date();
        if (me.anchorEl) {
            me.anchorEl.hide();
        }
        me.callParent(arguments);
        delete me.triggerElement;
    },

    /**
     * Shows this tooltip at the current event target XY position.
     */
    show: function() {
        var me = this;

        // Show this Component first, so that sizing can be calculated
        // pre-show it off screen so that the el will have dimensions
        this.callParent();
        if (this.hidden === false) {
            me.setPagePosition(-10000, -10000);

            if (me.anchor) {
                me.anchor = me.origAnchor;
            }
            me.showAt(me.getTargetXY());

            if (me.anchor) {
                me.syncAnchor();
                me.anchorEl.show();
            } else {
                me.anchorEl.hide();
            }
        }
    },

    // inherit docs
    showAt: function(xy) {
        var me = this;
        me.lastActive = new Date();
        me.clearTimers();

        // Only call if this is hidden. May have been called from show above.
        if (!me.isVisible()) {
            this.callParent(arguments);
        }

        // Show may have been vetoed.
        if (me.isVisible()) {
            me.setPagePosition(xy[0], xy[1]);
            if (me.constrainPosition || me.constrain) {
                me.doConstrain();
            }
            me.toFront(true);
        }

        if (me.dismissDelay && me.autoHide !== false) {
            me.dismissTimer = Ext.defer(me.hide, me.dismissDelay, me);
        }
        if (me.anchor) {
            me.syncAnchor();
            if (!me.anchorEl.isVisible()) {
                me.anchorEl.show();
            }
        } else {
            me.anchorEl.hide();
        }
    },

    // private
    syncAnchor: function() {
        var me = this,
            anchorPos,
            targetPos,
            offset;
        switch (me.tipAnchor.charAt(0)) {
        case 't':
            anchorPos = 'b';
            targetPos = 'tl';
            offset = [20 + me.anchorOffset, 1];
            break;
        case 'r':
            anchorPos = 'l';
            targetPos = 'tr';
            offset = [ - 1, 12 + me.anchorOffset];
            break;
        case 'b':
            anchorPos = 't';
            targetPos = 'bl';
            offset = [20 + me.anchorOffset, -1];
            break;
        default:
            anchorPos = 'r';
            targetPos = 'tl';
            offset = [1, 12 + me.anchorOffset];
            break;
        }
        me.anchorEl.alignTo(me.el, anchorPos + '-' + targetPos, offset);
    },

    // private
    setPagePosition: function(x, y) {
        var me = this;
        me.callParent(arguments);
        if (me.anchor) {
            me.syncAnchor();
        }
    },

    // private
    clearTimer: function(name) {
        name = name + 'Timer';
        clearTimeout(this[name]);
        delete this[name];
    },

    // private
    clearTimers: function() {
        var me = this;
        me.clearTimer('show');
        me.clearTimer('dismiss');
        me.clearTimer('hide');
    },

    // private
    onShow: function() {
        var me = this;
        me.callParent();
        me.mon(Ext.getDoc(), 'mousedown', me.onDocMouseDown, me);
    },

    // private
    onHide: function() {
        var me = this;
        me.callParent();
        me.mun(Ext.getDoc(), 'mousedown', me.onDocMouseDown, me);
    },

    // private
    onDocMouseDown: function(e) {
        var me = this;
        if (me.autoHide !== true && !me.closable && !e.within(me.el.dom)) {
            me.disable();
            Ext.defer(me.doEnable, 100, me);
        }
    },

    // private
    doEnable: function() {
        if (!this.isDestroyed) {
            this.enable();
        }
    },

    // private
    onDisable: function() {
        this.callParent();
        this.clearTimers();
        this.hide();
    },

    beforeDestroy: function() {
        var me = this;
        me.clearTimers();
        Ext.destroy(me.anchorEl);
        delete me.anchorEl;
        delete me.target;
        delete me.anchorTarget;
        delete me.triggerElement;
        me.callParent();
    },

    // private
    onDestroy: function() {
        Ext.getDoc().un('mousedown', this.onDocMouseDown, this);
        this.callParent();
    }
});

