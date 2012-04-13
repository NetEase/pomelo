/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.fx.Animator
 *
 * This class is used to run keyframe based animations, which follows the CSS3 based animation structure.
 * Keyframe animations differ from typical from/to animations in that they offer the ability to specify values
 * at various points throughout the animation.
 *
 * ## Using Keyframes
 *
 * The {@link #keyframes} option is the most important part of specifying an animation when using this
 * class. A key frame is a point in a particular animation. We represent this as a percentage of the
 * total animation duration. At each key frame, we can specify the target values at that time. Note that
 * you *must* specify the values at 0% and 100%, the start and ending values. There is also a {@link #keyframe}
 * event that fires after each key frame is reached.
 *
 * ## Example
 *
 * In the example below, we modify the values of the element at each fifth throughout the animation.
 *
 *     @example
 *     Ext.create('Ext.fx.Animator', {
 *         target: Ext.getBody().createChild({
 *             style: {
 *                 width: '100px',
 *                 height: '100px',
 *                 'background-color': 'red'
 *             }
 *         }),
 *         duration: 10000, // 10 seconds
 *         keyframes: {
 *             0: {
 *                 opacity: 1,
 *                 backgroundColor: 'FF0000'
 *             },
 *             20: {
 *                 x: 30,
 *                 opacity: 0.5
 *             },
 *             40: {
 *                 x: 130,
 *                 backgroundColor: '0000FF'
 *             },
 *             60: {
 *                 y: 80,
 *                 opacity: 0.3
 *             },
 *             80: {
 *                 width: 200,
 *                 y: 200
 *             },
 *             100: {
 *                 opacity: 1,
 *                 backgroundColor: '00FF00'
 *             }
 *         }
 *     });
 */
Ext.define('Ext.fx.Animator', {

    /* Begin Definitions */

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: ['Ext.fx.Manager'],

    /* End Definitions */

    isAnimator: true,

    /**
     * @cfg {Number} duration
     * Time in milliseconds for the animation to last. Defaults to 250.
     */
    duration: 250,

    /**
     * @cfg {Number} delay
     * Time to delay before starting the animation. Defaults to 0.
     */
    delay: 0,

    /* private used to track a delayed starting time */
    delayStart: 0,

    /**
     * @cfg {Boolean} dynamic
     * Currently only for Component Animation: Only set a component's outer element size bypassing layouts.  Set to true to do full layouts for every frame of the animation.  Defaults to false.
     */
    dynamic: false,

    /**
     * @cfg {String} easing
     *
     * This describes how the intermediate values used during a transition will be calculated. It allows for a transition to change
     * speed over its duration.
     *
     *  - backIn
     *  - backOut
     *  - bounceIn
     *  - bounceOut
     *  - ease
     *  - easeIn
     *  - easeOut
     *  - easeInOut
     *  - elasticIn
     *  - elasticOut
     *  - cubic-bezier(x1, y1, x2, y2)
     *
     * Note that cubic-bezier will create a custom easing curve following the CSS3 [transition-timing-function][0]
     * specification.  The four values specify points P1 and P2 of the curve as (x1, y1, x2, y2). All values must
     * be in the range [0, 1] or the definition is invalid.
     *
     * [0]: http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
     */
    easing: 'ease',

    /**
     * Flag to determine if the animation has started
     * @property running
     * @type Boolean
     */
    running: false,

    /**
     * Flag to determine if the animation is paused. Only set this to true if you need to
     * keep the Anim instance around to be unpaused later; otherwise call {@link #end}.
     * @property paused
     * @type Boolean
     */
    paused: false,

    /**
     * @private
     */
    damper: 1,

    /**
     * @cfg {Number} iterations
     * Number of times to execute the animation. Defaults to 1.
     */
    iterations: 1,

    /**
     * Current iteration the animation is running.
     * @property currentIteration
     * @type Number
     */
    currentIteration: 0,

    /**
     * Current keyframe step of the animation.
     * @property keyframeStep
     * @type Number
     */
    keyframeStep: 0,

    /**
     * @private
     */
    animKeyFramesRE: /^(from|to|\d+%?)$/,

    /**
     * @cfg {Ext.fx.target.Target} target
     * The Ext.fx.target to apply the animation to.  If not specified during initialization, this can be passed to the applyAnimator
     * method to apply the same animation to many targets.
     */

     /**
      * @cfg {Object} keyframes
      * Animation keyframes follow the CSS3 Animation configuration pattern. 'from' is always considered '0%' and 'to'
      * is considered '100%'.<b>Every keyframe declaration must have a keyframe rule for 0% and 100%, possibly defined using
      * "from" or "to"</b>.  A keyframe declaration without these keyframe selectors is invalid and will not be available for
      * animation.  The keyframe declaration for a keyframe rule consists of properties and values. Properties that are unable to
      * be animated are ignored in these rules, with the exception of 'easing' which can be changed at each keyframe. For example:
 <pre><code>
keyframes : {
    '0%': {
        left: 100
    },
    '40%': {
        left: 150
    },
    '60%': {
        left: 75
    },
    '100%': {
        left: 100
    }
}
 </code></pre>
      */
    constructor: function(config) {
        var me = this;
        config = Ext.apply(me, config || {});
        me.config = config;
        me.id = Ext.id(null, 'ext-animator-');
        me.addEvents(
            /**
             * @event beforeanimate
             * Fires before the animation starts. A handler can return false to cancel the animation.
             * @param {Ext.fx.Animator} this
             */
            'beforeanimate',
            /**
              * @event keyframe
              * Fires at each keyframe.
              * @param {Ext.fx.Animator} this
              * @param {Number} keyframe step number
              */
            'keyframe',
            /**
             * @event afteranimate
             * Fires when the animation is complete.
             * @param {Ext.fx.Animator} this
             * @param {Date} startTime
             */
            'afteranimate'
        );
        me.mixins.observable.constructor.call(me, config);
        me.timeline = [];
        me.createTimeline(me.keyframes);
        if (me.target) {
            me.applyAnimator(me.target);
            Ext.fx.Manager.addAnim(me);
        }
    },

    /**
     * @private
     */
    sorter: function (a, b) {
        return a.pct - b.pct;
    },

    /**
     * @private
     * Takes the given keyframe configuration object and converts it into an ordered array with the passed attributes per keyframe
     * or applying the 'to' configuration to all keyframes.  Also calculates the proper animation duration per keyframe.
     */
    createTimeline: function(keyframes) {
        var me = this,
            attrs = [],
            to = me.to || {},
            duration = me.duration,
            prevMs, ms, i, ln, pct, anim, nextAnim, attr;

        for (pct in keyframes) {
            if (keyframes.hasOwnProperty(pct) && me.animKeyFramesRE.test(pct)) {
                attr = {attrs: Ext.apply(keyframes[pct], to)};
                // CSS3 spec allow for from/to to be specified.
                if (pct == "from") {
                    pct = 0;
                }
                else if (pct == "to") {
                    pct = 100;
                }
                // convert % values into integers
                attr.pct = parseInt(pct, 10);
                attrs.push(attr);
            }
        }
        // Sort by pct property
        Ext.Array.sort(attrs, me.sorter);
        // Only an end
        //if (attrs[0].pct) {
        //    attrs.unshift({pct: 0, attrs: element.attrs});
        //}

        ln = attrs.length;
        for (i = 0; i < ln; i++) {
            prevMs = (attrs[i - 1]) ? duration * (attrs[i - 1].pct / 100) : 0;
            ms = duration * (attrs[i].pct / 100);
            me.timeline.push({
                duration: ms - prevMs,
                attrs: attrs[i].attrs
            });
        }
    },

    /**
     * Applies animation to the Ext.fx.target
     * @private
     * @param target
     * @type String/Object
     */
    applyAnimator: function(target) {
        var me = this,
            anims = [],
            timeline = me.timeline,
            reverse = me.reverse,
            ln = timeline.length,
            anim, easing, damper, initial, attrs, lastAttrs, i;

        if (me.fireEvent('beforeanimate', me) !== false) {
            for (i = 0; i < ln; i++) {
                anim = timeline[i];
                attrs = anim.attrs;
                easing = attrs.easing || me.easing;
                damper = attrs.damper || me.damper;
                delete attrs.easing;
                delete attrs.damper;
                anim = Ext.create('Ext.fx.Anim', {
                    target: target,
                    easing: easing,
                    damper: damper,
                    duration: anim.duration,
                    paused: true,
                    to: attrs
                });
                anims.push(anim);
            }
            me.animations = anims;
            me.target = anim.target;
            for (i = 0; i < ln - 1; i++) {
                anim = anims[i];
                anim.nextAnim = anims[i + 1];
                anim.on('afteranimate', function() {
                    this.nextAnim.paused = false;
                });
                anim.on('afteranimate', function() {
                    this.fireEvent('keyframe', this, ++this.keyframeStep);
                }, me);
            }
            anims[ln - 1].on('afteranimate', function() {
                this.lastFrame();
            }, me);
        }
    },

    /**
     * @private
     * Fires beforeanimate and sets the running flag.
     */
    start: function(startTime) {
        var me = this,
            delay = me.delay,
            delayStart = me.delayStart,
            delayDelta;
        if (delay) {
            if (!delayStart) {
                me.delayStart = startTime;
                return;
            }
            else {
                delayDelta = startTime - delayStart;
                if (delayDelta < delay) {
                    return;
                }
                else {
                    // Compensate for frame delay;
                    startTime = new Date(delayStart.getTime() + delay);
                }
            }
        }
        if (me.fireEvent('beforeanimate', me) !== false) {
            me.startTime = startTime;
            me.running = true;
            me.animations[me.keyframeStep].paused = false;
        }
    },

    /**
     * @private
     * Perform lastFrame cleanup and handle iterations
     * @returns a hash of the new attributes.
     */
    lastFrame: function() {
        var me = this,
            iter = me.iterations,
            iterCount = me.currentIteration;

        iterCount++;
        if (iterCount < iter) {
            me.startTime = new Date();
            me.currentIteration = iterCount;
            me.keyframeStep = 0;
            me.applyAnimator(me.target);
            me.animations[me.keyframeStep].paused = false;
        }
        else {
            me.currentIteration = 0;
            me.end();
        }
    },

    /**
     * Fire afteranimate event and end the animation. Usually called automatically when the
     * animation reaches its final frame, but can also be called manually to pre-emptively
     * stop and destroy the running animation.
     */
    end: function() {
        var me = this;
        me.fireEvent('afteranimate', me, me.startTime, new Date() - me.startTime);
    }
});
