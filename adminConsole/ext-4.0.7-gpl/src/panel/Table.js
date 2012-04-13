/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Nicolas Ferrero
 *
 * TablePanel is the basis of both {@link Ext.tree.Panel TreePanel} and {@link Ext.grid.Panel GridPanel}.
 *
 * TablePanel aggregates:
 *
 *  - a Selection Model
 *  - a View
 *  - a Store
 *  - Scrollers
 *  - Ext.grid.header.Container
 */
Ext.define('Ext.panel.Table', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.tablepanel',

    uses: [
        'Ext.selection.RowModel',
        'Ext.grid.Scroller',
        'Ext.grid.header.Container',
        'Ext.grid.Lockable'
    ],

    extraBaseCls: Ext.baseCSSPrefix + 'grid',
    extraBodyCls: Ext.baseCSSPrefix + 'grid-body',

    layout: 'fit',
    /**
     * @property {Boolean} hasView
     * True to indicate that a view has been injected into the panel.
     */
    hasView: false,

    // each panel should dictate what viewType and selType to use
    /**
     * @cfg {String} viewType
     * An xtype of view to use. This is automatically set to 'gridview' by {@link Ext.grid.Panel Grid}
     * and to 'treeview' by {@link Ext.tree.Panel Tree}.
     */
    viewType: null,

    /**
     * @cfg {Object} viewConfig
     * A config object that will be applied to the grid's UI view. Any of the config options available for
     * {@link Ext.view.Table} can be specified here. This option is ignored if {@link #view} is specified.
     */

    /**
     * @cfg {Ext.view.Table} view
     * The {@link Ext.view.Table} used by the grid. Use {@link #viewConfig} to just supply some config options to
     * view (instead of creating an entire View instance).
     */

    /**
     * @cfg {String} selType
     * An xtype of selection model to use. Defaults to 'rowmodel'. This is used to create selection model if just
     * a config object or nothing at all given in {@link #selModel} config.
     */
    selType: 'rowmodel',

    /**
     * @cfg {Ext.selection.Model/Object} selModel
     * A {@link Ext.selection.Model selection model} instance or config object.  In latter case the {@link #selType}
     * config option determines to which type of selection model this config is applied.
     */

    /**
     * @cfg {Boolean} multiSelect
     * True to enable 'MULTI' selection mode on selection model. See {@link Ext.selection.Model#mode}.
     */

    /**
     * @cfg {Boolean} simpleSelect
     * True to enable 'SIMPLE' selection mode on selection model. See {@link Ext.selection.Model#mode}.
     */

    /**
     * @cfg {Ext.data.Store} store (required)
     * The {@link Ext.data.Store Store} the grid should use as its data source.
     */

    /**
     * @cfg {Number} scrollDelta
     * Number of pixels to scroll when scrolling with mousewheel.
     */
    scrollDelta: 40,

    /**
     * @cfg {String/Boolean} scroll
     * Scrollers configuration. Valid values are 'both', 'horizontal' or 'vertical'.
     * True implies 'both'. False implies 'none'.
     */
    scroll: true,

    /**
     * @cfg {Ext.grid.column.Column[]} columns
     * An array of {@link Ext.grid.column.Column column} definition objects which define all columns that appear in this
     * grid. Each column definition provides the header text for the column, and a definition of where the data for that
     * column comes from.
     */

    /**
     * @cfg {Boolean} forceFit
     * Ttrue to force the columns to fit into the available width. Headers are first sized according to configuration,
     * whether that be a specific width, or flex. Then they are all proportionally changed in width so that the entire
     * content width is used.
     */

    /**
     * @cfg {Ext.grid.feature.Feature[]} features
     * An array of grid Features to be added to this grid. See {@link Ext.grid.feature.Feature} for usage.
     */

    /**
     * @cfg {Boolean} [hideHeaders=false]
     * True to hide column headers.
     */

    /**
     * @cfg {Boolean} deferRowRender
     * Defaults to true to enable deferred row rendering.
     *
     * This allows the View to execute a refresh quickly, with the expensive update of the row structure deferred so
     * that layouts with GridPanels appear, and lay out more quickly.
     */

     deferRowRender: true,
     
    /**
     * @cfg {Boolean} sortableColumns
     * False to disable column sorting via clicking the header and via the Sorting menu items.
     */
    sortableColumns: true,

    /**
     * @cfg {Boolean} [enableLocking=false]
     * True to enable locking support for this grid. Alternatively, locking will also be automatically
     * enabled if any of the columns in the column configuration contain the locked config option.
     */
    enableLocking: false,

    verticalScrollDock: 'right',
    verticalScrollerType: 'gridscroller',

    horizontalScrollerPresentCls: Ext.baseCSSPrefix + 'horizontal-scroller-present',
    verticalScrollerPresentCls: Ext.baseCSSPrefix + 'vertical-scroller-present',

    // private property used to determine where to go down to find views
    // this is here to support locking.
    scrollerOwner: true,

    invalidateScrollerOnRefresh: true,

    /**
     * @cfg {Boolean} enableColumnMove
     * False to disable column dragging within this grid.
     */
    enableColumnMove: true,

    /**
     * @cfg {Boolean} enableColumnResize
     * False to disable column resizing within this grid.
     */
    enableColumnResize: true,

    /**
     * @cfg {Boolean} enableColumnHide
     * False to disable column hiding within this grid.
     */
    enableColumnHide: true,

    initComponent: function() {
        //<debug>
        if (!this.viewType) {
            Ext.Error.raise("You must specify a viewType config.");
        }
        if (this.headers) {
            Ext.Error.raise("The headers config is not supported. Please specify columns instead.");
        }
        //</debug>

        var me          = this,
            scroll      = me.scroll,
            vertical    = false,
            horizontal  = false,
            headerCtCfg = me.columns || me.colModel,
            i           = 0,
            view,
            border = me.border;

        if (me.hideHeaders) {
            border = false;
        }

        // Look up the configured Store. If none configured, use the fieldless, empty Store defined in Ext.data.Store.
        me.store = Ext.data.StoreManager.lookup(me.store || 'ext-empty-store');

        // The columns/colModel config may be either a fully instantiated HeaderContainer, or an array of Column definitions, or a config object of a HeaderContainer
        // Either way, we extract a columns property referencing an array of Column definitions.
        if (headerCtCfg instanceof Ext.grid.header.Container) {
            me.headerCt = headerCtCfg;
            me.headerCt.border = border;
            me.columns = me.headerCt.items.items;
        } else {
            if (Ext.isArray(headerCtCfg)) {
                headerCtCfg = {
                    items: headerCtCfg,
                    border: border
                };
            }
            Ext.apply(headerCtCfg, {
                forceFit: me.forceFit,
                sortable: me.sortableColumns,
                enableColumnMove: me.enableColumnMove,
                enableColumnResize: me.enableColumnResize,
                enableColumnHide: me.enableColumnHide,
                border:  border
            });
            me.columns = headerCtCfg.items;

             // If any of the Column objects contain a locked property, and are not processed, this is a lockable TablePanel, a
             // special view will be injected by the Ext.grid.Lockable mixin, so no processing of .
             if (me.enableLocking || Ext.ComponentQuery.query('{locked !== undefined}{processed != true}', me.columns).length) {
                 me.self.mixin('lockable', Ext.grid.Lockable);
                 me.injectLockable();
             }
        }

        me.addEvents(
            /**
             * @event reconfigure
             * Fires after a reconfigure.
             * @param {Ext.panel.Table} this
             */
            'reconfigure',
            /**
             * @event viewready
             * Fires when the grid view is available (use this for selecting a default row).
             * @param {Ext.panel.Table} this
             */
            'viewready',
            /**
             * @event scrollerhide
             * Fires when a scroller is hidden.
             * @param {Ext.grid.Scroller} scroller
             * @param {String} orientation Orientation, can be 'vertical' or 'horizontal'
             */
            'scrollerhide',
            /**
             * @event scrollershow
             * Fires when a scroller is shown.
             * @param {Ext.grid.Scroller} scroller
             * @param {String} orientation Orientation, can be 'vertical' or 'horizontal'
             */
            'scrollershow'
        );

        me.bodyCls = me.bodyCls || '';
        me.bodyCls += (' ' + me.extraBodyCls);
        
        me.cls = me.cls || '';
        me.cls += (' ' + me.extraBaseCls);

        // autoScroll is not a valid configuration
        delete me.autoScroll;

        // If this TablePanel is lockable (Either configured lockable, or any of the defined columns has a 'locked' property)
        // than a special lockable view containing 2 side-by-side grids will have been injected so we do not need to set up any UI.
        if (!me.hasView) {

            // If we were not configured with a ready-made headerCt (either by direct config with a headerCt property, or by passing
            // a HeaderContainer instance as the 'columns' property, then go ahead and create one from the config object created above.
            if (!me.headerCt) {
                me.headerCt = Ext.create('Ext.grid.header.Container', headerCtCfg);
            }

            // Extract the array of Column objects
            me.columns = me.headerCt.items.items;

            if (me.hideHeaders) {
                me.headerCt.height = 0;
                me.headerCt.border = false;
                me.headerCt.addCls(Ext.baseCSSPrefix + 'grid-header-ct-hidden');
                me.addCls(Ext.baseCSSPrefix + 'grid-header-hidden');
                // IE Quirks Mode fix
                // If hidden configuration option was used, several layout calculations will be bypassed.
                if (Ext.isIEQuirks) {
                    me.headerCt.style = {
                        display: 'none'
                    };
                }
            }

            // turn both on.
            if (scroll === true || scroll === 'both') {
                vertical = horizontal = true;
            } else if (scroll === 'horizontal') {
                horizontal = true;
            } else if (scroll === 'vertical') {
                vertical = true;
            // All other values become 'none' or false.
            } else {
                me.headerCt.availableSpaceOffset = 0;
            }

            if (vertical) {
                me.verticalScroller = Ext.ComponentManager.create(me.initVerticalScroller());
                me.mon(me.verticalScroller, {
                    bodyscroll: me.onVerticalScroll,
                    scope: me
                });
            }

            if (horizontal) {
                me.horizontalScroller = Ext.ComponentManager.create(me.initHorizontalScroller());
                me.mon(me.horizontalScroller, {
                    bodyscroll: me.onHorizontalScroll,
                    scope: me
                });
            }

            me.headerCt.on('resize', me.onHeaderResize, me);
            me.relayHeaderCtEvents(me.headerCt);
            me.features = me.features || [];
            if (!Ext.isArray(me.features)) {
                me.features = [me.features];
            }
            me.dockedItems = me.dockedItems || [];
            me.dockedItems.unshift(me.headerCt);
            me.viewConfig = me.viewConfig || {};
            me.viewConfig.invalidateScrollerOnRefresh = me.invalidateScrollerOnRefresh;

            // AbstractDataView will look up a Store configured as an object
            // getView converts viewConfig into a View instance
            view = me.getView();

            view.on({
                afterrender: function () {
                    // hijack the view el's scroll method
                    view.el.scroll = Ext.Function.bind(me.elScroll, me);
                    // We use to listen to document.body wheel events, but that's a
                    // little much. We scope just to the view now.
                    me.mon(view.el, {
                        mousewheel: me.onMouseWheel,
                        scope: me
                    });
                },
                single: true
            });
            me.items = [view];
            me.hasView = true;

            me.mon(view.store, {
                load: me.onStoreLoad,
                scope: me
            });
            me.mon(view, {
                viewReady: me.onViewReady,
                resize: me.onViewResize,
                refresh: {
                    fn: me.onViewRefresh,
                    scope: me,
                    buffer: 50
                },
                scope: me
            });
            this.relayEvents(view, [
                /**
                 * @event beforeitemmousedown
                 * @alias Ext.view.View#beforeitemmousedown
                 */
                'beforeitemmousedown',
                /**
                 * @event beforeitemmouseup
                 * @alias Ext.view.View#beforeitemmouseup
                 */
                'beforeitemmouseup',
                /**
                 * @event beforeitemmouseenter
                 * @alias Ext.view.View#beforeitemmouseenter
                 */
                'beforeitemmouseenter',
                /**
                 * @event beforeitemmouseleave
                 * @alias Ext.view.View#beforeitemmouseleave
                 */
                'beforeitemmouseleave',
                /**
                 * @event beforeitemclick
                 * @alias Ext.view.View#beforeitemclick
                 */
                'beforeitemclick',
                /**
                 * @event beforeitemdblclick
                 * @alias Ext.view.View#beforeitemdblclick
                 */
                'beforeitemdblclick',
                /**
                 * @event beforeitemcontextmenu
                 * @alias Ext.view.View#beforeitemcontextmenu
                 */
                'beforeitemcontextmenu',
                /**
                 * @event itemmousedown
                 * @alias Ext.view.View#itemmousedown
                 */
                'itemmousedown',
                /**
                 * @event itemmouseup
                 * @alias Ext.view.View#itemmouseup
                 */
                'itemmouseup',
                /**
                 * @event itemmouseenter
                 * @alias Ext.view.View#itemmouseenter
                 */
                'itemmouseenter',
                /**
                 * @event itemmouseleave
                 * @alias Ext.view.View#itemmouseleave
                 */
                'itemmouseleave',
                /**
                 * @event itemclick
                 * @alias Ext.view.View#itemclick
                 */
                'itemclick',
                /**
                 * @event itemdblclick
                 * @alias Ext.view.View#itemdblclick
                 */
                'itemdblclick',
                /**
                 * @event itemcontextmenu
                 * @alias Ext.view.View#itemcontextmenu
                 */
                'itemcontextmenu',
                /**
                 * @event beforecontainermousedown
                 * @alias Ext.view.View#beforecontainermousedown
                 */
                'beforecontainermousedown',
                /**
                 * @event beforecontainermouseup
                 * @alias Ext.view.View#beforecontainermouseup
                 */
                'beforecontainermouseup',
                /**
                 * @event beforecontainermouseover
                 * @alias Ext.view.View#beforecontainermouseover
                 */
                'beforecontainermouseover',
                /**
                 * @event beforecontainermouseout
                 * @alias Ext.view.View#beforecontainermouseout
                 */
                'beforecontainermouseout',
                /**
                 * @event beforecontainerclick
                 * @alias Ext.view.View#beforecontainerclick
                 */
                'beforecontainerclick',
                /**
                 * @event beforecontainerdblclick
                 * @alias Ext.view.View#beforecontainerdblclick
                 */
                'beforecontainerdblclick',
                /**
                 * @event beforecontainercontextmenu
                 * @alias Ext.view.View#beforecontainercontextmenu
                 */
                'beforecontainercontextmenu',
                /**
                 * @event containermouseup
                 * @alias Ext.view.View#containermouseup
                 */
                'containermouseup',
                /**
                 * @event containermouseover
                 * @alias Ext.view.View#containermouseover
                 */
                'containermouseover',
                /**
                 * @event containermouseout
                 * @alias Ext.view.View#containermouseout
                 */
                'containermouseout',
                /**
                 * @event containerclick
                 * @alias Ext.view.View#containerclick
                 */
                'containerclick',
                /**
                 * @event containerdblclick
                 * @alias Ext.view.View#containerdblclick
                 */
                'containerdblclick',
                /**
                 * @event containercontextmenu
                 * @alias Ext.view.View#containercontextmenu
                 */
                'containercontextmenu',
                /**
                 * @event selectionchange
                 * @alias Ext.selection.Model#selectionchange
                 */
                'selectionchange',
                /**
                 * @event beforeselect
                 * @alias Ext.selection.RowModel#beforeselect
                 */
                'beforeselect',
                /**
                 * @event select
                 * @alias Ext.selection.RowModel#select
                 */
                'select',
                /**
                 * @event beforedeselect
                 * @alias Ext.selection.RowModel#beforedeselect
                 */
                'beforedeselect',
                /**
                 * @event deselect
                 * @alias Ext.selection.RowModel#deselect
                 */
                'deselect'
            ]);
        }

        me.callParent(arguments);
    },
    
    onRender: function(){
        var vScroll = this.verticalScroller,
            hScroll = this.horizontalScroller;

        if (vScroll) {
            vScroll.ensureDimension();
        }
        if (hScroll) {
            hScroll.ensureDimension();
        }
        this.callParent(arguments);    
    },

    // state management
    initStateEvents: function(){
        var events = this.stateEvents;
        // push on stateEvents if they don't exist
        Ext.each(['columnresize', 'columnmove', 'columnhide', 'columnshow', 'sortchange'], function(event){
            if (Ext.Array.indexOf(events, event)) {
                events.push(event);
            }
        });
        this.callParent();
    },

    /**
     * Returns the horizontal scroller config.
     */
    initHorizontalScroller: function () {
        var me = this,
            ret = {
                xtype: 'gridscroller',
                dock: 'bottom',
                section: me,
                store: me.store
            };

        return ret;
    },

    /**
     * Returns the vertical scroller config.
     */
    initVerticalScroller: function () {
        var me = this,
            ret = me.verticalScroller || {};

        Ext.applyIf(ret, {
            xtype: me.verticalScrollerType,
            dock: me.verticalScrollDock,
            store: me.store
        });

        return ret;
    },

    relayHeaderCtEvents: function (headerCt) {
        this.relayEvents(headerCt, [
            /**
             * @event columnresize
             * @alias Ext.grid.header.Container#columnresize
             */
            'columnresize',
            /**
             * @event columnmove
             * @alias Ext.grid.header.Container#columnmove
             */
            'columnmove',
            /**
             * @event columnhide
             * @alias Ext.grid.header.Container#columnhide
             */
            'columnhide',
            /**
             * @event columnshow
             * @alias Ext.grid.header.Container#columnshow
             */
            'columnshow',
            /**
             * @event sortchange
             * @alias Ext.grid.header.Container#sortchange
             */
            'sortchange'
        ]);
    },

    getState: function(){
        var me = this,
            state = me.callParent(),
            sorter = me.store.sorters.first();

        state.columns = (me.headerCt || me).getColumnsState();

        if (sorter) {
            state.sort = {
                property: sorter.property,
                direction: sorter.direction
            };
        }

        return state;
    },

    applyState: function(state) {
        var me = this,
            sorter = state.sort,
            store = me.store,
            columns = state.columns;

        delete state.columns;

        // Ensure superclass has applied *its* state.
        // AbstractComponent saves dimensions (and anchor/flex) plus collapsed state.
        me.callParent(arguments);

        if (columns) {
            (me.headerCt || me).applyColumnsState(columns);
        }

        if (sorter) {
            if (store.remoteSort) {
                store.sorters.add(Ext.create('Ext.util.Sorter', {
                    property: sorter.property,
                    direction: sorter.direction
                }));
            }
            else {
                store.sort(sorter.property, sorter.direction);
            }
        }
    },

    /**
     * Returns the store associated with this Panel.
     * @return {Ext.data.Store} The store
     */
    getStore: function(){
        return this.store;
    },

    /**
     * Gets the view for this panel.
     * @return {Ext.view.Table}
     */
    getView: function() {
        var me = this,
            sm;

        if (!me.view) {
            sm = me.getSelectionModel();
            me.view = me.createComponent(Ext.apply({}, me.viewConfig, {
                deferInitialRefresh: me.deferRowRender,
                xtype: me.viewType,
                store: me.store,
                headerCt: me.headerCt,
                selModel: sm,
                features: me.features,
                panel: me
            }));
            me.mon(me.view, {
                uievent: me.processEvent,
                scope: me
            });
            sm.view = me.view;
            me.headerCt.view = me.view;
            me.relayEvents(me.view, ['cellclick', 'celldblclick']);
        }
        return me.view;
    },

    /**
     * @private
     * @override
     * autoScroll is never valid for all classes which extend TablePanel.
     */
    setAutoScroll: Ext.emptyFn,

    // This method hijacks Ext.view.Table's el scroll method.
    // This enables us to keep the virtualized scrollbars in sync
    // with the view. It currently does NOT support animation.
    elScroll: function(direction, distance, animate) {
        var me = this,
            scroller;

        if (direction === "up" || direction === "left") {
            distance = -distance;
        }
        
        if (direction === "down" || direction === "up") {
            scroller = me.getVerticalScroller();
            
            //if the grid does not currently need a vertical scroller don't try to update it (EXTJSIV-3891)
            if (scroller) {
                scroller.scrollByDeltaY(distance);
            }
        } else {
            scroller = me.getHorizontalScroller();
            
            //if the grid does not currently need a horizontal scroller don't try to update it (EXTJSIV-3891)
            if (scroller) {
                scroller.scrollByDeltaX(distance);
            }
        }
    },

    /**
     * @private
     * Processes UI events from the view. Propagates them to whatever internal Components need to process them.
     * @param {String} type Event type, eg 'click'
     * @param {Ext.view.Table} view TableView Component
     * @param {HTMLElement} cell Cell HtmlElement the event took place within
     * @param {Number} recordIndex Index of the associated Store Model (-1 if none)
     * @param {Number} cellIndex Cell index within the row
     * @param {Ext.EventObject} e Original event
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e) {
        var me = this,
            header;

        if (cellIndex !== -1) {
            header = me.headerCt.getGridColumns()[cellIndex];
            return header.processEvent.apply(header, arguments);
        }
    },

    /**
     * Requests a recalculation of scrollbars and puts them in if they are needed.
     */
    determineScrollbars: function() {
        // Set a flag so that afterComponentLayout does not recurse back into here.
        if (this.determineScrollbarsRunning) {
            return;
        }
        this.determineScrollbarsRunning = true;
        var me = this,
            view = me.view,
            box,
            tableEl,
            scrollWidth,
            clientWidth,
            scrollHeight,
            clientHeight,
            verticalScroller = me.verticalScroller,
            horizontalScroller = me.horizontalScroller,
            curScrollbars = (verticalScroller   && verticalScroller.ownerCt === me ? 1 : 0) |
                            (horizontalScroller && horizontalScroller.ownerCt === me ? 2 : 0),
            reqScrollbars = 0; // 1 = vertical, 2 = horizontal, 3 = both

        // If we are not collapsed, and the view has been rendered AND filled, then we can determine scrollbars
        if (!me.collapsed && view && view.viewReady) {

            // Calculate maximum, *scrollbarless* space which the view has available.
            // It will be the Fit Layout's calculated size, plus the widths of any currently shown scrollbars
            box = view.el.getSize();

            clientWidth  = box.width  + ((curScrollbars & 1) ? verticalScroller.width : 0);
            clientHeight = box.height + ((curScrollbars & 2) ? horizontalScroller.height : 0);

            // Calculate the width of the scrolling block
            // There will never be a horizontal scrollbar if all columns are flexed.

            scrollWidth = (me.headerCt.query('[flex]').length && !me.headerCt.layout.tooNarrow) ? 0 : me.headerCt.getFullWidth();

            // Calculate the height of the scrolling block
            if (verticalScroller && verticalScroller.el) {
                scrollHeight = verticalScroller.getSizeCalculation().height;
            } else {
                tableEl = view.el.child('table', true);
                scrollHeight = tableEl ? tableEl.offsetHeight : 0;
            }

            // View is too high.
            // Definitely need a vertical scrollbar
            if (scrollHeight > clientHeight) {
                reqScrollbars = 1;

                // But if scrollable block width goes into the zone required by the vertical scrollbar, we'll also need a horizontal
                if (horizontalScroller && ((clientWidth - scrollWidth) < verticalScroller.width)) {
                    reqScrollbars = 3;
                }
            }

            // View height fits. But we stil may need a horizontal scrollbar, and this might necessitate a vertical one.
            else {
                // View is too wide.
                // Definitely need a horizontal scrollbar
                if (scrollWidth > clientWidth) {
                    reqScrollbars = 2;

                    // But if scrollable block height goes into the zone required by the horizontal scrollbar, we'll also need a vertical
                    if (verticalScroller && ((clientHeight - scrollHeight) < horizontalScroller.height)) {
                        reqScrollbars = 3;
                    }
                }
            }

            // If scrollbar requirements have changed, change 'em...
            if (reqScrollbars !== curScrollbars) {

                // Suspend component layout while we add/remove the docked scrollers
                me.suspendLayout = true;
                if (reqScrollbars & 1) {
                    me.showVerticalScroller();
                } else {
                    me.hideVerticalScroller();
                }
                if (reqScrollbars & 2) {
                    me.showHorizontalScroller();
                } else {
                    me.hideHorizontalScroller();
                }
                me.suspendLayout = false;

                // Lay out the Component.
                me.doComponentLayout();
                // Lay out me.items
                me.getLayout().layout();
            }
        }
        delete me.determineScrollbarsRunning;
    },

    onViewResize: function() {
        this.determineScrollbars();
    },

    afterComponentLayout: function() {
        this.callParent(arguments);
        this.determineScrollbars();
        this.invalidateScroller();
    },

    onHeaderResize: function() {
        if (!this.componentLayout.layoutBusy && this.view && this.view.rendered) {
            this.determineScrollbars();
            this.invalidateScroller();
        }
    },

    afterCollapse: function() {
        var me = this;
        if (me.verticalScroller) {
            me.verticalScroller.saveScrollPos();
        }
        if (me.horizontalScroller) {
            me.horizontalScroller.saveScrollPos();
        }
        me.callParent(arguments);
    },

    afterExpand: function() {
        var me = this;
        me.callParent(arguments);
        if (me.verticalScroller) {
            me.verticalScroller.restoreScrollPos();
        }
        if (me.horizontalScroller) {
            me.horizontalScroller.restoreScrollPos();
        }
    },

    /**
     * Hides the verticalScroller and removes the horizontalScrollerPresentCls.
     */
    hideHorizontalScroller: function() {
        var me = this;

        if (me.horizontalScroller && me.horizontalScroller.ownerCt === me) {
            me.verticalScroller.setReservedSpace(0);
            me.removeDocked(me.horizontalScroller, false);
            me.removeCls(me.horizontalScrollerPresentCls);
            me.fireEvent('scrollerhide', me.horizontalScroller, 'horizontal');
        }

    },

    /**
     * Shows the horizontalScroller and add the horizontalScrollerPresentCls.
     */
    showHorizontalScroller: function() {
        var me = this;

        if (me.verticalScroller) {
            me.verticalScroller.setReservedSpace(Ext.getScrollbarSize().height - 1);
        }
        if (me.horizontalScroller && me.horizontalScroller.ownerCt !== me) {
            me.addDocked(me.horizontalScroller);
            me.addCls(me.horizontalScrollerPresentCls);
            me.fireEvent('scrollershow', me.horizontalScroller, 'horizontal');
        }
    },

    /**
     * Hides the verticalScroller and removes the verticalScrollerPresentCls.
     */
    hideVerticalScroller: function() {
        var me = this;

        me.setHeaderReserveOffset(false);
        if (me.verticalScroller && me.verticalScroller.ownerCt === me) {
            me.removeDocked(me.verticalScroller, false);
            me.removeCls(me.verticalScrollerPresentCls);
            me.fireEvent('scrollerhide', me.verticalScroller, 'vertical');
        }
    },

    /**
     * Shows the verticalScroller and adds the verticalScrollerPresentCls.
     */
    showVerticalScroller: function() {
        var me = this;

        me.setHeaderReserveOffset(true);
        if (me.verticalScroller && me.verticalScroller.ownerCt !== me) {
            me.addDocked(me.verticalScroller);
            me.addCls(me.verticalScrollerPresentCls);
            me.fireEvent('scrollershow', me.verticalScroller, 'vertical');
        }
    },

    setHeaderReserveOffset: function (reserveOffset) {
        var headerCt = this.headerCt,
            layout = headerCt.layout;

        // only trigger a layout when reserveOffset is changing
        if (layout && layout.reserveOffset !== reserveOffset) {
            layout.reserveOffset = reserveOffset;
            if (!this.suspendLayout) {
                headerCt.doLayout();
            }
        }
    },

    /**
     * Invalides scrollers that are present and forces a recalculation. (Not related to showing/hiding the scrollers)
     */
    invalidateScroller: function() {
        var me = this,
            vScroll = me.verticalScroller,
            hScroll = me.horizontalScroller;

        if (vScroll) {
            vScroll.invalidate();
        }
        if (hScroll) {
            hScroll.invalidate();
        }
    },

    // refresh the view when a header moves
    onHeaderMove: function(headerCt, header, fromIdx, toIdx) {
        this.view.refresh();
    },

    // Section onHeaderHide is invoked after view.
    onHeaderHide: function(headerCt, header) {
        this.invalidateScroller();
    },

    onHeaderShow: function(headerCt, header) {
        this.invalidateScroller();
    },

    getVerticalScroller: function() {
        return this.getScrollerOwner().down('gridscroller[dock=' + this.verticalScrollDock + ']');
    },

    getHorizontalScroller: function() {
        return this.getScrollerOwner().down('gridscroller[dock=bottom]');
    },

    onMouseWheel: function(e) {
        var me = this,
            vertScroller = me.getVerticalScroller(),
            horizScroller = me.getHorizontalScroller(),
            scrollDelta = -me.scrollDelta,
            deltas = e.getWheelDeltas(),
            deltaX = scrollDelta * deltas.x,
            deltaY = scrollDelta * deltas.y,
            vertScrollerEl, horizScrollerEl,
            vertScrollerElDom, horizScrollerElDom,
            horizontalCanScrollLeft, horizontalCanScrollRight,
            verticalCanScrollDown, verticalCanScrollUp;

        // calculate whether or not both scrollbars can scroll right/left and up/down
        if (horizScroller) {
            horizScrollerEl = horizScroller.scrollEl;
            if (horizScrollerEl) {
                horizScrollerElDom = horizScrollerEl.dom;
                horizontalCanScrollRight = horizScrollerElDom.scrollLeft !== horizScrollerElDom.scrollWidth - horizScrollerElDom.clientWidth;
                horizontalCanScrollLeft  = horizScrollerElDom.scrollLeft !== 0;
            }
        }
        if (vertScroller) {
            vertScrollerEl = vertScroller.scrollEl;
            if (vertScrollerEl) {
                vertScrollerElDom = vertScrollerEl.dom;
                verticalCanScrollDown = vertScrollerElDom.scrollTop !== vertScrollerElDom.scrollHeight - vertScrollerElDom.clientHeight;
                verticalCanScrollUp   = vertScrollerElDom.scrollTop !== 0;
            }
        }

        if (horizScroller) {
            if ((deltaX < 0 && horizontalCanScrollLeft) || (deltaX > 0 && horizontalCanScrollRight)) {
                e.stopEvent();
                horizScroller.scrollByDeltaX(deltaX);
            }
        }
        if (vertScroller) {
            if ((deltaY < 0 && verticalCanScrollUp) || (deltaY > 0 && verticalCanScrollDown)) {
                e.stopEvent();
                vertScroller.scrollByDeltaY(deltaY);
            }
        }
    },

    /**
     * @private
     * Fires the TablePanel's viewready event when the view declares that its internal DOM is ready
     */
    onViewReady: function() {
        var me = this;
        me.fireEvent('viewready', me);
        if (me.deferRowRender) {
            me.determineScrollbars();
            me.invalidateScroller();
        }
    },

    /**
     * @private
     * Determines and invalidates scrollers on view refresh
     */
    onViewRefresh: function() {
        var me = this;

        // Refresh *during* render must be ignored.
        if (!me.rendering) {
            this.determineScrollbars();
            if (this.invalidateScrollerOnRefresh) {
                this.invalidateScroller();
            }
        }
    },

    /**
     * Sets the scrollTop of the TablePanel.
     * @param {Number} top
     */
    setScrollTop: function(top) {
        var me               = this,
            rootCmp          = me.getScrollerOwner(),
            verticalScroller = me.getVerticalScroller();

        rootCmp.virtualScrollTop = top;
        if (verticalScroller) {
            verticalScroller.setScrollTop(top);
        }
    },

    getScrollerOwner: function() {
        var rootCmp = this;
        if (!this.scrollerOwner) {
            rootCmp = this.up('[scrollerOwner]');
        }
        return rootCmp;
    },

    /**
     * Scrolls the TablePanel by deltaY
     * @param {Number} deltaY
     */
    scrollByDeltaY: function(deltaY) {
        var verticalScroller = this.getVerticalScroller();

        if (verticalScroller) {
            verticalScroller.scrollByDeltaY(deltaY);
        }
    },

    /**
     * Scrolls the TablePanel by deltaX
     * @param {Number} deltaX
     */
    scrollByDeltaX: function(deltaX) {
        var horizontalScroller = this.getHorizontalScroller();

        if (horizontalScroller) {
            horizontalScroller.scrollByDeltaX(deltaX);
        }
    },

    /**
     * Gets left hand side marker for header resizing.
     * @private
     */
    getLhsMarker: function() {
        var me = this;

        if (!me.lhsMarker) {
            me.lhsMarker = Ext.DomHelper.append(me.el, {
                cls: Ext.baseCSSPrefix + 'grid-resize-marker'
            }, true);
        }
        return me.lhsMarker;
    },

    /**
     * Gets right hand side marker for header resizing.
     * @private
     */
    getRhsMarker: function() {
        var me = this;

        if (!me.rhsMarker) {
            me.rhsMarker = Ext.DomHelper.append(me.el, {
                cls: Ext.baseCSSPrefix + 'grid-resize-marker'
            }, true);
        }
        return me.rhsMarker;
    },

    /**
     * Returns the selection model being used and creates it via the configuration if it has not been created already.
     * @return {Ext.selection.Model} selModel
     */
    getSelectionModel: function(){
        if (!this.selModel) {
            this.selModel = {};
        }

        var mode = 'SINGLE',
            type;
        if (this.simpleSelect) {
            mode = 'SIMPLE';
        } else if (this.multiSelect) {
            mode = 'MULTI';
        }

        Ext.applyIf(this.selModel, {
            allowDeselect: this.allowDeselect,
            mode: mode
        });

        if (!this.selModel.events) {
            type = this.selModel.selType || this.selType;
            this.selModel = Ext.create('selection.' + type, this.selModel);
        }

        if (!this.selModel.hasRelaySetup) {
            this.relayEvents(this.selModel, [
                'selectionchange', 'beforeselect', 'beforedeselect', 'select', 'deselect'
            ]);
            this.selModel.hasRelaySetup = true;
        }

        // lock the selection model if user
        // has disabled selection
        if (this.disableSelection) {
            this.selModel.locked = true;
        }
        return this.selModel;
    },

    onVerticalScroll: function(event, target) {
        var owner = this.getScrollerOwner(),
            items = owner.query('tableview'),
            i = 0,
            len = items.length;

        for (; i < len; i++) {
            items[i].el.dom.scrollTop = target.scrollTop;
        }
    },

    onHorizontalScroll: function(event, target) {
        var owner = this.getScrollerOwner(),
            items = owner.query('tableview'),
            center = items[1] || items[0];

        center.el.dom.scrollLeft = target.scrollLeft;
        this.headerCt.el.dom.scrollLeft = target.scrollLeft;
    },

    // template method meant to be overriden
    onStoreLoad: Ext.emptyFn,

    getEditorParent: function() {
        return this.body;
    },

    bindStore: function(store) {
        var me = this;
        me.store = store;
        me.getView().bindStore(store);
    },
    
    beforeDestroy: function(){
        // may be some duplication here since the horizontal and vertical
        // scroller may be part of the docked items, but we need to clean
        // them up in case they aren't visible.
        Ext.destroy(this.horizontalScroller, this.verticalScroller);
        this.callParent();
    },

    /**
     * Reconfigures the table with a new store/columns. Either the store or the columns can be ommitted if you don't wish
     * to change them.
     * @param {Ext.data.Store} store (Optional) The new store.
     * @param {Object[]} columns (Optional) An array of column configs
     */
    reconfigure: function(store, columns) {
        var me = this,
            headerCt = me.headerCt;

        if (me.lockable) {
            me.reconfigureLockable(store, columns);
        } else {
            if (columns) {
                headerCt.suspendLayout = true;
                headerCt.removeAll();
                headerCt.add(columns);
            }
            if (store) {
                store = Ext.StoreManager.lookup(store);
                me.bindStore(store);
            } else {
                me.getView().refresh();
            }
            if (columns) {
                headerCt.suspendLayout = false;
                me.forceComponentLayout();
            }
        }
        me.fireEvent('reconfigure', me);
    }
});
