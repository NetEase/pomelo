/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Color picker provides a simple color palette for choosing colors. The picker can be rendered to any container. The
 * available default to a standard 40-color palette; this can be customized with the {@link #colors} config.
 *
 * Typically you will need to implement a handler function to be notified when the user chooses a color from the picker;
 * you can register the handler using the {@link #select} event, or by implementing the {@link #handler} method.
 *
 *     @example
 *     Ext.create('Ext.picker.Color', {
 *         value: '993300',  // initial selected color
 *         renderTo: Ext.getBody(),
 *         listeners: {
 *             select: function(picker, selColor) {
 *                 alert(selColor);
 *             }
 *         }
 *     });
 */
Ext.define('Ext.picker.Color', {
    extend: 'Ext.Component',
    requires: 'Ext.XTemplate',
    alias: 'widget.colorpicker',
    alternateClassName: 'Ext.ColorPalette',

    /**
     * @cfg {String} [componentCls='x-color-picker']
     * The CSS class to apply to the containing element.
     */
    componentCls : Ext.baseCSSPrefix + 'color-picker',

    /**
     * @cfg {String} [selectedCls='x-color-picker-selected']
     * The CSS class to apply to the selected element
     */
    selectedCls: Ext.baseCSSPrefix + 'color-picker-selected',

    /**
     * @cfg {String} value
     * The initial color to highlight (should be a valid 6-digit color hex code without the # symbol). Note that the hex
     * codes are case-sensitive.
     */
    value : null,

    /**
     * @cfg {String} clickEvent
     * The DOM event that will cause a color to be selected. This can be any valid event name (dblclick, contextmenu).
     */
    clickEvent :'click',

    /**
     * @cfg {Boolean} allowReselect
     * If set to true then reselecting a color that is already selected fires the {@link #select} event
     */
    allowReselect : false,

    /**
     * @property {String[]} colors
     * An array of 6-digit color hex code strings (without the # symbol). This array can contain any number of colors,
     * and each hex code should be unique. The width of the picker is controlled via CSS by adjusting the width property
     * of the 'x-color-picker' class (or assigning a custom class), so you can balance the number of colors with the
     * width setting until the box is symmetrical.
     *
     * You can override individual colors if needed:
     *
     *     var cp = new Ext.picker.Color();
     *     cp.colors[0] = 'FF0000';  // change the first box to red
     *
     * Or you can provide a custom array of your own for complete control:
     *
     *     var cp = new Ext.picker.Color();
     *     cp.colors = ['000000', '993300', '333300'];
     */
    colors : [
        '000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333',
        '800000', 'FF6600', '808000', '008000', '008080', '0000FF', '666699', '808080',
        'FF0000', 'FF9900', '99CC00', '339966', '33CCCC', '3366FF', '800080', '969696',
        'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0',
        'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF'
    ],

    /**
     * @cfg {Function} handler
     * A function that will handle the select event of this picker. The handler is passed the following parameters:
     *
     * - `picker` : ColorPicker
     *
     *   The {@link Ext.picker.Color picker}.
     *
     * - `color` : String
     *
     *   The 6-digit color hex code (without the # symbol).
     */

    /**
     * @cfg {Object} scope
     * The scope (`this` reference) in which the `{@link #handler}` function will be called. Defaults to this
     * Color picker instance.
     */

    colorRe: /(?:^|\s)color-(.{6})(?:\s|$)/,
    
    renderTpl: [
        '<tpl for="colors">',
            '<a href="#" class="color-{.}" hidefocus="on">',
                '<em><span style="background:#{.}" unselectable="on">&#160;</span></em>',
            '</a>',
        '</tpl>'
    ],

    // private
    initComponent : function(){
        var me = this;

        me.callParent(arguments);
        me.addEvents(
            /**
             * @event select
             * Fires when a color is selected
             * @param {Ext.picker.Color} this
             * @param {String} color The 6-digit color hex code (without the # symbol)
             */
            'select'
        );

        if (me.handler) {
            me.on('select', me.handler, me.scope, true);
        }
    },


    // private
    onRender : function(container, position){
        var me = this,
            clickEvent = me.clickEvent;

        Ext.apply(me.renderData, {
            itemCls: me.itemCls,
            colors: me.colors
        });
        me.callParent(arguments);

        me.mon(me.el, clickEvent, me.handleClick, me, {delegate: 'a'});
        // always stop following the anchors
        if(clickEvent != 'click'){
            me.mon(me.el, 'click', Ext.emptyFn, me, {delegate: 'a', stopEvent: true});
        }
    },

    // private
    afterRender : function(){
        var me = this,
            value;

        me.callParent(arguments);
        if (me.value) {
            value = me.value;
            me.value = null;
            me.select(value, true);
        }
    },

    // private
    handleClick : function(event, target){
        var me = this,
            color;

        event.stopEvent();
        if (!me.disabled) {
            color = target.className.match(me.colorRe)[1];
            me.select(color.toUpperCase());
        }
    },

    /**
     * Selects the specified color in the picker (fires the {@link #select} event)
     * @param {String} color A valid 6-digit color hex code (# will be stripped if included)
     * @param {Boolean} suppressEvent (optional) True to stop the select event from firing. Defaults to false.
     */
    select : function(color, suppressEvent){

        var me = this,
            selectedCls = me.selectedCls,
            value = me.value,
            el;

        color = color.replace('#', '');
        if (!me.rendered) {
            me.value = color;
            return;
        }


        if (color != value || me.allowReselect) {
            el = me.el;

            if (me.value) {
                el.down('a.color-' + value).removeCls(selectedCls);
            }
            el.down('a.color-' + color).addCls(selectedCls);
            me.value = color;
            if (suppressEvent !== true) {
                me.fireEvent('select', me, color);
            }
        }
    },

    /**
     * Get the currently selected color value.
     * @return {String} value The selected value. Null if nothing is selected.
     */
    getValue: function(){
        return this.value || null;
    }
});

