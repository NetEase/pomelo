/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This class encapsulates the user interface for a tabular data set.
 * It acts as a centralized manager for controlling the various interface
 * elements of the view. This includes handling events, such as row and cell
 * level based DOM events. It also reacts to events from the underlying {@link Ext.selection.Model}
 * to provide visual feedback to the user.
 *
 * This class does not provide ways to manipulate the underlying data of the configured
 * {@link Ext.data.Store}.
 *
 * This is the base class for both {@link Ext.grid.View} and {@link Ext.tree.View} and is not
 * to be used directly.
 */
Ext.define('Ext.view.Table', {
    extend: 'Ext.view.View',
    alias: 'widget.tableview',
    uses: [
        'Ext.view.TableChunker',
        'Ext.util.DelayedTask',
        'Ext.util.MixedCollection'
    ],

    baseCls: Ext.baseCSSPrefix + 'grid-view',

    // row
    itemSelector: '.' + Ext.baseCSSPrefix + 'grid-row',
    // cell
    cellSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',

    selectedItemCls: Ext.baseCSSPrefix + 'grid-row-selected',
    selectedCellCls: Ext.baseCSSPrefix + 'grid-cell-selected',
    focusedItemCls: Ext.baseCSSPrefix + 'grid-row-focused',
    overItemCls: Ext.baseCSSPrefix + 'grid-row-over',
    altRowCls:   Ext.baseCSSPrefix + 'grid-row-alt',
    rowClsRe: /(?:^|\s*)grid-row-(first|last|alt)(?:\s+|$)/g,
    cellRe: new RegExp('x-grid-cell-([^\\s]+) ', ''),

    // cfg docs inherited
    trackOver: true,

    /**
     * Override this function to apply custom CSS classes to rows during rendering. This function should return the
     * CSS class name (or empty string '' for none) that will be added to the row's wrapping div. To apply multiple
     * class names, simply return them space-delimited within the string (e.g. 'my-class another-class').
     * Example usage:
     *
     *     viewConfig: {
     *         getRowClass: function(record, rowIndex, rowParams, store){
     *             return record.get("valid") ? "row-valid" : "row-error";
     *         }
     *     }
     *
     * @param {Ext.data.Model} record The record corresponding to the current row.
     * @param {Number} index The row index.
     * @param {Object} rowParams **DEPRECATED.** For row body use the
     * {@link Ext.grid.feature.RowBody#getAdditionalData getAdditionalData} method of the rowbody feature.
     * @param {Ext.data.Store} store The store this grid is bound to
     * @return {String} a CSS class name to add to the row.
     * @method
     */
    getRowClass: null,

    initComponent: function() {
        var me = this;

        me.scrollState = {};
        me.selModel.view = me;
        me.headerCt.view = me;
        me.initFeatures();
        me.tpl = '<div></div>';
        me.callParent();
        me.mon(me.store, {
            load: me.onStoreLoad,
            scope: me
        });

        // this.addEvents(
        //     /**
        //      * @event rowfocus
        //      * @param {Ext.data.Model} record
        //      * @param {HTMLElement} row
        //      * @param {Number} rowIdx
        //      */
        //     'rowfocus'
        // );
    },

    // scroll to top of the grid when store loads
    onStoreLoad: function(){
        var me = this;

        if (me.invalidateScrollerOnRefresh) {
            if (Ext.isGecko) {
                if (!me.scrollToTopTask) {
                    me.scrollToTopTask = Ext.create('Ext.util.DelayedTask', me.scrollToTop, me);
                }
                me.scrollToTopTask.delay(1);
            } else {
                me    .scrollToTop();
            }
        }
    },

    // scroll the view to the top
    scrollToTop: Ext.emptyFn,

    /**
     * Add a listener to the main view element. It will be destroyed with the view.
     * @private
     */
    addElListener: function(eventName, fn, scope){
        this.mon(this, eventName, fn, scope, {
            element: 'el'
        });
    },

    /**
     * Get the columns used for generating a template via TableChunker.
     * See {@link Ext.grid.header.Container#getGridColumns}.
     * @private
     */
    getGridColumns: function() {
        return this.headerCt.getGridColumns();
    },

    /**
     * Get a leaf level header by index regardless of what the nesting
     * structure is.
     * @private
     * @param {Number} index The index
     */
    getHeaderAtIndex: function(index) {
        return this.headerCt.getHeaderAtIndex(index);
    },

    /**
     * Get the cell (td) for a particular record and column.
     * @param {Ext.data.Model} record
     * @param {Ext.grid.column.Column} column
     * @private
     */
    getCell: function(record, column) {
        var row = this.getNode(record);
        return Ext.fly(row).down(column.getCellSelector());
    },

    /**
     * Get a reference to a feature
     * @param {String} id The id of the feature
     * @return {Ext.grid.feature.Feature} The feature. Undefined if not found
     */
    getFeature: function(id) {
        var features = this.featuresMC;
        if (features) {
            return features.get(id);
        }
    },

    /**
     * Initializes each feature and bind it to this view.
     * @private
     */
    initFeatures: function() {
        var me = this,
            i = 0,
            features,
            len;

        me.features = me.features || [];
        features = me.features;
        len = features.length;

        me.featuresMC = Ext.create('Ext.util.MixedCollection');
        for (; i < len; i++) {
            // ensure feature hasnt already been instantiated
            if (!features[i].isFeature) {
                features[i] = Ext.create('feature.' + features[i].ftype, features[i]);
            }
            // inject a reference to view
            features[i].view = me;
            me.featuresMC.add(features[i]);
        }
    },

    /**
     * Gives features an injection point to attach events to the markup that
     * has been created for this view.
     * @private
     */
    attachEventsForFeatures: function() {
        var features = this.features,
            ln       = features.length,
            i        = 0;

        for (; i < ln; i++) {
            if (features[i].isFeature) {
                features[i].attachEvents();
            }
        }
    },

    afterRender: function() {
        var me = this;

        me.callParent();
        me.mon(me.el, {
            scroll: me.fireBodyScroll,
            scope: me
        });
        me.el.unselectable();
        me.attachEventsForFeatures();
    },

    fireBodyScroll: function(e, t) {
        this.fireEvent('bodyscroll', e, t);
    },

    // TODO: Refactor headerCt dependency here to colModel
    /**
     * Uses the headerCt to transform data from dataIndex keys in a record to
     * headerId keys in each header and then run them through each feature to
     * get additional data for variables they have injected into the view template.
     * @private
     */
    prepareData: function(data, idx, record) {
        var me       = this,
            orig     = me.headerCt.prepareData(data, idx, record, me, me.ownerCt),
            features = me.features,
            ln       = features.length,
            i        = 0,
            node, feature;

        for (; i < ln; i++) {
            feature = features[i];
            if (feature.isFeature) {
                Ext.apply(orig, feature.getAdditionalData(data, idx, record, orig, me));
            }
        }

        return orig;
    },

    // TODO: Refactor headerCt dependency here to colModel
    collectData: function(records, startIndex) {
        var preppedRecords = this.callParent(arguments),
            headerCt  = this.headerCt,
            fullWidth = headerCt.getFullWidth(),
            features  = this.features,
            ln = features.length,
            o = {
                rows: preppedRecords,
                fullWidth: fullWidth
            },
            i  = 0,
            feature,
            j = 0,
            jln,
            rowParams;

        jln = preppedRecords.length;
        // process row classes, rowParams has been deprecated and has been moved
        // to the individual features that implement the behavior.
        if (this.getRowClass) {
            for (; j < jln; j++) {
                rowParams = {};
                preppedRecords[j]['rowCls'] = this.getRowClass(records[j], j, rowParams, this.store);
                //<debug>
                if (rowParams.alt) {
                    Ext.Error.raise("The getRowClass alt property is no longer supported.");
                }
                if (rowParams.tstyle) {
                    Ext.Error.raise("The getRowClass tstyle property is no longer supported.");
                }
                if (rowParams.cells) {
                    Ext.Error.raise("The getRowClass cells property is no longer supported.");
                }
                if (rowParams.body) {
                    Ext.Error.raise("The getRowClass body property is no longer supported. Use the getAdditionalData method of the rowbody feature.");
                }
                if (rowParams.bodyStyle) {
                    Ext.Error.raise("The getRowClass bodyStyle property is no longer supported.");
                }
                if (rowParams.cols) {
                    Ext.Error.raise("The getRowClass cols property is no longer supported.");
                }
                //</debug>
            }
        }
        // currently only one feature may implement collectData. This is to modify
        // what's returned to the view before its rendered
        for (; i < ln; i++) {
            feature = features[i];
            if (feature.isFeature && feature.collectData && !feature.disabled) {
                o = feature.collectData(records, preppedRecords, startIndex, fullWidth, o);
                break;
            }
        }
        return o;
    },

    // TODO: Refactor header resizing to column resizing
    /**
     * When a header is resized, setWidth on the individual columns resizer class,
     * the top level table, save/restore scroll state, generate a new template and
     * restore focus to the grid view's element so that keyboard navigation
     * continues to work.
     * @private
     */
    onHeaderResize: function(header, w, suppressFocus) {
        var me = this,
            el = me.el;

        if (el) {
            me.saveScrollState();
            // Grab the col and set the width, css
            // class is generated in TableChunker.
            // Select composites because there may be several chunks.

            // IE6 and IE7 bug.
            // Setting the width of the first TD does not work - ends up with a 1 pixel discrepancy.
            // We need to increment the passed with in this case.
            if (Ext.isIE6 || Ext.isIE7) {
                if (header.el.hasCls(Ext.baseCSSPrefix + 'column-header-first')) {
                    w += 1;
                }
            }
            el.select('.' + Ext.baseCSSPrefix + 'grid-col-resizer-'+header.id).setWidth(w);
            el.select('.' + Ext.baseCSSPrefix + 'grid-table-resizer').setWidth(me.headerCt.getFullWidth());
            me.restoreScrollState();
            if (!me.ignoreTemplate) {
                me.setNewTemplate();
            }
            if (!suppressFocus) {
                me.el.focus();
            }
        }
    },

    /**
     * When a header is shown restore its oldWidth if it was previously hidden.
     * @private
     */
    onHeaderShow: function(headerCt, header, suppressFocus) {
        var me = this;
        me.ignoreTemplate = true;
        // restore headers that were dynamically hidden
        if (header.oldWidth) {
            me.onHeaderResize(header, header.oldWidth, suppressFocus);
            delete header.oldWidth;
        // flexed headers will have a calculated size set
        // this additional check has to do with the fact that
        // defaults: {width: 100} will fight with a flex value
        } else if (header.width && !header.flex) {
            me.onHeaderResize(header, header.width, suppressFocus);
        }
        delete me.ignoreTemplate;
        me.setNewTemplate();
    },

    /**
     * When the header hides treat it as a resize to 0.
     * @private
     */
    onHeaderHide: function(headerCt, header, suppressFocus) {
        this.onHeaderResize(header, 0, suppressFocus);
    },

    /**
     * Set a new template based on the current columns displayed in the
     * grid.
     * @private
     */
    setNewTemplate: function() {
        var me = this,
            columns = me.headerCt.getColumnsForTpl(true);

        me.tpl = me.getTableChunker().getTableTpl({
            columns: columns,
            features: me.features
        });
    },

    /**
     * Returns the configured chunker or default of Ext.view.TableChunker
     */
    getTableChunker: function() {
        return this.chunker || Ext.view.TableChunker;
    },

    /**
     * Adds a CSS Class to a specific row.
     * @param {HTMLElement/String/Number/Ext.data.Model} rowInfo An HTMLElement, index or instance of a model
     * representing this row
     * @param {String} cls
     */
    addRowCls: function(rowInfo, cls) {
        var row = this.getNode(rowInfo);
        if (row) {
            Ext.fly(row).addCls(cls);
        }
    },

    /**
     * Removes a CSS Class from a specific row.
     * @param {HTMLElement/String/Number/Ext.data.Model} rowInfo An HTMLElement, index or instance of a model
     * representing this row
     * @param {String} cls
     */
    removeRowCls: function(rowInfo, cls) {
        var row = this.getNode(rowInfo);
        if (row) {
            Ext.fly(row).removeCls(cls);
        }
    },

    // GridSelectionModel invokes onRowSelect as selection changes
    onRowSelect : function(rowIdx) {
        this.addRowCls(rowIdx, this.selectedItemCls);
    },

    // GridSelectionModel invokes onRowDeselect as selection changes
    onRowDeselect : function(rowIdx) {
        var me = this;

        me.removeRowCls(rowIdx, me.selectedItemCls);
        me.removeRowCls(rowIdx, me.focusedItemCls);
    },

    onCellSelect: function(position) {
        var cell = this.getCellByPosition(position);
        if (cell) {
            cell.addCls(this.selectedCellCls);
        }
    },

    onCellDeselect: function(position) {
        var cell = this.getCellByPosition(position);
        if (cell) {
            cell.removeCls(this.selectedCellCls);
        }

    },

    onCellFocus: function(position) {
        //var cell = this.getCellByPosition(position);
        this.focusCell(position);
    },

    getCellByPosition: function(position) {
        var row    = position.row,
            column = position.column,
            store  = this.store,
            node   = this.getNode(row),
            header = this.headerCt.getHeaderAtIndex(column),
            cellSelector,
            cell = false;

        if (header && node) {
            cellSelector = header.getCellSelector();
            cell = Ext.fly(node).down(cellSelector);
        }
        return cell;
    },

    // GridSelectionModel invokes onRowFocus to 'highlight'
    // the last row focused
    onRowFocus: function(rowIdx, highlight, supressFocus) {
        var me = this,
            row = me.getNode(rowIdx);

        if (highlight) {
            me.addRowCls(rowIdx, me.focusedItemCls);
            if (!supressFocus) {
                me.focusRow(rowIdx);
            }
            //this.el.dom.setAttribute('aria-activedescendant', row.id);
        } else {
            me.removeRowCls(rowIdx, me.focusedItemCls);
        }
    },

    /**
     * Focuses a particular row and brings it into view. Will fire the rowfocus event.
     * @param {HTMLElement/String/Number/Ext.data.Model} rowIdx
     * An HTMLElement template node, index of a template node, the id of a template node or the
     * record associated with the node.
     */
    focusRow: function(rowIdx) {
        var me         = this,
            row        = me.getNode(rowIdx),
            el         = me.el,
            adjustment = 0,
            panel      = me.ownerCt,
            rowRegion,
            elRegion,
            record;

        if (row && el) {
            elRegion  = el.getRegion();
            rowRegion = Ext.fly(row).getRegion();
            // row is above
            if (rowRegion.top < elRegion.top) {
                adjustment = rowRegion.top - elRegion.top;
            // row is below
            } else if (rowRegion.bottom > elRegion.bottom) {
                adjustment = rowRegion.bottom - elRegion.bottom;
            }
            record = me.getRecord(row);
            rowIdx = me.store.indexOf(record);

            if (adjustment) {
                // scroll the grid itself, so that all gridview's update.
                panel.scrollByDeltaY(adjustment);
            }
            me.fireEvent('rowfocus', record, row, rowIdx);
        }
    },

    focusCell: function(position) {
        var me          = this,
            cell        = me.getCellByPosition(position),
            el          = me.el,
            adjustmentY = 0,
            adjustmentX = 0,
            elRegion    = el.getRegion(),
            panel       = me.ownerCt,
            cellRegion,
            record;

        if (cell) {
            cellRegion = cell.getRegion();
            // cell is above
            if (cellRegion.top < elRegion.top) {
                adjustmentY = cellRegion.top - elRegion.top;
            // cell is below
            } else if (cellRegion.bottom > elRegion.bottom) {
                adjustmentY = cellRegion.bottom - elRegion.bottom;
            }

            // cell is left
            if (cellRegion.left < elRegion.left) {
                adjustmentX = cellRegion.left - elRegion.left;
            // cell is right
            } else if (cellRegion.right > elRegion.right) {
                adjustmentX = cellRegion.right - elRegion.right;
            }

            if (adjustmentY) {
                // scroll the grid itself, so that all gridview's update.
                panel.scrollByDeltaY(adjustmentY);
            }
            if (adjustmentX) {
                panel.scrollByDeltaX(adjustmentX);
            }
            el.focus();
            me.fireEvent('cellfocus', record, cell, position);
        }
    },

    /**
     * Scrolls by delta. This affects this individual view ONLY and does not
     * synchronize across views or scrollers.
     * @param {Number} delta
     * @param {String} dir (optional) Valid values are scrollTop and scrollLeft. Defaults to scrollTop.
     * @private
     */
    scrollByDelta: function(delta, dir) {
        dir = dir || 'scrollTop';
        var elDom = this.el.dom;
        elDom[dir] = (elDom[dir] += delta);
    },

    onUpdate: function(ds, index) {
        this.callParent(arguments);
    },

    /**
     * Saves the scrollState in a private variable. Must be used in conjunction with restoreScrollState
     */
    saveScrollState: function() {
        if (this.rendered) {
            var dom = this.el.dom, 
                state = this.scrollState;
            
            state.left = dom.scrollLeft;
            state.top = dom.scrollTop;
        }
    },

    /**
     * Restores the scrollState.
     * Must be used in conjunction with saveScrollState
     * @private
     */
    restoreScrollState: function() {
        if (this.rendered) {
            var dom = this.el.dom, 
                state = this.scrollState, 
                headerEl = this.headerCt.el.dom;
            
            headerEl.scrollLeft = dom.scrollLeft = state.left;
            dom.scrollTop = state.top;
        }
    },

    /**
     * Refreshes the grid view. Saves and restores the scroll state, generates a new template, stripes rows and
     * invalidates the scrollers.
     */
    refresh: function() {
        this.setNewTemplate();
        this.callParent(arguments);
    },

    processItemEvent: function(record, row, rowIndex, e) {
        var me = this,
            cell = e.getTarget(me.cellSelector, row),
            cellIndex = cell ? cell.cellIndex : -1,
            map = me.statics().EventMap,
            selModel = me.getSelectionModel(),
            type = e.type,
            result;

        if (type == 'keydown' && !cell && selModel.getCurrentPosition) {
            // CellModel, otherwise we can't tell which cell to invoke
            cell = me.getCellByPosition(selModel.getCurrentPosition());
            if (cell) {
                cell = cell.dom;
                cellIndex = cell.cellIndex;
            }
        }

        result = me.fireEvent('uievent', type, me, cell, rowIndex, cellIndex, e);

        if (result === false || me.callParent(arguments) === false) {
            return false;
        }

        // Don't handle cellmouseenter and cellmouseleave events for now
        if (type == 'mouseover' || type == 'mouseout') {
            return true;
        }

        return !(
            // We are adding cell and feature events
            (me['onBeforeCell' + map[type]](cell, cellIndex, record, row, rowIndex, e) === false) ||
            (me.fireEvent('beforecell' + type, me, cell, cellIndex, record, row, rowIndex, e) === false) ||
            (me['onCell' + map[type]](cell, cellIndex, record, row, rowIndex, e) === false) ||
            (me.fireEvent('cell' + type, me, cell, cellIndex, record, row, rowIndex, e) === false)
        );
    },

    processSpecialEvent: function(e) {
        var me = this,
            map = me.statics().EventMap,
            features = me.features,
            ln = features.length,
            type = e.type,
            i, feature, prefix, featureTarget,
            beforeArgs, args,
            panel = me.ownerCt;

        me.callParent(arguments);

        if (type == 'mouseover' || type == 'mouseout') {
            return;
        }

        for (i = 0; i < ln; i++) {
            feature = features[i];
            if (feature.hasFeatureEvent) {
                featureTarget = e.getTarget(feature.eventSelector, me.getTargetEl());
                if (featureTarget) {
                    prefix = feature.eventPrefix;
                    // allows features to implement getFireEventArgs to change the
                    // fireEvent signature
                    beforeArgs = feature.getFireEventArgs('before' + prefix + type, me, featureTarget, e);
                    args = feature.getFireEventArgs(prefix + type, me, featureTarget, e);

                    if (
                        // before view event
                        (me.fireEvent.apply(me, beforeArgs) === false) ||
                        // panel grid event
                        (panel.fireEvent.apply(panel, beforeArgs) === false) ||
                        // view event
                        (me.fireEvent.apply(me, args) === false) ||
                        // panel event
                        (panel.fireEvent.apply(panel, args) === false)
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    onCellMouseDown: Ext.emptyFn,
    onCellMouseUp: Ext.emptyFn,
    onCellClick: Ext.emptyFn,
    onCellDblClick: Ext.emptyFn,
    onCellContextMenu: Ext.emptyFn,
    onCellKeyDown: Ext.emptyFn,
    onBeforeCellMouseDown: Ext.emptyFn,
    onBeforeCellMouseUp: Ext.emptyFn,
    onBeforeCellClick: Ext.emptyFn,
    onBeforeCellDblClick: Ext.emptyFn,
    onBeforeCellContextMenu: Ext.emptyFn,
    onBeforeCellKeyDown: Ext.emptyFn,

    /**
     * Expands a particular header to fit the max content width.
     * This will ONLY expand, not contract.
     * @private
     */
    expandToFit: function(header) {
        if (header) {
            var maxWidth = this.getMaxContentWidth(header);
            delete header.flex;
            header.setWidth(maxWidth);
        }
    },

    /**
     * Returns the max contentWidth of the header's text and all cells
     * in the grid under this header.
     * @private
     */
    getMaxContentWidth: function(header) {
        var cellSelector = header.getCellInnerSelector(),
            cells        = this.el.query(cellSelector),
            i = 0,
            ln = cells.length,
            maxWidth = header.el.dom.scrollWidth,
            scrollWidth;

        for (; i < ln; i++) {
            scrollWidth = cells[i].scrollWidth;
            if (scrollWidth > maxWidth) {
                maxWidth = scrollWidth;
            }
        }
        return maxWidth;
    },

    getPositionByEvent: function(e) {
        var me       = this,
            cellNode = e.getTarget(me.cellSelector),
            rowNode  = e.getTarget(me.itemSelector),
            record   = me.getRecord(rowNode),
            header   = me.getHeaderByCell(cellNode);

        return me.getPosition(record, header);
    },

    getHeaderByCell: function(cell) {
        if (cell) {
            var m = cell.className.match(this.cellRe);
            if (m && m[1]) {
                return Ext.getCmp(m[1]);
            }
        }
        return false;
    },

    /**
     * @param {Object} position The current row and column: an object containing the following properties:
     *
     * - row - The row index
     * - column - The column index
     *
     * @param {String} direction 'up', 'down', 'right' and 'left'
     * @param {Ext.EventObject} e event
     * @param {Boolean} preventWrap Set to true to prevent wrap around to the next or previous row.
     * @param {Function} verifierFn A function to verify the validity of the calculated position.
     * When using this function, you must return true to allow the newPosition to be returned.
     * @param {Object} scope Scope to run the verifierFn in
     * @returns {Object} newPosition An object containing the following properties:
     *
     * - row - The row index
     * - column - The column index
     *
     * @private
     */
    walkCells: function(pos, direction, e, preventWrap, verifierFn, scope) {
        var me       = this,
            row      = pos.row,
            column   = pos.column,
            rowCount = me.store.getCount(),
            firstCol = me.getFirstVisibleColumnIndex(),
            lastCol  = me.getLastVisibleColumnIndex(),
            newPos   = {row: row, column: column},
            activeHeader = me.headerCt.getHeaderAtIndex(column);

        // no active header or its currently hidden
        if (!activeHeader || activeHeader.hidden) {
            return false;
        }

        e = e || {};
        direction = direction.toLowerCase();
        switch (direction) {
            case 'right':
                // has the potential to wrap if its last
                if (column === lastCol) {
                    // if bottom row and last column, deny right
                    if (preventWrap || row === rowCount - 1) {
                        return false;
                    }
                    if (!e.ctrlKey) {
                        // otherwise wrap to nextRow and firstCol
                        newPos.row = row + 1;
                        newPos.column = firstCol;
                    }
                // go right
                } else {
                    if (!e.ctrlKey) {
                        newPos.column = column + me.getRightGap(activeHeader);
                    } else {
                        newPos.column = lastCol;
                    }
                }
                break;

            case 'left':
                // has the potential to wrap
                if (column === firstCol) {
                    // if top row and first column, deny left
                    if (preventWrap || row === 0) {
                        return false;
                    }
                    if (!e.ctrlKey) {
                        // otherwise wrap to prevRow and lastCol
                        newPos.row = row - 1;
                        newPos.column = lastCol;
                    }
                // go left
                } else {
                    if (!e.ctrlKey) {
                        newPos.column = column + me.getLeftGap(activeHeader);
                    } else {
                        newPos.column = firstCol;
                    }
                }
                break;

            case 'up':
                // if top row, deny up
                if (row === 0) {
                    return false;
                // go up
                } else {
                    if (!e.ctrlKey) {
                        newPos.row = row - 1;
                    } else {
                        newPos.row = 0;
                    }
                }
                break;

            case 'down':
                // if bottom row, deny down
                if (row === rowCount - 1) {
                    return false;
                // go down
                } else {
                    if (!e.ctrlKey) {
                        newPos.row = row + 1;
                    } else {
                        newPos.row = rowCount - 1;
                    }
                }
                break;
        }

        if (verifierFn && verifierFn.call(scope || window, newPos) !== true) {
            return false;
        } else {
            return newPos;
        }
    },
    getFirstVisibleColumnIndex: function() {
        var headerCt   = this.getHeaderCt(),
            allColumns = headerCt.getGridColumns(),
            visHeaders = Ext.ComponentQuery.query(':not([hidden])', allColumns),
            firstHeader = visHeaders[0];

        return headerCt.getHeaderIndex(firstHeader);
    },

    getLastVisibleColumnIndex: function() {
        var headerCt   = this.getHeaderCt(),
            allColumns = headerCt.getGridColumns(),
            visHeaders = Ext.ComponentQuery.query(':not([hidden])', allColumns),
            lastHeader = visHeaders[visHeaders.length - 1];

        return headerCt.getHeaderIndex(lastHeader);
    },

    getHeaderCt: function() {
        return this.headerCt;
    },

    getPosition: function(record, header) {
        var me = this,
            store = me.store,
            gridCols = me.headerCt.getGridColumns();

        return {
            row: store.indexOf(record),
            column: Ext.Array.indexOf(gridCols, header)
        };
    },

    /**
     * Determines the 'gap' between the closest adjacent header to the right
     * that is not hidden.
     * @private
     */
    getRightGap: function(activeHeader) {
        var headerCt        = this.getHeaderCt(),
            headers         = headerCt.getGridColumns(),
            activeHeaderIdx = Ext.Array.indexOf(headers, activeHeader),
            i               = activeHeaderIdx + 1,
            nextIdx;

        for (; i <= headers.length; i++) {
            if (!headers[i].hidden) {
                nextIdx = i;
                break;
            }
        }

        return nextIdx - activeHeaderIdx;
    },

    beforeDestroy: function() {
        if (this.rendered) {
            this.el.removeAllListeners();
        }
        this.callParent(arguments);
    },

    /**
     * Determines the 'gap' between the closest adjacent header to the left
     * that is not hidden.
     * @private
     */
    getLeftGap: function(activeHeader) {
        var headerCt        = this.getHeaderCt(),
            headers         = headerCt.getGridColumns(),
            activeHeaderIdx = Ext.Array.indexOf(headers, activeHeader),
            i               = activeHeaderIdx - 1,
            prevIdx;

        for (; i >= 0; i--) {
            if (!headers[i].hidden) {
                prevIdx = i;
                break;
            }
        }

        return prevIdx - activeHeaderIdx;
    }
});
