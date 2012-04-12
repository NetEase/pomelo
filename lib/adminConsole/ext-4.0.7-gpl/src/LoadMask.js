/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.LoadMask
 * <p>A modal, floating Component which may be shown above a specified {@link Ext.core.Element Element}, or a specified
 * {@link Ext.Component Component} while loading data. When shown, the configured owning Element or Component will
 * be covered with a modality mask, and the LoadMask's {@link #msg} will be displayed centered, accompanied by a spinner image.</p>
 * <p>If the {@link #store} config option is specified, the masking will be automatically shown and then hidden synchronized with
 * the Store's loading process.</p>
 * <p>Because this is a floating Component, its z-index will be managed by the global {@link Ext.WindowManager ZIndexManager}
 * object, and upon show, it will place itsef at the top of the hierarchy.</p>
 * <p>Example usage:</p>
 * <pre><code>
// Basic mask:
var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
myMask.show();
</code></pre>

 */

Ext.define('Ext.LoadMask', {

    extend: 'Ext.Component',

    alias: 'widget.loadmask',

    /* Begin Definitions */

    mixins: {
        floating: 'Ext.util.Floating'
    },

    uses: ['Ext.data.StoreManager'],

    /* End Definitions */

    /**
     * @cfg {Ext.data.Store} store
     * Optional Store to which the mask is bound. The mask is displayed when a load request is issued, and
     * hidden on either load success, or load fail.
     */

    /**
     * @cfg {String} msg
     * The text to display in a centered loading message box.
     */
    msg : 'Loading...',
    /**
     * @cfg {String} [msgCls="x-mask-loading"]
     * The CSS class to apply to the loading message element.
     */
    msgCls : Ext.baseCSSPrefix + 'mask-loading',
    
    /**
     * @cfg {Boolean} useMsg
     * Whether or not to use a loading message class or simply mask the bound element.
     */
    useMsg: true,

    /**
     * Read-only. True if the mask is currently disabled so that it will not be displayed
     * @type Boolean
     */
    disabled: false,

    baseCls: Ext.baseCSSPrefix + 'mask-msg',

    renderTpl: '<div style="position:relative" class="{msgCls}"></div>',

    // Private. The whole point is that there's a mask.
    modal: true,

    // Private. Obviously, it's floating.
    floating: {
        shadow: 'frame'
    },

    // Private. Masks are not focusable
    focusOnToFront: false,

    /**
     * Creates new LoadMask.
     * @param {String/HTMLElement/Ext.Element} el The element, element ID, or DOM node you wish to mask.
     * <p>Also, may be a {@link Ext.Component Component} who's element you wish to mask. If a Component is specified, then
     * the mask will be automatically sized upon Component resize, the message box will be kept centered,
     * and the mask only be visible when the Component is.</p>
     * @param {Object} [config] The config object
     */
    constructor : function(el, config) {
        var me = this;

        // If a Component passed, bind to it.
        if (el.isComponent) {
            me.ownerCt = el;
            me.bindComponent(el);
        }
        // Create a dumy Component encapsulating the specified Element
        else {
            me.ownerCt = new Ext.Component({
                el: Ext.get(el),
                rendered: true,
                componentLayoutCounter: 1
            });
            me.container = el;
        }
        me.callParent([config]);

        if (me.store) {
            me.bindStore(me.store, true);
        }
        me.renderData = {
            msgCls: me.msgCls
        };
        me.renderSelectors = {
            msgEl: 'div'
        };
    },

    bindComponent: function(comp) {
        this.mon(comp, {
            resize: this.onComponentResize,
            scope: this
        });
    },

    afterRender: function() {
        this.callParent(arguments);
        this.container = this.floatParent.getContentTarget();
    },

    /**
     * @private
     * Called when this LoadMask's Component is resized. The toFront method rebases and resizes the modal mask.
     */
    onComponentResize: function() {
        var me = this;
        if (me.rendered && me.isVisible()) {
            me.toFront();
            me.center();
        }
    },

    /**
     * Changes the data store bound to this LoadMask.
     * @param {Ext.data.Store} store The store to bind to this LoadMask
     */
    bindStore : function(store, initial) {
        var me = this;

        if (!initial && me.store) {
            me.mun(me.store, {
                scope: me,
                beforeload: me.onBeforeLoad,
                load: me.onLoad,
                exception: me.onLoad
            });
            if (!store) {
                me.store = null;
            }
        }
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            me.mon(store, {
                scope: me,
                beforeload: me.onBeforeLoad,
                load: me.onLoad,
                exception: me.onLoad
            });

        }
        me.store = store;
        if (store && store.isLoading()) {
            me.onBeforeLoad();
        }
    },

    onDisable : function() {
        this.callParent(arguments);
        if (this.loading) {
            this.onLoad();
        }
    },

    // private
    onBeforeLoad : function() {
        var me = this,
            owner = me.ownerCt || me.floatParent,
            origin;
        if (!this.disabled) {
            // If the owning Component has not been layed out, defer so that the ZIndexManager
            // gets to read its layed out size when sizing the modal mask
            if (owner.componentLayoutCounter) {
                Ext.Component.prototype.show.call(me);
            } else {
                // The code below is a 'run-once' interceptor.
                origin = owner.afterComponentLayout;
                owner.afterComponentLayout = function() {
                    owner.afterComponentLayout = origin;
                    origin.apply(owner, arguments);
                    if(me.loading) {
                        Ext.Component.prototype.show.call(me);
                    }
                };
            }
        }
    },

    onHide: function(){
        var me = this;
        me.callParent(arguments);
        me.showOnParentShow = true;
    },

    onShow: function() {
        var me = this,
            msgEl = me.msgEl;
            
        me.callParent(arguments);
        me.loading = true;
        if (me.useMsg) {
            msgEl.show().update(me.msg);
        } else {
            msgEl.parent().hide();
        }
    },

    afterShow: function() {
        this.callParent(arguments);
        this.center();
    },

    // private
    onLoad : function() {
        this.loading = false;
        Ext.Component.prototype.hide.call(this);
    }
});
