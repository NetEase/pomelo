/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.view.AbstractView
 * @extends Ext.Component
 * This is an abstract superclass and should not be used directly. Please see {@link Ext.view.View}.
 * @private
 */
Ext.define('Ext.view.AbstractView', {
    extend: 'Ext.Component',
    alternateClassName: 'Ext.view.AbstractView',
    requires: [
        'Ext.LoadMask',
        'Ext.data.StoreManager',
        'Ext.CompositeElementLite',
        'Ext.DomQuery',
        'Ext.selection.DataViewModel'
    ],

    inheritableStatics: {
        getRecord: function(node) {
            return this.getBoundView(node).getRecord(node);
        },

        getBoundView: function(node) {
            return Ext.getCmp(node.boundView);
        }
    },

    /**
     * @cfg {String/String[]/Ext.XTemplate} tpl (required)
     * The HTML fragment or an array of fragments that will make up the template used by this DataView.  This should
     * be specified in the same format expected by the constructor of {@link Ext.XTemplate}.
     */
    /**
     * @cfg {Ext.data.Store} store (required)
     * The {@link Ext.data.Store} to bind this DataView to.
     */

    /**
     * @cfg {Boolean} deferInitialRefresh
     * <p>Defaults to <code>true</code> to defer the initial refresh of the view.</p>
     * <p>This allows the View to execute its render and initial layout more quickly because the process will not be encumbered
     * by the expensive update of the view structure.</p>
     * <p><b>Important: </b>Be aware that this will mean that the View's item elements will not be available immediately upon render, so
     * <i>selection</i> may not take place at render time. To access a View's item elements as soon as possible, use the {@link #viewready} event.
     * Or set <code>deferInitialrefresh</code> to false, but this will be at the cost of slower rendering.</p>
     */
    deferInitialRefresh: true,

    /**
     * @cfg {String} itemSelector (required)
     * <b>This is a required setting</b>. A simple CSS selector (e.g. <tt>div.some-class</tt> or
     * <tt>span:first-child</tt>) that will be used to determine what nodes this DataView will be
     * working with. The itemSelector is used to map DOM nodes to records. As such, there should
     * only be one root level element that matches the selector for each record.
     */

    /**
     * @cfg {String} itemCls
     * Specifies the class to be assigned to each element in the view when used in conjunction with the
     * {@link #itemTpl} configuration.
     */
    itemCls: Ext.baseCSSPrefix + 'dataview-item',

    /**
     * @cfg {String/String[]/Ext.XTemplate} itemTpl
     * The inner portion of the item template to be rendered. Follows an XTemplate
     * structure and will be placed inside of a tpl.
     */

    /**
     * @cfg {String} overItemCls
     * A CSS class to apply to each item in the view on mouseover.
     * Ensure {@link #trackOver} is set to `true` to make use of this.
     */

    /**
     * @cfg {String} loadingText
     * A string to display during data load operations.  If specified, this text will be
     * displayed in a loading div and the view's contents will be cleared while loading, otherwise the view's
     * contents will continue to display normally until the new data is loaded and the contents are replaced.
     */
    loadingText: 'Loading...',

    /**
     * @cfg {Boolean/Object} loadMask
     * False to disable a load mask from displaying will the view is loading. This can also be a
     * {@link Ext.LoadMask} configuration object.
     */
    loadMask: true,

    /**
     * @cfg {String} loadingCls
     * The CSS class to apply to the loading message element. Defaults to Ext.LoadMask.prototype.msgCls "x-mask-loading".
     */

    /**
     * @cfg {Boolean} loadingUseMsg
     * Whether or not to use the loading message.
     * @private
     */
    loadingUseMsg: true,


    /**
     * @cfg {Number} loadingHeight
     * If specified, gives an explicit height for the data view when it is showing the {@link #loadingText},
     * if that is specified. This is useful to prevent the view's height from collapsing to zero when the
     * loading mask is applied and there are no other contents in the data view.
     */

    /**
     * @cfg {String} [selectedItemCls='x-view-selected']
     * A CSS class to apply to each selected item in the view.
     */
    selectedItemCls: Ext.baseCSSPrefix + 'item-selected',

    /**
     * @cfg {String} emptyText
     * The text to display in the view when there is no data to display.
     * Note that when using local data the emptyText will not be displayed unless you set
     * the {@link #deferEmptyText} option to false.
     */
    emptyText: "",

    /**
     * @cfg {Boolean} deferEmptyText
     * True to defer emptyText being applied until the store's first load.
     */
    deferEmptyText: true,

    /**
     * @cfg {Boolean} trackOver
     * True to enable mouseenter and mouseleave events
     */
    trackOver: false,

    /**
     * @cfg {Boolean} blockRefresh
     * Set this to true to ignore datachanged events on the bound store. This is useful if
     * you wish to provide custom transition animations via a plugin
     */
    blockRefresh: false,

    /**
     * @cfg {Boolean} disableSelection
     * True to disable selection within the DataView. This configuration will lock the selection model
     * that the DataView uses.
     */


    //private
    last: false,

    triggerEvent: 'itemclick',
    triggerCtEvent: 'containerclick',

    addCmpEvents: function() {

    },

    // private
    initComponent : function(){
        var me = this,
            isDef = Ext.isDefined,
            itemTpl = me.itemTpl,
            memberFn = {};

        if (itemTpl) {
            if (Ext.isArray(itemTpl)) {
                // string array
                itemTpl = itemTpl.join('');
            } else if (Ext.isObject(itemTpl)) {
                // tpl instance
                memberFn = Ext.apply(memberFn, itemTpl.initialConfig);
                itemTpl = itemTpl.html;
            }

            if (!me.itemSelector) {
                me.itemSelector = '.' + me.itemCls;
            }

            itemTpl = Ext.String.format('<tpl for="."><div class="{0}">{1}</div></tpl>', me.itemCls, itemTpl);
            me.tpl = Ext.create('Ext.XTemplate', itemTpl, memberFn);
        }

        //<debug>
        if (!isDef(me.tpl) || !isDef(me.itemSelector)) {
            Ext.Error.raise({
                sourceClass: 'Ext.view.View',
                tpl: me.tpl,
                itemSelector: me.itemSelector,
                msg: "DataView requires both tpl and itemSelector configurations to be defined."
            });
        }
        //</debug>

        me.callParent();
        if(Ext.isString(me.tpl) || Ext.isArray(me.tpl)){
            me.tpl = Ext.create('Ext.XTemplate', me.tpl);
        }

        //<debug>
        // backwards compat alias for overClass/selectedClass
        // TODO: Consider support for overCls generation Ext.Component config
        if (isDef(me.overCls) || isDef(me.overClass)) {
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Ext.view.View: Using the deprecated overCls or overClass configuration. Use overItemCls instead.');
            }
            me.overItemCls = me.overCls || me.overClass;
            delete me.overCls;
            delete me.overClass;
        }

        if (me.overItemCls) {
            me.trackOver = true;
        }

        if (isDef(me.selectedCls) || isDef(me.selectedClass)) {
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Ext.view.View: Using the deprecated selectedCls or selectedClass configuration. Use selectedItemCls instead.');
            }
            me.selectedItemCls = me.selectedCls || me.selectedClass;
            delete me.selectedCls;
            delete me.selectedClass;
        }
        //</debug>

        me.addEvents(
            /**
             * @event beforerefresh
             * Fires before the view is refreshed
             * @param {Ext.view.View} this The DataView object
             */
            'beforerefresh',
            /**
             * @event refresh
             * Fires when the view is refreshed
             * @param {Ext.view.View} this The DataView object
             */
            'refresh',
            /**
             * @event viewready
             * Fires when the View's item elements representing Store items has been rendered. If the {@link #deferInitialRefresh} flag
             * was set (and it is <code>true</code> by default), this will be <b>after</b> initial render, and no items will be available
             * for selection until this event fires.
             * @param {Ext.view.View} this
             */
            'viewready',
            /**
             * @event itemupdate
             * Fires when the node associated with an individual record is updated
             * @param {Ext.data.Model} record The model instance
             * @param {Number} index The index of the record/node
             * @param {HTMLElement} node The node that has just been updated
             */
            'itemupdate',
            /**
             * @event itemadd
             * Fires when the nodes associated with an recordset have been added to the underlying store
             * @param {Ext.data.Model[]} records The model instance
             * @param {Number} index The index at which the set of record/nodes starts
             * @param {HTMLElement[]} node The node that has just been updated
             */
            'itemadd',
            /**
             * @event itemremove
             * Fires when the node associated with an individual record is removed
             * @param {Ext.data.Model} record The model instance
             * @param {Number} index The index of the record/node
             */
            'itemremove'
        );

        me.addCmpEvents();

        // Look up the configured Store. If none configured, use the fieldless, empty Store defined in Ext.data.Store.
        me.store = Ext.data.StoreManager.lookup(me.store || 'ext-empty-store');
        me.all = new Ext.CompositeElementLite();
    },

    onRender: function() {
        var me = this,
            mask = me.loadMask,
            cfg = {
                msg: me.loadingText,
                msgCls: me.loadingCls,
                useMsg: me.loadingUseMsg
            };

        me.callParent(arguments);

        if (mask) {
            // either a config object
            if (Ext.isObject(mask)) {
                cfg = Ext.apply(cfg, mask);
            }
            // Attach the LoadMask to a *Component* so that it can be sensitive to resizing during long loads.
            // If this DataView is floating, then mask this DataView.
            // Otherwise, mask its owning Container (or this, if there *is* no owning Container).
            // LoadMask captures the element upon render.
            me.loadMask = Ext.create('Ext.LoadMask', me, cfg);
            me.loadMask.on({
                scope: me,
                beforeshow: me.onMaskBeforeShow,
                hide: me.onMaskHide
            });
        }
    },

    onMaskBeforeShow: function(){
        var loadingHeight = this.loadingHeight;
        
        this.getSelectionModel().deselectAll();
        if (loadingHeight) {
            this.setCalculatedSize(undefined, loadingHeight);
        }
    },

    onMaskHide: function(){
        var me = this;
        
        if (!me.destroying && me.loadingHeight) {
            me.setHeight(me.height);
        }
    },

    afterRender: function() {
        this.callParent(arguments);

        // Init the SelectionModel after any on('render') listeners have been added.
        // Drag plugins create a DragDrop instance in a render listener, and that needs
        // to see an itemmousedown event first.
        this.getSelectionModel().bindComponent(this);
    },

    /**
     * Gets the selection model for this view.
     * @return {Ext.selection.Model} The selection model
     */
    getSelectionModel: function(){
        var me = this,
            mode = 'SINGLE';

        if (!me.selModel) {
            me.selModel = {};
        }

        if (me.simpleSelect) {
            mode = 'SIMPLE';
        } else if (me.multiSelect) {
            mode = 'MULTI';
        }

        Ext.applyIf(me.selModel, {
            allowDeselect: me.allowDeselect,
            mode: mode
        });

        if (!me.selModel.events) {
            me.selModel = Ext.create('Ext.selection.DataViewModel', me.selModel);
        }

        if (!me.selModel.hasRelaySetup) {
            me.relayEvents(me.selModel, [
                'selectionchange', 'beforeselect', 'beforedeselect', 'select', 'deselect'
            ]);
            me.selModel.hasRelaySetup = true;
        }

        // lock the selection model if user
        // has disabled selection
        if (me.disableSelection) {
            me.selModel.locked = true;
        }

        return me.selModel;
    },

    /**
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        var me = this,
            el,
            records;

        if (!me.rendered || me.isDestroyed) {
            return;
        }

        me.fireEvent('beforerefresh', me);
        el = me.getTargetEl();
        records = me.store.getRange();

        el.update('');
        if (records.length < 1) {
            if (!me.deferEmptyText || me.hasSkippedEmptyText) {
                el.update(me.emptyText);
            }
            me.all.clear();
        } else {
            me.tpl.overwrite(el, me.collectData(records, 0));
            me.all.fill(Ext.query(me.getItemSelector(), el.dom));
            me.updateIndexes(0);
        }

        me.selModel.refresh();
        me.hasSkippedEmptyText = true;
        me.fireEvent('refresh', me);

        // Upon first refresh, fire the viewready event.
        // Reconfiguring the grid "renews" this event.
        if (!me.viewReady) {
            // Fire an event when deferred content becomes available.
            // This supports grid Panel's deferRowRender capability
            me.viewReady = true;
            me.fireEvent('viewready', me);
        }
    },

    /**
     * Function which can be overridden to provide custom formatting for each Record that is used by this
     * DataView's {@link #tpl template} to render each node.
     * @param {Object/Object[]} data The raw data object that was used to create the Record.
     * @param {Number} recordIndex the index number of the Record being prepared for rendering.
     * @param {Ext.data.Model} record The Record being prepared for rendering.
     * @return {Array/Object} The formatted data in a format expected by the internal {@link #tpl template}'s overwrite() method.
     * (either an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'}))
     */
    prepareData: function(data, index, record) {
        if (record) {
            Ext.apply(data, record.getAssociatedData());
        }
        return data;
    },

    /**
     * <p>Function which can be overridden which returns the data object passed to this
     * DataView's {@link #tpl template} to render the whole DataView.</p>
     * <p>This is usually an Array of data objects, each element of which is processed by an
     * {@link Ext.XTemplate XTemplate} which uses <tt>'&lt;tpl for="."&gt;'</tt> to iterate over its supplied
     * data object as an Array. However, <i>named</i> properties may be placed into the data object to
     * provide non-repeating data such as headings, totals etc.</p>
     * @param {Ext.data.Model[]} records An Array of {@link Ext.data.Model}s to be rendered into the DataView.
     * @param {Number} startIndex the index number of the Record being prepared for rendering.
     * @return {Object[]} An Array of data objects to be processed by a repeating XTemplate. May also
     * contain <i>named</i> properties.
     */
    collectData : function(records, startIndex){
        var r = [],
            i = 0,
            len = records.length,
            record;

        for(; i < len; i++){
            record = records[i];
            r[r.length] = this.prepareData(record[record.persistenceProperty], startIndex + i, record);
        }
        return r;
    },

    // private
    bufferRender : function(records, index){
        var div = document.createElement('div');
        this.tpl.overwrite(div, this.collectData(records, index));
        return Ext.query(this.getItemSelector(), div);
    },

    // private
    onUpdate : function(ds, record){
        var me = this,
            index = me.store.indexOf(record),
            node;

        if (index > -1){
            node = me.bufferRender([record], index)[0];
            // ensure the node actually exists in the DOM
            if (me.getNode(record)) {
                me.all.replaceElement(index, node, true);
                me.updateIndexes(index, index);
                // Maintain selection after update
                // TODO: Move to approriate event handler.
                me.selModel.refresh();
                me.fireEvent('itemupdate', record, index, node);
            }
        }

    },

    // private
    onAdd : function(ds, records, index) {
        var me = this,
            nodes;

        if (me.all.getCount() === 0) {
            me.refresh();
            return;
        }

        nodes = me.bufferRender(records, index);
        me.doAdd(nodes, records, index);

        me.selModel.refresh();
        me.updateIndexes(index);
        me.fireEvent('itemadd', records, index, nodes);
    },

    doAdd: function(nodes, records, index) {
        var all = this.all;

        if (index < all.getCount()) {
            all.item(index).insertSibling(nodes, 'before', true);
        } else {
            all.last().insertSibling(nodes, 'after', true);
        }

        Ext.Array.insert(all.elements, index, nodes);
    },

    // private
    onRemove : function(ds, record, index) {
        var me = this;

        me.doRemove(record, index);
        me.updateIndexes(index);
        if (me.store.getCount() === 0){
            me.refresh();
        }
        me.fireEvent('itemremove', record, index);
    },

    doRemove: function(record, index) {
        this.all.removeElement(index, true);
    },

    /**
     * Refreshes an individual node's data from the store.
     * @param {Number} index The item's data index in the store
     */
    refreshNode : function(index){
        this.onUpdate(this.store, this.store.getAt(index));
    },

    // private
    updateIndexes : function(startIndex, endIndex) {
        var ns = this.all.elements,
            records = this.store.getRange(),
            i;
            
        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length - 1));
        for(i = startIndex; i <= endIndex; i++){
            ns[i].viewIndex = i;
            ns[i].viewRecordId = records[i].internalId;
            if (!ns[i].boundView) {
                ns[i].boundView = this.id;
            }
        }
    },

    /**
     * Returns the store associated with this DataView.
     * @return {Ext.data.Store} The store
     */
    getStore : function(){
        return this.store;
    },

    /**
     * Changes the data store bound to this view and refreshes it.
     * @param {Ext.data.Store} store The store to bind to this view
     */
    bindStore : function(store, initial) {
        var me = this,
            maskStore;

        if (!initial && me.store) {
            if (store !== me.store && me.store.autoDestroy) {
                me.store.destroyStore();
            }
            else {
                me.mun(me.store, {
                    scope: me,
                    datachanged: me.onDataChanged,
                    add: me.onAdd,
                    remove: me.onRemove,
                    update: me.onUpdate,
                    clear: me.refresh
                });
            }
            if (!store) {
                // Ensure we have an instantiated LoadMask before we unbind it.
                if (me.loadMask && me.loadMask.bindStore) {
                    me.loadMask.bindStore(null);
                }
                me.store = null;
            }
        }
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            me.mon(store, {
                scope: me,
                datachanged: me.onDataChanged,
                add: me.onAdd,
                remove: me.onRemove,
                update: me.onUpdate,
                clear: me.refresh
            });
            // Ensure we have an instantiated LoadMask before we bind it.
            if (me.loadMask && me.loadMask.bindStore) {
                // View's store is a NodeStore, use owning TreePanel's Store
                if (Ext.Array.contains(store.alias, 'store.node')) {
                    maskStore = this.ownerCt.store;
                } else {
                    maskStore = store;
                }
                me.loadMask.bindStore(maskStore);
            }
        }

        // Flag to say that initial refresh has not been performed.
        // Set here rather than at initialization time, so that a reconfigure with a new store will refire viewready
        me.viewReady = false;

        me.store = store;
        // Bind the store to our selection model
        me.getSelectionModel().bind(store);

        /*
         * This code used to have checks for:
         * if (store && (!initial || store.getCount() || me.emptyText)) {
         * Instead, just trigger a refresh and let the view itself figure out
         * what needs to happen. It can cause incorrect display if our store
         * has no data.
         */
        if (store) {
            if (initial && me.deferInitialRefresh) {
                Ext.Function.defer(function () {
                    if (!me.isDestroyed) {
                        me.refresh(true);
                    }
                }, 1);
            } else {
                me.refresh(true);
            }
        }
    },

    /**
     * @private
     * Calls this.refresh if this.blockRefresh is not true
     */
    onDataChanged: function() {
        if (this.blockRefresh !== true) {
            this.refresh.apply(this, arguments);
        }
    },

    /**
     * Returns the template node the passed child belongs to, or null if it doesn't belong to one.
     * @param {HTMLElement} node
     * @return {HTMLElement} The template node
     */
    findItemByChild: function(node){
        return Ext.fly(node).findParent(this.getItemSelector(), this.getTargetEl());
    },

    /**
     * Returns the template node by the Ext.EventObject or null if it is not found.
     * @param {Ext.EventObject} e
     */
    findTargetByEvent: function(e) {
        return e.getTarget(this.getItemSelector(), this.getTargetEl());
    },


    /**
     * Gets the currently selected nodes.
     * @return {HTMLElement[]} An array of HTMLElements
     */
    getSelectedNodes: function(){
        var nodes   = [],
            records = this.selModel.getSelection(),
            ln = records.length,
            i  = 0;

        for (; i < ln; i++) {
            nodes.push(this.getNode(records[i]));
        }

        return nodes;
    },

    /**
     * Gets an array of the records from an array of nodes
     * @param {HTMLElement[]} nodes The nodes to evaluate
     * @return {Ext.data.Model[]} records The {@link Ext.data.Model} objects
     */
    getRecords: function(nodes) {
        var records = [],
            i = 0,
            len = nodes.length,
            data = this.store.data;

        for (; i < len; i++) {
            records[records.length] = data.getByKey(nodes[i].viewRecordId);
        }

        return records;
    },

    /**
     * Gets a record from a node
     * @param {Ext.Element/HTMLElement} node The node to evaluate
     *
     * @return {Ext.data.Model} record The {@link Ext.data.Model} object
     */
    getRecord: function(node){
        return this.store.data.getByKey(Ext.getDom(node).viewRecordId);
    },


    /**
     * Returns true if the passed node is selected, else false.
     * @param {HTMLElement/Number/Ext.data.Model} node The node, node index or record to check
     * @return {Boolean} True if selected, else false
     */
    isSelected : function(node) {
        // TODO: El/Idx/Record
        var r = this.getRecord(node);
        return this.selModel.isSelected(r);
    },

    /**
     * Selects a record instance by record instance or index.
     * @param {Ext.data.Model[]/Number} records An array of records or an index
     * @param {Boolean} [keepExisting] True to keep existing selections
     * @param {Boolean} [suppressEvent] Set to true to not fire a select event
     */
    select: function(records, keepExisting, suppressEvent) {
        this.selModel.select(records, keepExisting, suppressEvent);
    },

    /**
     * Deselects a record instance by record instance or index.
     * @param {Ext.data.Model[]/Number} records An array of records or an index
     * @param {Boolean} [suppressEvent] Set to true to not fire a deselect event
     */
    deselect: function(records, suppressEvent) {
        this.selModel.deselect(records, suppressEvent);
    },

    /**
     * Gets a template node.
     * @param {HTMLElement/String/Number/Ext.data.Model} nodeInfo An HTMLElement template node, index of a template node,
     * the id of a template node or the record associated with the node.
     * @return {HTMLElement} The node or null if it wasn't found
     */
    getNode : function(nodeInfo) {
        if (!this.rendered) {
            return null;
        }
        if (Ext.isString(nodeInfo)) {
            return document.getElementById(nodeInfo);
        }
        if (Ext.isNumber(nodeInfo)) {
            return this.all.elements[nodeInfo];
        }
        if (nodeInfo instanceof Ext.data.Model) {
            return this.getNodeByRecord(nodeInfo);
        }
        return nodeInfo; // already an HTMLElement
    },

    /**
     * @private
     */
    getNodeByRecord: function(record) {
        var ns = this.all.elements,
            ln = ns.length,
            i = 0;

        for (; i < ln; i++) {
            if (ns[i].viewRecordId === record.internalId) {
                return ns[i];
            }
        }

        return null;
    },

    /**
     * Gets a range nodes.
     * @param {Number} start (optional) The index of the first node in the range
     * @param {Number} end (optional) The index of the last node in the range
     * @return {HTMLElement[]} An array of nodes
     */
    getNodes: function(start, end) {
        var ns = this.all.elements,
            nodes = [],
            i;

        start = start || 0;
        end = !Ext.isDefined(end) ? Math.max(ns.length - 1, 0) : end;
        if (start <= end) {
            for (i = start; i <= end && ns[i]; i++) {
                nodes.push(ns[i]);
            }
        } else {
            for (i = start; i >= end && ns[i]; i--) {
                nodes.push(ns[i]);
            }
        }
        return nodes;
    },

    /**
     * Finds the index of the passed node.
     * @param {HTMLElement/String/Number/Ext.data.Model} nodeInfo An HTMLElement template node, index of a template node, the id of a template node
     * or a record associated with a node.
     * @return {Number} The index of the node or -1
     */
    indexOf: function(node) {
        node = this.getNode(node);
        if (Ext.isNumber(node.viewIndex)) {
            return node.viewIndex;
        }
        return this.all.indexOf(node);
    },

    onDestroy : function() {
        var me = this;

        me.all.clear();
        me.callParent();
        me.bindStore(null);
        me.selModel.destroy();
    },

    // invoked by the selection model to maintain visual UI cues
    onItemSelect: function(record) {
        var node = this.getNode(record);
        
        if (node) {
            Ext.fly(node).addCls(this.selectedItemCls);
        }
    },

    // invoked by the selection model to maintain visual UI cues
    onItemDeselect: function(record) {
        var node = this.getNode(record);
        
        if (node) {
            Ext.fly(node).removeCls(this.selectedItemCls);
        }
    },

    getItemSelector: function() {
        return this.itemSelector;
    }
}, function() {
    // all of this information is available directly
    // from the SelectionModel itself, the only added methods
    // to DataView regarding selection will perform some transformation/lookup
    // between HTMLElement/Nodes to records and vice versa.
    Ext.deprecate('extjs', '4.0', function() {
        Ext.view.AbstractView.override({
            /**
             * @cfg {Boolean} [multiSelect=false]
             * True to allow selection of more than one item at a time, false to allow selection of only a single item
             * at a time or no selection at all, depending on the value of {@link #singleSelect}.
             */
            /**
             * @cfg {Boolean} [singleSelect=false]
             * True to allow selection of exactly one item at a time, false to allow no selection at all.
             * Note that if {@link #multiSelect} = true, this value will be ignored.
             */
            /**
             * @cfg {Boolean} [simpleSelect=false]
             * True to enable multiselection by clicking on multiple items without requiring the user to hold Shift or Ctrl,
             * false to force the user to hold Ctrl or Shift to select more than on item.
             */

            /**
             * Gets the number of selected nodes.
             * @return {Number} The node count
             */
            getSelectionCount : function(){
                if (Ext.global.console) {
                    Ext.global.console.warn("DataView: getSelectionCount will be removed, please interact with the Ext.selection.DataViewModel");
                }
                return this.selModel.getSelection().length;
            },

            /**
             * Gets an array of the selected records
             * @return {Ext.data.Model[]} An array of {@link Ext.data.Model} objects
             */
            getSelectedRecords : function(){
                if (Ext.global.console) {
                    Ext.global.console.warn("DataView: getSelectedRecords will be removed, please interact with the Ext.selection.DataViewModel");
                }
                return this.selModel.getSelection();
            },

            select: function(records, keepExisting, supressEvents) {
                if (Ext.global.console) {
                    Ext.global.console.warn("DataView: select will be removed, please access select through a DataView's SelectionModel, ie: view.getSelectionModel().select()");
                }
                var sm = this.getSelectionModel();
                return sm.select.apply(sm, arguments);
            },

            clearSelections: function() {
                if (Ext.global.console) {
                    Ext.global.console.warn("DataView: clearSelections will be removed, please access deselectAll through DataView's SelectionModel, ie: view.getSelectionModel().deselectAll()");
                }
                var sm = this.getSelectionModel();
                return sm.deselectAll();
            }
        });
    });
});

