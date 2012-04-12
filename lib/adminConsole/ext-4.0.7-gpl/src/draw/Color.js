/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Represents an RGB color and provides helper functions get
 * color components in HSL color space.
 */
Ext.define('Ext.draw.Color', {

    /* Begin Definitions */

    /* End Definitions */

    colorToHexRe: /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/,
    rgbRe: /\s*rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)\s*/,
    hexRe: /\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/,

    /**
     * @cfg {Number} lightnessFactor
     *
     * The default factor to compute the lighter or darker color. Defaults to 0.2.
     */
    lightnessFactor: 0.2,

    /**
     * Creates new Color.
     * @param {Number} red Red component (0..255)
     * @param {Number} green Green component (0..255)
     * @param {Number} blue Blue component (0..255)
     */
    constructor : function(red, green, blue) {
        var me = this,
            clamp = Ext.Number.constrain;
        me.r = clamp(red, 0, 255);
        me.g = clamp(green, 0, 255);
        me.b = clamp(blue, 0, 255);
    },

    /**
     * Get the red component of the color, in the range 0..255.
     * @return {Number}
     */
    getRed: function() {
        return this.r;
    },

    /**
     * Get the green component of the color, in the range 0..255.
     * @return {Number}
     */
    getGreen: function() {
        return this.g;
    },

    /**
     * Get the blue component of the color, in the range 0..255.
     * @return {Number}
     */
    getBlue: function() {
        return this.b;
    },

    /**
     * Get the RGB values.
     * @return {Number[]}
     */
    getRGB: function() {
        var me = this;
        return [me.r, me.g, me.b];
    },

    /**
     * Get the equivalent HSL components of the color.
     * @return {Number[]}
     */
    getHSL: function() {
        var me = this,
            r = me.r / 255,
            g = me.g / 255,
            b = me.b / 255,
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            delta = max - min,
            h,
            s = 0,
            l = 0.5 * (max + min);

        // min==max means achromatic (hue is undefined)
        if (min != max) {
            s = (l < 0.5) ? delta / (max + min) : delta / (2 - max - min);
            if (r == max) {
                h = 60 * (g - b) / delta;
            } else if (g == max) {
                h = 120 + 60 * (b - r) / delta;
            } else {
                h = 240 + 60 * (r - g) / delta;
            }
            if (h < 0) {
                h += 360;
            }
            if (h >= 360) {
                h -= 360;
            }
        }
        return [h, s, l];
    },

    /**
     * Return a new color that is lighter than this color.
     * @param {Number} factor Lighter factor (0..1), default to 0.2
     * @return Ext.draw.Color
     */
    getLighter: function(factor) {
        var hsl = this.getHSL();
        factor = factor || this.lightnessFactor;
        hsl[2] = Ext.Number.constrain(hsl[2] + factor, 0, 1);
        return this.fromHSL(hsl[0], hsl[1], hsl[2]);
    },

    /**
     * Return a new color that is darker than this color.
     * @param {Number} factor Darker factor (0..1), default to 0.2
     * @return Ext.draw.Color
     */
    getDarker: function(factor) {
        factor = factor || this.lightnessFactor;
        return this.getLighter(-factor);
    },

    /**
     * Return the color in the hex format, i.e. '#rrggbb'.
     * @return {String}
     */
    toString: function() {
        var me = this,
            round = Math.round,
            r = round(me.r).toString(16),
            g = round(me.g).toString(16),
            b = round(me.b).toString(16);
        r = (r.length == 1) ? '0' + r : r;
        g = (g.length == 1) ? '0' + g : g;
        b = (b.length == 1) ? '0' + b : b;
        return ['#', r, g, b].join('');
    },

    /**
     * Convert a color to hexadecimal format.
     *
     * **Note:** This method is both static and instance.
     *
     * @param {String/String[]} color The color value (i.e 'rgb(255, 255, 255)', 'color: #ffffff').
     * Can also be an Array, in this case the function handles the first member.
     * @returns {String} The color in hexadecimal format.
     * @static
     */
    toHex: function(color) {
        if (Ext.isArray(color)) {
            color = color[0];
        }
        if (!Ext.isString(color)) {
            return '';
        }
        if (color.substr(0, 1) === '#') {
            return color;
        }
        var digits = this.colorToHexRe.exec(color);

        if (Ext.isArray(digits)) {
            var red = parseInt(digits[2], 10),
                green = parseInt(digits[3], 10),
                blue = parseInt(digits[4], 10),
                rgb = blue | (green << 8) | (red << 16);
            return digits[1] + '#' + ("000000" + rgb.toString(16)).slice(-6);
        }
        else {
            return '';
        }
    },

    /**
     * Parse the string and create a new color.
     *
     * Supported formats: '#rrggbb', '#rgb', and 'rgb(r,g,b)'.
     *
     * If the string is not recognized, an undefined will be returned instead.
     *
     * **Note:** This method is both static and instance.
     *
     * @param {String} str Color in string.
     * @returns Ext.draw.Color
     * @static
     */
    fromString: function(str) {
        var values, r, g, b,
            parse = parseInt;

        if ((str.length == 4 || str.length == 7) && str.substr(0, 1) === '#') {
            values = str.match(this.hexRe);
            if (values) {
                r = parse(values[1], 16) >> 0;
                g = parse(values[2], 16) >> 0;
                b = parse(values[3], 16) >> 0;
                if (str.length == 4) {
                    r += (r * 16);
                    g += (g * 16);
                    b += (b * 16);
                }
            }
        }
        else {
            values = str.match(this.rgbRe);
            if (values) {
                r = values[1];
                g = values[2];
                b = values[3];
            }
        }

        return (typeof r == 'undefined') ? undefined : Ext.create('Ext.draw.Color', r, g, b);
    },

    /**
     * Returns the gray value (0 to 255) of the color.
     *
     * The gray value is calculated using the formula r*0.3 + g*0.59 + b*0.11.
     *
     * @returns {Number}
     */
    getGrayscale: function() {
        // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
        return this.r * 0.3 + this.g * 0.59 + this.b * 0.11;
    },

    /**
     * Create a new color based on the specified HSL values.
     *
     * **Note:** This method is both static and instance.
     *
     * @param {Number} h Hue component (0..359)
     * @param {Number} s Saturation component (0..1)
     * @param {Number} l Lightness component (0..1)
     * @returns Ext.draw.Color
     * @static
     */
    fromHSL: function(h, s, l) {
        var C, X, m, i, rgb = [],
            abs = Math.abs,
            floor = Math.floor;

        if (s == 0 || h == null) {
            // achromatic
            rgb = [l, l, l];
        }
        else {
            // http://en.wikipedia.org/wiki/HSL_and_HSV#From_HSL
            // C is the chroma
            // X is the second largest component
            // m is the lightness adjustment
            h /= 60;
            C = s * (1 - abs(2 * l - 1));
            X = C * (1 - abs(h - 2 * floor(h / 2) - 1));
            m = l - C / 2;
            switch (floor(h)) {
                case 0:
                    rgb = [C, X, 0];
                    break;
                case 1:
                    rgb = [X, C, 0];
                    break;
                case 2:
                    rgb = [0, C, X];
                    break;
                case 3:
                    rgb = [0, X, C];
                    break;
                case 4:
                    rgb = [X, 0, C];
                    break;
                case 5:
                    rgb = [C, 0, X];
                    break;
            }
            rgb = [rgb[0] + m, rgb[1] + m, rgb[2] + m];
        }
        return Ext.create('Ext.draw.Color', rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);
    }
}, function() {
    var prototype = this.prototype;

    //These functions are both static and instance. TODO: find a more elegant way of copying them
    this.addStatics({
        fromHSL: function() {
            return prototype.fromHSL.apply(prototype, arguments);
        },
        fromString: function() {
            return prototype.fromString.apply(prototype, arguments);
        },
        toHex: function() {
            return prototype.toHex.apply(prototype, arguments);
        }
    });
});

