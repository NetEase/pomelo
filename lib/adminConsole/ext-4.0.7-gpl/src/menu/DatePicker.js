/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A menu containing an Ext.picker.Date Component.
 *
 * Notes:
 *
 * - Although not listed here, the **constructor** for this class accepts all of the
 *   configuration options of **{@link Ext.picker.Date}**.
 * - If subclassing DateMenu, any configuration options for the DatePicker must be applied
 *   to the **initialConfig** property of the DateMenu. Applying {@link Ext.picker.Date Date Picker}
 *   configuration settings to **this** will **not** affect the Date Picker's configuration.
 *
 * Example:
 *
 *     @example
 *     var dateMenu = Ext.create('Ext.menu.DatePicker', {
 *         handler: function(dp, date){
 *             Ext.Msg.alert('Date Selected', 'You selected ' + Ext.Date.format(date, 'M j, Y'));
 *         }
 *     });
 *
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 90,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'choose a date',
 *             menu: dateMenu
 *         },{
 *             iconCls: 'add16',
 *             text: 'icon item'
 *         },{
 *             text: 'regular item'
 *         }]
 *     });
 */
 Ext.define('Ext.menu.DatePicker', {
     extend: 'Ext.menu.Menu',

     alias: 'widget.datemenu',

     requires: [
        'Ext.picker.Date'
     ],

    /**
     * @cfg {Boolean} hideOnClick
     * False to continue showing the menu after a date is selected.
     */
    hideOnClick : true,

    /**
     * @cfg {String} pickerId
     * An id to assign to the underlying date picker.
     */
    pickerId : null,

    /**
     * @cfg {Number} maxHeight
     * @hide
     */

    /**
     * @property {Ext.picker.Date} picker
     * The {@link Ext.picker.Date} instance for this DateMenu
     */

    /**
     * @event click
     * @hide
     */

    /**
     * @event itemclick
     * @hide
     */

    initComponent : function(){
        var me = this;

        Ext.apply(me, {
            showSeparator: false,
            plain: true,
            border: false,
            bodyPadding: 0, // remove the body padding from the datepicker menu item so it looks like 3.3
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-date-item',
                id: me.pickerId,
                xtype: 'datepicker'
            }, me.initialConfig)
        });

        me.callParent(arguments);

        me.picker = me.down('datepicker');
        /**
         * @event select
         * @alias Ext.picker.Date#select
         */
        me.relayEvents(me.picker, ['select']);

        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    },

    hidePickerOnSelect: function() {
        Ext.menu.Manager.hideAll();
    }
 });
