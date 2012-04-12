/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A month picker component. This class is used by the {@link Ext.picker.Date Date picker} class
 * to allow browsing and selection of year/months combinations.
 */
Ext.define('Ext.picker.Month', {
    extend: 'Ext.Component',
    requires: ['Ext.XTemplate', 'Ext.util.ClickRepeater', 'Ext.Date', 'Ext.button.Button'],
    alias: 'widget.monthpicker',
    alternateClassName: 'Ext.MonthPicker',

    renderTpl: [
        '<div id="{id}-bodyEl" class="{baseCls}-body">',
          '<div class="{baseCls}-months">',
              '<tpl for="months">',
                  '<div class="{parent.baseCls}-item {parent.baseCls}-month"><a href="#" hidefocus="on">{.}</a></div>',
              '</tpl>',
          '</div>',
          '<div class="{baseCls}-years">',
              '<div class="{baseCls}-yearnav">',
                  '<button id="{id}-prevEl" class="{baseCls}-yearnav-prev"></button>',
                  '<button id="{id}-nextEl" class="{baseCls}-yearnav-next"></button>',
              '</div>',
              '<tpl for="years">',
                  '<div class="{parent.baseCls}-item {parent.baseCls}-year"><a href="#" hidefocus="on">{.}</a></div>',
              '</tpl>',
          '</div>',
          '<div class="' + Ext.baseCSSPrefix + 'clear"></div>',
        '</div>',
        '<tpl if="showButtons">',
          '<div id="{id}-buttonsEl" class="{baseCls}-buttons"></div>',
        '</tpl>'
    ],

    /**
     * @cfg {String} okText The text to display on the ok button.
     */
    okText: 'OK',

    /**
     * @cfg {String} cancelText The text to display on the cancel button.
     */
    cancelText: 'Cancel',

    /**
     * @cfg {String} baseCls The base CSS class to apply to the picker element. Defaults to <tt>'x-monthpicker'</tt>
     */
    baseCls: Ext.baseCSSPrefix + 'monthpicker',

    /**
     * @cfg {Boolean} showButtons True to show ok and cancel buttons below the picker.
     */
    showButtons: true,

    /**
     * @cfg {String} selectedCls The class to be added to selected items in the picker. Defaults to
     * <tt>'x-monthpicker-selected'</tt>
     */

    /**
     * @cfg {Date/Number[]} value The default value to set. See {@link #setValue}
     */
    width: 178,

    // used when attached to date picker which isnt showing buttons
    smallCls: Ext.baseCSSPrefix + 'monthpicker-small',

    // private
    totalYears: 10,
    yearOffset: 5, // 10 years in total, 2 per row
    monthOffset: 6, // 12 months, 2 per row

    // private, inherit docs
    initComponent: function(){
        var me = this;

        me.selectedCls = me.baseCls + '-selected';
        me.addEvents(
            /**
             * @event cancelclick
             * Fires when the cancel button is pressed.
             * @param {Ext.picker.Month} this
             */
            'cancelclick',

            /**
             * @event monthclick
             * Fires when a month is clicked.
             * @param {Ext.picker.Month} this
             * @param {Array} value The current value
             */
            'monthclick',

            /**
             * @event monthdblclick
             * Fires when a month is clicked.
             * @param {Ext.picker.Month} this
             * @param {Array} value The current value
             */
            'monthdblclick',

            /**
             * @event okclick
             * Fires when the ok button is pressed.
             * @param {Ext.picker.Month} this
             * @param {Array} value The current value
             */
            'okclick',

            /**
             * @event select
             * Fires when a month/year is selected.
             * @param {Ext.picker.Month} this
             * @param {Array} value The current value
             */
            'select',

            /**
             * @event yearclick
             * Fires when a year is clicked.
             * @param {Ext.picker.Month} this
             * @param {Array} value The current value
             */
            'yearclick',

            /**
             * @event yeardblclick
             * Fires when a year is clicked.
             * @param {Ext.picker.Month} this
             * @param {Array} value The current value
             */
            'yeardblclick'
        );
        if (me.small) {
            me.addCls(me.smallCls);
        }
        me.setValue(me.value);
        me.activeYear = me.getYear(new Date().getFullYear() - 4, -4);
        this.callParent();
    },

    // private, inherit docs
    onRender: function(ct, position){
        var me = this,
            i = 0,
            months = [],
            shortName = Ext.Date.getShortMonthName,
            monthLen = me.monthOffset;

        for (; i < monthLen; ++i) {
            months.push(shortName(i), shortName(i + monthLen));
        }

        Ext.apply(me.renderData, {
            months: months,
            years: me.getYears(),
            showButtons: me.showButtons
        });

        me.addChildEls('bodyEl', 'prevEl', 'nextEl', 'buttonsEl');

        me.callParent(arguments);
    },

    // private, inherit docs
    afterRender: function(){
        var me = this,
            body = me.bodyEl,
            buttonsEl = me.buttonsEl;

        me.callParent();

        me.mon(body, 'click', me.onBodyClick, me);
        me.mon(body, 'dblclick', me.onBodyClick, me);

        // keep a reference to the year/month elements since we'll be re-using them
        me.years = body.select('.' + me.baseCls + '-year a');
        me.months = body.select('.' + me.baseCls + '-month a');

        if (me.showButtons) {
            me.okBtn = Ext.create('Ext.button.Button', {
                text: me.okText,
                renderTo: buttonsEl,
                handler: me.onOkClick,
                scope: me
            });
            me.cancelBtn = Ext.create('Ext.button.Button', {
                text: me.cancelText,
                renderTo: buttonsEl,
                handler: me.onCancelClick,
                scope: me
            });
        }

        me.backRepeater = Ext.create('Ext.util.ClickRepeater', me.prevEl, {
            handler: Ext.Function.bind(me.adjustYear, me, [-me.totalYears])
        });

        me.prevEl.addClsOnOver(me.baseCls + '-yearnav-prev-over');
        me.nextRepeater = Ext.create('Ext.util.ClickRepeater', me.nextEl, {
            handler: Ext.Function.bind(me.adjustYear, me, [me.totalYears])
        });
        me.nextEl.addClsOnOver(me.baseCls + '-yearnav-next-over');
        me.updateBody();
    },

    /**
     * Set the value for the picker.
     * @param {Date/Number[]} value The value to set. It can be a Date object, where the month/year will be extracted, or
     * it can be an array, with the month as the first index and the year as the second.
     * @return {Ext.picker.Month} this
     */
    setValue: function(value){
        var me = this,
            active = me.activeYear,
            offset = me.monthOffset,
            year,
            index;

        if (!value) {
            me.value = [null, null];
        } else if (Ext.isDate(value)) {
            me.value = [value.getMonth(), value.getFullYear()];
        } else {
            me.value = [value[0], value[1]];
        }

        if (me.rendered) {
            year = me.value[1];
            if (year !== null) {
                if ((year < active || year > active + me.yearOffset)) {
                    me.activeYear = year - me.yearOffset + 1;
                }
            }
            me.updateBody();
        }

        return me;
    },

    /**
     * Gets the selected value. It is returned as an array [month, year]. It may
     * be a partial value, for example [null, 2010]. The month is returned as
     * 0 based.
     * @return {Number[]} The selected value
     */
    getValue: function(){
        return this.value;
    },

    /**
     * Checks whether the picker has a selection
     * @return {Boolean} Returns true if both a month and year have been selected
     */
    hasSelection: function(){
        var value = this.value;
        return value[0] !== null && value[1] !== null;
    },

    /**
     * Get an array of years to be pushed in the template. It is not in strict
     * numerical order because we want to show them in columns.
     * @private
     * @return {Number[]} An array of years
     */
    getYears: function(){
        var me = this,
            offset = me.yearOffset,
            start = me.activeYear, // put the "active" year on the left
            end = start + offset,
            i = start,
            years = [];

        for (; i < end; ++i) {
            years.push(i, i + offset);
        }

        return years;
    },

    /**
     * Update the years in the body based on any change
     * @private
     */
    updateBody: function(){
        var me = this,
            years = me.years,
            months = me.months,
            yearNumbers = me.getYears(),
            cls = me.selectedCls,
            value = me.getYear(null),
            month = me.value[0],
            monthOffset = me.monthOffset,
            year;

        if (me.rendered) {
            years.removeCls(cls);
            months.removeCls(cls);
            years.each(function(el, all, index){
                year = yearNumbers[index];
                el.dom.innerHTML = year;
                if (year == value) {
                    el.dom.className = cls;
                }
            });
            if (month !== null) {
                if (month < monthOffset) {
                    month = month * 2;
                } else {
                    month = (month - monthOffset) * 2 + 1;
                }
                months.item(month).addCls(cls);
            }
        }
    },

    /**
     * Gets the current year value, or the default.
     * @private
     * @param {Number} defaultValue The default value to use if the year is not defined.
     * @param {Number} offset A number to offset the value by
     * @return {Number} The year value
     */
    getYear: function(defaultValue, offset) {
        var year = this.value[1];
        offset = offset || 0;
        return year === null ? defaultValue : year + offset;
    },

    /**
     * React to clicks on the body
     * @private
     */
    onBodyClick: function(e, t) {
        var me = this,
            isDouble = e.type == 'dblclick';

        if (e.getTarget('.' + me.baseCls + '-month')) {
            e.stopEvent();
            me.onMonthClick(t, isDouble);
        } else if (e.getTarget('.' + me.baseCls + '-year')) {
            e.stopEvent();
            me.onYearClick(t, isDouble);
        }
    },

    /**
     * Modify the year display by passing an offset.
     * @param {Number} [offset=10] The offset to move by.
     */
    adjustYear: function(offset){
        if (typeof offset != 'number') {
            offset = this.totalYears;
        }
        this.activeYear += offset;
        this.updateBody();
    },

    /**
     * React to the ok button being pressed
     * @private
     */
    onOkClick: function(){
        this.fireEvent('okclick', this, this.value);
    },

    /**
     * React to the cancel button being pressed
     * @private
     */
    onCancelClick: function(){
        this.fireEvent('cancelclick', this);
    },

    /**
     * React to a month being clicked
     * @private
     * @param {HTMLElement} target The element that was clicked
     * @param {Boolean} isDouble True if the event was a doubleclick
     */
    onMonthClick: function(target, isDouble){
        var me = this;
        me.value[0] = me.resolveOffset(me.months.indexOf(target), me.monthOffset);
        me.updateBody();
        me.fireEvent('month' + (isDouble ? 'dbl' : '') + 'click', me, me.value);
        me.fireEvent('select', me, me.value);
    },

    /**
     * React to a year being clicked
     * @private
     * @param {HTMLElement} target The element that was clicked
     * @param {Boolean} isDouble True if the event was a doubleclick
     */
    onYearClick: function(target, isDouble){
        var me = this;
        me.value[1] = me.activeYear + me.resolveOffset(me.years.indexOf(target), me.yearOffset);
        me.updateBody();
        me.fireEvent('year' + (isDouble ? 'dbl' : '') + 'click', me, me.value);
        me.fireEvent('select', me, me.value);

    },

    /**
     * Returns an offsetted number based on the position in the collection. Since our collections aren't
     * numerically ordered, this function helps to normalize those differences.
     * @private
     * @param {Object} index
     * @param {Object} offset
     * @return {Number} The correctly offsetted number
     */
    resolveOffset: function(index, offset){
        if (index % 2 === 0) {
            return (index / 2);
        } else {
            return offset + Math.floor(index / 2);
        }
    },

    // private, inherit docs
    beforeDestroy: function(){
        var me = this;
        me.years = me.months = null;
        Ext.destroyMembers(me, 'backRepeater', 'nextRepeater', 'okBtn', 'cancelBtn');
        me.callParent();
    }
});

