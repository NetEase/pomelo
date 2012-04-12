/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.selection.CheckboxModel
 * @extends Ext.selection.RowModel
 *
 * A selection model that renders a column of checkboxes that can be toggled to
 * select or deselect rows. The default mode for this selection model is MULTI.
 *
 * The selection model will inject a header for the checkboxes in the first view
 * and according to the 'injectCheckbox' configuration.
 */
Ext.define('Ext.selection.CheckboxModel', {
    alias: 'selection.checkboxmodel',
    extend: 'Ext.selection.RowModel',

    /**
     * @cfg {String} mode
     * Modes of selection.
     * Valid values are SINGLE, SIMPLE, and MULTI. Defaults to 'MULTI'
     */
    mode: 'MULTI',

    /**
     * @cfg {Number/Boolean/String} injectCheckbox
     * Instructs the SelectionModel whether or not to inject the checkbox header
     * automatically or not. (Note: By not placing the checkbox in manually, the
     * grid view will need to be rendered 2x on initial render.)
     * Supported values are a Number index, false and the strings 'first' and 'last'.
     */
    injectCheckbox: 0,

    /**
     * @cfg {Boolean} checkOnly <tt>true</tt> if rows can only be selected by clicking on the
     * checkbox column.
     */
    checkOnly: false,

    headerWidth: 24,

    // private
    checkerOnCls: Ext.baseCSSPrefix + 'grid-hd-checker-on',

    bindComponent: function(view) {
        var me = this;

        me.sortable = false;
        me.callParent(arguments);
        if (!me.hasLockedHeader() || view.headerCt.lockedCt) {
            // if we have a locked header, only hook up to the first
            view.headerCt.on('headerclick', me.onHeaderClick, me);
            me.addCheckbox(true);
            me.mon(view.ownerCt, 'reconfigure', me.addCheckbox, me);
        }
    },

    hasLockedHeader: function(){
        var hasLocked = false;
        Ext.each(this.views, function(view){
            if (view.headerCt.lockedCt) {
                hasLocked = true;
                return false;
            }
        });
        return hasLocked;
    },

    /**
     * Add the header checkbox to the header row
     * @private
     * @param {Boolean} initial True if we're binding for the first time.
     */
    addCheckbox: function(initial){
        var me = this,
            checkbox = me.injectCheckbox,
            view = me.views[0],
            headerCt = view.headerCt;

        if (checkbox !== false) {
            if (checkbox == 'first') {
                checkbox = 0;
            } else if (checkbox == 'last') {
                checkbox = headerCt.getColumnCount();
            }
            headerCt.add(checkbox,  me.getHeaderConfig());
        }

        if (initial !== true) {
            view.refresh();
        }
    },

    /**
     * Toggle the ui header between checked and unchecked state.
     * @param {Boolean} isChecked
     * @private
     */
    toggleUiHeader: function(isChecked) {
        var view     = this.views[0],
            headerCt = view.headerCt,
            checkHd  = headerCt.child('gridcolumn[isCheckerHd]');

        if (checkHd) {
            if (isChecked) {
                checkHd.el.addCls(this.checkerOnCls);
            } else {
                checkHd.el.removeCls(this.checkerOnCls);
            }
        }
    },

    /**
     * Toggle between selecting all and deselecting all when clicking on
     * a checkbox header.
     */
    onHeaderClick: function(headerCt, header, e) {
        if (header.isCheckerHd) {
            e.stopEvent();
            var isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
            if (isChecked) {
                // We have to supress the event or it will scrollTo the change
                this.deselectAll(true);
            } else {
                // We have to supress the event or it will scrollTo the change
                this.selectAll(true);
            }
        }
    },

    /**
     * Retrieve a configuration to be used in a HeaderContainer.
     * This should be used when injectCheckbox is set to false.
     */
    getHeaderConfig: function() {
        var me = this;

        return {
            isCheckerHd: true,
            text : '&#160;',
            width: me.headerWidth,
            sortable: false,
            draggable: false,
            resizable: false,
            hideable: false,
            menuDisabled: true,
            dataIndex: '',
            cls: Ext.baseCSSPrefix + 'column-header-checkbox ',
            renderer: Ext.Function.bind(me.renderer, me),
            locked: me.hasLockedHeader()
        };
    },

    /**
     * Generates the HTML to be rendered in the injected checkbox column for each row.
     * Creates the standard checkbox markup by default; can be overridden to provide custom rendering.
     * See {@link Ext.grid.column.Column#renderer} for description of allowed parameters.
     */
    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
        metaData.tdCls = Ext.baseCSSPrefix + 'grid-cell-special';
        return '<div class="' + Ext.baseCSSPrefix + 'grid-row-checker">&#160;</div>';
    },

    // override
    onRowMouseDown: function(view, record, item, index, e) {
        view.el.focus();
        var me = this,
            checker = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-checker');
            
        if (!me.allowRightMouseSelection(e)) {
            return;
        }

        // checkOnly set, but we didn't click on a checker.
        if (me.checkOnly && !checker) {
            return;
        }

        if (checker) {
            var mode = me.getSelectionMode();
            // dont change the mode if its single otherwise
            // we would get multiple selection
            if (mode !== 'SINGLE') {
                me.setSelectionMode('SIMPLE');
            }
            me.selectWithEvent(record, e);
            me.setSelectionMode(mode);
        } else {
            me.selectWithEvent(record, e);
        }
    },

    /**
     * Synchronize header checker value as selection changes.
     * @private
     */
    onSelectChange: function() {
        this.callParent(arguments);

        // check to see if all records are selected
        var hdSelectStatus = this.selected.getCount() === this.store.getCount();
        this.toggleUiHeader(hdSelectStatus);
    }
});

