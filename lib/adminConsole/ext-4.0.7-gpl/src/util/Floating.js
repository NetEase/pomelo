/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A mixin to add floating capability to a Component.
 */
Ext.define('Ext.util.Floating', {

    uses: ['Ext.Layer', 'Ext.window.Window'],

    /**
     * @cfg {Boolean} focusOnToFront
     * Specifies whether the floated component should be automatically {@link Ext.Component#focus focused} when
     * it is {@link #toFront brought to the front}.
     */
    focusOnToFront: true,

    /**
     * @cfg {String/Boolean} shadow
     * Specifies whether the floating component should be given a shadow. Set to true to automatically create an {@link
     * Ext.Shadow}, or a string indicating the shadow's display {@link Ext.Shadow#mode}. Set to false to disable the
     * shadow.
     */
    shadow: 'sides',

    constructor: function(config) {
        var me = this;
        
        me.floating = true;
        me.el = Ext.create('Ext.Layer', Ext.apply({}, config, {
            hideMode: me.hideMode,
            hidden: me.hidden,
            shadow: Ext.isDefined(me.shadow) ? me.shadow : 'sides',
            shadowOffset: me.shadowOffset,
            constrain: false,
            shim: me.shim === false ? false : undefined
        }), me.el);
    },

    onFloatRender: function() {
        var me = this;
        me.zIndexParent = me.getZIndexParent();
        me.setFloatParent(me.ownerCt);
        delete me.ownerCt;

        if (me.zIndexParent) {
            me.zIndexParent.registerFloatingItem(me);
        } else {
            Ext.WindowManager.register(me);
        }
    },

    setFloatParent: function(floatParent) {
        var me = this;

        // Remove listeners from previous floatParent
        if (me.floatParent) {
            me.mun(me.floatParent, {
                hide: me.onFloatParentHide,
                show: me.onFloatParentShow,
                scope: me
            });
        }

        me.floatParent = floatParent;

        // Floating Components as children of Containers must hide when their parent hides.
        if (floatParent) {
            me.mon(me.floatParent, {
                hide: me.onFloatParentHide,
                show: me.onFloatParentShow,
                scope: me
            });
        }

        // If a floating Component is configured to be constrained, but has no configured
        // constrainTo setting, set its constrainTo to be it's ownerCt before rendering.
        if ((me.constrain || me.constrainHeader) && !me.constrainTo) {
            me.constrainTo = floatParent ? floatParent.getTargetEl() : me.container;
        }
    },

    onFloatParentHide: function() {
        var me = this;
        
        if (me.hideOnParentHide !== false) {
            me.showOnParentShow = me.isVisible();
            me.hide();
        }
    },

    onFloatParentShow: function() {
        if (this.showOnParentShow) {
            delete this.showOnParentShow;
            this.show();
        }
    },

    /**
     * @private
     * Finds the ancestor Container responsible for allocating zIndexes for the passed Component.
     *
     * That will be the outermost floating Container (a Container which has no ownerCt and has floating:true).
     *
     * If we have no ancestors, or we walk all the way up to the document body, there's no zIndexParent,
     * and the global Ext.WindowManager will be used.
     */
    getZIndexParent: function() {
        var p = this.ownerCt,
            c;

        if (p) {
            while (p) {
                c = p;
                p = p.ownerCt;
            }
            if (c.floating) {
                return c;
            }
        }
    },

    // private
    // z-index is managed by the zIndexManager and may be overwritten at any time.
    // Returns the next z-index to be used.
    // If this is a Container, then it will have rebased any managed floating Components,
    // and so the next available z-index will be approximately 10000 above that.
    setZIndex: function(index) {
        var me = this;
        me.el.setZIndex(index);

        // Next item goes 10 above;
        index += 10;

        // When a Container with floating items has its z-index set, it rebases any floating items it is managing.
        // The returned value is a round number approximately 10000 above the last z-index used.
        if (me.floatingItems) {
            index = Math.floor(me.floatingItems.setBase(index) / 100) * 100 + 10000;
        }
        return index;
    },

    /**
     * Moves this floating Component into a constrain region.
     *
     * By default, this Component is constrained to be within the container it was added to, or the element it was
     * rendered to.
     *
     * An alternative constraint may be passed.
     * @param {String/HTMLElement/Ext.Element/Ext.util.Region} constrainTo (Optional) The Element or {@link Ext.util.Region Region} into which this Component is
     * to be constrained. Defaults to the element into which this floating Component was rendered.
     */
    doConstrain: function(constrainTo) {
        var me = this,
            vector = me.getConstrainVector(constrainTo || me.el.getScopeParent()),
            xy;

        if (vector) {
            xy = me.getPosition();
            xy[0] += vector[0];
            xy[1] += vector[1];
            me.setPosition(xy);
        }
    },


    /**
     * Gets the x/y offsets to constrain this float
     * @private
     * @param {String/HTMLElement/Ext.Element/Ext.util.Region} constrainTo (Optional) The Element or {@link Ext.util.Region Region} into which this Component is to be constrained.
     * @return {Number[]} The x/y constraints
     */
    getConstrainVector: function(constrainTo){
        var me = this,
            el;

        if (me.constrain || me.constrainHeader) {
            el = me.constrainHeader ? me.header.el : me.el;
            constrainTo = constrainTo || (me.floatParent && me.floatParent.getTargetEl()) || me.container;
            return el.getConstrainVector(constrainTo);
        }
    },

    /**
     * Aligns this floating Component to the specified element
     *
     * @param {Ext.Component/Ext.Element/HTMLElement/String} element
     * The element or {@link Ext.Component} to align to. If passing a component, it must be a
     * omponent instance. If a string id is passed, it will be used as an element id.
     * @param {String} [position="tl-bl?"] The position to align to (see {@link
     * Ext.Element#alignTo} for more details).
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @return {Ext.Component} this
     */
    alignTo: function(element, position, offsets) {
        if (element.isComponent) {
            element = element.getEl();
        }
        var xy = this.el.getAlignToXY(element, position, offsets);
        this.setPagePosition(xy);
        return this;
    },

    /**
     * Brings this floating Component to the front of any other visible, floating Components managed by the same {@link
     * Ext.ZIndexManager ZIndexManager}
     *
     * If this Component is modal, inserts the modal mask just below this Component in the z-index stack.
     *
     * @param {Boolean} [preventFocus=false] Specify `true` to prevent the Component from being focused.
     * @return {Ext.Component} this
     */
    toFront: function(preventFocus) {
        var me = this;

        // Find the floating Component which provides the base for this Component's zIndexing.
        // That must move to front to then be able to rebase its zIndex stack and move this to the front
        if (me.zIndexParent) {
            me.zIndexParent.toFront(true);
        }
        if (me.zIndexManager.bringToFront(me)) {
            if (!Ext.isDefined(preventFocus)) {
                preventFocus = !me.focusOnToFront;
            }
            if (!preventFocus) {
                // Kick off a delayed focus request.
                // If another floating Component is toFronted before the delay expires
                // this will not receive focus.
                me.focus(false, true);
            }
        }
        return me;
    },

    /**
     * This method is called internally by {@link Ext.ZIndexManager} to signal that a floating Component has either been
     * moved to the top of its zIndex stack, or pushed from the top of its zIndex stack.
     *
     * If a _Window_ is superceded by another Window, deactivating it hides its shadow.
     *
     * This method also fires the {@link Ext.Component#activate activate} or
     * {@link Ext.Component#deactivate deactivate} event depending on which action occurred.
     *
     * @param {Boolean} [active=false] True to activate the Component, false to deactivate it.
     * @param {Ext.Component} [newActive] The newly active Component which is taking over topmost zIndex position.
     */
    setActive: function(active, newActive) {
        var me = this;
        
        if (active) {
            if (me.el.shadow && !me.maximized) {
                me.el.enableShadow(true);
            }
            me.fireEvent('activate', me);
        } else {
            // Only the *Windows* in a zIndex stack share a shadow. All other types of floaters
            // can keep their shadows all the time
            if ((me instanceof Ext.window.Window) && (newActive instanceof Ext.window.Window)) {
                me.el.disableShadow();
            }
            me.fireEvent('deactivate', me);
        }
    },

    /**
     * Sends this Component to the back of (lower z-index than) any other visible windows
     * @return {Ext.Component} this
     */
    toBack: function() {
        this.zIndexManager.sendToBack(this);
        return this;
    },

    /**
     * Center this Component in its container.
     * @return {Ext.Component} this
     */
    center: function() {
        var me = this,
            xy = me.el.getAlignToXY(me.container, 'c-c');
        me.setPagePosition(xy);
        return me;
    },

    // private
    syncShadow : function(){
        if (this.floating) {
            this.el.sync(true);
        }
    },

    // private
    fitContainer: function() {
        var parent = this.floatParent,
            container = parent ? parent.getTargetEl() : this.container,
            size = container.getViewSize(false);

        this.setSize(size);
    }
});
