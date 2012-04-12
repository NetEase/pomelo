/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.dd.DragTracker
 * A DragTracker listens for drag events on an Element and fires events at the start and end of the drag,
 * as well as during the drag. This is useful for components such as {@link Ext.slider.Multi}, where there is
 * an element that can be dragged around to change the Slider's value.
 * DragTracker provides a series of template methods that should be overridden to provide functionality
 * in response to detected drag operations. These are onBeforeStart, onStart, onDrag and onEnd.
 * See {@link Ext.slider.Multi}'s initEvents function for an example implementation.
 */
Ext.define('Ext.dd.DragTracker', {

    uses: ['Ext.util.Region'],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @property {Boolean} active
     * Read-only property indicated whether the user is currently dragging this
     * tracker.
     */
    active: false,

    /**
     * @property {HTMLElement} dragTarget
     * <p><b>Only valid during drag operations. Read-only.</b></p>
     * <p>The element being dragged.</p>
     * <p>If the {@link #delegate} option is used, this will be the delegate element which was mousedowned.</p>
     */

    /**
     * @cfg {Boolean} trackOver
     * <p>Defaults to <code>false</code>. Set to true to fire mouseover and mouseout events when the mouse enters or leaves the target element.</p>
     * <p>This is implicitly set when an {@link #overCls} is specified.</p>
     * <b>If the {@link #delegate} option is used, these events fire only when a delegate element is entered of left.</b>.
     */
    trackOver: false,

    /**
     * @cfg {String} overCls
     * <p>A CSS class to add to the DragTracker's target element when the element (or, if the {@link #delegate} option is used,
     * when a delegate element) is mouseovered.</p>
     * <b>If the {@link #delegate} option is used, these events fire only when a delegate element is entered of left.</b>.
     */

    /**
     * @cfg {Ext.util.Region/Ext.Element} constrainTo
     * <p>A {@link Ext.util.Region Region} (Or an element from which a Region measurement will be read) which is used to constrain
     * the result of the {@link #getOffset} call.</p>
     * <p>This may be set any time during the DragTracker's lifecycle to set a dynamic constraining region.</p>
     */

    /**
     * @cfg {Number} tolerance
     * Number of pixels the drag target must be moved before dragging is
     * considered to have started. Defaults to <code>5</code>.
     */
    tolerance: 5,

    /**
     * @cfg {Boolean/Number} autoStart
     * Defaults to <code>false</code>. Specify <code>true</code> to defer trigger start by 1000 ms.
     * Specify a Number for the number of milliseconds to defer trigger start.
     */
    autoStart: false,

    /**
     * @cfg {String} delegate
     * Optional. <p>A {@link Ext.DomQuery DomQuery} selector which identifies child elements within the DragTracker's encapsulating
     * Element which are the tracked elements. This limits tracking to only begin when the matching elements are mousedowned.</p>
     * <p>This may also be a specific child element within the DragTracker's encapsulating element to use as the tracked element.</p>
     */

    /**
     * @cfg {Boolean} preventDefault
     * Specify <code>false</code> to enable default actions on onMouseDown events. Defaults to <code>true</code>.
     */

    /**
     * @cfg {Boolean} stopEvent
     * Specify <code>true</code> to stop the <code>mousedown</code> event from bubbling to outer listeners from the target element (or its delegates). Defaults to <code>false</code>.
     */

    constructor : function(config){
        Ext.apply(this, config);
        this.addEvents(
            /**
             * @event mouseover <p><b>Only available when {@link #trackOver} is <code>true</code></b></p>
             * <p>Fires when the mouse enters the DragTracker's target element (or if {@link #delegate} is
             * used, when the mouse enters a delegate element).</p>
             * @param {Object} this
             * @param {Object} e event object
             * @param {HTMLElement} target The element mouseovered.
             */
            'mouseover',

            /**
             * @event mouseout <p><b>Only available when {@link #trackOver} is <code>true</code></b></p>
             * <p>Fires when the mouse exits the DragTracker's target element (or if {@link #delegate} is
             * used, when the mouse exits a delegate element).</p>
             * @param {Object} this
             * @param {Object} e event object
             */
            'mouseout',

            /**
             * @event mousedown <p>Fires when the mouse button is pressed down, but before a drag operation begins. The
             * drag operation begins after either the mouse has been moved by {@link #tolerance} pixels, or after
             * the {@link #autoStart} timer fires.</p>
             * <p>Return false to veto the drag operation.</p>
             * @param {Object} this
             * @param {Object} e event object
             */
            'mousedown',

            /**
             * @event mouseup
             * @param {Object} this
             * @param {Object} e event object
             */
            'mouseup',

            /**
             * @event mousemove Fired when the mouse is moved. Returning false cancels the drag operation.
             * @param {Object} this
             * @param {Object} e event object
             */
            'mousemove',

            /**
             * @event beforestart
             * @param {Object} this
             * @param {Object} e event object
             */
            'beforedragstart',

            /**
             * @event dragstart
             * @param {Object} this
             * @param {Object} e event object
             */
            'dragstart',

            /**
             * @event dragend
             * @param {Object} this
             * @param {Object} e event object
             */
            'dragend',

            /**
             * @event drag
             * @param {Object} this
             * @param {Object} e event object
             */
            'drag'
        );

        this.dragRegion = Ext.create('Ext.util.Region', 0,0,0,0);

        if (this.el) {
            this.initEl(this.el);
        }

        // Dont pass the config so that it is not applied to 'this' again
        this.mixins.observable.constructor.call(this);
        if (this.disabled) {
            this.disable();
        }

    },

    /**
     * Initializes the DragTracker on a given element.
     * @param {Ext.Element/HTMLElement} el The element
     */
    initEl: function(el) {
        this.el = Ext.get(el);

        // The delegate option may also be an element on which to listen
        this.handle = Ext.get(this.delegate);

        // If delegate specified an actual element to listen on, we do not use the delegate listener option
        this.delegate = this.handle ? undefined : this.delegate;

        if (!this.handle) {
            this.handle = this.el;
        }

        // Add a mousedown listener which reacts only on the elements targeted by the delegate config.
        // We process mousedown to begin tracking.
        this.mon(this.handle, {
            mousedown: this.onMouseDown,
            delegate: this.delegate,
            scope: this
        });

        // If configured to do so, track mouse entry and exit into the target (or delegate).
        // The mouseover and mouseout CANNOT be replaced with mouseenter and mouseleave
        // because delegate cannot work with those pseudoevents. Entry/exit checking is done in the handler.
        if (this.trackOver || this.overCls) {
            this.mon(this.handle, {
                mouseover: this.onMouseOver,
                mouseout: this.onMouseOut,
                delegate: this.delegate,
                scope: this
            });
        }
    },

    disable: function() {
        this.disabled = true;
    },

    enable: function() {
        this.disabled = false;
    },

    destroy : function() {
        this.clearListeners();
        delete this.el;
    },

    // When the pointer enters a tracking element, fire a mouseover if the mouse entered from outside.
    // This is mouseenter functionality, but we cannot use mouseenter because we are using "delegate" to filter mouse targets
    onMouseOver: function(e, target) {
        var me = this;
        if (!me.disabled) {
            if (Ext.EventManager.contains(e) || me.delegate) {
                me.mouseIsOut = false;
                if (me.overCls) {
                    me.el.addCls(me.overCls);
                }
                me.fireEvent('mouseover', me, e, me.delegate ? e.getTarget(me.delegate, target) : me.handle);
            }
        }
    },

    // When the pointer exits a tracking element, fire a mouseout.
    // This is mouseleave functionality, but we cannot use mouseleave because we are using "delegate" to filter mouse targets
    onMouseOut: function(e) {
        if (this.mouseIsDown) {
            this.mouseIsOut = true;
        } else {
            if (this.overCls) {
                this.el.removeCls(this.overCls);
            }
            this.fireEvent('mouseout', this, e);
        }
    },

    onMouseDown: function(e, target){
        // If this is disabled, or the mousedown has been processed by an upstream DragTracker, return
        if (this.disabled ||e.dragTracked) {
            return;
        }

        // This information should be available in mousedown listener and onBeforeStart implementations
        this.dragTarget = this.delegate ? target : this.handle.dom;
        this.startXY = this.lastXY = e.getXY();
        this.startRegion = Ext.fly(this.dragTarget).getRegion();

        if (this.fireEvent('mousedown', this, e) === false ||
            this.fireEvent('beforedragstart', this, e) === false ||
            this.onBeforeStart(e) === false) {
            return;
        }

        // Track when the mouse is down so that mouseouts while the mouse is down are not processed.
        // The onMouseOut method will only ever be called after mouseup.
        this.mouseIsDown = true;

        // Flag for downstream DragTracker instances that the mouse is being tracked.
        e.dragTracked = true;

        if (this.preventDefault !== false) {
            e.preventDefault();
        }
        Ext.getDoc().on({
            scope: this,
            mouseup: this.onMouseUp,
            mousemove: this.onMouseMove,
            selectstart: this.stopSelect
        });
        if (this.autoStart) {
            this.timer =  Ext.defer(this.triggerStart, this.autoStart === true ? 1000 : this.autoStart, this, [e]);
        }
    },

    onMouseMove: function(e, target){
        // BrowserBug: IE hack to see if button was released outside of window.
        // Needed in IE6-9 in quirks and strictmode
        if (this.active && Ext.isIE && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }

        e.preventDefault();
        var xy = e.getXY(),
            s = this.startXY;

        this.lastXY = xy;
        if (!this.active) {
            if (Math.max(Math.abs(s[0]-xy[0]), Math.abs(s[1]-xy[1])) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }

        // Returning false from a mousemove listener deactivates
        if (this.fireEvent('mousemove', this, e) === false) {
            this.onMouseUp(e);
        } else {
            this.onDrag(e);
            this.fireEvent('drag', this, e);
        }
    },

    onMouseUp: function(e) {
        // Clear the flag which ensures onMouseOut fires only after the mouse button
        // is lifted if the mouseout happens *during* a drag.
        this.mouseIsDown = false;

        // If we mouseouted the el *during* the drag, the onMouseOut method will not have fired. Ensure that it gets processed.
        if (this.mouseIsOut) {
            this.mouseIsOut = false;
            this.onMouseOut(e);
        }
        e.preventDefault();
        this.fireEvent('mouseup', this, e);
        this.endDrag(e);
    },

    /**
     * @private
     * Stop the drag operation, and remove active mouse listeners.
     */
    endDrag: function(e) {
        var doc = Ext.getDoc(),
        wasActive = this.active;

        doc.un('mousemove', this.onMouseMove, this);
        doc.un('mouseup', this.onMouseUp, this);
        doc.un('selectstart', this.stopSelect, this);
        this.clearStart();
        this.active = false;
        if (wasActive) {
            this.onEnd(e);
            this.fireEvent('dragend', this, e);
        }
        // Private property calculated when first required and only cached during a drag
        delete this._constrainRegion;

        // Remove flag from event singleton.  Using "Ext.EventObject" here since "endDrag" is called directly in some cases without an "e" param
        delete Ext.EventObject.dragTracked;
    },

    triggerStart: function(e) {
        this.clearStart();
        this.active = true;
        this.onStart(e);
        this.fireEvent('dragstart', this, e);
    },

    clearStart : function() {
        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }
    },

    stopSelect : function(e) {
        e.stopEvent();
        return false;
    },

    /**
     * Template method which should be overridden by each DragTracker instance. Called when the user first clicks and
     * holds the mouse button down. Return false to disallow the drag
     * @param {Ext.EventObject} e The event object
     * @template
     */
    onBeforeStart : function(e) {

    },

    /**
     * Template method which should be overridden by each DragTracker instance. Called when a drag operation starts
     * (e.g. the user has moved the tracked element beyond the specified tolerance)
     * @param {Ext.EventObject} e The event object
     * @template
     */
    onStart : function(xy) {

    },

    /**
     * Template method which should be overridden by each DragTracker instance. Called whenever a drag has been detected.
     * @param {Ext.EventObject} e The event object
     * @template
     */
    onDrag : function(e) {

    },

    /**
     * Template method which should be overridden by each DragTracker instance. Called when a drag operation has been completed
     * (e.g. the user clicked and held the mouse down, dragged the element and then released the mouse button)
     * @param {Ext.EventObject} e The event object
     * @template
     */
    onEnd : function(e) {

    },

    /**
     * </p>Returns the drag target. This is usually the DragTracker's encapsulating element.</p>
     * <p>If the {@link #delegate} option is being used, this may be a child element which matches the
     * {@link #delegate} selector.</p>
     * @return {Ext.Element} The element currently being tracked.
     */
    getDragTarget : function(){
        return this.dragTarget;
    },

    /**
     * @private
     * @returns {Ext.Element} The DragTracker's encapsulating element.
     */
    getDragCt : function(){
        return this.el;
    },

    /**
     * @private
     * Return the Region into which the drag operation is constrained.
     * Either the XY pointer itself can be constrained, or the dragTarget element
     * The private property _constrainRegion is cached until onMouseUp
     */
    getConstrainRegion: function() {
        if (this.constrainTo) {
            if (this.constrainTo instanceof Ext.util.Region) {
                return this.constrainTo;
            }
            if (!this._constrainRegion) {
                this._constrainRegion = Ext.fly(this.constrainTo).getViewRegion();
            }
        } else {
            if (!this._constrainRegion) {
                this._constrainRegion = this.getDragCt().getViewRegion();
            }
        }
        return this._constrainRegion;
    },

    getXY : function(constrain){
        return constrain ? this.constrainModes[constrain](this, this.lastXY) : this.lastXY;
    },

    /**
     * Returns the X, Y offset of the current mouse position from the mousedown point.
     *
     * This method may optionally constrain the real offset values, and returns a point coerced in one
     * of two modes:
     *
     *  - `point`
     *    The current mouse position is coerced into the constrainRegion and the resulting position is returned.
     *  - `dragTarget`
     *    The new {@link Ext.util.Region Region} of the {@link #getDragTarget dragTarget} is calculated
     *    based upon the current mouse position, and then coerced into the constrainRegion. The returned
     *    mouse position is then adjusted by the same delta as was used to coerce the region.\
     *
     * @param constrainMode {String} (Optional) If omitted the true mouse position is returned. May be passed
     * as `point` or `dragTarget`. See above.
     * @returns {Number[]} The `X, Y` offset from the mousedown point, optionally constrained.
     */
    getOffset : function(constrain){
        var xy = this.getXY(constrain),
            s = this.startXY;

        return [xy[0]-s[0], xy[1]-s[1]];
    },

    constrainModes: {
        // Constrain the passed point to within the constrain region
        point: function(me, xy) {
            var dr = me.dragRegion,
                constrainTo = me.getConstrainRegion();

            // No constraint
            if (!constrainTo) {
                return xy;
            }

            dr.x = dr.left = dr[0] = dr.right = xy[0];
            dr.y = dr.top = dr[1] = dr.bottom = xy[1];
            dr.constrainTo(constrainTo);

            return [dr.left, dr.top];
        },

        // Constrain the dragTarget to within the constrain region. Return the passed xy adjusted by the same delta.
        dragTarget: function(me, xy) {
            var s = me.startXY,
                dr = me.startRegion.copy(),
                constrainTo = me.getConstrainRegion(),
                adjust;

            // No constraint
            if (!constrainTo) {
                return xy;
            }

            // See where the passed XY would put the dragTarget if translated by the unconstrained offset.
            // If it overflows, we constrain the passed XY to bring the potential
            // region back within the boundary.
            dr.translateBy(xy[0]-s[0], xy[1]-s[1]);

            // Constrain the X coordinate by however much the dragTarget overflows
            if (dr.right > constrainTo.right) {
                xy[0] += adjust = (constrainTo.right - dr.right);    // overflowed the right
                dr.left += adjust;
            }
            if (dr.left < constrainTo.left) {
                xy[0] += (constrainTo.left - dr.left);      // overflowed the left
            }

            // Constrain the Y coordinate by however much the dragTarget overflows
            if (dr.bottom > constrainTo.bottom) {
                xy[1] += adjust = (constrainTo.bottom - dr.bottom);  // overflowed the bottom
                dr.top += adjust;
            }
            if (dr.top < constrainTo.top) {
                xy[1] += (constrainTo.top - dr.top);        // overflowed the top
            }
            return xy;
        }
    }
});
