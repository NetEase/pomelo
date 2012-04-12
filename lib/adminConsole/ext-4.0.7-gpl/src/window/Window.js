/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A specialized panel intended for use as an application window. Windows are floated, {@link #resizable}, and
 * {@link #draggable} by default. Windows can be {@link #maximizable maximized} to fill the viewport, restored to
 * their prior size, and can be {@link #minimize}d.
 *
 * Windows can also be linked to a {@link Ext.ZIndexManager} or managed by the {@link Ext.WindowManager} to provide
 * grouping, activation, to front, to back and other application-specific behavior.
 *
 * By default, Windows will be rendered to document.body. To {@link #constrain} a Window to another element specify
 * {@link Ext.Component#renderTo renderTo}.
 *
 * **As with all {@link Ext.container.Container Container}s, it is important to consider how you want the Window to size
 * and arrange any child Components. Choose an appropriate {@link #layout} configuration which lays out child Components
 * in the required manner.**
 *
 *     @example
 *     Ext.create('Ext.window.Window', {
 *         title: 'Hello',
 *         height: 200,
 *         width: 400,
 *         layout: 'fit',
 *         items: {  // Let's put an empty grid in just to illustrate fit layout
 *             xtype: 'grid',
 *             border: false,
 *             columns: [{header: 'World'}],                 // One header just for show. There's no data,
 *             store: Ext.create('Ext.data.ArrayStore', {}) // A dummy empty data store
 *         }
 *     }).show();
 */
Ext.define('Ext.window.Window', {
    extend: 'Ext.panel.Panel',

    alternateClassName: 'Ext.Window',

    requires: ['Ext.util.ComponentDragger', 'Ext.util.Region', 'Ext.EventManager'],

    alias: 'widget.window',

    /**
     * @cfg {Number} x
     * The X position of the left edge of the window on initial showing. Defaults to centering the Window within the
     * width of the Window's container {@link Ext.Element Element} (The Element that the Window is rendered to).
     */

    /**
     * @cfg {Number} y
     * The Y position of the top edge of the window on initial showing. Defaults to centering the Window within the
     * height of the Window's container {@link Ext.Element Element} (The Element that the Window is rendered to).
     */

    /**
     * @cfg {Boolean} [modal=false]
     * True to make the window modal and mask everything behind it when displayed, false to display it without
     * restricting access to other UI elements.
     */

    /**
     * @cfg {String/Ext.Element} [animateTarget=null]
     * Id or element from which the window should animate while opening.
     */

    /**
     * @cfg {String/Number/Ext.Component} defaultFocus
     * Specifies a Component to receive focus when this Window is focused.
     *
     * This may be one of:
     *
     *   - The index of a footer Button.
     *   - The id or {@link Ext.AbstractComponent#itemId} of a descendant Component.
     *   - A Component.
     */

    /**
     * @cfg {Function} onEsc
     * Allows override of the built-in processing for the escape key. Default action is to close the Window (performing
     * whatever action is specified in {@link #closeAction}. To prevent the Window closing when the escape key is
     * pressed, specify this as {@link Ext#emptyFn Ext.emptyFn}.
     */

    /**
     * @cfg {Boolean} [collapsed=false]
     * True to render the window collapsed, false to render it expanded. Note that if {@link #expandOnShow}
     * is true (the default) it will override the `collapsed` config and the window will always be
     * expanded when shown.
     */

    /**
     * @cfg {Boolean} [maximized=false]
     * True to initially display the window in a maximized state.
     */

    /**
    * @cfg {String} [baseCls='x-window']
    * The base CSS class to apply to this panel's element.
    */
    baseCls: Ext.baseCSSPrefix + 'window',

    /**
     * @cfg {Boolean/Object} resizable
     * Specify as `true` to allow user resizing at each edge and corner of the window, false to disable resizing.
     *
     * This may also be specified as a config object to Ext.resizer.Resizer
     */
    resizable: true,

    /**
     * @cfg {Boolean} draggable
     * True to allow the window to be dragged by the header bar, false to disable dragging. Note that
     * by default the window will be centered in the viewport, so if dragging is disabled the window may need to be
     * positioned programmatically after render (e.g., myWindow.setPosition(100, 100);).
     */
    draggable: true,

    /**
     * @cfg {Boolean} constrain
     * True to constrain the window within its containing element, false to allow it to fall outside of its containing
     * element. By default the window will be rendered to document.body. To render and constrain the window within
     * another element specify {@link #renderTo}. Optionally the header only can be constrained
     * using {@link #constrainHeader}.
     */
    constrain: false,

    /**
     * @cfg {Boolean} constrainHeader
     * True to constrain the window header within its containing element (allowing the window body to fall outside of
     * its containing element) or false to allow the header to fall outside its containing element.
     * Optionally the entire window can be constrained using {@link #constrain}.
     */
    constrainHeader: false,

    /**
     * @cfg {Boolean} plain
     * True to render the window body with a transparent background so that it will blend into the framing elements,
     * false to add a lighter background color to visually highlight the body element and separate it more distinctly
     * from the surrounding frame.
     */
    plain: false,

    /**
     * @cfg {Boolean} minimizable
     * True to display the 'minimize' tool button and allow the user to minimize the window, false to hide the button
     * and disallow minimizing the window. Note that this button provides no implementation -- the
     * behavior of minimizing a window is implementation-specific, so the minimize event must be handled and a custom
     * minimize behavior implemented for this option to be useful.
     */
    minimizable: false,

    /**
     * @cfg {Boolean} maximizable
     * True to display the 'maximize' tool button and allow the user to maximize the window, false to hide the button
     * and disallow maximizing the window. Note that when a window is maximized, the tool button
     * will automatically change to a 'restore' button with the appropriate behavior already built-in that will restore
     * the window to its previous size.
     */
    maximizable: false,

    // inherit docs
    minHeight: 100,

    // inherit docs
    minWidth: 200,

    /**
     * @cfg {Boolean} expandOnShow
     * True to always expand the window when it is displayed, false to keep it in its current state (which may be
     * {@link #collapsed}) when displayed.
     */
    expandOnShow: true,

    // inherited docs, same default
    collapsible: false,

    /**
     * @cfg {Boolean} closable
     * True to display the 'close' tool button and allow the user to close the window, false to hide the button and
     * disallow closing the window.
     *
     * By default, when close is requested by either clicking the close button in the header or pressing ESC when the
     * Window has focus, the {@link #close} method will be called. This will _{@link Ext.Component#destroy destroy}_ the
     * Window and its content meaning that it may not be reused.
     *
     * To make closing a Window _hide_ the Window so that it may be reused, set {@link #closeAction} to 'hide'.
     */
    closable: true,

    /**
     * @cfg {Boolean} hidden
     * Render this Window hidden. If `true`, the {@link #hide} method will be called internally.
     */
    hidden: true,

    // Inherit docs from Component. Windows render to the body on first show.
    autoRender: true,

    // Inherit docs from Component. Windows hide using visibility.
    hideMode: 'visibility',

    /** @cfg {Boolean} floating @hide Windows are always floating*/
    floating: true,

    ariaRole: 'alertdialog',

    itemCls: 'x-window-item',

    overlapHeader: true,

    ignoreHeaderBorderManagement: true,

    // private
    initComponent: function() {
        var me = this;
        me.callParent();
        me.addEvents(
            /**
             * @event activate
             * Fires after the window has been visually activated via {@link #setActive}.
             * @param {Ext.window.Window} this
             */

            /**
             * @event deactivate
             * Fires after the window has been visually deactivated via {@link #setActive}.
             * @param {Ext.window.Window} this
             */

            /**
             * @event resize
             * Fires after the window has been resized.
             * @param {Ext.window.Window} this
             * @param {Number} width The window's new width
             * @param {Number} height The window's new height
             */
            'resize',

            /**
             * @event maximize
             * Fires after the window has been maximized.
             * @param {Ext.window.Window} this
             */
            'maximize',

            /**
             * @event minimize
             * Fires after the window has been minimized.
             * @param {Ext.window.Window} this
             */
            'minimize',

            /**
             * @event restore
             * Fires after the window has been restored to its original size after being maximized.
             * @param {Ext.window.Window} this
             */
            'restore'
        );

        if (me.plain) {
            me.addClsWithUI('plain');
        }

        if (me.modal) {
            me.ariaRole = 'dialog';
        }
    },

    // State Management
    // private

    initStateEvents: function(){
        var events = this.stateEvents;
        // push on stateEvents if they don't exist
        Ext.each(['maximize', 'restore', 'resize', 'dragend'], function(event){
            if (Ext.Array.indexOf(events, event)) {
                events.push(event);
            }
        });
        this.callParent();
    },

    getState: function() {
        var me = this,
            state = me.callParent() || {},
            maximized = !!me.maximized;

        state.maximized = maximized;
        Ext.apply(state, {
            size: maximized ? me.restoreSize : me.getSize(),
            pos: maximized ? me.restorePos : me.getPosition()
        });
        return state;
    },

    applyState: function(state){
        var me = this;

        if (state) {
            me.maximized = state.maximized;
            if (me.maximized) {
                me.hasSavedRestore = true;
                me.restoreSize = state.size;
                me.restorePos = state.pos;
            } else {
                Ext.apply(me, {
                    width: state.size.width,
                    height: state.size.height,
                    x: state.pos[0],
                    y: state.pos[1]
                });
            }
        }
    },

    // private
    onMouseDown: function (e) {
        var preventFocus;
            
        if (this.floating) {
            if (Ext.fly(e.getTarget()).focusable()) {
                preventFocus = true;
            }
            this.toFront(preventFocus);
        }
    },

    // private
    onRender: function(ct, position) {
        var me = this;
        me.callParent(arguments);
        me.focusEl = me.el;

        // Double clicking a header will toggleMaximize
        if (me.maximizable) {
            me.header.on({
                dblclick: {
                    fn: me.toggleMaximize,
                    element: 'el',
                    scope: me
                }
            });
        }
    },

    // private
    afterRender: function() {
        var me = this,
            hidden = me.hidden,
            keyMap;

        me.hidden = false;
        // Component's afterRender sizes and positions the Component
        me.callParent();
        me.hidden = hidden;

        // Create the proxy after the size has been applied in Component.afterRender
        me.proxy = me.getProxy();

        // clickToRaise
        me.mon(me.el, 'mousedown', me.onMouseDown, me);
        
        // allow the element to be focusable
        me.el.set({
            tabIndex: -1
        });

        // Initialize
        if (me.maximized) {
            me.maximized = false;
            me.maximize();
        }

        if (me.closable) {
            keyMap = me.getKeyMap();
            keyMap.on(27, me.onEsc, me);

            //if (hidden) { ? would be consistent w/before/afterShow...
                keyMap.disable();
            //}
        }

        if (!hidden) {
            me.syncMonitorWindowResize();
            me.doConstrain();
        }
    },

    /**
     * @private
     * @override
     * Override Component.initDraggable.
     * Window uses the header element as the delegate.
     */
    initDraggable: function() {
        var me = this,
            ddConfig;

        if (!me.header) {
            me.updateHeader(true);
        }

        /*
         * Check the header here again. If for whatever reason it wasn't created in
         * updateHeader (preventHeader) then we'll just ignore the rest since the
         * header acts as the drag handle.
         */
        if (me.header) {
            ddConfig = Ext.applyIf({
                el: me.el,
                delegate: '#' + me.header.id
            }, me.draggable);

            // Add extra configs if Window is specified to be constrained
            if (me.constrain || me.constrainHeader) {
                ddConfig.constrain = me.constrain;
                ddConfig.constrainDelegate = me.constrainHeader;
                ddConfig.constrainTo = me.constrainTo || me.container;
            }

            /**
             * @property {Ext.util.ComponentDragger} dd
             * If this Window is configured {@link #draggable}, this property will contain an instance of
             * {@link Ext.util.ComponentDragger} (A subclass of {@link Ext.dd.DragTracker DragTracker}) which handles dragging
             * the Window's DOM Element, and constraining according to the {@link #constrain} and {@link #constrainHeader} .
             *
             * This has implementations of `onBeforeStart`, `onDrag` and `onEnd` which perform the dragging action. If
             * extra logic is needed at these points, use {@link Ext.Function#createInterceptor createInterceptor} or
             * {@link Ext.Function#createSequence createSequence} to augment the existing implementations.
             */
            me.dd = Ext.create('Ext.util.ComponentDragger', this, ddConfig);
            me.relayEvents(me.dd, ['dragstart', 'drag', 'dragend']);
        }
    },

    // private
    onEsc: function(k, e) {
        e.stopEvent();
        this[this.closeAction]();
    },

    // private
    beforeDestroy: function() {
        var me = this;
        if (me.rendered) {
            delete this.animateTarget;
            me.hide();
            Ext.destroy(
                me.keyMap
            );
        }
        me.callParent();
    },

    /**
     * @private
     * @override
     * Contribute class-specific tools to the header.
     * Called by Panel's initTools.
     */
    addTools: function() {
        var me = this;

        // Call Panel's initTools
        me.callParent();

        if (me.minimizable) {
            me.addTool({
                type: 'minimize',
                handler: Ext.Function.bind(me.minimize, me, [])
            });
        }
        if (me.maximizable) {
            me.addTool({
                type: 'maximize',
                handler: Ext.Function.bind(me.maximize, me, [])
            });
            me.addTool({
                type: 'restore',
                handler: Ext.Function.bind(me.restore, me, []),
                hidden: true
            });
        }
    },

    /**
     * Gets the configured default focus item. If a {@link #defaultFocus} is set, it will receive focus, otherwise the
     * Container itself will receive focus.
     */
    getFocusEl: function() {
        var me = this,
            f = me.focusEl,
            defaultComp = me.defaultButton || me.defaultFocus,
            t = typeof db,
            el,
            ct;

        if (Ext.isDefined(defaultComp)) {
            if (Ext.isNumber(defaultComp)) {
                f = me.query('button')[defaultComp];
            } else if (Ext.isString(defaultComp)) {
                f = me.down('#' + defaultComp);
            } else {
                f = defaultComp;
            }
        }
        return f || me.focusEl;
    },

    // private
    beforeShow: function() {
        this.callParent();

        if (this.expandOnShow) {
            this.expand(false);
        }
    },

    // private
    afterShow: function(animateTarget) {
        var me = this,
            animating = animateTarget || me.animateTarget;


        // No constraining code needs to go here.
        // Component.onShow constrains the Component. *If the constrain config is true*

        // Perform superclass's afterShow tasks
        // Which might include animating a proxy from an animateTarget
        me.callParent(arguments);

        if (me.maximized) {
            me.fitContainer();
        }

        me.syncMonitorWindowResize();
        if (!animating) {
            me.doConstrain();
        }

        if (me.keyMap) {
            me.keyMap.enable();
        }
    },

    // private
    doClose: function() {
        var me = this;

        // Being called as callback after going through the hide call below
        if (me.hidden) {
            me.fireEvent('close', me);
            if (me.closeAction == 'destroy') {
                this.destroy();
            }
        } else {
            // close after hiding
            me.hide(me.animateTarget, me.doClose, me);
        }
    },

    // private
    afterHide: function() {
        var me = this;

        // No longer subscribe to resizing now that we're hidden
        me.syncMonitorWindowResize();

        // Turn off keyboard handling once window is hidden
        if (me.keyMap) {
            me.keyMap.disable();
        }

        // Perform superclass's afterHide tasks.
        me.callParent(arguments);
    },

    // private
    onWindowResize: function() {
        if (this.maximized) {
            this.fitContainer();
        }
        this.doConstrain();
    },

    /**
     * Placeholder method for minimizing the window. By default, this method simply fires the {@link #minimize} event
     * since the behavior of minimizing a window is application-specific. To implement custom minimize behavior, either
     * the minimize event can be handled or this method can be overridden.
     * @return {Ext.window.Window} this
     */
    minimize: function() {
        this.fireEvent('minimize', this);
        return this;
    },

    afterCollapse: function() {
        var me = this;

        if (me.maximizable) {
            me.tools.maximize.hide();
            me.tools.restore.hide();
        }
        if (me.resizer) {
            me.resizer.disable();
        }
        me.callParent(arguments);
    },

    afterExpand: function() {
        var me = this;

        if (me.maximized) {
            me.tools.restore.show();
        } else if (me.maximizable) {
            me.tools.maximize.show();
        }
        if (me.resizer) {
            me.resizer.enable();
        }
        me.callParent(arguments);
    },

    /**
     * Fits the window within its current container and automatically replaces the {@link #maximizable 'maximize' tool
     * button} with the 'restore' tool button. Also see {@link #toggleMaximize}.
     * @return {Ext.window.Window} this
     */
    maximize: function() {
        var me = this;

        if (!me.maximized) {
            me.expand(false);
            if (!me.hasSavedRestore) {
                me.restoreSize = me.getSize();
                me.restorePos = me.getPosition(true);
            }
            if (me.maximizable) {
                me.tools.maximize.hide();
                me.tools.restore.show();
            }
            me.maximized = true;
            me.el.disableShadow();

            if (me.dd) {
                me.dd.disable();
            }
            if (me.collapseTool) {
                me.collapseTool.hide();
            }
            me.el.addCls(Ext.baseCSSPrefix + 'window-maximized');
            me.container.addCls(Ext.baseCSSPrefix + 'window-maximized-ct');

            me.syncMonitorWindowResize();
            me.setPosition(0, 0);
            me.fitContainer();
            me.fireEvent('maximize', me);
        }
        return me;
    },

    /**
     * Restores a {@link #maximizable maximized} window back to its original size and position prior to being maximized
     * and also replaces the 'restore' tool button with the 'maximize' tool button. Also see {@link #toggleMaximize}.
     * @return {Ext.window.Window} this
     */
    restore: function() {
        var me = this,
            tools = me.tools;

        if (me.maximized) {
            delete me.hasSavedRestore;
            me.removeCls(Ext.baseCSSPrefix + 'window-maximized');

            // Toggle tool visibility
            if (tools.restore) {
                tools.restore.hide();
            }
            if (tools.maximize) {
                tools.maximize.show();
            }
            if (me.collapseTool) {
                me.collapseTool.show();
            }

            // Restore the position/sizing
            me.setPosition(me.restorePos);
            me.setSize(me.restoreSize);

            // Unset old position/sizing
            delete me.restorePos;
            delete me.restoreSize;

            me.maximized = false;

            me.el.enableShadow(true);

            // Allow users to drag and drop again
            if (me.dd) {
                me.dd.enable();
            }

            me.container.removeCls(Ext.baseCSSPrefix + 'window-maximized-ct');

            me.syncMonitorWindowResize();
            me.doConstrain();
            me.fireEvent('restore', me);
        }
        return me;
    },

    /**
     * Synchronizes the presence of our listener for window resize events. This method
     * should be called whenever this status might change.
     * @private
     */
    syncMonitorWindowResize: function () {
        var me = this,
            currentlyMonitoring = me._monitoringResize,
            // all the states where we should be listening to window resize:
            yes = me.monitorResize || me.constrain || me.constrainHeader || me.maximized,
            // all the states where we veto this:
            veto = me.hidden || me.destroying || me.isDestroyed;

        if (yes && !veto) {
            // we should be listening...
            if (!currentlyMonitoring) {
                // but we aren't, so set it up
                Ext.EventManager.onWindowResize(me.onWindowResize, me);
                me._monitoringResize = true;
            }
        } else if (currentlyMonitoring) {
            // we should not be listening, but we are, so tear it down
            Ext.EventManager.removeResizeListener(me.onWindowResize, me);
            me._monitoringResize = false;
        }
    },

    /**
     * A shortcut method for toggling between {@link #maximize} and {@link #restore} based on the current maximized
     * state of the window.
     * @return {Ext.window.Window} this
     */
    toggleMaximize: function() {
        return this[this.maximized ? 'restore': 'maximize']();
    }

    /**
     * @cfg {Boolean} autoWidth @hide
     * Absolute positioned element and therefore cannot support autoWidth.
     * A width is a required configuration.
     **/
});

