/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A Grid header type which renders an icon, or a series of icons in a grid cell, and offers a scoped click
 * handler for each icon.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'senority', 'dep', 'hired'],
 *         data:[
 *             {firstname:"Michael", lastname:"Scott"},
 *             {firstname:"Dwight", lastname:"Schrute"},
 *             {firstname:"Jim", lastname:"Halpert"},
 *             {firstname:"Kevin", lastname:"Malone"},
 *             {firstname:"Angela", lastname:"Martin"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Action Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {
 *                 xtype:'actioncolumn',
 *                 width:50,
 *                 items: [{
 *                     icon: 'extjs/examples/shared/icons/fam/cog_edit.png',  // Use a URL in the icon config
 *                     tooltip: 'Edit',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Edit " + rec.get('firstname'));
 *                     }
 *                 },{
 *                     icon: 'extjs/examples/restful/images/delete.png',
 *                     tooltip: 'Delete',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Terminate " + rec.get('firstname'));
 *                     }
 *                 }]
 *             }
 *         ],
 *         width: 250,
 *         renderTo: Ext.getBody()
 *     });
 *
 * The action column can be at any index in the columns array, and a grid can have any number of
 * action columns.
 */
Ext.define('Ext.grid.column.Action', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.actioncolumn'],
    alternateClassName: 'Ext.grid.ActionColumn',

    /**
     * @cfg {String} icon
     * The URL of an image to display as the clickable element in the column. Defaults to
     * `{@link Ext#BLANK_IMAGE_URL Ext.BLANK_IMAGE_URL}`.
     */
    /**
     * @cfg {String} iconCls
     * A CSS class to apply to the icon image. To determine the class dynamically, configure the Column with
     * a `{@link #getClass}` function.
     */
    /**
     * @cfg {Function} handler
     * A function called when the icon is clicked.
     * @cfg {Ext.view.Table} handler.view The owning TableView.
     * @cfg {Number} handler.rowIndex The row index clicked on.
     * @cfg {Number} handler.colIndex The column index clicked on.
     * @cfg {Object} handler.item The clicked item (or this Column if multiple {@link #items} were not configured).
     * @cfg {Event} handler.e The click event.
     */
    /**
     * @cfg {Object} scope
     * The scope (**this** reference) in which the `{@link #handler}` and `{@link #getClass}` fuctions are executed.
     * Defaults to this Column.
     */
    /**
     * @cfg {String} tooltip
     * A tooltip message to be displayed on hover. {@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager} must
     * have been initialized.
     */
    /* @cfg {Boolean} disabled
     * If true, the action will not respond to click events, and will be displayed semi-opaque.
     */
    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid _row_ selection upon mousedown.
     */
    /**
     * @cfg {Function} getClass
     * A function which returns the CSS class to apply to the icon image.
     *
     * @cfg {Object} getClass.v The value of the column's configured field (if any).
     *
     * @cfg {Object} getClass.metadata An object in which you may set the following attributes:
     * @cfg {String} getClass.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} getClass.metadata.attr An HTML attribute definition string to apply to the data container
     * element *within* the table cell (e.g. 'style="color:red;"').
     *
     * @cfg {Ext.data.Model} getClass.r The Record providing the data.
     *
     * @cfg {Number} getClass.rowIndex The row index..
     *
     * @cfg {Number} getClass.colIndex The column index.
     *
     * @cfg {Ext.data.Store} getClass.store The Store which is providing the data Model.
     */
    /**
     * @cfg {Object[]} items
     * An Array which may contain multiple icon definitions, each element of which may contain:
     *
     * @cfg {String} items.icon The url of an image to display as the clickable element in the column.
     *
     * @cfg {String} items.iconCls A CSS class to apply to the icon image. To determine the class dynamically,
     * configure the item with a `getClass` function.
     *
     * @cfg {Function} items.getClass A function which returns the CSS class to apply to the icon image.
     * @cfg {Object} items.getClass.v The value of the column's configured field (if any).
     * @cfg {Object} items.getClass.metadata An object in which you may set the following attributes:
     * @cfg {String} items.getClass.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} items.getClass.metadata.attr An HTML attribute definition string to apply to the data
     * container element _within_ the table cell (e.g. 'style="color:red;"').
     * @cfg {Ext.data.Model} items.getClass.r The Record providing the data.
     * @cfg {Number} items.getClass.rowIndex The row index..
     * @cfg {Number} items.getClass.colIndex The column index.
     * @cfg {Ext.data.Store} items.getClass.store The Store which is providing the data Model.
     *
     * @cfg {Function} items.handler A function called when the icon is clicked.
     *
     * @cfg {Object} items.scope The scope (`this` reference) in which the `handler` and `getClass` functions
     * are executed. Fallback defaults are this Column's configured scope, then this Column.
     *
     * @cfg {String} items.tooltip A tooltip message to be displayed on hover.
     * @cfg {Boolean} items.disabled If true, the action will not respond to click events, and will be displayed semi-opaque.
     * {@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager} must have been initialized.
     */
    /**
     * @property {Array} items
     * An array of action items copied from the configured {@link #cfg-items items} configuration. Each will have
     * an `enable` and `disable` method added which will enable and disable the associated action, and
     * update the displayed icon accordingly.
     */
    header: '&#160;',

    actionIdRe: new RegExp(Ext.baseCSSPrefix + 'action-col-(\\d+)'),

    /**
     * @cfg {String} altText
     * The alt text to use for the image element.
     */
    altText: '',

    sortable: false,

    constructor: function(config) {
        var me = this,
            cfg = Ext.apply({}, config),
            items = cfg.items || [me],
            l = items.length,
            i,
            item;

        // This is a Container. Delete the items config to be reinstated after construction.
        delete cfg.items;
        me.callParent([cfg]);

        // Items is an array property of ActionColumns
        me.items = items;

//      Renderer closure iterates through items creating an <img> element for each and tagging with an identifying
//      class name x-action-col-{n}
        me.renderer = function(v, meta) {
//          Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||'' : '';

            meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
            for (i = 0; i < l; i++) {
                item = items[i];
                item.disable = Ext.Function.bind(me.disableAction, me, [i]);
                item.enable = Ext.Function.bind(me.enableAction, me, [i]);
                v += '<img alt="' + (item.altText || me.altText) + '" src="' + (item.icon || Ext.BLANK_IMAGE_URL) +
                    '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') +
                    ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope||me.scope||me, arguments) : (me.iconCls || '')) + '"' +
                    ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' />';
            }
            return v;
        };
    },

    /**
     * Enables this ActionColumn's action at the specified index.
     */
    enableAction: function(index) {
        var me = this;

        if (!index) {
            index = 0;
        } else if (!Ext.isNumber(index)) {
            index = Ext.Array.indexOf(me.items, index);
        }
        me.items[index].disabled = false;
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).removeCls(me.disabledCls);
    },

    /**
     * Disables this ActionColumn's action at the specified index.
     */
    disableAction: function(index) {
        var me = this;

        if (!index) {
            index = 0;
        } else if (!Ext.isNumber(index)) {
            index = Ext.Array.indexOf(me.items, index);
        }
        me.items[index].disabled = true;
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).addCls(me.disabledCls);
    },

    destroy: function() {
        delete this.items;
        delete this.renderer;
        return this.callParent(arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     * Also fires any configured click handlers. By default, cancels the mousedown event to prevent selection.
     * Returns the event handler's status to allow canceling of GridView's bubbling process.
     */
    processEvent : function(type, view, cell, recordIndex, cellIndex, e){
        var me = this,
            match = e.getTarget().className.match(me.actionIdRe),
            item, fn;
            
        if (match) {
            item = me.items[parseInt(match[1], 10)];
            if (item) {
                if (type == 'click') {
                    fn = item.handler || me.handler;
                    if (fn && !item.disabled) {
                        fn.call(item.scope || me.scope || me, view, recordIndex, cellIndex, item, e);
                    }
                } else if (type == 'mousedown' && item.stopSelection !== false) {
                    return false;
                }
            }
        }
        return me.callParent(arguments);
    },

    cascade: function(fn, scope) {
        fn.call(scope||this, this);
    },

    // Private override because this cannot function as a Container, and it has an items property which is an Array, NOT a MixedCollection.
    getRefItems: function() {
        return [];
    }
});
