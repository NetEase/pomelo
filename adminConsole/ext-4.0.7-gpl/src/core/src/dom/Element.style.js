/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Element
 */
(function(){
    // local style camelizing for speed
    var ELEMENT = Ext.Element,
        supports = Ext.supports,
        view = document.defaultView,
        opacityRe = /alpha\(opacity=(.*)\)/i,
        trimRe = /^\s+|\s+$/g,
        spacesRe = /\s+/,
        wordsRe = /\w/g,
        adjustDirect2DTableRe = /table-row|table-.*-group/,
        INTERNAL = '_internal',
        PADDING = 'padding',
        MARGIN = 'margin',
        BORDER = 'border',
        LEFT = '-left',
        RIGHT = '-right',
        TOP = '-top',
        BOTTOM = '-bottom',
        WIDTH = '-width',
        MATH = Math,
        HIDDEN = 'hidden',
        ISCLIPPED = 'isClipped',
        OVERFLOW = 'overflow',
        OVERFLOWX = 'overflow-x',
        OVERFLOWY = 'overflow-y',
        ORIGINALCLIP = 'originalClip',
        // special markup used throughout Ext when box wrapping elements
        borders = {l: BORDER + LEFT + WIDTH, r: BORDER + RIGHT + WIDTH, t: BORDER + TOP + WIDTH, b: BORDER + BOTTOM + WIDTH},
        paddings = {l: PADDING + LEFT, r: PADDING + RIGHT, t: PADDING + TOP, b: PADDING + BOTTOM},
        margins = {l: MARGIN + LEFT, r: MARGIN + RIGHT, t: MARGIN + TOP, b: MARGIN + BOTTOM},
        data = ELEMENT.data;

    ELEMENT.boxMarkup = '<div class="{0}-tl"><div class="{0}-tr"><div class="{0}-tc"></div></div></div><div class="{0}-ml"><div class="{0}-mr"><div class="{0}-mc"></div></div></div><div class="{0}-bl"><div class="{0}-br"><div class="{0}-bc"></div></div></div>';

    // These property values are read from the parentNode if they cannot be read
    // from the child:
    ELEMENT.inheritedProps = {
        fontSize: 1,
        fontStyle: 1,
        opacity: 1
    };

    Ext.override(ELEMENT, {

        /**
         * TODO: Look at this
         */
        // private  ==> used by Fx
        adjustWidth : function(width) {
            var me = this,
                isNum = (typeof width == 'number');

            if(isNum && me.autoBoxAdjust && !me.isBorderBox()){
               width -= (me.getBorderWidth("lr") + me.getPadding("lr"));
            }
            return (isNum && width < 0) ? 0 : width;
        },

        // private   ==> used by Fx
        adjustHeight : function(height) {
            var me = this,
                isNum = (typeof height == "number");

            if(isNum && me.autoBoxAdjust && !me.isBorderBox()){
               height -= (me.getBorderWidth("tb") + me.getPadding("tb"));
            }
            return (isNum && height < 0) ? 0 : height;
        },


        /**
         * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
         * @param {String/String[]} className The CSS classes to add separated by space, or an array of classes
         * @return {Ext.Element} this
         */
        addCls : function(className){
            var me = this,
                cls = [],
                space = ((me.dom.className.replace(trimRe, '') == '') ? "" : " "),
                i, len, v;
            if (className === undefined) {
                return me;
            }
            // Separate case is for speed
            if (Object.prototype.toString.call(className) !== '[object Array]') {
                if (typeof className === 'string') {
                    className = className.replace(trimRe, '').split(spacesRe);
                    if (className.length === 1) {
                        className = className[0];
                        if (!me.hasCls(className)) {
                            me.dom.className += space + className;
                        }
                    } else {
                        this.addCls(className);
                    }
                }
            } else {
                for (i = 0, len = className.length; i < len; i++) {
                    v = className[i];
                    if (typeof v == 'string' && (' ' + me.dom.className + ' ').indexOf(' ' + v + ' ') == -1) {
                        cls.push(v);
                    }
                }
                if (cls.length) {
                    me.dom.className += space + cls.join(" ");
                }
            }
            return me;
        },

        /**
         * Removes one or more CSS classes from the element.
         * @param {String/String[]} className The CSS classes to remove separated by space, or an array of classes
         * @return {Ext.Element} this
         */
        removeCls : function(className){
            var me = this,
                i, idx, len, cls, elClasses;
            if (className === undefined) {
                return me;
            }
            if (Object.prototype.toString.call(className) !== '[object Array]') {
                className = className.replace(trimRe, '').split(spacesRe);
            }
            if (me.dom && me.dom.className) {
                elClasses = me.dom.className.replace(trimRe, '').split(spacesRe);
                for (i = 0, len = className.length; i < len; i++) {
                    cls = className[i];
                    if (typeof cls == 'string') {
                        cls = cls.replace(trimRe, '');
                        idx = Ext.Array.indexOf(elClasses, cls);
                        if (idx != -1) {
                            Ext.Array.erase(elClasses, idx, 1);
                        }
                    }
                }
                me.dom.className = elClasses.join(" ");
            }
            return me;
        },

        /**
         * Adds one or more CSS classes to this element and removes the same class(es) from all siblings.
         * @param {String/String[]} className The CSS class to add, or an array of classes
         * @return {Ext.Element} this
         */
        radioCls : function(className){
            var cn = this.dom.parentNode.childNodes,
                v, i, len;
            className = Ext.isArray(className) ? className : [className];
            for (i = 0, len = cn.length; i < len; i++) {
                v = cn[i];
                if (v && v.nodeType == 1) {
                    Ext.fly(v, '_internal').removeCls(className);
                }
            }
            return this.addCls(className);
        },

        /**
         * Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it).
         * @param {String} className The CSS class to toggle
         * @return {Ext.Element} this
         * @method
         */
        toggleCls : Ext.supports.ClassList ?
            function(className) {
                this.dom.classList.toggle(Ext.String.trim(className));
                return this;
            } :
            function(className) {
                return this.hasCls(className) ? this.removeCls(className) : this.addCls(className);
            },

        /**
         * Checks if the specified CSS class exists on this element's DOM node.
         * @param {String} className The CSS class to check for
         * @return {Boolean} True if the class exists, else false
         * @method
         */
        hasCls : Ext.supports.ClassList ?
            function(className) {
                if (!className) {
                    return false;
                }
                className = className.split(spacesRe);
                var ln = className.length,
                    i = 0;
                for (; i < ln; i++) {
                    if (className[i] && this.dom.classList.contains(className[i])) {
                        return true;
                    }
                }
                return false;
            } :
            function(className){
                return className && (' ' + this.dom.className + ' ').indexOf(' ' + className + ' ') != -1;
            },

        /**
         * Replaces a CSS class on the element with another.  If the old name does not exist, the new name will simply be added.
         * @param {String} oldClassName The CSS class to replace
         * @param {String} newClassName The replacement CSS class
         * @return {Ext.Element} this
         */
        replaceCls : function(oldClassName, newClassName){
            return this.removeCls(oldClassName).addCls(newClassName);
        },

        isStyle : function(style, val) {
            return this.getStyle(style) == val;
        },

        /**
         * Normalizes currentStyle and computedStyle.
         * @param {String} property The style property whose value is returned.
         * @return {String} The current value of the style property for this element.
         * @method
         */
        getStyle : function() {
            return view && view.getComputedStyle ?
                function(prop){
                    var el = this.dom,
                        v, cs, out, display, cleaner;

                    if(el == document){
                        return null;
                    }
                    prop = ELEMENT.normalize(prop);
                    out = (v = el.style[prop]) ? v :
                           (cs = view.getComputedStyle(el, "")) ? cs[prop] : null;

                    // Ignore cases when the margin is correctly reported as 0, the bug only shows
                    // numbers larger.
                    if(prop == 'marginRight' && out != '0px' && !supports.RightMargin){
                        cleaner = ELEMENT.getRightMarginFixCleaner(el);
                        display = this.getStyle('display');
                        el.style.display = 'inline-block';
                        out = view.getComputedStyle(el, '').marginRight;
                        el.style.display = display;
                        cleaner();
                    }

                    if(prop == 'backgroundColor' && out == 'rgba(0, 0, 0, 0)' && !supports.TransparentColor){
                        out = 'transparent';
                    }
                    return out;
                } :
                function (prop) {
                    var el = this.dom,
                        m, cs;

                    if (el == document) {
                        return null;
                    }
                    prop = ELEMENT.normalize(prop);

                    do {
                        if (prop == 'opacity') {
                            if (el.style.filter.match) {
                                m = el.style.filter.match(opacityRe);
                                if(m){
                                    var fv = parseFloat(m[1]);
                                    if(!isNaN(fv)){
                                        return fv ? fv / 100 : 0;
                                    }
                                }
                            }
                            return 1;
                        }

                        // the try statement does have a cost, so we avoid it unless we are
                        // on IE6
                        if (!Ext.isIE6) {
                            return el.style[prop] || ((cs = el.currentStyle) ? cs[prop] : null);
                        }

                        try {
                            return el.style[prop] || ((cs = el.currentStyle) ? cs[prop] : null);
                        } catch (e) {
                            // in some cases, IE6 will throw Invalid Argument for properties
                            // like fontSize (see in /examples/tabs/tabs.html).
                        }

                        if (!ELEMENT.inheritedProps[prop]) {
                            break;
                        }

                        el = el.parentNode;
                        // this is _not_ perfect, but we can only hope that the style we
                        // need is inherited from a parentNode. If not and since IE won't
                        // give us the info we need, we are never going to be 100% right.
                    } while (el);

                    //<debug>
                    Ext.log({
                        level: 'warn',
                        msg: 'Failed to get ' + this.dom.id + '.currentStyle.' + prop
                    });
                    //</debug>
                    return null;
                }
        }(),

        /**
         * Return the CSS color for the specified CSS attribute. rgb, 3 digit (like #fff) and valid values
         * are convert to standard 6 digit hex color.
         * @param {String} attr The css attribute
         * @param {String} defaultValue The default value to use when a valid color isn't found
         * @param {String} prefix (optional) defaults to #. Use an empty string when working with
         * color anims.
         */
        getColor : function(attr, defaultValue, prefix){
            var v = this.getStyle(attr),
                color = prefix || prefix === '' ? prefix : '#',
                h;

            if(!v || (/transparent|inherit/.test(v))) {
                return defaultValue;
            }
            if(/^r/.test(v)){
                Ext.each(v.slice(4, v.length -1).split(','), function(s){
                    h = parseInt(s, 10);
                    color += (h < 16 ? '0' : '') + h.toString(16);
                });
            }else{
                v = v.replace('#', '');
                color += v.length == 3 ? v.replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3') : v;
            }
            return(color.length > 5 ? color.toLowerCase() : defaultValue);
        },

        /**
         * Wrapper for setting style properties, also takes single object parameter of multiple styles.
         * @param {String/Object} property The style property to be set, or an object of multiple styles.
         * @param {String} value (optional) The value to apply to the given property, or null if an object was passed.
         * @return {Ext.Element} this
         */
        setStyle : function(prop, value){
            var me = this,
                tmp, style;

            if (!me.dom) {
                return me;
            }
            if (typeof prop === 'string') {
                tmp = {};
                tmp[prop] = value;
                prop = tmp;
            }
            for (style in prop) {
                if (prop.hasOwnProperty(style)) {
                    value = Ext.value(prop[style], '');
                    if (style == 'opacity') {
                        me.setOpacity(value);
                    }
                    else {
                        me.dom.style[ELEMENT.normalize(style)] = value;
                    }
                }
            }
            return me;
        },

        /**
         * Set the opacity of the element
         * @param {Number} opacity The new opacity. 0 = transparent, .5 = 50% visibile, 1 = fully visible, etc
         * @param {Boolean/Object} animate (optional) a standard Element animation config object or <tt>true</tt> for
         * the default animation (<tt>{duration: .35, easing: 'easeIn'}</tt>)
         * @return {Ext.Element} this
         */
        setOpacity: function(opacity, animate) {
            var me = this,
                dom = me.dom,
                val,
                style;

            if (!me.dom) {
                return me;
            }

            style = me.dom.style;

            if (!animate || !me.anim) {
                if (!Ext.supports.Opacity) {
                    opacity = opacity < 1 ? 'alpha(opacity=' + opacity * 100 + ')': '';
                    val = style.filter.replace(opacityRe, '').replace(trimRe, '');

                    style.zoom = 1;
                    style.filter = val + (val.length > 0 ? ' ': '') + opacity;
                }
                else {
                    style.opacity = opacity;
                }
            }
            else {
                if (!Ext.isObject(animate)) {
                    animate = {
                        duration: 350,
                        easing: 'ease-in'
                    };
                }
                me.animate(Ext.applyIf({
                    to: {
                        opacity: opacity
                    }
                },
                animate));
            }
            return me;
        },


        /**
         * Clears any opacity settings from this element. Required in some cases for IE.
         * @return {Ext.Element} this
         */
        clearOpacity : function(){
            var style = this.dom.style;
            if(!Ext.supports.Opacity){
                if(!Ext.isEmpty(style.filter)){
                    style.filter = style.filter.replace(opacityRe, '').replace(trimRe, '');
                }
            }else{
                style.opacity = style['-moz-opacity'] = style['-khtml-opacity'] = '';
            }
            return this;
        },

        /**
         * @private
         * Returns 1 if the browser returns the subpixel dimension rounded to the lowest pixel.
         * @return {Number} 0 or 1
         */
        adjustDirect2DDimension: function(dimension) {
            var me = this,
                dom = me.dom,
                display = me.getStyle('display'),
                inlineDisplay = dom.style['display'],
                inlinePosition = dom.style['position'],
                originIndex = dimension === 'width' ? 0 : 1,
                floating;

            if (display === 'inline') {
                dom.style['display'] = 'inline-block';
            }

            dom.style['position'] = display.match(adjustDirect2DTableRe) ? 'absolute' : 'static';

            // floating will contain digits that appears after the decimal point
            // if height or width are set to auto we fallback to msTransformOrigin calculation
            floating = (parseFloat(me.getStyle(dimension)) || parseFloat(dom.currentStyle.msTransformOrigin.split(' ')[originIndex]) * 2) % 1;

            dom.style['position'] = inlinePosition;

            if (display === 'inline') {
                dom.style['display'] = inlineDisplay;
            }

            return floating;
        },

        /**
         * Returns the offset height of the element
         * @param {Boolean} contentHeight (optional) true to get the height minus borders and padding
         * @return {Number} The element's height
         */
        getHeight: function(contentHeight, preciseHeight) {
            var me = this,
                dom = me.dom,
                hidden = Ext.isIE && me.isStyle('display', 'none'),
                height, overflow, style, floating;

            // IE Quirks mode acts more like a max-size measurement unless overflow is hidden during measurement.
            // We will put the overflow back to it's original value when we are done measuring.
            if (Ext.isIEQuirks) {
                style = dom.style;
                overflow = style.overflow;
                me.setStyle({ overflow: 'hidden'});
            }

            height = dom.offsetHeight;

            height = MATH.max(height, hidden ? 0 : dom.clientHeight) || 0;

            // IE9 Direct2D dimension rounding bug
            if (!hidden && Ext.supports.Direct2DBug) {
                floating = me.adjustDirect2DDimension('height');
                if (preciseHeight) {
                    height += floating;
                }
                else if (floating > 0 && floating < 0.5) {
                    height++;
                }
            }

            if (contentHeight) {
                height -= (me.getBorderWidth("tb") + me.getPadding("tb"));
            }

            if (Ext.isIEQuirks) {
                me.setStyle({ overflow: overflow});
            }

            if (height < 0) {
                height = 0;
            }
            return height;
        },

        /**
         * Returns the offset width of the element
         * @param {Boolean} contentWidth (optional) true to get the width minus borders and padding
         * @return {Number} The element's width
         */
        getWidth: function(contentWidth, preciseWidth) {
            var me = this,
                dom = me.dom,
                hidden = Ext.isIE && me.isStyle('display', 'none'),
                rect, width, overflow, style, floating, parentPosition;

            // IE Quirks mode acts more like a max-size measurement unless overflow is hidden during measurement.
            // We will put the overflow back to it's original value when we are done measuring.
            if (Ext.isIEQuirks) {
                style = dom.style;
                overflow = style.overflow;
                me.setStyle({overflow: 'hidden'});
            }

            // Fix Opera 10.5x width calculation issues
            if (Ext.isOpera10_5) {
                if (dom.parentNode.currentStyle.position === 'relative') {
                    parentPosition = dom.parentNode.style.position;
                    dom.parentNode.style.position = 'static';
                    width = dom.offsetWidth;
                    dom.parentNode.style.position = parentPosition;
                }
                width = Math.max(width || 0, dom.offsetWidth);

            // Gecko will in some cases report an offsetWidth that is actually less than the width of the
            // text contents, because it measures fonts with sub-pixel precision but rounds the calculated
            // value down. Using getBoundingClientRect instead of offsetWidth allows us to get the precise
            // subpixel measurements so we can force them to always be rounded up. See
            // https://bugzilla.mozilla.org/show_bug.cgi?id=458617
            } else if (Ext.supports.BoundingClientRect) {
                rect = dom.getBoundingClientRect();
                width = rect.right - rect.left;
                width = preciseWidth ? width : Math.ceil(width);
            } else {
                width = dom.offsetWidth;
            }

            width = MATH.max(width, hidden ? 0 : dom.clientWidth) || 0;

            // IE9 Direct2D dimension rounding bug
            if (!hidden && Ext.supports.Direct2DBug) {
                floating = me.adjustDirect2DDimension('width');
                if (preciseWidth) {
                    width += floating;
                }
                else if (floating > 0 && floating < 0.5) {
                    width++;
                }
            }

            if (contentWidth) {
                width -= (me.getBorderWidth("lr") + me.getPadding("lr"));
            }

            if (Ext.isIEQuirks) {
                me.setStyle({ overflow: overflow});
            }

            if (width < 0) {
                width = 0;
            }
            return width;
        },

        /**
         * Set the width of this Element.
         * @param {Number/String} width The new width. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
         * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
         * </ul></div>
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        setWidth : function(width, animate){
            var me = this;
            width = me.adjustWidth(width);
            if (!animate || !me.anim) {
                me.dom.style.width = me.addUnits(width);
            }
            else {
                if (!Ext.isObject(animate)) {
                    animate = {};
                }
                me.animate(Ext.applyIf({
                    to: {
                        width: width
                    }
                }, animate));
            }
            return me;
        },

        /**
         * Set the height of this Element.
         * <pre><code>
// change the height to 200px and animate with default configuration
Ext.fly('elementId').setHeight(200, true);

// change the height to 150px and animate with a custom configuration
Ext.fly('elId').setHeight(150, {
    duration : .5, // animation will have a duration of .5 seconds
    // will change the content to "finished"
    callback: function(){ this.{@link #update}("finished"); }
});
         * </code></pre>
         * @param {Number/String} height The new height. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels.)</li>
         * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
         * </ul></div>
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
         setHeight : function(height, animate){
            var me = this;
            height = me.adjustHeight(height);
            if (!animate || !me.anim) {
                me.dom.style.height = me.addUnits(height);
            }
            else {
                if (!Ext.isObject(animate)) {
                    animate = {};
                }
                me.animate(Ext.applyIf({
                    to: {
                        height: height
                    }
                }, animate));
            }
            return me;
        },

        /**
         * Gets the width of the border(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
         * passing <tt>'lr'</tt> would get the border <b><u>l</u></b>eft width + the border <b><u>r</u></b>ight width.
         * @return {Number} The width of the sides passed added together
         */
        getBorderWidth : function(side){
            return this.addStyles(side, borders);
        },

        /**
         * Gets the width of the padding(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
         * passing <tt>'lr'</tt> would get the padding <b><u>l</u></b>eft + the padding <b><u>r</u></b>ight.
         * @return {Number} The padding of the sides passed added together
         */
        getPadding : function(side){
            return this.addStyles(side, paddings);
        },

        /**
         *  Store the current overflow setting and clip overflow on the element - use <tt>{@link #unclip}</tt> to remove
         * @return {Ext.Element} this
         */
        clip : function(){
            var me = this,
                dom = me.dom;

            if(!data(dom, ISCLIPPED)){
                data(dom, ISCLIPPED, true);
                data(dom, ORIGINALCLIP, {
                    o: me.getStyle(OVERFLOW),
                    x: me.getStyle(OVERFLOWX),
                    y: me.getStyle(OVERFLOWY)
                });
                me.setStyle(OVERFLOW, HIDDEN);
                me.setStyle(OVERFLOWX, HIDDEN);
                me.setStyle(OVERFLOWY, HIDDEN);
            }
            return me;
        },

        /**
         *  Return clipping (overflow) to original clipping before <tt>{@link #clip}</tt> was called
         * @return {Ext.Element} this
         */
        unclip : function(){
            var me = this,
                dom = me.dom,
                clip;

            if(data(dom, ISCLIPPED)){
                data(dom, ISCLIPPED, false);
                clip = data(dom, ORIGINALCLIP);
                if(clip.o){
                    me.setStyle(OVERFLOW, clip.o);
                }
                if(clip.x){
                    me.setStyle(OVERFLOWX, clip.x);
                }
                if(clip.y){
                    me.setStyle(OVERFLOWY, clip.y);
                }
            }
            return me;
        },

        // private
        addStyles : function(sides, styles){
            var totalSize = 0,
                sidesArr = sides.match(wordsRe),
                i = 0,
                len = sidesArr.length,
                side, size;
            for (; i < len; i++) {
                side = sidesArr[i];
                size = side && parseInt(this.getStyle(styles[side]), 10);
                if (size) {
                    totalSize += MATH.abs(size);
                }
            }
            return totalSize;
        },

        margins : margins,

        /**
         * More flexible version of {@link #setStyle} for setting style properties.
         * @param {String/Object/Function} styles A style specification string, e.g. "width:100px", or object in the form {width:"100px"}, or
         * a function which returns such a specification.
         * @return {Ext.Element} this
         */
        applyStyles : function(style){
            Ext.DomHelper.applyStyles(this.dom, style);
            return this;
        },

        /**
         * Returns an object with properties matching the styles requested.
         * For example, el.getStyles('color', 'font-size', 'width') might return
         * {'color': '#FFFFFF', 'font-size': '13px', 'width': '100px'}.
         * @param {String} style1 A style name
         * @param {String} style2 A style name
         * @param {String} etc.
         * @return {Object} The style object
         */
        getStyles : function(){
            var styles = {},
                len = arguments.length,
                i = 0, style;

            for(; i < len; ++i) {
                style = arguments[i];
                styles[style] = this.getStyle(style);
            }
            return styles;
        },

       /**
        * <p>Wraps the specified element with a special 9 element markup/CSS block that renders by default as
        * a gray container with a gradient background, rounded corners and a 4-way shadow.</p>
        * <p>This special markup is used throughout Ext when box wrapping elements ({@link Ext.button.Button},
        * {@link Ext.panel.Panel} when <tt>{@link Ext.panel.Panel#frame frame=true}</tt>, {@link Ext.window.Window}).  The markup
        * is of this form:</p>
        * <pre><code>
    Ext.Element.boxMarkup =
    &#39;&lt;div class="{0}-tl">&lt;div class="{0}-tr">&lt;div class="{0}-tc">&lt;/div>&lt;/div>&lt;/div>
     &lt;div class="{0}-ml">&lt;div class="{0}-mr">&lt;div class="{0}-mc">&lt;/div>&lt;/div>&lt;/div>
     &lt;div class="{0}-bl">&lt;div class="{0}-br">&lt;div class="{0}-bc">&lt;/div>&lt;/div>&lt;/div>&#39;;
        * </code></pre>
        * <p>Example usage:</p>
        * <pre><code>
    // Basic box wrap
    Ext.get("foo").boxWrap();

    // You can also add a custom class and use CSS inheritance rules to customize the box look.
    // 'x-box-blue' is a built-in alternative -- look at the related CSS definitions as an example
    // for how to create a custom box wrap style.
    Ext.get("foo").boxWrap().addCls("x-box-blue");
        * </code></pre>
        * @param {String} class (optional) A base CSS class to apply to the containing wrapper element
        * (defaults to <tt>'x-box'</tt>). Note that there are a number of CSS rules that are dependent on
        * this name to make the overall effect work, so if you supply an alternate base class, make sure you
        * also supply all of the necessary rules.
        * @return {Ext.Element} The outermost wrapping element of the created box structure.
        */
        boxWrap : function(cls){
            cls = cls || Ext.baseCSSPrefix + 'box';
            var el = Ext.get(this.insertHtml("beforeBegin", "<div class='" + cls + "'>" + Ext.String.format(ELEMENT.boxMarkup, cls) + "</div>"));
            Ext.DomQuery.selectNode('.' + cls + '-mc', el.dom).appendChild(this.dom);
            return el;
        },

        /**
         * Set the size of this Element. If animation is true, both width and height will be animated concurrently.
         * @param {Number/String} width The new width. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
         * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
         * <li>A size object in the format <code>{width: widthValue, height: heightValue}</code>.</li>
         * </ul></div>
         * @param {Number/String} height The new height. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels).</li>
         * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
         * </ul></div>
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        setSize : function(width, height, animate){
            var me = this;
            if (Ext.isObject(width)) { // in case of object from getSize()
                animate = height;
                height = width.height;
                width = width.width;
            }
            width = me.adjustWidth(width);
            height = me.adjustHeight(height);
            if(!animate || !me.anim){
                // Must touch some property before setting style.width/height on non-quirk IE6,7, or the
                // properties will not reflect the changes on the style immediately
                if (!Ext.isIEQuirks && (Ext.isIE6 || Ext.isIE7)) {
                    me.dom.offsetTop;
                }
                me.dom.style.width = me.addUnits(width);
                me.dom.style.height = me.addUnits(height);
            }
            else {
                if (animate === true) {
                    animate = {};
                }
                me.animate(Ext.applyIf({
                    to: {
                        width: width,
                        height: height
                    }
                }, animate));
            }
            return me;
        },

        /**
         * Returns either the offsetHeight or the height of this element based on CSS height adjusted by padding or borders
         * when needed to simulate offsetHeight when offsets aren't available. This may not work on display:none elements
         * if a height has not been set using CSS.
         * @return {Number}
         */
        getComputedHeight : function(){
            var me = this,
                h = Math.max(me.dom.offsetHeight, me.dom.clientHeight);
            if(!h){
                h = parseFloat(me.getStyle('height')) || 0;
                if(!me.isBorderBox()){
                    h += me.getFrameWidth('tb');
                }
            }
            return h;
        },

        /**
         * Returns either the offsetWidth or the width of this element based on CSS width adjusted by padding or borders
         * when needed to simulate offsetWidth when offsets aren't available. This may not work on display:none elements
         * if a width has not been set using CSS.
         * @return {Number}
         */
        getComputedWidth : function(){
            var me = this,
                w = Math.max(me.dom.offsetWidth, me.dom.clientWidth);

            if(!w){
                w = parseFloat(me.getStyle('width')) || 0;
                if(!me.isBorderBox()){
                    w += me.getFrameWidth('lr');
                }
            }
            return w;
        },

        /**
         * Returns the sum width of the padding and borders for the passed "sides". See getBorderWidth()
         for more information about the sides.
         * @param {String} sides
         * @return {Number}
         */
        getFrameWidth : function(sides, onlyContentBox){
            return onlyContentBox && this.isBorderBox() ? 0 : (this.getPadding(sides) + this.getBorderWidth(sides));
        },

        /**
         * Sets up event handlers to add and remove a css class when the mouse is over this element
         * @param {String} className
         * @return {Ext.Element} this
         */
        addClsOnOver : function(className){
            var dom = this.dom;
            this.hover(
                function(){
                    Ext.fly(dom, INTERNAL).addCls(className);
                },
                function(){
                    Ext.fly(dom, INTERNAL).removeCls(className);
                }
            );
            return this;
        },

        /**
         * Sets up event handlers to add and remove a css class when this element has the focus
         * @param {String} className
         * @return {Ext.Element} this
         */
        addClsOnFocus : function(className){
            var me = this,
                dom = me.dom;
            me.on("focus", function(){
                Ext.fly(dom, INTERNAL).addCls(className);
            });
            me.on("blur", function(){
                Ext.fly(dom, INTERNAL).removeCls(className);
            });
            return me;
        },

        /**
         * Sets up event handlers to add and remove a css class when the mouse is down and then up on this element (a click effect)
         * @param {String} className
         * @return {Ext.Element} this
         */
        addClsOnClick : function(className){
            var dom = this.dom;
            this.on("mousedown", function(){
                Ext.fly(dom, INTERNAL).addCls(className);
                var d = Ext.getDoc(),
                    fn = function(){
                        Ext.fly(dom, INTERNAL).removeCls(className);
                        d.removeListener("mouseup", fn);
                    };
                d.on("mouseup", fn);
            });
            return this;
        },

        /**
         * <p>Returns the dimensions of the element available to lay content out in.<p>
         * <p>If the element (or any ancestor element) has CSS style <code>display : none</code>, the dimensions will be zero.</p>
         * example:<pre><code>
        var vpSize = Ext.getBody().getViewSize();

        // all Windows created afterwards will have a default value of 90% height and 95% width
        Ext.Window.override({
            width: vpSize.width * 0.9,
            height: vpSize.height * 0.95
        });
        // To handle window resizing you would have to hook onto onWindowResize.
        * </code></pre>
        *
        * getViewSize utilizes clientHeight/clientWidth which excludes sizing of scrollbars.
        * To obtain the size including scrollbars, use getStyleSize
        *
        * Sizing of the document body is handled at the adapter level which handles special cases for IE and strict modes, etc.
        */

        getViewSize : function(){
            var me = this,
                dom = me.dom,
                isDoc = (dom == Ext.getDoc().dom || dom == Ext.getBody().dom),
                style, overflow, ret;

            // If the body, use static methods
            if (isDoc) {
                ret = {
                    width : ELEMENT.getViewWidth(),
                    height : ELEMENT.getViewHeight()
                };

            // Else use clientHeight/clientWidth
            }
            else {
                // IE 6 & IE Quirks mode acts more like a max-size measurement unless overflow is hidden during measurement.
                // We will put the overflow back to it's original value when we are done measuring.
                if (Ext.isIE6 || Ext.isIEQuirks) {
                    style = dom.style;
                    overflow = style.overflow;
                    me.setStyle({ overflow: 'hidden'});
                }
                ret = {
                    width : dom.clientWidth,
                    height : dom.clientHeight
                };
                if (Ext.isIE6 || Ext.isIEQuirks) {
                    me.setStyle({ overflow: overflow });
                }
            }
            return ret;
        },

        /**
        * <p>Returns the dimensions of the element available to lay content out in.<p>
        *
        * getStyleSize utilizes prefers style sizing if present, otherwise it chooses the larger of offsetHeight/clientHeight and offsetWidth/clientWidth.
        * To obtain the size excluding scrollbars, use getViewSize
        *
        * Sizing of the document body is handled at the adapter level which handles special cases for IE and strict modes, etc.
        */

        getStyleSize : function(){
            var me = this,
                doc = document,
                d = this.dom,
                isDoc = (d == doc || d == doc.body),
                s = d.style,
                w, h;

            // If the body, use static methods
            if (isDoc) {
                return {
                    width : ELEMENT.getViewWidth(),
                    height : ELEMENT.getViewHeight()
                };
            }
            // Use Styles if they are set
            if(s.width && s.width != 'auto'){
                w = parseFloat(s.width);
                if(me.isBorderBox()){
                   w -= me.getFrameWidth('lr');
                }
            }
            // Use Styles if they are set
            if(s.height && s.height != 'auto'){
                h = parseFloat(s.height);
                if(me.isBorderBox()){
                   h -= me.getFrameWidth('tb');
                }
            }
            // Use getWidth/getHeight if style not set.
            return {width: w || me.getWidth(true), height: h || me.getHeight(true)};
        },

        /**
         * Returns the size of the element.
         * @param {Boolean} contentSize (optional) true to get the width/size minus borders and padding
         * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
         */
        getSize : function(contentSize){
            return {width: this.getWidth(contentSize), height: this.getHeight(contentSize)};
        },

        /**
         * Forces the browser to repaint this element
         * @return {Ext.Element} this
         */
        repaint : function(){
            var dom = this.dom;
            this.addCls(Ext.baseCSSPrefix + 'repaint');
            setTimeout(function(){
                Ext.fly(dom).removeCls(Ext.baseCSSPrefix + 'repaint');
            }, 1);
            return this;
        },

        /**
         * Enable text selection for this element (normalized across browsers)
         * @return {Ext.Element} this
         */
        selectable : function() {
            var me = this;
            me.dom.unselectable = "off";
            // Prevent it from bubles up and enables it to be selectable
            me.on('selectstart', function (e) {
                e.stopPropagation();
                return true;
            });
            me.applyStyles("-moz-user-select: text; -khtml-user-select: text;");
            me.removeCls(Ext.baseCSSPrefix + 'unselectable');
            return me;
        },

        /**
         * Disables text selection for this element (normalized across browsers)
         * @return {Ext.Element} this
         */
        unselectable : function(){
            var me = this;
            me.dom.unselectable = "on";

            me.swallowEvent("selectstart", true);
            me.applyStyles("-moz-user-select:-moz-none;-khtml-user-select:none;");
            me.addCls(Ext.baseCSSPrefix + 'unselectable');

            return me;
        },

        /**
         * Returns an object with properties top, left, right and bottom representing the margins of this element unless sides is passed,
         * then it returns the calculated width of the sides (see getPadding)
         * @param {String} sides (optional) Any combination of l, r, t, b to get the sum of those sides
         * @return {Object/Number}
         */
        getMargin : function(side){
            var me = this,
                hash = {t:"top", l:"left", r:"right", b: "bottom"},
                o = {},
                key;

            if (!side) {
                for (key in me.margins){
                    o[hash[key]] = parseFloat(me.getStyle(me.margins[key])) || 0;
                }
                return o;
            } else {
                return me.addStyles.call(me, side, me.margins);
            }
        }
    });
})();
