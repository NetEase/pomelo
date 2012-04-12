/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Slider which supports vertical or horizontal orientation, keyboard adjustments, configurable snapping, axis clicking
 * and animation. Can be added as an item to any container.
 *
 * Sliders can be created with more than one thumb handle by passing an array of values instead of a single one:
 *
 *     @example
 *     Ext.create('Ext.slider.Multi', {
 *         width: 200,
 *         values: [25, 50, 75],
 *         increment: 5,
 *         minValue: 0,
 *         maxValue: 100,
 *
 *         // this defaults to true, setting to false allows the thumbs to pass each other
 *         constrainThumbs: false,
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.slider.Multi', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.multislider',
    alternateClassName: 'Ext.slider.MultiSlider',

    requires: [
        'Ext.slider.Thumb',
        'Ext.slider.Tip',
        'Ext.Number',
        'Ext.util.Format',
        'Ext.Template',
        'Ext.layout.component.field.Slider'
    ],

    // note: {id} here is really {inputId}, but {cmpId} is available
    fieldSubTpl: [
        '<div id="{id}" class="' + Ext.baseCSSPrefix + 'slider {fieldCls} {vertical}" aria-valuemin="{minValue}" aria-valuemax="{maxValue}" aria-valuenow="{value}" aria-valuetext="{value}">',
            '<div id="{cmpId}-endEl" class="' + Ext.baseCSSPrefix + 'slider-end" role="presentation">',
                '<div id="{cmpId}-innerEl" class="' + Ext.baseCSSPrefix + 'slider-inner" role="presentation">',
                    '<a id="{cmpId}-focusEl" class="' + Ext.baseCSSPrefix + 'slider-focus" href="#" tabIndex="-1" hidefocus="on" role="presentation"></a>',
                '</div>',
            '</div>',
        '</div>',
        {
            disableFormats: true,
            compiled: true
        }
    ],

    /**
     * @cfg {Number} value
     * A value with which to initialize the slider. Defaults to minValue. Setting this will only result in the creation
     * of a single slider thumb; if you want multiple thumbs then use the {@link #values} config instead.
     */

    /**
     * @cfg {Number[]} values
     * Array of Number values with which to initalize the slider. A separate slider thumb will be created for each value
     * in this array. This will take precedence over the single {@link #value} config.
     */

    /**
     * @cfg {Boolean} vertical
     * Orient the Slider vertically rather than horizontally.
     */
    vertical: false,

    /**
     * @cfg {Number} minValue
     * The minimum value for the Slider.
     */
    minValue: 0,

    /**
     * @cfg {Number} maxValue
     * The maximum value for the Slider.
     */
    maxValue: 100,

    /**
     * @cfg {Number/Boolean} decimalPrecision The number of decimal places to which to round the Slider's value.
     *
     * To disable rounding, configure as **false**.
     */
    decimalPrecision: 0,

    /**
     * @cfg {Number} keyIncrement
     * How many units to change the Slider when adjusting with keyboard navigation. If the increment
     * config is larger, it will be used instead.
     */
    keyIncrement: 1,

    /**
     * @cfg {Number} increment
     * How many units to change the slider when adjusting by drag and drop. Use this option to enable 'snapping'.
     */
    increment: 0,

    /**
     * @private
     * @property {Number[]} clickRange
     * Determines whether or not a click to the slider component is considered to be a user request to change the value. Specified as an array of [top, bottom],
     * the click event's 'top' property is compared to these numbers and the click only considered a change request if it falls within them. e.g. if the 'top'
     * value of the click event is 4 or 16, the click is not considered a change request as it falls outside of the [5, 15] range
     */
    clickRange: [5,15],

    /**
     * @cfg {Boolean} clickToChange
     * Determines whether or not clicking on the Slider axis will change the slider.
     */
    clickToChange : true,

    /**
     * @cfg {Boolean} animate
     * Turn on or off animation.
     */
    animate: true,

    /**
     * @property {Boolean} dragging
     * True while the thumb is in a drag operation
     */
    dragging: false,

    /**
     * @cfg {Boolean} constrainThumbs
     * True to disallow thumbs from overlapping one another.
     */
    constrainThumbs: true,

    componentLayout: 'sliderfield',

    /**
     * @cfg {Boolean} useTips
     * True to use an Ext.slider.Tip to display tips for the value.
     */
    useTips : true,

    /**
     * @cfg {Function} tipText
     * A function used to display custom text for the slider tip. Defaults to null, which will use the default on the
     * plugin.
     */
    tipText : null,

    ariaRole: 'slider',

    // private override
    initValue: function() {
        var me = this,
            extValue = Ext.value,
            // Fallback for initial values: values config -> value config -> minValue config -> 0
            values = extValue(me.values, [extValue(me.value, extValue(me.minValue, 0))]),
            i = 0,
            len = values.length;

        // Store for use in dirty check
        me.originalValue = values;

        // Add a thumb for each value
        for (; i < len; i++) {
            me.addThumb(values[i]);
        }
    },

    // private override
    initComponent : function() {
        var me = this,
            tipPlug,
            hasTip;

        /**
         * @property {Array} thumbs
         * Array containing references to each thumb
         */
        me.thumbs = [];

        me.keyIncrement = Math.max(me.increment, me.keyIncrement);

        me.addEvents(
            /**
             * @event beforechange
             * Fires before the slider value is changed. By returning false from an event handler, you can cancel the
             * event and prevent the slider from changing.
             * @param {Ext.slider.Multi} slider The slider
             * @param {Number} newValue The new value which the slider is being changed to.
             * @param {Number} oldValue The old value which the slider was previously.
             */
            'beforechange',

            /**
             * @event change
             * Fires when the slider value is changed.
             * @param {Ext.slider.Multi} slider The slider
             * @param {Number} newValue The new value which the slider has been changed to.
             * @param {Ext.slider.Thumb} thumb The thumb that was changed
             */
            'change',

            /**
             * @event changecomplete
             * Fires when the slider value is changed by the user and any drag operations have completed.
             * @param {Ext.slider.Multi} slider The slider
             * @param {Number} newValue The new value which the slider has been changed to.
             * @param {Ext.slider.Thumb} thumb The thumb that was changed
             */
            'changecomplete',

            /**
             * @event dragstart
             * Fires after a drag operation has started.
             * @param {Ext.slider.Multi} slider The slider
             * @param {Ext.EventObject} e The event fired from Ext.dd.DragTracker
             */
            'dragstart',

            /**
             * @event drag
             * Fires continuously during the drag operation while the mouse is moving.
             * @param {Ext.slider.Multi} slider The slider
             * @param {Ext.EventObject} e The event fired from Ext.dd.DragTracker
             */
            'drag',

            /**
             * @event dragend
             * Fires after the drag operation has completed.
             * @param {Ext.slider.Multi} slider The slider
             * @param {Ext.EventObject} e The event fired from Ext.dd.DragTracker
             */
            'dragend'
        );

        if (me.vertical) {
            Ext.apply(me, Ext.slider.Multi.Vertical);
        }

        me.callParent();

        // only can use it if it exists.
        if (me.useTips) {
            tipPlug = me.tipText ? {getText: me.tipText} : {};
            me.plugins = me.plugins || [];
            Ext.each(me.plugins, function(plug){
                if (plug.isSliderTip) {
                    hasTip = true;
                    return false;
                }
            });
            if (!hasTip) {
                me.plugins.push(Ext.create('Ext.slider.Tip', tipPlug));
            }
        }
    },

    /**
     * Creates a new thumb and adds it to the slider
     * @param {Number} value The initial value to set on the thumb. Defaults to 0
     * @return {Ext.slider.Thumb} The thumb
     */
    addThumb: function(value) {
        var me = this,
            thumb = Ext.create('Ext.slider.Thumb', {
            value    : value,
            slider   : me,
            index    : me.thumbs.length,
            constrain: me.constrainThumbs
        });
        me.thumbs.push(thumb);

        //render the thumb now if needed
        if (me.rendered) {
            thumb.render();
        }

        return thumb;
    },

    /**
     * @private
     * Moves the given thumb above all other by increasing its z-index. This is called when as drag
     * any thumb, so that the thumb that was just dragged is always at the highest z-index. This is
     * required when the thumbs are stacked on top of each other at one of the ends of the slider's
     * range, which can result in the user not being able to move any of them.
     * @param {Ext.slider.Thumb} topThumb The thumb to move to the top
     */
    promoteThumb: function(topThumb) {
        var thumbs = this.thumbs,
            ln = thumbs.length,
            zIndex, thumb, i;

        for (i = 0; i < ln; i++) {
            thumb = thumbs[i];

            if (thumb == topThumb) {
                thumb.bringToFront();
            } else {
                thumb.sendToBack();
            }
        }
    },

    // private override
    onRender : function() {
        var me = this,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            thumb;

        Ext.applyIf(me.subTplData, {
            vertical: me.vertical ? Ext.baseCSSPrefix + 'slider-vert' : Ext.baseCSSPrefix + 'slider-horz',
            minValue: me.minValue,
            maxValue: me.maxValue,
            value: me.value
        });

        me.addChildEls('endEl', 'innerEl', 'focusEl');

        me.callParent(arguments);

        //render each thumb
        for (; i < len; i++) {
            thumbs[i].render();
        }

        //calculate the size of half a thumb
        thumb = me.innerEl.down('.' + Ext.baseCSSPrefix + 'slider-thumb');
        me.halfThumb = (me.vertical ? thumb.getHeight() : thumb.getWidth()) / 2;

    },

    /**
     * Utility method to set the value of the field when the slider changes.
     * @param {Object} slider The slider object.
     * @param {Object} v The new value.
     * @private
     */
    onChange : function(slider, v) {
        this.setValue(v, undefined, true);
    },

    /**
     * @private
     * Adds keyboard and mouse listeners on this.el. Ignores click events on the internal focus element.
     */
    initEvents : function() {
        var me = this;

        me.mon(me.el, {
            scope    : me,
            mousedown: me.onMouseDown,
            keydown  : me.onKeyDown,
            change : me.onChange
        });

        me.focusEl.swallowEvent("click", true);
    },

    /**
     * @private
     * Mousedown handler for the slider. If the clickToChange is enabled and the click was not on the draggable 'thumb',
     * this calculates the new value of the slider and tells the implementation (Horizontal or Vertical) to move the thumb
     * @param {Ext.EventObject} e The click event
     */
    onMouseDown : function(e) {
        var me = this,
            thumbClicked = false,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            local;

        if (me.disabled) {
            return;
        }

        //see if the click was on any of the thumbs
        for (; i < len; i++) {
            thumbClicked = thumbClicked || e.target == thumbs[i].el.dom;
        }

        if (me.clickToChange && !thumbClicked) {
            local = me.innerEl.translatePoints(e.getXY());
            me.onClickChange(local);
        }
        me.focus();
    },

    /**
     * @private
     * Moves the thumb to the indicated position. Note that a Vertical implementation is provided in Ext.slider.Multi.Vertical.
     * Only changes the value if the click was within this.clickRange.
     * @param {Object} local Object containing top and left values for the click event.
     */
    onClickChange : function(local) {
        var me = this,
            thumb, index;

        if (local.top > me.clickRange[0] && local.top < me.clickRange[1]) {
            //find the nearest thumb to the click event
            thumb = me.getNearest(local, 'left');
            if (!thumb.disabled) {
                index = thumb.index;
                me.setValue(index, Ext.util.Format.round(me.reverseValue(local.left), me.decimalPrecision), undefined, true);
            }
        }
    },

    /**
     * @private
     * Returns the nearest thumb to a click event, along with its distance
     * @param {Object} local Object containing top and left values from a click event
     * @param {String} prop The property of local to compare on. Use 'left' for horizontal sliders, 'top' for vertical ones
     * @return {Object} The closest thumb object and its distance from the click event
     */
    getNearest: function(local, prop) {
        var me = this,
            localValue = prop == 'top' ? me.innerEl.getHeight() - local[prop] : local[prop],
            clickValue = me.reverseValue(localValue),
            nearestDistance = (me.maxValue - me.minValue) + 5, //add a small fudge for the end of the slider
            index = 0,
            nearest = null,
            thumbs = me.thumbs,
            i = 0,
            len = thumbs.length,
            thumb,
            value,
            dist;

        for (; i < len; i++) {
            thumb = me.thumbs[i];
            value = thumb.value;
            dist  = Math.abs(value - clickValue);

            if (Math.abs(dist <= nearestDistance)) {
                nearest = thumb;
                index = i;
                nearestDistance = dist;
            }
        }
        return nearest;
    },

    /**
     * @private
     * Handler for any keypresses captured by the slider. If the key is UP or RIGHT, the thumb is moved along to the right
     * by this.keyIncrement. If DOWN or LEFT it is moved left. Pressing CTRL moves the slider to the end in either direction
     * @param {Ext.EventObject} e The Event object
     */
    onKeyDown : function(e) {
        /*
         * The behaviour for keyboard handling with multiple thumbs is currently undefined.
         * There's no real sane default for it, so leave it like this until we come up
         * with a better way of doing it.
         */
        var me = this,
            k,
            val;

        if(me.disabled || me.thumbs.length !== 1) {
            e.preventDefault();
            return;
        }
        k = e.getKey();

        switch(k) {
            case e.UP:
            case e.RIGHT:
                e.stopEvent();
                val = e.ctrlKey ? me.maxValue : me.getValue(0) + me.keyIncrement;
                me.setValue(0, val, undefined, true);
            break;
            case e.DOWN:
            case e.LEFT:
                e.stopEvent();
                val = e.ctrlKey ? me.minValue : me.getValue(0) - me.keyIncrement;
                me.setValue(0, val, undefined, true);
            break;
            default:
                e.preventDefault();
        }
    },

    // private
    afterRender : function() {
        var me = this,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            thumb,
            v;

        me.callParent(arguments);

        for (; i < len; i++) {
            thumb = thumbs[i];

            if (thumb.value !== undefined) {
                v = me.normalizeValue(thumb.value);
                if (v !== thumb.value) {
                    // delete this.value;
                    me.setValue(i, v, false);
                } else {
                    thumb.move(me.translateValue(v), false);
                }
            }
        }
    },

    /**
     * @private
     * Returns the ratio of pixels to mapped values. e.g. if the slider is 200px wide and maxValue - minValue is 100,
     * the ratio is 2
     * @return {Number} The ratio of pixels to mapped values
     */
    getRatio : function() {
        var w = this.innerEl.getWidth(),
            v = this.maxValue - this.minValue;
        return v === 0 ? w : (w/v);
    },

    /**
     * @private
     * Returns a snapped, constrained value when given a desired value
     * @param {Number} value Raw number value
     * @return {Number} The raw value rounded to the correct d.p. and constrained within the set max and min values
     */
    normalizeValue : function(v) {
        var me = this;

        v = Ext.Number.snap(v, this.increment, this.minValue, this.maxValue);
        v = Ext.util.Format.round(v, me.decimalPrecision);
        v = Ext.Number.constrain(v, me.minValue, me.maxValue);
        return v;
    },

    /**
     * Sets the minimum value for the slider instance. If the current value is less than the minimum value, the current
     * value will be changed.
     * @param {Number} val The new minimum value
     */
    setMinValue : function(val) {
        var me = this,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            t;

        me.minValue = val;
        if (me.rendered) {
            me.inputEl.dom.setAttribute('aria-valuemin', val);
        }

        for (; i < len; ++i) {
            t = thumbs[i];
            t.value = t.value < val ? val : t.value;
        }
        me.syncThumbs();
    },

    /**
     * Sets the maximum value for the slider instance. If the current value is more than the maximum value, the current
     * value will be changed.
     * @param {Number} val The new maximum value
     */
    setMaxValue : function(val) {
        var me = this,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            t;

        me.maxValue = val;
        if (me.rendered) {
            me.inputEl.dom.setAttribute('aria-valuemax', val);
        }

        for (; i < len; ++i) {
            t = thumbs[i];
            t.value = t.value > val ? val : t.value;
        }
        me.syncThumbs();
    },

    /**
     * Programmatically sets the value of the Slider. Ensures that the value is constrained within the minValue and
     * maxValue.
     * @param {Number} index Index of the thumb to move
     * @param {Number} value The value to set the slider to. (This will be constrained within minValue and maxValue)
     * @param {Boolean} [animate=true] Turn on or off animation
     */
    setValue : function(index, value, animate, changeComplete) {
        var me = this,
            thumb = me.thumbs[index];

        // ensures value is contstrained and snapped
        value = me.normalizeValue(value);

        if (value !== thumb.value && me.fireEvent('beforechange', me, value, thumb.value, thumb) !== false) {
            thumb.value = value;
            if (me.rendered) {
                // TODO this only handles a single value; need a solution for exposing multiple values to aria.
                // Perhaps this should go on each thumb element rather than the outer element.
                me.inputEl.set({
                    'aria-valuenow': value,
                    'aria-valuetext': value
                });

                thumb.move(me.translateValue(value), Ext.isDefined(animate) ? animate !== false : me.animate);

                me.fireEvent('change', me, value, thumb);
                if (changeComplete) {
                    me.fireEvent('changecomplete', me, value, thumb);
                }
            }
        }
    },

    /**
     * @private
     */
    translateValue : function(v) {
        var ratio = this.getRatio();
        return (v * ratio) - (this.minValue * ratio) - this.halfThumb;
    },

    /**
     * @private
     * Given a pixel location along the slider, returns the mapped slider value for that pixel.
     * E.g. if we have a slider 200px wide with minValue = 100 and maxValue = 500, reverseValue(50)
     * returns 200
     * @param {Number} pos The position along the slider to return a mapped value for
     * @return {Number} The mapped value for the given position
     */
    reverseValue : function(pos) {
        var ratio = this.getRatio();
        return (pos + (this.minValue * ratio)) / ratio;
    },

    // private
    focus : function() {
        this.focusEl.focus(10);
    },

    //private
    onDisable: function() {
        var me = this,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            thumb,
            el,
            xy;

        me.callParent();

        for (; i < len; i++) {
            thumb = thumbs[i];
            el = thumb.el;

            thumb.disable();

            if(Ext.isIE) {
                //IE breaks when using overflow visible and opacity other than 1.
                //Create a place holder for the thumb and display it.
                xy = el.getXY();
                el.hide();

                me.innerEl.addCls(me.disabledCls).dom.disabled = true;

                if (!me.thumbHolder) {
                    me.thumbHolder = me.endEl.createChild({cls: Ext.baseCSSPrefix + 'slider-thumb ' + me.disabledCls});
                }

                me.thumbHolder.show().setXY(xy);
            }
        }
    },

    //private
    onEnable: function() {
        var me = this,
            i = 0,
            thumbs = me.thumbs,
            len = thumbs.length,
            thumb,
            el;

        this.callParent();

        for (; i < len; i++) {
            thumb = thumbs[i];
            el = thumb.el;

            thumb.enable();

            if (Ext.isIE) {
                me.innerEl.removeCls(me.disabledCls).dom.disabled = false;

                if (me.thumbHolder) {
                    me.thumbHolder.hide();
                }

                el.show();
                me.syncThumbs();
            }
        }
    },

    /**
     * Synchronizes thumbs position to the proper proportion of the total component width based on the current slider
     * {@link #value}. This will be called automatically when the Slider is resized by a layout, but if it is rendered
     * auto width, this method can be called from another resize handler to sync the Slider if necessary.
     */
    syncThumbs : function() {
        if (this.rendered) {
            var thumbs = this.thumbs,
                length = thumbs.length,
                i = 0;

            for (; i < length; i++) {
                thumbs[i].move(this.translateValue(thumbs[i].value));
            }
        }
    },

    /**
     * Returns the current value of the slider
     * @param {Number} index The index of the thumb to return a value for
     * @return {Number/Number[]} The current value of the slider at the given index, or an array of all thumb values if
     * no index is given.
     */
    getValue : function(index) {
        return Ext.isNumber(index) ? this.thumbs[index].value : this.getValues();
    },

    /**
     * Returns an array of values - one for the location of each thumb
     * @return {Number[]} The set of thumb values
     */
    getValues: function() {
        var values = [],
            i = 0,
            thumbs = this.thumbs,
            len = thumbs.length;

        for (; i < len; i++) {
            values.push(thumbs[i].value);
        }

        return values;
    },

    getSubmitValue: function() {
        var me = this;
        return (me.disabled || !me.submitValue) ? null : me.getValue();
    },

    reset: function() {
        var me = this,
            Array = Ext.Array;
        Array.forEach(Array.from(me.originalValue), function(val, i) {
            me.setValue(i, val);
        });
        me.clearInvalid();
        // delete here so we reset back to the original state
        delete me.wasValid;
    },

    // private
    beforeDestroy : function() {
        var me = this;

        Ext.destroy(me.innerEl, me.endEl, me.focusEl);
        Ext.each(me.thumbs, function(thumb) {
            Ext.destroy(thumb);
        }, me);

        me.callParent();
    },

    statics: {
        // Method overrides to support slider with vertical orientation
        Vertical: {
            getRatio : function() {
                var h = this.innerEl.getHeight(),
                    v = this.maxValue - this.minValue;
                return h/v;
            },

            onClickChange : function(local) {
                var me = this,
                    thumb, index, bottom;

                if (local.left > me.clickRange[0] && local.left < me.clickRange[1]) {
                    thumb = me.getNearest(local, 'top');
                    if (!thumb.disabled) {
                        index = thumb.index;
                        bottom =  me.reverseValue(me.innerEl.getHeight() - local.top);

                        me.setValue(index, Ext.util.Format.round(me.minValue + bottom, me.decimalPrecision), undefined, true);
                    }
                }
            }
        }
    }
});

