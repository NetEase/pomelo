/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.container.AbstractContainer
 * @extends Ext.Component
 * An abstract base class which provides shared methods for Containers across the Sencha product line.
 * @private
 */
Ext.define('Ext.container.AbstractContainer', {

    /* Begin Definitions */

    extend: 'Ext.Component',

    requires: [
        'Ext.util.MixedCollection',
        'Ext.layout.container.Auto',
        'Ext.ZIndexManager'
    ],

    /* End Definitions */
    /**
     * @cfg {String/Object} layout
     * <p><b>Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <p>The sizing and positioning of child {@link #items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.  For example:</p>
     * <p>If the {@link #layout} configuration is not explicitly specified for
     * a general purpose container (e.g. Container or Panel) the
     * {@link Ext.layout.container.Auto default layout manager} will be used
     * which does nothing but render child components sequentially into the
     * Container (no sizing or positioning will be performed in this situation).</p>
     * <p><b><code>layout</code></b> may be specified as either as an Object or as a String:</p>
     * <div><ul class="mdetail-params">
     * <li><u>Specify as an Object</u></li>
     * <div><ul class="mdetail-params">
     * <li>Example usage:</li>
     * <pre><code>
layout: {
    type: 'vbox',
    align: 'left'
}
       </code></pre>
     *
     * <li><code><b>type</b></code></li>
     * <br/><p>The layout type to be used for this container.  If not specified,
     * a default {@link Ext.layout.container.Auto} will be created and used.</p>
     * <p>Valid layout <code>type</code> values are:</p>
     * <div class="sub-desc"><ul class="mdetail-params">
     * <li><code><b>{@link Ext.layout.container.Auto Auto}</b></code> &nbsp;&nbsp;&nbsp; <b>Default</b></li>
     * <li><code><b>{@link Ext.layout.container.Card card}</b></code></li>
     * <li><code><b>{@link Ext.layout.container.Fit fit}</b></code></li>
     * <li><code><b>{@link Ext.layout.container.HBox hbox}</b></code></li>
     * <li><code><b>{@link Ext.layout.container.VBox vbox}</b></code></li>
     * <li><code><b>{@link Ext.layout.container.Anchor anchor}</b></code></li>
     * <li><code><b>{@link Ext.layout.container.Table table}</b></code></li>
     * </ul></div>
     *
     * <li>Layout specific configuration properties</li>
     * <p>Additional layout specific configuration properties may also be
     * specified. For complete details regarding the valid config options for
     * each layout type, see the layout class corresponding to the <code>type</code>
     * specified.</p>
     *
     * </ul></div>
     *
     * <li><u>Specify as a String</u></li>
     * <div><ul class="mdetail-params">
     * <li>Example usage:</li>
     * <pre><code>
layout: 'vbox'
       </code></pre>
     * <li><code><b>layout</b></code></li>
     * <p>The layout <code>type</code> to be used for this container (see list
     * of valid layout type values above).</p>
     * <p>Additional layout specific configuration properties. For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * </ul></div></ul></div>
     */

    /**
     * @cfg {String/Number} activeItem
     * A string component id or the numeric index of the component that should be initially activated within the
     * container's layout on render.  For example, activeItem: 'item-1' or activeItem: 0 (index 0 = the first
     * item in the container's collection).  activeItem only applies to layout styles that can display
     * items one at a time (like {@link Ext.layout.container.Card} and {@link Ext.layout.container.Fit}).
     */
    /**
     * @cfg {Object/Object[]} items
     * <p>A single item, or an array of child Components to be added to this container</p>
     * <p><b>Unless configured with a {@link #layout}, a Container simply renders child Components serially into
     * its encapsulating element and performs no sizing or positioning upon them.</b><p>
     * <p>Example:</p>
     * <pre><code>
// specifying a single item
items: {...},
layout: 'fit',    // The single items is sized to fit

// specifying multiple items
items: [{...}, {...}],
layout: 'hbox', // The items are arranged horizontally
       </code></pre>
     * <p>Each item may be:</p>
     * <ul>
     * <li>A {@link Ext.Component Component}</li>
     * <li>A Component configuration object</li>
     * </ul>
     * <p>If a configuration object is specified, the actual type of Component to be
     * instantiated my be indicated by using the {@link Ext.Component#xtype xtype} option.</p>
     * <p>Every Component class has its own {@link Ext.Component#xtype xtype}.</p>
     * <p>If an {@link Ext.Component#xtype xtype} is not explicitly
     * specified, the {@link #defaultType} for the Container is used, which by default is usually <code>panel</code>.</p>
     * <p><b>Notes</b>:</p>
     * <p>Ext uses lazy rendering. Child Components will only be rendered
     * should it become necessary. Items are automatically laid out when they are first
     * shown (no sizing is done while hidden), or in response to a {@link #doLayout} call.</p>
     * <p>Do not specify <code>{@link Ext.panel.Panel#contentEl contentEl}</code> or
     * <code>{@link Ext.panel.Panel#html html}</code> with <code>items</code>.</p>
     */
    /**
     * @cfg {Object/Function} defaults
     * This option is a means of applying default settings to all added items whether added through the {@link #items}
     * config or via the {@link #add} or {@link #insert} methods.
     *
     * Defaults are applied to both config objects and instantiated components conditionally so as not to override
     * existing properties in the item (see {@link Ext#applyIf}).
     *
     * If the defaults option is specified as a function, then the function will be called using this Container as the
     * scope (`this` reference) and passing the added item as the first parameter. Any resulting object
     * from that call is then applied to the item as default properties.
     *
     * For example, to automatically apply padding to the body of each of a set of
     * contained {@link Ext.panel.Panel} items, you could pass: `defaults: {bodyStyle:'padding:15px'}`.
     *
     * Usage:
     *
     *     defaults: { // defaults are applied to items, not the container
     *         autoScroll: true
     *     },
     *     items: [
     *         // default will not be applied here, panel1 will be autoScroll: false
     *         {
     *             xtype: 'panel',
     *             id: 'panel1',
     *             autoScroll: false
     *         },
     *         // this component will have autoScroll: true
     *         new Ext.panel.Panel({
     *             id: 'panel2'
     *         })
     *     ]
     */

    /** @cfg {Boolean} suspendLayout
     * If true, suspend calls to doLayout.  Useful when batching multiple adds to a container and not passing them
     * as multiple arguments or an array.
     */
    suspendLayout : false,

    /** @cfg {Boolean} autoDestroy
     * If true the container will automatically destroy any contained component that is removed from it, else
     * destruction must be handled manually.
     * Defaults to true.
     */
    autoDestroy : true,

     /** @cfg {String} defaultType
      * <p>The default {@link Ext.Component xtype} of child Components to create in this Container when
      * a child item is specified as a raw configuration object, rather than as an instantiated Component.</p>
      * <p>Defaults to <code>'panel'</code>.</p>
      */
    defaultType: 'panel',

    isContainer : true,

    /**
     * The number of container layout calls made on this object.
     * @property layoutCounter
     * @type {Number}
     * @private
     */
    layoutCounter : 0,

    baseCls: Ext.baseCSSPrefix + 'container',

    /**
     * @cfg {String[]} bubbleEvents
     * <p>An array of events that, when fired, should be bubbled to any parent container.
     * See {@link Ext.util.Observable#enableBubble}.
     * Defaults to <code>['add', 'remove']</code>.
     */
    bubbleEvents: ['add', 'remove'],

    // @private
    initComponent : function(){
        var me = this;
        me.addEvents(
            /**
             * @event afterlayout
             * Fires when the components in this container are arranged by the associated layout manager.
             * @param {Ext.container.Container} this
             * @param {Ext.layout.container.Container} layout The ContainerLayout implementation for this container
             */
            'afterlayout',
            /**
             * @event beforeadd
             * Fires before any {@link Ext.Component} is added or inserted into the container.
             * A handler can return false to cancel the add.
             * @param {Ext.container.Container} this
             * @param {Ext.Component} component The component being added
             * @param {Number} index The index at which the component will be added to the container's items collection
             */
            'beforeadd',
            /**
             * @event beforeremove
             * Fires before any {@link Ext.Component} is removed from the container.  A handler can return
             * false to cancel the remove.
             * @param {Ext.container.Container} this
             * @param {Ext.Component} component The component being removed
             */
            'beforeremove',
            /**
             * @event add
             * @bubbles
             * Fires after any {@link Ext.Component} is added or inserted into the container.
             * @param {Ext.container.Container} this
             * @param {Ext.Component} component The component that was added
             * @param {Number} index The index at which the component was added to the container's items collection
             */
            'add',
            /**
             * @event remove
             * @bubbles
             * Fires after any {@link Ext.Component} is removed from the container.
             * @param {Ext.container.Container} this
             * @param {Ext.Component} component The component that was removed
             */
            'remove'
        );

        // layoutOnShow stack
        me.layoutOnShow = Ext.create('Ext.util.MixedCollection');
        me.callParent();
        me.initItems();
    },

    // @private
    initItems : function() {
        var me = this,
            items = me.items;

        /**
         * The MixedCollection containing all the child items of this container.
         * @property items
         * @type Ext.util.MixedCollection
         */
        me.items = Ext.create('Ext.util.MixedCollection', false, me.getComponentId);

        if (items) {
            if (!Ext.isArray(items)) {
                items = [items];
            }

            me.add(items);
        }
    },

    // @private
    afterRender : function() {
        this.getLayout();
        this.callParent();
    },

    renderChildren: function () {
        var me = this,
            layout = me.getLayout();

        me.callParent();
        // this component's elements exist, so now create the child components' elements

        if (layout) {
            me.suspendLayout = true;
            layout.renderChildren();
            delete me.suspendLayout;
        }
    },

    // @private
    setLayout : function(layout) {
        var currentLayout = this.layout;

        if (currentLayout && currentLayout.isLayout && currentLayout != layout) {
            currentLayout.setOwner(null);
        }

        this.layout = layout;
        layout.setOwner(this);
    },

    /**
     * Returns the {@link Ext.layout.container.AbstractContainer layout} instance currently associated with this Container.
     * If a layout has not been instantiated yet, that is done first
     * @return {Ext.layout.container.AbstractContainer} The layout
     */
    getLayout : function() {
        var me = this;
        if (!me.layout || !me.layout.isLayout) {
            me.setLayout(Ext.layout.Layout.create(me.layout, 'autocontainer'));
        }

        return me.layout;
    },

    /**
     * Manually force this container's layout to be recalculated. The framework uses this internally to refresh layouts
     * form most cases.
     * @return {Ext.container.Container} this
     */
    doLayout : function() {
        var me = this,
            layout = me.getLayout();

        if (me.rendered && layout && !me.suspendLayout) {
            // If either dimension is being auto-set, then it requires a ComponentLayout to be run.
            if (!me.isFixedWidth() || !me.isFixedHeight()) {
                // Only run the ComponentLayout if it is not already in progress
                if (me.componentLayout.layoutBusy !== true) {
                    me.doComponentLayout();
                    if (me.componentLayout.layoutCancelled === true) {
                        layout.layout();
                    }
                }
            }
            // Both dimensions set, either by configuration, or by an owning layout, run a ContainerLayout
            else {
                // Only run the ContainerLayout if it is not already in progress
                if (layout.layoutBusy !== true) {
                    layout.layout();
                }
            }
        }

        return me;
    },

    // @private
    afterLayout : function(layout) {
        ++this.layoutCounter;
        this.fireEvent('afterlayout', this, layout);
    },

    // @private
    prepareItems : function(items, applyDefaults) {
        if (!Ext.isArray(items)) {
            items = [items];
        }

        // Make sure defaults are applied and item is initialized
        var i = 0,
            len = items.length,
            item;

        for (; i < len; i++) {
            item = items[i];
            if (applyDefaults) {
                item = this.applyDefaults(item);
            }
            items[i] = this.lookupComponent(item);
        }
        return items;
    },

    // @private
    applyDefaults : function(config) {
        var defaults = this.defaults;

        if (defaults) {
            if (Ext.isFunction(defaults)) {
                defaults = defaults.call(this, config);
            }

            if (Ext.isString(config)) {
                config = Ext.ComponentManager.get(config);
            }
            Ext.applyIf(config, defaults);
        }

        return config;
    },

    // @private
    lookupComponent : function(comp) {
        return Ext.isString(comp) ? Ext.ComponentManager.get(comp) : this.createComponent(comp);
    },

    // @private
    createComponent : function(config, defaultType) {
        // // add in ownerCt at creation time but then immediately
        // // remove so that onBeforeAdd can handle it
        // var component = Ext.create(Ext.apply({ownerCt: this}, config), defaultType || this.defaultType);
        //
        // delete component.initialConfig.ownerCt;
        // delete component.ownerCt;

        return Ext.ComponentManager.create(config, defaultType || this.defaultType);
    },

    // @private - used as the key lookup function for the items collection
    getComponentId : function(comp) {
        return comp.getItemId();
    },

    /**

Adds {@link Ext.Component Component}(s) to this Container.

##Description:##

- Fires the {@link #beforeadd} event before adding.
- The Container's {@link #defaults default config values} will be applied
  accordingly (see `{@link #defaults}` for details).
- Fires the `{@link #add}` event after the component has been added.

##Notes:##

If the Container is __already rendered__ when `add`
is called, it will render the newly added Component into its content area.

__**If**__ the Container was configured with a size-managing {@link #layout} manager, the Container
will recalculate its internal layout at this time too.

Note that the default layout manager simply renders child Components sequentially into the content area and thereafter performs no sizing.

If adding multiple new child Components, pass them as an array to the `add` method, so that only one layout recalculation is performed.

    tb = new {@link Ext.toolbar.Toolbar}({
        renderTo: document.body
    });  // toolbar is rendered
    tb.add([{text:'Button 1'}, {text:'Button 2'}]); // add multiple items. ({@link #defaultType} for {@link Ext.toolbar.Toolbar Toolbar} is 'button')

##Warning:##

Components directly managed by the BorderLayout layout manager
may not be removed or added.  See the Notes for {@link Ext.layout.container.Border BorderLayout}
for more details.

     * @param {Ext.Component[]/Ext.Component...} component
     * Either one or more Components to add or an Array of Components to add.
     * See `{@link #items}` for additional information.
     *
     * @return {Ext.Component[]/Ext.Component} The Components that were added.
     * @markdown
     */
    add : function() {
        var me = this,
            args = Array.prototype.slice.call(arguments),
            hasMultipleArgs,
            items,
            results = [],
            i,
            ln,
            item,
            index = -1,
            cmp;

        if (typeof args[0] == 'number') {
            index = args.shift();
        }

        hasMultipleArgs = args.length > 1;
        if (hasMultipleArgs || Ext.isArray(args[0])) {

            items = hasMultipleArgs ? args : args[0];
            // Suspend Layouts while we add multiple items to the container
            me.suspendLayout = true;
            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];

                //<debug>
                if (!item) {
                    Ext.Error.raise("Trying to add a null item as a child of Container with itemId/id: " + me.getItemId());
                }
                //</debug>

                if (index != -1) {
                    item = me.add(index + i, item);
                } else {
                    item = me.add(item);
                }
                results.push(item);
            }
            // Resume Layouts now that all items have been added and do a single layout for all the items just added
            me.suspendLayout = false;
            me.doLayout();
            return results;
        }

        cmp = me.prepareItems(args[0], true)[0];

        // Floating Components are not added into the items collection
        // But they do get an upward ownerCt link so that they can traverse
        // up to their z-index parent.
        if (cmp.floating) {
            cmp.onAdded(me, index);
        } else {
            index = (index !== -1) ? index : me.items.length;
            if (me.fireEvent('beforeadd', me, cmp, index) !== false && me.onBeforeAdd(cmp) !== false) {
                me.items.insert(index, cmp);
                cmp.onAdded(me, index);
                me.onAdd(cmp, index);
                me.fireEvent('add', me, cmp, index);
            }
            me.doLayout();
        }
        return cmp;
    },

    onAdd : Ext.emptyFn,
    onRemove : Ext.emptyFn,

    /**
     * Inserts a Component into this Container at a specified index. Fires the
     * {@link #beforeadd} event before inserting, then fires the {@link #add} event after the
     * Component has been inserted.
     * @param {Number} index The index at which the Component will be inserted
     * into the Container's items collection
     * @param {Ext.Component} component The child Component to insert.<br><br>
     * Ext uses lazy rendering, and will only render the inserted Component should
     * it become necessary.<br><br>
     * A Component config object may be passed in order to avoid the overhead of
     * constructing a real Component object if lazy rendering might mean that the
     * inserted Component will not be rendered immediately. To take advantage of
     * this 'lazy instantiation', set the {@link Ext.Component#xtype} config
     * property to the registered type of the Component wanted.<br><br>
     * For a list of all available xtypes, see {@link Ext.Component}.
     * @return {Ext.Component} component The Component (or config object) that was
     * inserted with the Container's default config values applied.
     */
    insert : function(index, comp) {
        return this.add(index, comp);
    },

    /**
     * Moves a Component within the Container
     * @param {Number} fromIdx The index the Component you wish to move is currently at.
     * @param {Number} toIdx The new index for the Component.
     * @return {Ext.Component} component The Component (or config object) that was moved.
     */
    move : function(fromIdx, toIdx) {
        var items = this.items,
            item;
        item = items.removeAt(fromIdx);
        if (item === false) {
            return false;
        }
        items.insert(toIdx, item);
        this.doLayout();
        return item;
    },

    // @private
    onBeforeAdd : function(item) {
        var me = this;

        if (item.ownerCt) {
            item.ownerCt.remove(item, false);
        }

        if (me.border === false || me.border === 0) {
            item.border = (item.border === true);
        }
    },

    /**
     * Removes a component from this container.  Fires the {@link #beforeremove} event before removing, then fires
     * the {@link #remove} event after the component has been removed.
     * @param {Ext.Component/String} component The component reference or id to remove.
     * @param {Boolean} autoDestroy (optional) True to automatically invoke the removed Component's {@link Ext.Component#destroy} function.
     * Defaults to the value of this Container's {@link #autoDestroy} config.
     * @return {Ext.Component} component The Component that was removed.
     */
    remove : function(comp, autoDestroy) {
        var me = this,
            c = me.getComponent(comp);
        //<debug>
            if (Ext.isDefined(Ext.global.console) && !c) {
                console.warn("Attempted to remove a component that does not exist. Ext.container.Container: remove takes an argument of the component to remove. cmp.remove() is incorrect usage.");
            }
        //</debug>

        if (c && me.fireEvent('beforeremove', me, c) !== false) {
            me.doRemove(c, autoDestroy);
            me.fireEvent('remove', me, c);
        }

        return c;
    },

    // @private
    doRemove : function(component, autoDestroy) {
        var me = this,
            layout = me.layout,
            hasLayout = layout && me.rendered;

        me.items.remove(component);
        component.onRemoved();

        if (hasLayout) {
            layout.onRemove(component);
        }

        me.onRemove(component, autoDestroy);

        if (autoDestroy === true || (autoDestroy !== false && me.autoDestroy)) {
            component.destroy();
        }

        if (hasLayout && !autoDestroy) {
            layout.afterRemove(component);
        }

        if (!me.destroying) {
            me.doLayout();
        }
    },

    /**
     * Removes all components from this container.
     * @param {Boolean} autoDestroy (optional) True to automatically invoke the removed Component's {@link Ext.Component#destroy} function.
     * Defaults to the value of this Container's {@link #autoDestroy} config.
     * @return {Ext.Component[]} Array of the destroyed components
     */
    removeAll : function(autoDestroy) {
        var me = this,
            removeItems = me.items.items.slice(),
            items = [],
            i = 0,
            len = removeItems.length,
            item;

        // Suspend Layouts while we remove multiple items from the container
        me.suspendLayout = true;
        for (; i < len; i++) {
            item = removeItems[i];
            me.remove(item, autoDestroy);

            if (item.ownerCt !== me) {
                items.push(item);
            }
        }

        // Resume Layouts now that all items have been removed and do a single layout (if we removed anything!)
        me.suspendLayout = false;
        if (len) {
            me.doLayout();
        }
        return items;
    },

    // Used by ComponentQuery to retrieve all of the items
    // which can potentially be considered a child of this Container.
    // This should be overriden by components which have child items
    // that are not contained in items. For example dockedItems, menu, etc
    // IMPORTANT note for maintainers:
    //  Items are returned in tree traversal order. Each item is appended to the result array
    //  followed by the results of that child's getRefItems call.
    //  Floating child items are appended after internal child items.
    getRefItems : function(deep) {
        var me = this,
            items = me.items.items,
            len = items.length,
            i = 0,
            item,
            result = [];

        for (; i < len; i++) {
            item = items[i];
            result.push(item);
            if (deep && item.getRefItems) {
                result.push.apply(result, item.getRefItems(true));
            }
        }

        // Append floating items to the list.
        // These will only be present after they are rendered.
        if (me.floatingItems && me.floatingItems.accessList) {
            result.push.apply(result, me.floatingItems.accessList);
        }

        return result;
    },

    /**
     * Cascades down the component/container heirarchy from this component (passed in the first call), calling the specified function with
     * each component. The scope (<code>this</code> reference) of the
     * function call will be the scope provided or the current component. The arguments to the function
     * will be the args provided or the current component. If the function returns false at any point,
     * the cascade is stopped on that branch.
     * @param {Function} fn The function to call
     * @param {Object} [scope] The scope of the function (defaults to current component)
     * @param {Array} [args] The args to call the function with. The current component always passed as the last argument.
     * @return {Ext.Container} this
     */
    cascade : function(fn, scope, origArgs){
        var me = this,
            cs = me.items ? me.items.items : [],
            len = cs.length,
            i = 0,
            c,
            args = origArgs ? origArgs.concat(me) : [me],
            componentIndex = args.length - 1;

        if (fn.apply(scope || me, args) !== false) {
            for(; i < len; i++){
                c = cs[i];
                if (c.cascade) {
                    c.cascade(fn, scope, origArgs);
                } else {
                    args[componentIndex] = c;
                    fn.apply(scope || cs, args);
                }
            }
        }
        return this;
    },

    /**
     * Examines this container's <code>{@link #items}</code> <b>property</b>
     * and gets a direct child component of this container.
     * @param {String/Number} comp This parameter may be any of the following:
     * <div><ul class="mdetail-params">
     * <li>a <b><code>String</code></b> : representing the <code>{@link Ext.Component#itemId itemId}</code>
     * or <code>{@link Ext.Component#id id}</code> of the child component </li>
     * <li>a <b><code>Number</code></b> : representing the position of the child component
     * within the <code>{@link #items}</code> <b>property</b></li>
     * </ul></div>
     * <p>For additional information see {@link Ext.util.MixedCollection#get}.
     * @return Ext.Component The component (if found).
     */
    getComponent : function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }

        return this.items.get(comp);
    },

    /**
     * Retrieves all descendant components which match the passed selector.
     * Executes an Ext.ComponentQuery.query using this container as its root.
     * @param {String} selector (optional) Selector complying to an Ext.ComponentQuery selector.
     * If no selector is specified all items will be returned.
     * @return {Ext.Component[]} Components which matched the selector
     */
    query : function(selector) {
        selector = selector || '*';
        return Ext.ComponentQuery.query(selector, this);
    },

    /**
     * Retrieves the first direct child of this container which matches the passed selector.
     * The passed in selector must comply with an Ext.ComponentQuery selector.
     * @param {String} selector (optional) An Ext.ComponentQuery selector. If no selector is
     * specified, the first child will be returned.
     * @return Ext.Component
     */
    child : function(selector) {
        selector = selector || '';
        return this.query('> ' + selector)[0] || null;
    },

    /**
     * Retrieves the first descendant of this container which matches the passed selector.
     * The passed in selector must comply with an Ext.ComponentQuery selector.
     * @param {String} selector (optional) An Ext.ComponentQuery selector. If no selector is
     * specified, the first child will be returned.
     * @return Ext.Component
     */
    down : function(selector) {
        return this.query(selector)[0] || null;
    },

    // inherit docs
    show : function() {
        this.callParent(arguments);
        this.performDeferredLayouts();
        return this;
    },

    // Lay out any descendant containers who queued a layout operation during the time this was hidden
    // This is also called by Panel after it expands because descendants of a collapsed Panel allso queue any layout ops.
    performDeferredLayouts: function() {
        var layoutCollection = this.layoutOnShow,
            ln = layoutCollection.getCount(),
            i = 0,
            needsLayout,
            item;

        for (; i < ln; i++) {
            item = layoutCollection.get(i);
            needsLayout = item.needsLayout;

            if (Ext.isObject(needsLayout)) {
                item.doComponentLayout(needsLayout.width, needsLayout.height, needsLayout.isSetSize, needsLayout.ownerCt);
            }
        }
        layoutCollection.clear();
    },

    //@private
    // Enable all immediate children that was previously disabled
    onEnable: function() {
        Ext.Array.each(this.query('[isFormField]'), function(item) {
            if (item.resetDisable) {
                item.enable();
                delete item.resetDisable;
            }
        });
        this.callParent();
    },

    // @private
    // Disable all immediate children that was previously disabled
    onDisable: function() {
        Ext.Array.each(this.query('[isFormField]'), function(item) {
            if (item.resetDisable !== false && !item.disabled) {
                item.disable();
                item.resetDisable = true;
            }
        });
        this.callParent();
    },

    /**
     * Occurs before componentLayout is run. Returning false from this method will prevent the containerLayout
     * from being executed.
     */
    beforeLayout: function() {
        return true;
    },

    // @private
    beforeDestroy : function() {
        var me = this,
            items = me.items,
            c;

        if (items) {
            while ((c = items.first())) {
                me.doRemove(c, true);
            }
        }

        Ext.destroy(
            me.layout
        );
        me.callParent();
    }
});

