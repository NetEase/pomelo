/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.fx.Manager
 * Animation Manager which keeps track of all current animations and manages them on a frame by frame basis.
 * @private
 * @singleton
 */

Ext.define('Ext.fx.Manager', {

    /* Begin Definitions */

    singleton: true,

    requires: ['Ext.util.MixedCollection',
               'Ext.fx.target.Element',
               'Ext.fx.target.CompositeElement',
               'Ext.fx.target.Sprite',
               'Ext.fx.target.CompositeSprite',
               'Ext.fx.target.Component'],

    mixins: {
        queue: 'Ext.fx.Queue'
    },

    /* End Definitions */

    constructor: function() {
        this.items = Ext.create('Ext.util.MixedCollection');
        this.mixins.queue.constructor.call(this);

        // this.requestAnimFrame = (function() {
        //     var raf = window.requestAnimationFrame ||
        //               window.webkitRequestAnimationFrame ||
        //               window.mozRequestAnimationFrame ||
        //               window.oRequestAnimationFrame ||
        //               window.msRequestAnimationFrame;
        //     if (raf) {
        //         return function(callback, element) {
        //             raf(callback);
        //         };
        //     }
        //     else {
        //         return function(callback, element) {
        //             window.setTimeout(callback, Ext.fx.Manager.interval);
        //         };
        //     }
        // })();
    },

    /**
     * @cfg {Number} interval Default interval in miliseconds to calculate each frame.  Defaults to 16ms (~60fps)
     */
    interval: 16,

    /**
     * @cfg {Boolean} forceJS Turn off to not use CSS3 transitions when they are available
     */
    forceJS: true,

    // @private Target factory
    createTarget: function(target) {
        var me = this,
            useCSS3 = !me.forceJS && Ext.supports.Transitions,
            targetObj;

        me.useCSS3 = useCSS3;

        // dom id
        if (Ext.isString(target)) {
            target = Ext.get(target);
        }
        // dom element
        if (target && target.tagName) {
            target = Ext.get(target);
            targetObj = Ext.create('Ext.fx.target.' + 'Element' + (useCSS3 ? 'CSS' : ''), target);
            me.targets.add(targetObj);
            return targetObj;
        }
        if (Ext.isObject(target)) {
            // Element
            if (target.dom) {
                targetObj = Ext.create('Ext.fx.target.' + 'Element' + (useCSS3 ? 'CSS' : ''), target);
            }
            // Element Composite
            else if (target.isComposite) {
                targetObj = Ext.create('Ext.fx.target.' + 'CompositeElement' + (useCSS3 ? 'CSS' : ''), target);
            }
            // Draw Sprite
            else if (target.isSprite) {
                targetObj = Ext.create('Ext.fx.target.Sprite', target);
            }
            // Draw Sprite Composite
            else if (target.isCompositeSprite) {
                targetObj = Ext.create('Ext.fx.target.CompositeSprite', target);
            }
            // Component
            else if (target.isComponent) {
                targetObj = Ext.create('Ext.fx.target.Component', target);
            }
            else if (target.isAnimTarget) {
                return target;
            }
            else {
                return null;
            }
            me.targets.add(targetObj);
            return targetObj;
        }
        else {
            return null;
        }
    },

    /**
     * Add an Anim to the manager. This is done automatically when an Anim instance is created.
     * @param {Ext.fx.Anim} anim
     */
    addAnim: function(anim) {
        var items = this.items,
            task = this.task;
        // var me = this,
        //     items = me.items,
        //     cb = function() {
        //         if (items.length) {
        //             me.task = true;
        //             me.runner();
        //             me.requestAnimFrame(cb);
        //         }
        //         else {
        //             me.task = false;
        //         }
        //     };

        items.add(anim);

        // Start the timer if not already running
        if (!task && items.length) {
            task = this.task = {
                run: this.runner,
                interval: this.interval,
                scope: this
            };
            Ext.TaskManager.start(task);
        }

        // //Start the timer if not already running
        // if (!me.task && items.length) {
        //     me.requestAnimFrame(cb);
        // }
    },

    /**
     * Remove an Anim from the manager. This is done automatically when an Anim ends.
     * @param {Ext.fx.Anim} anim
     */
    removeAnim: function(anim) {
        // this.items.remove(anim);
        var items = this.items,
            task = this.task;
        items.remove(anim);
        // Stop the timer if there are no more managed Anims
        if (task && !items.length) {
            Ext.TaskManager.stop(task);
            delete this.task;
        }
    },

    /**
     * @private
     * Filter function to determine which animations need to be started
     */
    startingFilter: function(o) {
        return o.paused === false && o.running === false && o.iterations > 0;
    },

    /**
     * @private
     * Filter function to determine which animations are still running
     */
    runningFilter: function(o) {
        return o.paused === false && o.running === true && o.isAnimator !== true;
    },

    /**
     * @private
     * Runner function being called each frame
     */
    runner: function() {
        var me = this,
            items = me.items;

        me.targetData = {};
        me.targetArr = {};

        // Single timestamp for all animations this interval
        me.timestamp = new Date();

        // Start any items not current running
        items.filterBy(me.startingFilter).each(me.startAnim, me);

        // Build the new attributes to be applied for all targets in this frame
        items.filterBy(me.runningFilter).each(me.runAnim, me);

        // Apply all the pending changes to their targets
        me.applyPendingAttrs();
    },

    /**
     * @private
     * Start the individual animation (initialization)
     */
    startAnim: function(anim) {
        anim.start(this.timestamp);
    },

    /**
     * @private
     * Run the individual animation for this frame
     */
    runAnim: function(anim) {
        if (!anim) {
            return;
        }
        var me = this,
            targetId = anim.target.getId(),
            useCSS3 = me.useCSS3 && anim.target.type == 'element',
            elapsedTime = me.timestamp - anim.startTime,
            target, o;

        this.collectTargetData(anim, elapsedTime, useCSS3);

        // For CSS3 animation, we need to immediately set the first frame's attributes without any transition
        // to get a good initial state, then add the transition properties and set the final attributes.
        if (useCSS3) {
            // Flush the collected attributes, without transition
            anim.target.setAttr(me.targetData[targetId], true);

            // Add the end frame data
            me.targetData[targetId] = [];
            me.collectTargetData(anim, anim.duration, useCSS3);

            // Pause the animation so runAnim doesn't keep getting called
            anim.paused = true;

            target = anim.target.target;
            // We only want to attach an event on the last element in a composite
            if (anim.target.isComposite) {
                target = anim.target.target.last();
            }

            // Listen for the transitionend event
            o = {};
            o[Ext.supports.CSS3TransitionEnd] = anim.lastFrame;
            o.scope = anim;
            o.single = true;
            target.on(o);
        }
        // For JS animation, trigger the lastFrame handler if this is the final frame
        else if (elapsedTime >= anim.duration) {
            me.applyPendingAttrs(true);
            delete me.targetData[targetId];
            delete me.targetArr[targetId];
            anim.lastFrame();
        }
    },

    /**
     * Collect target attributes for the given Anim object at the given timestamp
     * @param {Ext.fx.Anim} anim The Anim instance
     * @param {Number} timestamp Time after the anim's start time
     */
    collectTargetData: function(anim, elapsedTime, useCSS3) {
        var targetId = anim.target.getId(),
            targetData = this.targetData[targetId],
            data;
        
        if (!targetData) {
            targetData = this.targetData[targetId] = [];
            this.targetArr[targetId] = anim.target;
        }

        data = {
            duration: anim.duration,
            easing: (useCSS3 && anim.reverse) ? anim.easingFn.reverse().toCSS3() : anim.easing,
            attrs: {}
        };
        Ext.apply(data.attrs, anim.runAnim(elapsedTime));
        targetData.push(data);
    },

    /**
     * @private
     * Apply all pending attribute changes to their targets
     */
    applyPendingAttrs: function(isLastFrame) {
        var targetData = this.targetData,
            targetArr = this.targetArr,
            targetId;
        for (targetId in targetData) {
            if (targetData.hasOwnProperty(targetId)) {
                targetArr[targetId].setAttr(targetData[targetId], false, isLastFrame);
            }
        }
    }
});

