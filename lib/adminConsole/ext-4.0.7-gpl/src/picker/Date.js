/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A date picker. This class is used by the Ext.form.field.Date field to allow browsing and selection of valid
 * dates in a popup next to the field, but may also be used with other components.
 *
 * Typically you will need to implement a handler function to be notified when the user chooses a date from the picker;
 * you can register the handler using the {@link #select} event, or by implementing the {@link #handler} method.
 *
 * By default the user will be allowed to pick any date; this can be changed by using the {@link #minDate},
 * {@link #maxDate}, {@link #disabledDays}, {@link #disabledDatesRE}, and/or {@link #disabledDates} configs.
 *
 * All the string values documented below may be overridden by including an Ext locale file in your page.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Choose a future date:',
 *         width: 200,
 *         bodyPadding: 10,
 *         renderTo: Ext.getBody(),
 *         items: [{
 *             xtype: 'datepicker',
 *             minDate: new Date(),
 *             handler: function(picker, date) {
 *                 // do something with the selected date
 *             }
 *         }]
 *     });
 */
Ext.define('Ext.picker.Date', {
    extend: 'Ext.Component',
    requires: [
        'Ext.XTemplate',
        'Ext.button.Button',
        'Ext.button.Split',
        'Ext.util.ClickRepeater',
        'Ext.util.KeyNav',
        'Ext.EventObject',
        'Ext.fx.Manager',
        'Ext.picker.Month'
    ],
    alias: 'widget.datepicker',
    alternateClassName: 'Ext.DatePicker',

    renderTpl: [
        '<div class="{cls}" id="{id}" role="grid" title="{ariaTitle} {value:this.longDay}">',
            '<div role="presentation" class="{baseCls}-header">',
                '<div class="{baseCls}-prev"><a id="{id}-prevEl" href="#" role="button" title="{prevText}"></a></div>',
                '<div class="{baseCls}-month" id="{id}-middleBtnEl"></div>',
                '<div class="{baseCls}-next"><a id="{id}-nextEl" href="#" role="button" title="{nextText}"></a></div>',
            '</div>',
            '<table id="{id}-eventEl" class="{baseCls}-inner" cellspacing="0" role="presentation">',
                '<thead role="presentation"><tr role="presentation">',
                    '<tpl for="dayNames">',
                        '<th role="columnheader" title="{.}"><span>{.:this.firstInitial}</span></th>',
                    '</tpl>',
                '</tr></thead>',
                '<tbody role="presentation"><tr role="presentation">',
                    '<tpl for="days">',
                        '{#:this.isEndOfWeek}',
                        '<td role="gridcell" id="{[Ext.id()]}">',
                            '<a role="presentation" href="#" hidefocus="on" class="{parent.baseCls}-date" tabIndex="1">',
                                '<em role="presentation"><span role="presentation"></span></em>',
                            '</a>',
                        '</td>',
                    '</tpl>',
                '</tr></tbody>',
            '</table>',
            '<tpl if="showToday">',
                '<div id="{id}-footerEl" role="presentation" class="{baseCls}-footer"></div>',
            '</tpl>',
        '</div>',
        {
            firstInitial: function(value) {
                return value.substr(0,1);
            },
            isEndOfWeek: function(value) {
                // convert from 1 based index to 0 based
                // by decrementing value once.
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },
            longDay: function(value){
                return Ext.Date.format(value, this.longDayFormat);
            }
        }
    ],

    ariaTitle: 'Date Picker',

    /**
     * @cfg {String} todayText
     * The text to display on the button that selects the current date
     */
    todayText : 'Today',

    /**
     * @cfg {Function} handler
     * Optional. A function that will handle the select event of this picker. The handler is passed the following
     * parameters:
     *
     *   - `picker` : Ext.picker.Date
     *
     * This Date picker.
     *
     *   - `date` : Date
     *
     * The selected date.
     */

    /**
     * @cfg {Object} scope
     * The scope (`this` reference) in which the `{@link #handler}` function will be called. Defaults to this
     * DatePicker instance.
     */

    /**
     * @cfg {String} todayTip
     * A string used to format the message for displaying in a tooltip over the button that selects the current date.
     * The `{0}` token in string is replaced by today's date.
     */
    todayTip : '{0} (Spacebar)',

    /**
     * @cfg {String} minText
     * The error text to display if the minDate validation fails.
     */
    minText : 'This date is before the minimum date',

    /**
     * @cfg {String} maxText
     * The error text to display if the maxDate validation fails.
     */
    maxText : 'This date is after the maximum date',

    /**
     * @cfg {String} format
     * The default date format string which can be overriden for localization support. The format must be valid
     * according to {@link Ext.Date#parse} (defaults to {@link Ext.Date#defaultFormat}).
     */

    /**
     * @cfg {String} disabledDaysText
     * The tooltip to display when the date falls on a disabled day.
     */
    disabledDaysText : 'Disabled',

    /**
     * @cfg {String} disabledDatesText
     * The tooltip text to display when the date falls on a disabled date.
     */
    disabledDatesText : 'Disabled',

    /**
     * @cfg {String[]} monthNames
     * An array of textual month names which can be overriden for localization support (defaults to Ext.Date.monthNames)
     */

    /**
     * @cfg {String[]} dayNames
     * An array of textual day names which can be overriden for localization support (defaults to Ext.Date.dayNames)
     */

    /**
     * @cfg {String} nextText
     * The next month navigation button tooltip
     */
    nextText : 'Next Month (Control+Right)',

    /**
     * @cfg {String} prevText
     * The previous month navigation button tooltip
     */
    prevText : 'Previous Month (Control+Left)',

    /**
     * @cfg {String} monthYearText
     * The header month selector tooltip
     */
    monthYearText : 'Choose a month (Control+Up/Down to move years)',

    /**
     * @cfg {Number} startDay
     * Day index at which the week should begin, 0-based (defaults to Sunday)
     */
    startDay : 0,

    /**
     * @cfg {Boolean} showToday
     * False to hide the footer area containing the Today button and disable the keyboard handler for spacebar that
     * selects the current date.
     */
    showToday : true,

    /**
     * @cfg {Date} [minDate=null]
     * Minimum allowable date (JavaScript date object)
     */

    /**
     * @cfg {Date} [maxDate=null]
     * Maximum allowable date (JavaScript date object)
     */

    /**
     * @cfg {Number[]} [disabledDays=null]
     * An array of days to disable, 0-based. For example, [0, 6] disables Sunday and Saturday.
     */

    /**
     * @cfg {RegExp} [disabledDatesRE=null]
     * JavaScript regular expression used to disable a pattern of dates. The {@link #disabledDates}
     * config will generate this regex internally, but if you specify disabledDatesRE it will take precedence over the
     * disabledDates value.
     */

    /**
     * @cfg {String[]} disabledDates
     * An array of 'dates' to disable, as strings. These strings will be used to build a dynamic regular expression so
     * they are very powerful. Some examples:
     *
     *   - ['03/08/2003', '09/16/2003'] would disable those exact dates
     *   - ['03/08', '09/16'] would disable those days for every year
     *   - ['^03/08'] would only match the beginning (useful if you are using short years)
     *   - ['03/../2006'] would disable every day in March 2006
     *   - ['^03'] would disable every day in every March
     *
     * Note that the format of the dates included in the array should exactly match the {@link #format} config. In order
     * to support regular expressions, if you are using a date format that has '.' in it, you will have to escape the
     * dot when restricting dates. For example: ['03\\.08\\.03'].
     */

    /**
     * @cfg {Boolean} disableAnim
     * True to disable animations when showing the month picker.
     */
    disableAnim: false,

    /**
     * @cfg {String} [baseCls='x-datepicker']
     * The base CSS class to apply to this components element.
     */
    baseCls: Ext.baseCSSPrefix + 'datepicker',

    /**
     * @cfg {String} [selectedCls='x-datepicker-selected']
     * The class to apply to the selected cell.
     */

    /**
     * @cfg {String} [disabledCellCls='x-datepicker-disabled']
     * The class to apply to disabled cells.
     */

    /**
     * @cfg {String} longDayFormat
     * The format for displaying a date in a longer format.
     */
    longDayFormat: 'F d, Y',

    /**
     * @cfg {Object} keyNavConfig
     * Specifies optional custom key event handlers for the {@link Ext.util.KeyNav} attached to this date picker. Must
     * conform to the config format recognized by the {@link Ext.util.KeyNav} constructor. Handlers specified in this
     * object will replace default handlers of the same name.
     */

    /**
     * @cfg {Boolean} focusOnShow
     * True to automatically focus the picker on show.
     */
    focusOnShow: false,

    // private
    // Set by other components to stop the picker focus being updated when the value changes.
    focusOnSelect: true,

    width: 178,

    // default value used to initialise each date in the DatePicker
    // (note: 12 noon was chosen because it steers well clear of all DST timezone changes)
    initHour: 12, // 24-hour format

    numDays: 42,

    // private, inherit docs
    initComponent : function() {
        var me = this,
            clearTime = Ext.Date.clearTime;

        me.selectedCls = me.baseCls + '-selected';
        me.disabledCellCls = me.baseCls + '-disabled';
        me.prevCls = me.baseCls + '-prevday';
        me.activeCls = me.baseCls + '-active';
        me.nextCls = me.baseCls + '-prevday';
        me.todayCls = me.baseCls + '-today';
        me.dayNames = me.dayNames.slice(me.startDay).concat(me.dayNames.slice(0, me.startDay));
        this.callParent();

        me.value = me.value ?
                 clearTime(me.value, true) : clearTime(new Date());

        me.addEvents(
            /**
             * @event select
             * Fires when a date is selected
             * @param {Ext.picker.Date} this DatePicker
             * @param {Date} date The selected date
             */
            'select'
        );

        me.initDisabledDays();
    },

    // private, inherit docs
    onRender : function(container, position){
        /*
         * days array for looping through 6 full weeks (6 weeks * 7 days)
         * Note that we explicitly force the size here so the template creates
         * all the appropriate cells.
         */

        var me = this,
            days = new Array(me.numDays),
            today = Ext.Date.format(new Date(), me.format);

        Ext.applyIf(me, {
            renderData: {}
        });

        Ext.apply(me.renderData, {
            dayNames: me.dayNames,
            ariaTitle: me.ariaTitle,
            value: me.value,
            showToday: me.showToday,
            prevText: me.prevText,
            nextText: me.nextText,
            days: days
        });
        me.getTpl('renderTpl').longDayFormat = me.longDayFormat;

        me.addChildEls('eventEl', 'prevEl', 'nextEl', 'middleBtnEl', 'footerEl');

        this.callParent(arguments);
        me.el.unselectable();

        me.cells = me.eventEl.select('tbody td');
        me.textNodes = me.eventEl.query('tbody td span');

        me.monthBtn = Ext.create('Ext.button.Split', {
            text: '',
            tooltip: me.monthYearText,
            renderTo: me.middleBtnEl
        });
        //~ me.middleBtnEl.down('button').addCls(Ext.baseCSSPrefix + 'btn-arrow');


        me.todayBtn = Ext.create('Ext.button.Button', {
            renderTo: me.footerEl,
            text: Ext.String.format(me.todayText, today),
            tooltip: Ext.String.format(me.todayTip, today),
            handler: me.selectToday,
            scope: me
        });
    },

    // private, inherit docs
    initEvents: function(){
        var me = this,
            eDate = Ext.Date,
            day = eDate.DAY;

        this.callParent();

        me.prevRepeater = Ext.create('Ext.util.ClickRepeater', me.prevEl, {
            handler: me.showPrevMonth,
            scope: me,
            preventDefault: true,
            stopDefault: true
        });

        me.nextRepeater = Ext.create('Ext.util.ClickRepeater', me.nextEl, {
            handler: me.showNextMonth,
            scope: me,
            preventDefault:true,
            stopDefault:true
        });

        me.keyNav = Ext.create('Ext.util.KeyNav', me.eventEl, Ext.apply({
            scope: me,
            'left' : function(e){
                if(e.ctrlKey){
                    me.showPrevMonth();
                }else{
                    me.update(eDate.add(me.activeDate, day, -1));
                }
            },

            'right' : function(e){
                if(e.ctrlKey){
                    me.showNextMonth();
                }else{
                    me.update(eDate.add(me.activeDate, day, 1));
                }
            },

            'up' : function(e){
                if(e.ctrlKey){
                    me.showNextYear();
                }else{
                    me.update(eDate.add(me.activeDate, day, -7));
                }
            },

            'down' : function(e){
                if(e.ctrlKey){
                    me.showPrevYear();
                }else{
                    me.update(eDate.add(me.activeDate, day, 7));
                }
            },
            'pageUp' : me.showNextMonth,
            'pageDown' : me.showPrevMonth,
            'enter' : function(e){
                e.stopPropagation();
                return true;
            }
        }, me.keyNavConfig));

        if(me.showToday){
            me.todayKeyListener = me.eventEl.addKeyListener(Ext.EventObject.SPACE, me.selectToday,  me);
        }
        me.mon(me.eventEl, 'mousewheel', me.handleMouseWheel, me);
        me.mon(me.eventEl, 'click', me.handleDateClick,  me, {delegate: 'a.' + me.baseCls + '-date'});
        me.mon(me.monthBtn, 'click', me.showMonthPicker, me);
        me.mon(me.monthBtn, 'arrowclick', me.showMonthPicker, me);
        me.update(me.value);
    },

    /**
     * Setup the disabled dates regex based on config options
     * @private
     */
    initDisabledDays : function(){
        var me = this,
            dd = me.disabledDates,
            re = '(?:',
            len;

        if(!me.disabledDatesRE && dd){
                len = dd.length - 1;

            Ext.each(dd, function(d, i){
                re += Ext.isDate(d) ? '^' + Ext.String.escapeRegex(Ext.Date.dateFormat(d, me.format)) + '$' : dd[i];
                if(i != len){
                    re += '|';
                }
            }, me);
            me.disabledDatesRE = new RegExp(re + ')');
        }
    },

    /**
     * Replaces any existing disabled dates with new values and refreshes the DatePicker.
     * @param {String[]/RegExp} disabledDates An array of date strings (see the {@link #disabledDates} config for
     * details on supported values), or a JavaScript regular expression used to disable a pattern of dates.
     * @return {Ext.picker.Date} this
     */
    setDisabledDates : function(dd){
        var me = this;

        if(Ext.isArray(dd)){
            me.disabledDates = dd;
            me.disabledDatesRE = null;
        }else{
            me.disabledDatesRE = dd;
        }
        me.initDisabledDays();
        me.update(me.value, true);
        return me;
    },

    /**
     * Replaces any existing disabled days (by index, 0-6) with new values and refreshes the DatePicker.
     * @param {Number[]} disabledDays An array of disabled day indexes. See the {@link #disabledDays} config for details
     * on supported values.
     * @return {Ext.picker.Date} this
     */
    setDisabledDays : function(dd){
        this.disabledDays = dd;
        return this.update(this.value, true);
    },

    /**
     * Replaces any existing {@link #minDate} with the new value and refreshes the DatePicker.
     * @param {Date} value The minimum date that can be selected
     * @return {Ext.picker.Date} this
     */
    setMinDate : function(dt){
        this.minDate = dt;
        return this.update(this.value, true);
    },

    /**
     * Replaces any existing {@link #maxDate} with the new value and refreshes the DatePicker.
     * @param {Date} value The maximum date that can be selected
     * @return {Ext.picker.Date} this
     */
    setMaxDate : function(dt){
        this.maxDate = dt;
        return this.update(this.value, true);
    },

    /**
     * Sets the value of the date field
     * @param {Date} value The date to set
     * @return {Ext.picker.Date} this
     */
    setValue : function(value){
        this.value = Ext.Date.clearTime(value, true);
        return this.update(this.value);
    },

    /**
     * Gets the current selected value of the date field
     * @return {Date} The selected date
     */
    getValue : function(){
        return this.value;
    },

    // private
    focus : function(){
        this.update(this.activeDate);
    },

    // private, inherit docs
    onEnable: function(){
        this.callParent();
        this.setDisabledStatus(false);
        this.update(this.activeDate);

    },

    // private, inherit docs
    onDisable : function(){
        this.callParent();
        this.setDisabledStatus(true);
    },

    /**
     * Set the disabled state of various internal components
     * @private
     * @param {Boolean} disabled
     */
    setDisabledStatus : function(disabled){
        var me = this;

        me.keyNav.setDisabled(disabled);
        me.prevRepeater.setDisabled(disabled);
        me.nextRepeater.setDisabled(disabled);
        if (me.showToday) {
            me.todayKeyListener.setDisabled(disabled);
            me.todayBtn.setDisabled(disabled);
        }
    },

    /**
     * Get the current active date.
     * @private
     * @return {Date} The active date
     */
    getActive: function(){
        return this.activeDate || this.value;
    },

    /**
     * Run any animation required to hide/show the month picker.
     * @private
     * @param {Boolean} isHide True if it's a hide operation
     */
    runAnimation: function(isHide){
        var picker = this.monthPicker,
            options = {
                duration: 200,
                callback: function(){
                    if (isHide) {
                        picker.hide();
                    } else {
                        picker.show();
                    }
                }
            };

        if (isHide) {
            picker.el.slideOut('t', options);
        } else {
            picker.el.slideIn('t', options);
        }
    },

    /**
     * Hides the month picker, if it's visible.
     * @param {Boolean} [animate] Indicates whether to animate this action. If the animate
     * parameter is not specified, the behavior will use {@link #disableAnim} to determine
     * whether to animate or not.
     * @return {Ext.picker.Date} this
     */
    hideMonthPicker : function(animate){
        var me = this,
            picker = me.monthPicker;

        if (picker) {
            if (me.shouldAnimate(animate)) {
                me.runAnimation(true);
            } else {
                picker.hide();
            }
        }
        return me;
    },

    /**
     * Show the month picker
     * @param {Boolean} [animate] Indicates whether to animate this action. If the animate
     * parameter is not specified, the behavior will use {@link #disableAnim} to determine
     * whether to animate or not.
     * @return {Ext.picker.Date} this
     */
    showMonthPicker : function(animate){
        var me = this,
            picker;
        
        if (me.rendered && !me.disabled) {
            picker = me.createMonthPicker();
            picker.setValue(me.getActive());
            picker.setSize(me.getSize());
            picker.setPosition(-1, -1);
            if (me.shouldAnimate(animate)) {
                me.runAnimation(false);
            } else {
                picker.show();
            }
        }
        return me;
    },
    
    /**
     * Checks whether a hide/show action should animate
     * @private
     * @param {Boolean} [animate] A possible animation value
     * @return {Boolean} Whether to animate the action
     */
    shouldAnimate: function(animate){
        return Ext.isDefined(animate) ? animate : !this.disableAnim;
    },

    /**
     * Create the month picker instance
     * @private
     * @return {Ext.picker.Month} picker
     */
    createMonthPicker: function(){
        var me = this,
            picker = me.monthPicker;

        if (!picker) {
            me.monthPicker = picker = Ext.create('Ext.picker.Month', {
                renderTo: me.el,
                floating: true,
                shadow: false,
                small: me.showToday === false,
                listeners: {
                    scope: me,
                    cancelclick: me.onCancelClick,
                    okclick: me.onOkClick,
                    yeardblclick: me.onOkClick,
                    monthdblclick: me.onOkClick
                }
            });
            if (!me.disableAnim) {
                // hide the element if we're animating to prevent an initial flicker
                picker.el.setStyle('display', 'none');
            }
            me.on('beforehide', Ext.Function.bind(me.hideMonthPicker, me, [false]));
        }
        return picker;
    },

    /**
     * Respond to an ok click on the month picker
     * @private
     */
    onOkClick: function(picker, value){
        var me = this,
            month = value[0],
            year = value[1],
            date = new Date(year, month, me.getActive().getDate());

        if (date.getMonth() !== month) {
            // 'fix' the JS rolling date conversion if needed
            date = new Date(year, month, 1).getLastDateOfMonth();
        }
        me.update(date);
        me.hideMonthPicker();
    },

    /**
     * Respond to a cancel click on the month picker
     * @private
     */
    onCancelClick: function(){
        this.hideMonthPicker();
    },

    /**
     * Show the previous month.
     * @param {Object} e
     * @return {Ext.picker.Date} this
     */
    showPrevMonth : function(e){
        return this.update(Ext.Date.add(this.activeDate, Ext.Date.MONTH, -1));
    },

    /**
     * Show the next month.
     * @param {Object} e
     * @return {Ext.picker.Date} this
     */
    showNextMonth : function(e){
        return this.update(Ext.Date.add(this.activeDate, Ext.Date.MONTH, 1));
    },

    /**
     * Show the previous year.
     * @return {Ext.picker.Date} this
     */
    showPrevYear : function(){
        this.update(Ext.Date.add(this.activeDate, Ext.Date.YEAR, -1));
    },

    /**
     * Show the next year.
     * @return {Ext.picker.Date} this
     */
    showNextYear : function(){
        this.update(Ext.Date.add(this.activeDate, Ext.Date.YEAR, 1));
    },

    /**
     * Respond to the mouse wheel event
     * @private
     * @param {Ext.EventObject} e
     */
    handleMouseWheel : function(e){
        e.stopEvent();
        if(!this.disabled){
            var delta = e.getWheelDelta();
            if(delta > 0){
                this.showPrevMonth();
            } else if(delta < 0){
                this.showNextMonth();
            }
        }
    },

    /**
     * Respond to a date being clicked in the picker
     * @private
     * @param {Ext.EventObject} e
     * @param {HTMLElement} t
     */
    handleDateClick : function(e, t){
        var me = this,
            handler = me.handler;

        e.stopEvent();
        if(!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)){
            me.cancelFocus = me.focusOnSelect === false;
            me.setValue(new Date(t.dateValue));
            delete me.cancelFocus;
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            // event handling is turned off on hide
            // when we are using the picker in a field
            // therefore onSelect comes AFTER the select
            // event.
            me.onSelect();
        }
    },

    /**
     * Perform any post-select actions
     * @private
     */
    onSelect: function() {
        if (this.hideOnSelect) {
             this.hide();
         }
    },

    /**
     * Sets the current value to today.
     * @return {Ext.picker.Date} this
     */
    selectToday : function(){
        var me = this,
            btn = me.todayBtn,
            handler = me.handler;

        if(btn && !btn.disabled){
            me.setValue(Ext.Date.clearTime(new Date()));
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    },

    /**
     * Update the selected cell
     * @private
     * @param {Date} date The new date
     * @param {Date} active The active date
     */
    selectedUpdate: function(date, active){
        var me = this,
            t = date.getTime(),
            cells = me.cells,
            cls = me.selectedCls;

        cells.removeCls(cls);
        cells.each(function(c){
            if (c.dom.firstChild.dateValue == t) {
                me.el.dom.setAttribute('aria-activedescendent', c.dom.id);
                c.addCls(cls);
                if(me.isVisible() && !me.cancelFocus){
                    Ext.fly(c.dom.firstChild).focus(50);
                }
                return false;
            }
        }, this);
    },

    /**
     * Update the contents of the picker for a new month
     * @private
     * @param {Date} date The new date
     * @param {Date} active The active date
     */
    fullUpdate: function(date, active){
        var me = this,
            cells = me.cells.elements,
            textNodes = me.textNodes,
            disabledCls = me.disabledCellCls,
            eDate = Ext.Date,
            i = 0,
            extraDays = 0,
            visible = me.isVisible(),
            sel = +eDate.clearTime(date, true),
            today = +eDate.clearTime(new Date()),
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddText = me.disabledDatesText,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            ddaysText = me.disabledDaysText,
            format = me.format,
            days = eDate.getDaysInMonth(date),
            firstOfMonth = eDate.getFirstDateOfMonth(date),
            startingPos = firstOfMonth.getDay() - me.startDay,
            previousMonth = eDate.add(date, eDate.MONTH, -1),
            longDayFormat = me.longDayFormat,
            prevStart,
            current,
            disableToday,
            tempDate,
            setCellClass,
            html,
            cls,
            formatValue,
            value;

        if (startingPos < 0) {
            startingPos += 7;
        }

        days += startingPos;
        prevStart = eDate.getDaysInMonth(previousMonth) - startingPos;
        current = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), prevStart, me.initHour);

        if (me.showToday) {
            tempDate = eDate.clearTime(new Date());
            disableToday = (tempDate < min || tempDate > max ||
                (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
                (ddays && ddays.indexOf(tempDate.getDay()) != -1));

            if (!me.disabled) {
                me.todayBtn.setDisabled(disableToday);
                me.todayKeyListener.setDisabled(disableToday);
            }
        }

        setCellClass = function(cell){
            value = +eDate.clearTime(current, true);
            cell.title = eDate.format(current, longDayFormat);
            // store dateValue number as an expando
            cell.firstChild.dateValue = value;
            if(value == today){
                cell.className += ' ' + me.todayCls;
                cell.title = me.todayText;
            }
            if(value == sel){
                cell.className += ' ' + me.selectedCls;
                me.el.dom.setAttribute('aria-activedescendant', cell.id);
                if (visible && me.floating) {
                    Ext.fly(cell.firstChild).focus(50);
                }
            }
            // disabling
            if(value < min) {
                cell.className = disabledCls;
                cell.title = me.minText;
                return;
            }
            if(value > max) {
                cell.className = disabledCls;
                cell.title = me.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(current.getDay()) != -1){
                    cell.title = ddaysText;
                    cell.className = disabledCls;
                }
            }
            if(ddMatch && format){
                formatValue = eDate.dateFormat(current, format);
                if(ddMatch.test(formatValue)){
                    cell.title = ddText.replace('%0', formatValue);
                    cell.className = disabledCls;
                }
            }
        };

        for(; i < me.numDays; ++i) {
            if (i < startingPos) {
                html = (++prevStart);
                cls = me.prevCls;
            } else if (i >= days) {
                html = (++extraDays);
                cls = me.nextCls;
            } else {
                html = i - startingPos + 1;
                cls = me.activeCls;
            }
            textNodes[i].innerHTML = html;
            cells[i].className = cls;
            current.setDate(current.getDate() + 1);
            setCellClass(cells[i]);
        }

        me.monthBtn.setText(me.monthNames[date.getMonth()] + ' ' + date.getFullYear());
    },

    /**
     * Update the contents of the picker
     * @private
     * @param {Date} date The new date
     * @param {Boolean} forceRefresh True to force a full refresh
     */
    update : function(date, forceRefresh){
        var me = this,
            active = me.activeDate;

        if (me.rendered) {
            me.activeDate = date;
            if(!forceRefresh && active && me.el && active.getMonth() == date.getMonth() && active.getFullYear() == date.getFullYear()){
                me.selectedUpdate(date, active);
            } else {
                me.fullUpdate(date, active);
            }
        }
        return me;
    },

    // private, inherit docs
    beforeDestroy : function() {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.todayKeyListener,
                me.keyNav,
                me.monthPicker,
                me.monthBtn,
                me.nextRepeater,
                me.prevRepeater,
                me.todayBtn
            );
            delete me.textNodes;
            delete me.cells.elements;
        }
        me.callParent();
    },

    // private, inherit docs
    onShow: function() {
        this.callParent(arguments);
        if (this.focusOnShow) {
            this.focus();
        }
    }
},

// After dependencies have loaded:
function() {
    var proto = this.prototype;

    proto.monthNames = Ext.Date.monthNames;

    proto.dayNames = Ext.Date.dayNames;

    proto.format = Ext.Date.defaultFormat;
});

