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
 *     @example
 *     Ext.create('Ext.slider.Single', {
 *         width: 200,
 *         value: 50,
 *         increment: 10,
 *         minValue: 0,
 *         maxValue: 100,
 *         renderTo: Ext.getBody()
 *     });
 *
 * The class Ext.slider.Single is aliased to Ext.Slider for backwards compatibility.
 */
Ext.define('Ext.slider.Single', {
    extend: 'Ext.slider.Multi',
    alias: ['widget.slider', 'widget.sliderfield'],
    alternateClassName: ['Ext.Slider', 'Ext.form.SliderField', 'Ext.slider.SingleSlider', 'Ext.slider.Slider'],

    /**
     * Returns the current value of the slider
     * @return {Number} The current value of the slider
     */
    getValue: function() {
        // just returns the value of the first thumb, which should be the only one in a single slider
        return this.callParent([0]);
    },

    /**
     * Programmatically sets the value of the Slider. Ensures that the value is constrained within the minValue and
     * maxValue.
     * @param {Number} value The value to set the slider to. (This will be constrained within minValue and maxValue)
     * @param {Boolean} [animate] Turn on or off animation
     */
    setValue: function(value, animate) {
        var args = Ext.toArray(arguments),
            len  = args.length;

        // this is to maintain backwards compatiblity for sliders with only one thunb. Usually you must pass the thumb
        // index to setValue, but if we only have one thumb we inject the index here first if given the multi-slider
        // signature without the required index. The index will always be 0 for a single slider
        if (len == 1 || (len <= 3 && typeof arguments[1] != 'number')) {
            args.unshift(0);
        }

        return this.callParent(args);
    },

    // private
    getNearest : function(){
        // Since there's only 1 thumb, it's always the nearest
        return this.thumbs[0];
    }
});

