/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This class provides an abstract grid editing plugin on selected {@link Ext.grid.column.Column columns}.
 * The editable columns are specified by providing an {@link Ext.grid.column.Column#editor editor}
 * in the {@link Ext.grid.column.Column column configuration}.
 *
 * **Note:** This class should not be used directly. See {@link Ext.grid.plugin.CellEditing} and
 * {@link Ext.grid.plugin.RowEditing}.
 */
Ext.define('Ext.grid.plugin.Editing', {
    alias: 'editing.editing',

    requires: [
        'Ext.grid.column.Column',
        'Ext.util.KeyNav'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {Number} clicksToEdit
     * The number of clicks on a grid required to display the editor.
     */
    clicksToEdit: 2,

    // private
    defaultFieldXType: 'textfield',

    // cell, row, form
    editStyle: '',

    constructor: function(config) {
        var me = this;
        Ext.apply(me, config);

        me.addEvents(
            // Doc'ed in separate editing plugins
            'beforeedit',

            // Doc'ed in separate editing plugins
            'edit',

            // Doc'ed in separate editing plugins
            'validateedit'
        );
        me.mixins.observable.constructor.call(me);
        // TODO: Deprecated, remove in 5.0
        me.relayEvents(me, ['afteredit'], 'after');
    },

    // private
    init: function(grid) {
        var me = this;

        me.grid = grid;
        me.view = grid.view;
        me.initEvents();
        me.mon(grid, 'reconfigure', me.onReconfigure, me);
        me.onReconfigure();

        grid.relayEvents(me, ['beforeedit', 'edit', 'validateedit']);
        // Marks the grid as editable, so that the SelectionModel
        // can make appropriate decisions during navigation
        grid.isEditable = true;
        grid.editingPlugin = grid.view.editingPlugin = me;
    },

    /**
     * Fires after the grid is reconfigured
     * @private
     */
    onReconfigure: function(){
        this.initFieldAccessors(this.view.getGridColumns());
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        var me = this,
            grid = me.grid,
            headerCt = grid.headerCt,
            events = grid.events;

        Ext.destroy(me.keyNav);
        me.removeFieldAccessors(grid.getView().getGridColumns());

        // Clear all listeners from all our events, clear all managed listeners we added to other Observables
        me.clearListeners();

        delete me.grid.editingPlugin;
        delete me.grid.view.editingPlugin;
        delete me.grid;
        delete me.view;
        delete me.editor;
        delete me.keyNav;
    },

    // private
    getEditStyle: function() {
        return this.editStyle;
    },

    // private
    initFieldAccessors: function(column) {
        var me = this;

        if (Ext.isArray(column)) {
            Ext.Array.forEach(column, me.initFieldAccessors, me);
            return;
        }

        // Augment the Header class to have a getEditor and setEditor method
        // Important: Only if the header does not have its own implementation.
        Ext.applyIf(column, {
            getEditor: function(record, defaultField) {
                return me.getColumnField(this, defaultField);
            },

            setEditor: function(field) {
                me.setColumnField(this, field);
            }
        });
    },

    // private
    removeFieldAccessors: function(column) {
        var me = this;

        if (Ext.isArray(column)) {
            Ext.Array.forEach(column, me.removeFieldAccessors, me);
            return;
        }

        delete column.getEditor;
        delete column.setEditor;
    },

    // private
    // remaps to the public API of Ext.grid.column.Column.getEditor
    getColumnField: function(columnHeader, defaultField) {
        var field = columnHeader.field;

        if (!field && columnHeader.editor) {
            field = columnHeader.editor;
            delete columnHeader.editor;
        }

        if (!field && defaultField) {
            field = defaultField;
        }

        if (field) {
            if (Ext.isString(field)) {
                field = { xtype: field };
            }
            if (Ext.isObject(field) && !field.isFormField) {
                field = Ext.ComponentManager.create(field, this.defaultFieldXType);
                columnHeader.field = field;
            }

            Ext.apply(field, {
                name: columnHeader.dataIndex
            });

            return field;
        }
    },

    // private
    // remaps to the public API of Ext.grid.column.Column.setEditor
    setColumnField: function(column, field) {
        if (Ext.isObject(field) && !field.isFormField) {
            field = Ext.ComponentManager.create(field, this.defaultFieldXType);
        }
        column.field = field;
    },

    // private
    initEvents: function() {
        var me = this;
        me.initEditTriggers();
        me.initCancelTriggers();
    },

    // @abstract
    initCancelTriggers: Ext.emptyFn,

    // private
    initEditTriggers: function() {
        var me = this,
            view = me.view,
            clickEvent = me.clicksToEdit === 1 ? 'click' : 'dblclick';

        // Start editing
        me.mon(view, 'cell' + clickEvent, me.startEditByClick, me);
        view.on('render', function() {
            me.keyNav = Ext.create('Ext.util.KeyNav', view.el, {
                enter: me.onEnterKey,
                esc: me.onEscKey,
                scope: me
            });
        }, me, { single: true });
    },

    // private
    onEnterKey: function(e) {
        var me = this,
            grid = me.grid,
            selModel = grid.getSelectionModel(),
            record,
            columnHeader = grid.headerCt.getHeaderAtIndex(0);

        // Calculate editing start position from SelectionModel
        // CellSelectionModel
        if (selModel.getCurrentPosition) {
            pos = selModel.getCurrentPosition();
            record = grid.store.getAt(pos.row);
            columnHeader = grid.headerCt.getHeaderAtIndex(pos.column);
        }
        // RowSelectionModel
        else {
            record = selModel.getLastSelected();
        }
        me.startEdit(record, columnHeader);
    },

    // private
    onEscKey: function(e) {
        this.cancelEdit();
    },

    // private
    startEditByClick: function(view, cell, colIdx, record, row, rowIdx, e) {
        this.startEdit(record, view.getHeaderAtIndex(colIdx));
    },

    /**
     * @private
     * @template
     * Template method called before editing begins.
     * @param {Object} context The current editing context
     * @return {Boolean} Return false to cancel the editing process
     */
    beforeEdit: Ext.emptyFn,

    /**
     * Starts editing the specified record, using the specified Column definition to define which field is being edited.
     * @param {Ext.data.Model/Number} record The Store data record which backs the row to be edited, or index of the record in Store.
     * @param {Ext.grid.column.Column/Number} columnHeader The Column object defining the column to be edited, or index of the column.
     */
    startEdit: function(record, columnHeader) {
        var me = this,
            context = me.getEditingContext(record, columnHeader);

        if (me.beforeEdit(context) === false || me.fireEvent('beforeedit', context) === false || context.cancel) {
            return false;
        }

        me.context = context;
        me.editing = true;
    },

    /**
     * @private
     * Collects all information necessary for any subclasses to perform their editing functions.
     * @param record
     * @param columnHeader
     * @returns {Object} The editing context based upon the passed record and column
     */
    getEditingContext: function(record, columnHeader) {
        var me = this,
            grid = me.grid,
            store = grid.store,
            rowIdx,
            colIdx,
            view = grid.getView(),
            value;

        // If they'd passed numeric row, column indices, look them up.
        if (Ext.isNumber(record)) {
            rowIdx = record;
            record = store.getAt(rowIdx);
        } else {
            rowIdx = store.indexOf(record);
        }
        if (Ext.isNumber(columnHeader)) {
            colIdx = columnHeader;
            columnHeader = grid.headerCt.getHeaderAtIndex(colIdx);
        } else {
            colIdx = columnHeader.getIndex();
        }

        value = record.get(columnHeader.dataIndex);
        return {
            grid: grid,
            record: record,
            field: columnHeader.dataIndex,
            value: value,
            row: view.getNode(rowIdx),
            column: columnHeader,
            rowIdx: rowIdx,
            colIdx: colIdx
        };
    },

    /**
     * Cancels any active edit that is in progress.
     */
    cancelEdit: function() {
        this.editing = false;
    },

    /**
     * Completes the edit if there is an active edit in progress.
     */
    completeEdit: function() {
        var me = this;

        if (me.editing && me.validateEdit()) {
            me.fireEvent('edit', me.context);
        }

        delete me.context;
        me.editing = false;
    },

    // @abstract
    validateEdit: function() {
        var me = this,
            context = me.context;

        return me.fireEvent('validateedit', me, context) !== false && !context.cancel;
    }
});

