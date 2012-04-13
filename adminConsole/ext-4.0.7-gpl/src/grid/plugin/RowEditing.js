/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * The Ext.grid.plugin.RowEditing plugin injects editing at a row level for a Grid. When editing begins,
 * a small floating dialog will be shown for the appropriate row. Each editable column will show a field
 * for editing. There is a button to save or cancel all changes for the edit.
 *
 * The field that will be used for the editor is defined at the
 * {@link Ext.grid.column.Column#editor editor}. The editor can be a field instance or a field configuration.
 * If an editor is not specified for a particular column then that column won't be editable and the value of
 * the column will be displayed.
 *
 * The editor may be shared for each column in the grid, or a different one may be specified for each column.
 * An appropriate field type should be chosen to match the data structure that it will be editing. For example,
 * to edit a date, it would be useful to specify {@link Ext.form.field.Date} as the editor.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'simpsonsStore',
 *         fields:['name', 'email', 'phone'],
 *         data: [
 *             {"name":"Lisa", "email":"lisa@simpsons.com", "phone":"555-111-1224"},
 *             {"name":"Bart", "email":"bart@simpsons.com", "phone":"555--222-1234"},
 *             {"name":"Homer", "email":"home@simpsons.com", "phone":"555-222-1244"},
 *             {"name":"Marge", "email":"marge@simpsons.com", "phone":"555-222-1254"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Simpsons',
 *         store: Ext.data.StoreManager.lookup('simpsonsStore'),
 *         columns: [
 *             {header: 'Name',  dataIndex: 'name', editor: 'textfield'},
 *             {header: 'Email', dataIndex: 'email', flex:1,
 *                 editor: {
 *                     xtype: 'textfield',
 *                     allowBlank: false
 *                 }
 *             },
 *             {header: 'Phone', dataIndex: 'phone'}
 *         ],
 *         selType: 'rowmodel',
 *         plugins: [
 *             Ext.create('Ext.grid.plugin.RowEditing', {
 *                 clicksToEdit: 1
 *             })
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.grid.plugin.RowEditing', {
    extend: 'Ext.grid.plugin.Editing',
    alias: 'plugin.rowediting',

    requires: [
        'Ext.grid.RowEditor'
    ],

    editStyle: 'row',

    /**
     * @cfg {Boolean} autoCancel
     * True to automatically cancel any pending changes when the row editor begins editing a new row.
     * False to force the user to explicitly cancel the pending changes. Defaults to true.
     */
    autoCancel: true,

    /**
     * @cfg {Number} clicksToMoveEditor
     * The number of clicks to move the row editor to a new row while it is visible and actively editing another row.
     * This will default to the same value as {@link Ext.grid.plugin.Editing#clicksToEdit clicksToEdit}.
     */

    /**
     * @cfg {Boolean} errorSummary
     * True to show a {@link Ext.tip.ToolTip tooltip} that summarizes all validation errors present
     * in the row editor. Set to false to prevent the tooltip from showing. Defaults to true.
     */
    errorSummary: true,

    /**
     * @event beforeedit
     * Fires before row editing is triggered.
     *
     * @param {Ext.grid.plugin.Editing} editor
     * @param {Object} e An edit event with the following properties:
     *
     * - grid - The grid this editor is on
     * - view - The grid view
     * - store - The grid store
     * - record - The record being edited
     * - row - The grid table row
     * - column - The grid {@link Ext.grid.column.Column Column} defining the column that initiated the edit
     * - rowIdx - The row index that is being edited
     * - colIdx - The column index that initiated the edit
     * - cancel - Set this to true to cancel the edit or return false from your handler.
     */
    
    /**
     * @event canceledit
     * Fires when the user has started editing a row but then cancelled the edit
     * @param {Object} grid The grid
     */
    
    /**
     * @event edit
     * Fires after a row is edited. Usage example:
     *
     *     grid.on('edit', function(editor, e) {
     *         // commit the changes right after editing finished
     *         e.record.commit();
     *     };
     *
     * @param {Ext.grid.plugin.Editing} editor
     * @param {Object} e An edit event with the following properties:
     *
     * - grid - The grid this editor is on
     * - view - The grid view
     * - store - The grid store
     * - record - The record being edited
     * - row - The grid table row
     * - column - The grid {@link Ext.grid.column.Column Column} defining the column that initiated the edit
     * - rowIdx - The row index that is being edited
     * - colIdx - The column index that initiated the edit
     */
    /**
     * @event validateedit
     * Fires after a cell is edited, but before the value is set in the record. Return false to cancel the change. The
     * edit event object has the following properties
     *
     * Usage example showing how to remove the red triangle (dirty record indicator) from some records (not all). By
     * observing the grid's validateedit event, it can be cancelled if the edit occurs on a targeted row (for example)
     * and then setting the field's new value in the Record directly:
     *
     *     grid.on('validateedit', function(editor, e) {
     *       var myTargetRow = 6;
     *
     *       if (e.rowIdx == myTargetRow) {
     *         e.cancel = true;
     *         e.record.data[e.field] = e.value;
     *       }
     *     });
     *
     * @param {Ext.grid.plugin.Editing} editor
     * @param {Object} e An edit event with the following properties:
     *
     * - grid - The grid this editor is on
     * - view - The grid view
     * - store - The grid store
     * - record - The record being edited
     * - row - The grid table row
     * - column - The grid {@link Ext.grid.column.Column Column} defining the column that initiated the edit
     * - rowIdx - The row index that is being edited
     * - colIdx - The column index that initiated the edit
     * - cancel - Set this to true to cancel the edit or return false from your handler.
     */

    constructor: function() {
        var me = this;
        me.callParent(arguments);

        if (!me.clicksToMoveEditor) {
            me.clicksToMoveEditor = me.clicksToEdit;
        }

        me.autoCancel = !!me.autoCancel;
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        var me = this;
        Ext.destroy(me.editor);
        me.callParent(arguments);
    },

    /**
     * Starts editing the specified record, using the specified Column definition to define which field is being edited.
     * @param {Ext.data.Model} record The Store data record which backs the row to be edited.
     * @param {Ext.data.Model} columnHeader The Column object defining the column to be edited. @override
     */
    startEdit: function(record, columnHeader) {
        var me = this,
            editor = me.getEditor();

        if (me.callParent(arguments) === false) {
            return false;
        }

        // Fire off our editor
        if (editor.beforeEdit() !== false) {
            editor.startEdit(me.context.record, me.context.column);
        }
    },

    // private
    cancelEdit: function() {
        var me = this;

        if (me.editing) {
            me.getEditor().cancelEdit();
            me.callParent(arguments);
            
            me.fireEvent('canceledit', me.context);
        }
    },

    // private
    completeEdit: function() {
        var me = this;

        if (me.editing && me.validateEdit()) {
            me.editing = false;
            me.fireEvent('edit', me.context);
        }
    },

    // private
    validateEdit: function() {
        var me             = this,
            editor         = me.editor,
            context        = me.context,
            record         = context.record,
            newValues      = {},
            originalValues = {},
            name;

        editor.items.each(function(item) {
            name = item.name;

            newValues[name]      = item.getValue();
            originalValues[name] = record.get(name);
        });

        Ext.apply(context, {
            newValues      : newValues,
            originalValues : originalValues
        });

        return me.callParent(arguments) && me.getEditor().completeEdit();
    },

    // private
    getEditor: function() {
        var me = this;

        if (!me.editor) {
            me.editor = me.initEditor();
        }
        return me.editor;
    },

    // private
    initEditor: function() {
        var me = this,
            grid = me.grid,
            view = me.view,
            headerCt = grid.headerCt;

        return Ext.create('Ext.grid.RowEditor', {
            autoCancel: me.autoCancel,
            errorSummary: me.errorSummary,
            fields: headerCt.getGridColumns(),
            hidden: true,

            // keep a reference..
            editingPlugin: me,
            renderTo: view.el
        });
    },

    // private
    initEditTriggers: function() {
        var me = this,
            grid = me.grid,
            view = me.view,
            headerCt = grid.headerCt,
            moveEditorEvent = me.clicksToMoveEditor === 1 ? 'click' : 'dblclick';

        me.callParent(arguments);

        if (me.clicksToMoveEditor !== me.clicksToEdit) {
            me.mon(view, 'cell' + moveEditorEvent, me.moveEditorByClick, me);
        }

        view.on('render', function() {
            // Column events
            me.mon(headerCt, {
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                columnresize: me.onColumnResize,
                columnhide: me.onColumnHide,
                columnshow: me.onColumnShow,
                columnmove: me.onColumnMove,
                scope: me
            });
        }, me, { single: true });
    },

    startEditByClick: function() {
        var me = this;
        if (!me.editing || me.clicksToMoveEditor === me.clicksToEdit) {
            me.callParent(arguments);
        }
    },

    moveEditorByClick: function() {
        var me = this;
        if (me.editing) {
            me.superclass.startEditByClick.apply(me, arguments);
        }
    },

    // private
    onColumnAdd: function(ct, column) {
        if (column.isHeader) {
            var me = this,
                editor;

            me.initFieldAccessors(column);
            editor = me.getEditor();

            if (editor && editor.onColumnAdd) {
                editor.onColumnAdd(column);
            }
        }
    },

    // private
    onColumnRemove: function(ct, column) {
        if (column.isHeader) {
            var me = this,
                editor = me.getEditor();

            if (editor && editor.onColumnRemove) {
                editor.onColumnRemove(column);
            }
            me.removeFieldAccessors(column);
        }
    },

    // private
    onColumnResize: function(ct, column, width) {
        if (column.isHeader) {
            var me = this,
                editor = me.getEditor();

            if (editor && editor.onColumnResize) {
                editor.onColumnResize(column, width);
            }
        }
    },

    // private
    onColumnHide: function(ct, column) {
        // no isHeader check here since its already a columnhide event.
        var me = this,
            editor = me.getEditor();

        if (editor && editor.onColumnHide) {
            editor.onColumnHide(column);
        }
    },

    // private
    onColumnShow: function(ct, column) {
        // no isHeader check here since its already a columnshow event.
        var me = this,
            editor = me.getEditor();

        if (editor && editor.onColumnShow) {
            editor.onColumnShow(column);
        }
    },

    // private
    onColumnMove: function(ct, column, fromIdx, toIdx) {
        // no isHeader check here since its already a columnmove event.
        var me = this,
            editor = me.getEditor();

        if (editor && editor.onColumnMove) {
            editor.onColumnMove(column, fromIdx, toIdx);
        }
    },

    // private
    setColumnField: function(column, field) {
        var me = this;
        me.callParent(arguments);
        me.getEditor().setField(column.field, column);
    }
});

