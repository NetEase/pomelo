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
Ext.applyIf(Ext.Element.prototype, {
    // @private override base Ext.util.Animate mixin for animate for backwards compatibility
    animate: function(config) {
        var me = this;
        if (!me.id) {
            me = Ext.get(me.dom);
        }
        if (Ext.fx.Manager.hasFxBlock(me.id)) {
            return me;
        }
        Ext.fx.Manager.queueFx(Ext.create('Ext.fx.Anim', me.anim(config)));
        return this;
    },

    // @private override base Ext.util.Animate mixin for animate for backwards compatibility
    anim: function(config) {
        if (!Ext.isObject(config)) {
            return (config) ? {} : false;
        }

        var me = this,
            duration = config.duration || Ext.fx.Anim.prototype.duration,
            easing = config.easing || 'ease',
            animConfig;

        if (config.stopAnimation) {
            me.stopAnimation();
        }

        Ext.applyIf(config, Ext.fx.Manager.getFxDefaults(me.id));

        // Clear any 'paused' defaults.
        Ext.fx.Manager.setFxDefaults(me.id, {
            delay: 0
        });

        animConfig = {
            target: me,
            remove: config.remove,
            alternate: config.alternate || false,
            duration: duration,
            easing: easing,
            callback: config.callback,
            listeners: config.listeners,
            iterations: config.iterations || 1,
            scope: config.scope,
            block: config.block,
            concurrent: config.concurrent,
            delay: config.delay || 0,
            paused: true,
            keyframes: config.keyframes,
            from: config.from || {},
            to: Ext.apply({}, config)
        };
        Ext.apply(animConfig.to, config.to);

        // Anim API properties - backward compat
        delete animConfig.to.to;
        delete animConfig.to.from;
        delete animConfig.to.remove;
        delete animConfig.to.alternate;
        delete animConfig.to.keyframes;
        delete animConfig.to.iterations;
        delete animConfig.to.listeners;
        delete animConfig.to.target;
        delete animConfig.to.paused;
        delete animConfig.to.callback;
        delete animConfig.to.scope;
        delete animConfig.to.duration;
        delete animConfig.to.easing;
        delete animConfig.to.concurrent;
        delete animConfig.to.block;
        delete animConfig.to.stopAnimation;
        delete animConfig.to.delay;
        return animConfig;
    },

    /**
     * Slides the element into view. An anchor point can be optionally passed to set the point of origin for the slide
     * effect. This function automatically handles wrapping the element with a fixed-size container if needed. See the
     * Fx class overview for valid anchor point options. Usage:
     *
     *     // default: slide the element in from the top
     *     el.slideIn();
     *
     *     // custom: slide the element in from the right with a 2-second duration
     *     el.slideIn('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.slideIn('t', {
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {String} [anchor='t'] One of the valid Fx anchor positions
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    slideIn: function(anchor, obj, slideOut) {
        var me = this,
            elStyle = me.dom.style,
            beforeAnim, wrapAnim;

        anchor = anchor || "t";
        obj = obj || {};

        beforeAnim = function() {
            var animScope = this,
                listeners = obj.listeners,
                box, position, restoreSize, wrap, anim;

            if (!slideOut) {
                me.fixDisplay();
            }

            box = me.getBox();
            if ((anchor == 't' || anchor == 'b') && box.height === 0) {
                box.height = me.dom.scrollHeight;
            }
            else if ((anchor == 'l' || anchor == 'r') && box.width === 0) {
                box.width = me.dom.scrollWidth;
            }

            position = me.getPositioning();
            me.setSize(box.width, box.height);

            wrap = me.wrap({
                style: {
                    visibility: slideOut ? 'visible' : 'hidden'
                }
            });
            wrap.setPositioning(position);
            if (wrap.isStyle('position', 'static')) {
                wrap.position('relative');
            }
            me.clearPositioning('auto');
            wrap.clip();

            // This element is temporarily positioned absolute within its wrapper.
            // Restore to its default, CSS-inherited visibility setting.
            // We cannot explicitly poke visibility:visible into its style because that overrides the visibility of the wrap.
            me.setStyle({
                visibility: '',
                position: 'absolute'
            });
            if (slideOut) {
                wrap.setSize(box.width, box.height);
            }

            switch (anchor) {
                case 't':
                    anim = {
                        from: {
                            width: box.width + 'px',
                            height: '0px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    break;
                case 'l':
                    anim = {
                        from: {
                            width: '0px',
                            height: box.height + 'px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.right = '0px';
                    break;
                case 'r':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            width: '0px',
                            height: box.height + 'px'
                        },
                        to: {
                            x: box.x,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'b':
                    anim = {
                        from: {
                            y: box.y + box.height,
                            width: box.width + 'px',
                            height: '0px'
                        },
                        to: {
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'tl':
                    anim = {
                        from: {
                            x: box.x,
                            y: box.y,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    elStyle.right = '0px';
                    break;
                case 'bl':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            x: box.x,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.right = '0px';
                    break;
                case 'br':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            y: box.y + box.height,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            x: box.x,
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'tr':
                    anim = {
                        from: {
                            y: box.y + box.height,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    break;
            }

            wrap.show();
            wrapAnim = Ext.apply({}, obj);
            delete wrapAnim.listeners;
            wrapAnim = Ext.create('Ext.fx.Anim', Ext.applyIf(wrapAnim, {
                target: wrap,
                duration: 500,
                easing: 'ease-out',
                from: slideOut ? anim.to : anim.from,
                to: slideOut ? anim.from : anim.to
            }));

            // In the absence of a callback, this listener MUST be added first
            wrapAnim.on('afteranimate', function() {
                if (slideOut) {
                    me.setPositioning(position);
                    if (obj.useDisplay) {
                        me.setDisplayed(false);
                    } else {
                        me.hide();
                    }
                }
                else {
                    me.clearPositioning();
                    me.setPositioning(position);
                }
                if (wrap.dom) {
                    wrap.dom.parentNode.insertBefore(me.dom, wrap.dom);
                    wrap.remove();
                }
                me.setSize(box.width, box.height);
                animScope.end();
            });
            // Add configured listeners after
            if (listeners) {
                wrapAnim.on(listeners);
            }
        };

        me.animate({
            duration: obj.duration ? obj.duration * 2 : 1000,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                },
                afteranimate: {
                    fn: function() {
                        if (wrapAnim && wrapAnim.running) {
                            wrapAnim.end();
                        }
                    }
                }
            }
        });
        return me;
    },


    /**
     * Slides the element out of view. An anchor point can be optionally passed to set the end point for the slide
     * effect. When the effect is completed, the element will be hidden (visibility = 'hidden') but block elements will
     * still take up space in the document. The element must be removed from the DOM using the 'remove' config option if
     * desired. This function automatically handles wrapping the element with a fixed-size container if needed. See the
     * Fx class overview for valid anchor point options. Usage:
     *
     *     // default: slide the element out to the top
     *     el.slideOut();
     *
     *     // custom: slide the element out to the right with a 2-second duration
     *     el.slideOut('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.slideOut('t', {
     *         easing: 'easeOut',
     *         duration: 500,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {String} [anchor='t'] One of the valid Fx anchor positions
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    slideOut: function(anchor, o) {
        return this.slideIn(anchor, o, true);
    },

    /**
     * Fades the element out while slowly expanding it in all directions. When the effect is completed, the element will
     * be hidden (visibility = 'hidden') but block elements will still take up space in the document. Usage:
     *
     *     // default
     *     el.puff();
     *
     *     // common config options shown with default values
     *     el.puff({
     *         easing: 'easeOut',
     *         duration: 500,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    puff: function(obj) {
        var me = this,
            beforeAnim;
        obj = Ext.applyIf(obj || {}, {
            easing: 'ease-out',
            duration: 500,
            useDisplay: false
        });

        beforeAnim = function() {
            me.clearOpacity();
            me.show();

            var box = me.getBox(),
                fontSize = me.getStyle('fontSize'),
                position = me.getPositioning();
            this.to = {
                width: box.width * 2,
                height: box.height * 2,
                x: box.x - (box.width / 2),
                y: box.y - (box.height /2),
                opacity: 0,
                fontSize: '200%'
            };
            this.on('afteranimate',function() {
                if (me.dom) {
                    if (obj.useDisplay) {
                        me.setDisplayed(false);
                    } else {
                        me.hide();
                    }
                    me.clearOpacity();
                    me.setPositioning(position);
                    me.setStyle({fontSize: fontSize});
                }
            });
        };

        me.animate({
            duration: obj.duration,
            easing: obj.easing,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Blinks the element as if it was clicked and then collapses on its center (similar to switching off a television).
     * When the effect is completed, the element will be hidden (visibility = 'hidden') but block elements will still
     * take up space in the document. The element must be removed from the DOM using the 'remove' config option if
     * desired. Usage:
     *
     *     // default
     *     el.switchOff();
     *
     *     // all config options shown with default values
     *     el.switchOff({
     *         easing: 'easeIn',
     *         duration: .3,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    switchOff: function(obj) {
        var me = this,
            beforeAnim;

        obj = Ext.applyIf(obj || {}, {
            easing: 'ease-in',
            duration: 500,
            remove: false,
            useDisplay: false
        });

        beforeAnim = function() {
            var animScope = this,
                size = me.getSize(),
                xy = me.getXY(),
                keyframe, position;
            me.clearOpacity();
            me.clip();
            position = me.getPositioning();

            keyframe = Ext.create('Ext.fx.Animator', {
                target: me,
                duration: obj.duration,
                easing: obj.easing,
                keyframes: {
                    33: {
                        opacity: 0.3
                    },
                    66: {
                        height: 1,
                        y: xy[1] + size.height / 2
                    },
                    100: {
                        width: 1,
                        x: xy[0] + size.width / 2
                    }
                }
            });
            keyframe.on('afteranimate', function() {
                if (obj.useDisplay) {
                    me.setDisplayed(false);
                } else {
                    me.hide();
                }
                me.clearOpacity();
                me.setPositioning(position);
                me.setSize(size);
                animScope.end();
            });
        };
        me.animate({
            duration: (obj.duration * 2),
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Shows a ripple of exploding, attenuating borders to draw attention to an Element. Usage:
     *
     *     // default: a single light blue ripple
     *     el.frame();
     *
     *     // custom: 3 red ripples lasting 3 seconds total
     *     el.frame("#ff0000", 3, { duration: 3 });
     *
     *     // common config options shown with default values
     *     el.frame("#C3DAF9", 1, {
     *         duration: 1 //duration of each individual ripple.
     *         // Note: Easing is not configurable and will be ignored if included
     *     });
     *
     * @param {String} [color='C3DAF9'] The color of the border. Should be a 6 char hex color without the leading #
     * (defaults to light blue).
     * @param {Number} [count=1] The number of ripples to display
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    frame : function(color, count, obj){
        var me = this,
            beforeAnim;

        color = color || '#C3DAF9';
        count = count || 1;
        obj = obj || {};

        beforeAnim = function() {
            me.show();
            var animScope = this,
                box = me.getBox(),
                proxy = Ext.getBody().createChild({
                    style: {
                        position : 'absolute',
                        'pointer-events': 'none',
                        'z-index': 35000,
                        border : '0px solid ' + color
                    }
                }),
                proxyAnim;
            proxyAnim = Ext.create('Ext.fx.Anim', {
                target: proxy,
                duration: obj.duration || 1000,
                iterations: count,
                from: {
                    top: box.y,
                    left: box.x,
                    borderWidth: 0,
                    opacity: 1,
                    height: box.height,
                    width: box.width
                },
                to: {
                    top: box.y - 20,
                    left: box.x - 20,
                    borderWidth: 10,
                    opacity: 0,
                    height: box.height + 40,
                    width: box.width + 40
                }
            });
            proxyAnim.on('afteranimate', function() {
                proxy.remove();
                animScope.end();
            });
        };

        me.animate({
            duration: (obj.duration * 2) || 2000,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Slides the element while fading it out of view. An anchor point can be optionally passed to set the ending point
     * of the effect. Usage:
     *
     *     // default: slide the element downward while fading out
     *     el.ghost();
     *
     *     // custom: slide the element out to the right with a 2-second duration
     *     el.ghost('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.ghost('b', {
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {String} [anchor='b'] One of the valid Fx anchor positions
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    ghost: function(anchor, obj) {
        var me = this,
            beforeAnim;

        anchor = anchor || "b";
        beforeAnim = function() {
            var width = me.getWidth(),
                height = me.getHeight(),
                xy = me.getXY(),
                position = me.getPositioning(),
                to = {
                    opacity: 0
                };
            switch (anchor) {
                case 't':
                    to.y = xy[1] - height;
                    break;
                case 'l':
                    to.x = xy[0] - width;
                    break;
                case 'r':
                    to.x = xy[0] + width;
                    break;
                case 'b':
                    to.y = xy[1] + height;
                    break;
                case 'tl':
                    to.x = xy[0] - width;
                    to.y = xy[1] - height;
                    break;
                case 'bl':
                    to.x = xy[0] - width;
                    to.y = xy[1] + height;
                    break;
                case 'br':
                    to.x = xy[0] + width;
                    to.y = xy[1] + height;
                    break;
                case 'tr':
                    to.x = xy[0] + width;
                    to.y = xy[1] - height;
                    break;
            }
            this.to = to;
            this.on('afteranimate', function () {
                if (me.dom) {
                    me.hide();
                    me.clearOpacity();
                    me.setPositioning(position);
                }
            });
        };

        me.animate(Ext.applyIf(obj || {}, {
            duration: 500,
            easing: 'ease-out',
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        }));
        return me;
    },

    /**
     * Highlights the Element by setting a color (applies to the background-color by default, but can be changed using
     * the "attr" config option) and then fading back to the original color. If no original color is available, you
     * should provide the "endColor" config option which will be cleared after the animation. Usage:
     *
     *     // default: highlight background to yellow
     *     el.highlight();
     *
     *     // custom: highlight foreground text to blue for 2 seconds
     *     el.highlight("0000ff", { attr: 'color', duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.highlight("ffff9c", {
     *         attr: "backgroundColor", //can be any valid CSS property (attribute) that supports a color value
     *         endColor: (current color) or "ffffff",
     *         easing: 'easeIn',
     *         duration: 1000
     *     });
     *
     * @param {String} [color='ffff9c'] The highlight color. Should be a 6 char hex color without the leading #
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    highlight: function(color, o) {
        var me = this,
            dom = me.dom,
            from = {},
            restore, to, attr, lns, event, fn;

        o = o || {};
        lns = o.listeners || {};
        attr = o.attr || 'backgroundColor';
        from[attr] = color || 'ffff9c';

        if (!o.to) {
            to = {};
            to[attr] = o.endColor || me.getColor(attr, 'ffffff', '');
        }
        else {
            to = o.to;
        }

        // Don't apply directly on lns, since we reference it in our own callbacks below
        o.listeners = Ext.apply(Ext.apply({}, lns), {
            beforeanimate: function() {
                restore = dom.style[attr];
                me.clearOpacity();
                me.show();

                event = lns.beforeanimate;
                if (event) {
                    fn = event.fn || event;
                    return fn.apply(event.scope || lns.scope || window, arguments);
                }
            },
            afteranimate: function() {
                if (dom) {
                    dom.style[attr] = restore;
                }

                event = lns.afteranimate;
                if (event) {
                    fn = event.fn || event;
                    fn.apply(event.scope || lns.scope || window, arguments);
                }
            }
        });

        me.animate(Ext.apply({}, o, {
            duration: 1000,
            easing: 'ease-in',
            from: from,
            to: to
        }));
        return me;
    },

   /**
    * @deprecated 4.0
    * Creates a pause before any subsequent queued effects begin. If there are no effects queued after the pause it will
    * have no effect. Usage:
    *
    *     el.pause(1);
    *
    * @param {Number} seconds The length of time to pause (in seconds)
    * @return {Ext.Element} The Element
    */
    pause: function(ms) {
        var me = this;
        Ext.fx.Manager.setFxDefaults(me.id, {
            delay: ms
        });
        return me;
    },

    /**
     * Fade an element in (from transparent to opaque). The ending opacity can be specified using the `opacity`
     * config option. Usage:
     *
     *     // default: fade in from opacity 0 to 100%
     *     el.fadeIn();
     *
     *     // custom: fade in from opacity 0 to 75% over 2 seconds
     *     el.fadeIn({ opacity: .75, duration: 2000});
     *
     *     // common config options shown with default values
     *     el.fadeIn({
     *         opacity: 1, //can be any value between 0 and 1 (e.g. .5)
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    fadeIn: function(o) {
        this.animate(Ext.apply({}, o, {
            opacity: 1
        }));
        return this;
    },

    /**
     * Fade an element out (from opaque to transparent). The ending opacity can be specified using the `opacity`
     * config option. Note that IE may require `useDisplay:true` in order to redisplay correctly.
     * Usage:
     *
     *     // default: fade out from the element's current opacity to 0
     *     el.fadeOut();
     *
     *     // custom: fade out from the element's current opacity to 25% over 2 seconds
     *     el.fadeOut({ opacity: .25, duration: 2000});
     *
     *     // common config options shown with default values
     *     el.fadeOut({
     *         opacity: 0, //can be any value between 0 and 1 (e.g. .5)
     *         easing: 'easeOut',
     *         duration: 500,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    fadeOut: function(o) {
        this.animate(Ext.apply({}, o, {
            opacity: 0
        }));
        return this;
    },

    /**
     * @deprecated 4.0
     * Animates the transition of an element's dimensions from a starting height/width to an ending height/width. This
     * method is a convenience implementation of {@link #shift}. Usage:
     *
     *     // change height and width to 100x100 pixels
     *     el.scale(100, 100);
     *
     *     // common config options shown with default values.  The height and width will default to
     *     // the element's existing values if passed as null.
     *     el.scale(
     *         [element's width],
     *         [element's height], {
     *             easing: 'easeOut',
     *             duration: .35
     *         }
     *     );
     *
     * @param {Number} width The new width (pass undefined to keep the original width)
     * @param {Number} height The new height (pass undefined to keep the original height)
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    scale: function(w, h, o) {
        this.animate(Ext.apply({}, o, {
            width: w,
            height: h
        }));
        return this;
    },

    /**
     * @deprecated 4.0
     * Animates the transition of any combination of an element's dimensions, xy position and/or opacity. Any of these
     * properties not specified in the config object will not be changed. This effect requires that at least one new
     * dimension, position or opacity setting must be passed in on the config object in order for the function to have
     * any effect. Usage:
     *
     *     // slide the element horizontally to x position 200 while changing the height and opacity
     *     el.shift({ x: 200, height: 50, opacity: .8 });
     *
     *     // common config options shown with default values.
     *     el.shift({
     *         width: [element's width],
     *         height: [element's height],
     *         x: [element's x position],
     *         y: [element's y position],
     *         opacity: [element's opacity],
     *         easing: 'easeOut',
     *         duration: .35
     *     });
     *
     * @param {Object} options Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    shift: function(config) {
        this.animate(config);
        return this;
    }
});

