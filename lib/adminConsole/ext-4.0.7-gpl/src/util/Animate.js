/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.Animate
 * This animation class is a mixin.
 * 
 * Ext.util.Animate provides an API for the creation of animated transitions of properties and styles.  
 * This class is used as a mixin and currently applied to {@link Ext.Element}, {@link Ext.CompositeElement}, 
 * {@link Ext.draw.Sprite}, {@link Ext.draw.CompositeSprite}, and {@link Ext.Component}.  Note that Components 
 * have a limited subset of what attributes can be animated such as top, left, x, y, height, width, and 
 * opacity (color, paddings, and margins can not be animated).
 * 
 * ## Animation Basics
 * 
 * All animations require three things - `easing`, `duration`, and `to` (the final end value for each property) 
 * you wish to animate. Easing and duration are defaulted values specified below.
 * Easing describes how the intermediate values used during a transition will be calculated. 
 * {@link Ext.fx.Anim#easing Easing} allows for a transition to change speed over its duration.
 * You may use the defaults for easing and duration, but you must always set a 
 * {@link Ext.fx.Anim#to to} property which is the end value for all animations.  
 * 
 * Popular element 'to' configurations are:
 * 
 *  - opacity
 *  - x
 *  - y
 *  - color
 *  - height
 *  - width 
 * 
 * Popular sprite 'to' configurations are:
 * 
 *  - translation
 *  - path
 *  - scale
 *  - stroke
 *  - rotation
 * 
 * The default duration for animations is 250 (which is a 1/4 of a second).  Duration is denoted in 
 * milliseconds.  Therefore 1 second is 1000, 1 minute would be 60000, and so on. The default easing curve 
 * used for all animations is 'ease'.  Popular easing functions are included and can be found in {@link Ext.fx.Anim#easing Easing}.
 * 
 * For example, a simple animation to fade out an element with a default easing and duration:
 * 
 *     var p1 = Ext.get('myElementId');
 * 
 *     p1.animate({
 *         to: {
 *             opacity: 0
 *         }
 *     });
 * 
 * To make this animation fade out in a tenth of a second:
 * 
 *     var p1 = Ext.get('myElementId');
 * 
 *     p1.animate({
 *        duration: 100,
 *         to: {
 *             opacity: 0
 *         }
 *     });
 * 
 * ## Animation Queues
 * 
 * By default all animations are added to a queue which allows for animation via a chain-style API.
 * For example, the following code will queue 4 animations which occur sequentially (one right after the other):
 * 
 *     p1.animate({
 *         to: {
 *             x: 500
 *         }
 *     }).animate({
 *         to: {
 *             y: 150
 *         }
 *     }).animate({
 *         to: {
 *             backgroundColor: '#f00'  //red
 *         }
 *     }).animate({
 *         to: {
 *             opacity: 0
 *         }
 *     });
 * 
 * You can change this behavior by calling the {@link Ext.util.Animate#syncFx syncFx} method and all 
 * subsequent animations for the specified target will be run concurrently (at the same time).
 * 
 *     p1.syncFx();  //this will make all animations run at the same time
 * 
 *     p1.animate({
 *         to: {
 *             x: 500
 *         }
 *     }).animate({
 *         to: {
 *             y: 150
 *         }
 *     }).animate({
 *         to: {
 *             backgroundColor: '#f00'  //red
 *         }
 *     }).animate({
 *         to: {
 *             opacity: 0
 *         }
 *     });
 * 
 * This works the same as:
 * 
 *     p1.animate({
 *         to: {
 *             x: 500,
 *             y: 150,
 *             backgroundColor: '#f00'  //red
 *             opacity: 0
 *         }
 *     });
 * 
 * The {@link Ext.util.Animate#stopAnimation stopAnimation} method can be used to stop any 
 * currently running animations and clear any queued animations. 
 * 
 * ## Animation Keyframes
 *
 * You can also set up complex animations with {@link Ext.fx.Anim#keyframes keyframes} which follow the 
 * CSS3 Animation configuration pattern. Note rotation, translation, and scaling can only be done for sprites. 
 * The previous example can be written with the following syntax:
 * 
 *     p1.animate({
 *         duration: 1000,  //one second total
 *         keyframes: {
 *             25: {     //from 0 to 250ms (25%)
 *                 x: 0
 *             },
 *             50: {   //from 250ms to 500ms (50%)
 *                 y: 0
 *             },
 *             75: {  //from 500ms to 750ms (75%)
 *                 backgroundColor: '#f00'  //red
 *             },
 *             100: {  //from 750ms to 1sec
 *                 opacity: 0
 *             }
 *         }
 *     });
 * 
 * ## Animation Events
 * 
 * Each animation you create has events for {@link Ext.fx.Anim#beforeanimate beforeanimate}, 
 * {@link Ext.fx.Anim#afteranimate afteranimate}, and {@link Ext.fx.Anim#lastframe lastframe}.  
 * Keyframed animations adds an additional {@link Ext.fx.Animator#keyframe keyframe} event which 
 * fires for each keyframe in your animation.
 * 
 * All animations support the {@link Ext.util.Observable#listeners listeners} configuration to attact functions to these events.
 *    
 *     startAnimate: function() {
 *         var p1 = Ext.get('myElementId');
 *         p1.animate({
 *            duration: 100,
 *             to: {
 *                 opacity: 0
 *             },
 *             listeners: {
 *                 beforeanimate:  function() {
 *                     // Execute my custom method before the animation
 *                     this.myBeforeAnimateFn();
 *                 },
 *                 afteranimate: function() {
 *                     // Execute my custom method after the animation
 *                     this.myAfterAnimateFn();
 *                 },
 *                 scope: this
 *         });
 *     },
 *     myBeforeAnimateFn: function() {
 *       // My custom logic
 *     },
 *     myAfterAnimateFn: function() {
 *       // My custom logic
 *     }
 * 
 * Due to the fact that animations run asynchronously, you can determine if an animation is currently 
 * running on any target by using the {@link Ext.util.Animate#getActiveAnimation getActiveAnimation} 
 * method.  This method will return false if there are no active animations or return the currently 
 * running {@link Ext.fx.Anim} instance.
 * 
 * In this example, we're going to wait for the current animation to finish, then stop any other 
 * queued animations before we fade our element's opacity to 0:
 * 
 *     var curAnim = p1.getActiveAnimation();
 *     if (curAnim) {
 *         curAnim.on('afteranimate', function() {
 *             p1.stopAnimation();
 *             p1.animate({
 *                 to: {
 *                     opacity: 0
 *                 }
 *             });
 *         });
 *     }
 * 
 * @docauthor Jamie Avins <jamie@sencha.com>
 */
Ext.define('Ext.util.Animate', {

    uses: ['Ext.fx.Manager', 'Ext.fx.Anim'],

    /**
     * <p>Perform custom animation on this object.<p>
     * <p>This method is applicable to both the {@link Ext.Component Component} class and the {@link Ext.Element Element} class.
     * It performs animated transitions of certain properties of this object over a specified timeline.</p>
     * <p>The sole parameter is an object which specifies start property values, end property values, and properties which
     * describe the timeline. Of the properties listed below, only <b><code>to</code></b> is mandatory.</p>
     * <p>Properties include<ul>
     * <li><code>from</code> <div class="sub-desc">An object which specifies start values for the properties being animated.
     * If not supplied, properties are animated from current settings. The actual properties which may be animated depend upon
     * ths object being animated. See the sections below on Element and Component animation.<div></li>
     * <li><code>to</code> <div class="sub-desc">An object which specifies end values for the properties being animated.</div></li>
     * <li><code>duration</code><div class="sub-desc">The duration <b>in milliseconds</b> for which the animation will run.</div></li>
     * <li><code>easing</code> <div class="sub-desc">A string value describing an easing type to modify the rate of change from the default linear to non-linear. Values may be one of:<code><ul>
     * <li>ease</li>
     * <li>easeIn</li>
     * <li>easeOut</li>
     * <li>easeInOut</li>
     * <li>backIn</li>
     * <li>backOut</li>
     * <li>elasticIn</li>
     * <li>elasticOut</li>
     * <li>bounceIn</li>
     * <li>bounceOut</li>
     * </ul></code></div></li>
     * <li><code>keyframes</code> <div class="sub-desc">This is an object which describes the state of animated properties at certain points along the timeline.
     * it is an object containing properties who's names are the percentage along the timeline being described and who's values specify the animation state at that point.</div></li>
     * <li><code>listeners</code> <div class="sub-desc">This is a standard {@link Ext.util.Observable#listeners listeners} configuration object which may be used
     * to inject behaviour at either the <code>beforeanimate</code> event or the <code>afteranimate</code> event.</div></li>
     * </ul></p>
     * <h3>Animating an {@link Ext.Element Element}</h3>
     * When animating an Element, the following properties may be specified in <code>from</code>, <code>to</code>, and <code>keyframe</code> objects:<ul>
     * <li><code>x</code> <div class="sub-desc">The page X position in pixels.</div></li>
     * <li><code>y</code> <div class="sub-desc">The page Y position in pixels</div></li>
     * <li><code>left</code> <div class="sub-desc">The element's CSS <code>left</code> value. Units must be supplied.</div></li>
     * <li><code>top</code> <div class="sub-desc">The element's CSS <code>top</code> value. Units must be supplied.</div></li>
     * <li><code>width</code> <div class="sub-desc">The element's CSS <code>width</code> value. Units must be supplied.</div></li>
     * <li><code>height</code> <div class="sub-desc">The element's CSS <code>height</code> value. Units must be supplied.</div></li>
     * <li><code>scrollLeft</code> <div class="sub-desc">The element's <code>scrollLeft</code> value.</div></li>
     * <li><code>scrollTop</code> <div class="sub-desc">The element's <code>scrollLeft</code> value.</div></li>
     * <li><code>opacity</code> <div class="sub-desc">The element's <code>opacity</code> value. This must be a value between <code>0</code> and <code>1</code>.</div></li>
     * </ul>
     * <p><b>Be aware than animating an Element which is being used by an Ext Component without in some way informing the Component about the changed element state
     * will result in incorrect Component behaviour. This is because the Component will be using the old state of the element. To avoid this problem, it is now possible to
     * directly animate certain properties of Components.</b></p>
     * <h3>Animating a {@link Ext.Component Component}</h3>
     * When animating an Element, the following properties may be specified in <code>from</code>, <code>to</code>, and <code>keyframe</code> objects:<ul>
     * <li><code>x</code> <div class="sub-desc">The Component's page X position in pixels.</div></li>
     * <li><code>y</code> <div class="sub-desc">The Component's page Y position in pixels</div></li>
     * <li><code>left</code> <div class="sub-desc">The Component's <code>left</code> value in pixels.</div></li>
     * <li><code>top</code> <div class="sub-desc">The Component's <code>top</code> value in pixels.</div></li>
     * <li><code>width</code> <div class="sub-desc">The Component's <code>width</code> value in pixels.</div></li>
     * <li><code>width</code> <div class="sub-desc">The Component's <code>width</code> value in pixels.</div></li>
     * <li><code>dynamic</code> <div class="sub-desc">Specify as true to update the Component's layout (if it is a Container) at every frame
     * of the animation. <i>Use sparingly as laying out on every intermediate size change is an expensive operation</i>.</div></li>
     * </ul>
     * <p>For example, to animate a Window to a new size, ensuring that its internal layout, and any shadow is correct:</p>
     * <pre><code>
myWindow = Ext.create('Ext.window.Window', {
    title: 'Test Component animation',
    width: 500,
    height: 300,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        title: 'Left: 33%',
        margins: '5 0 5 5',
        flex: 1
    }, {
        title: 'Left: 66%',
        margins: '5 5 5 5',
        flex: 2
    }]
});
myWindow.show();
myWindow.header.el.on('click', function() {
    myWindow.animate({
        to: {
            width: (myWindow.getWidth() == 500) ? 700 : 500,
            height: (myWindow.getHeight() == 300) ? 400 : 300,
        }
    });
});
</code></pre>
     * <p>For performance reasons, by default, the internal layout is only updated when the Window reaches its final <code>"to"</code> size. If dynamic updating of the Window's child
     * Components is required, then configure the animation with <code>dynamic: true</code> and the two child items will maintain their proportions during the animation.</p>
     * @param {Object} config An object containing properties which describe the animation's start and end states, and the timeline of the animation.
     * @return {Object} this
     */
    animate: function(animObj) {
        var me = this;
        if (Ext.fx.Manager.hasFxBlock(me.id)) {
            return me;
        }
        Ext.fx.Manager.queueFx(Ext.create('Ext.fx.Anim', me.anim(animObj)));
        return this;
    },

    // @private - process the passed fx configuration.
    anim: function(config) {
        if (!Ext.isObject(config)) {
            return (config) ? {} : false;
        }

        var me = this;

        if (config.stopAnimation) {
            me.stopAnimation();
        }

        Ext.applyIf(config, Ext.fx.Manager.getFxDefaults(me.id));

        return Ext.apply({
            target: me,
            paused: true
        }, config);
    },

    /**
     * @deprecated 4.0 Replaced by {@link #stopAnimation}
     * Stops any running effects and clears this object's internal effects queue if it contains
     * any additional effects that haven't started yet.
     * @return {Ext.Element} The Element
     * @method
     */
    stopFx: Ext.Function.alias(Ext.util.Animate, 'stopAnimation'),

    /**
     * Stops any running effects and clears this object's internal effects queue if it contains
     * any additional effects that haven't started yet.
     * @return {Ext.Element} The Element
     */
    stopAnimation: function() {
        Ext.fx.Manager.stopAnimation(this.id);
        return this;
    },

    /**
     * Ensures that all effects queued after syncFx is called on this object are
     * run concurrently.  This is the opposite of {@link #sequenceFx}.
     * @return {Object} this
     */
    syncFx: function() {
        Ext.fx.Manager.setFxDefaults(this.id, {
            concurrent: true
        });
        return this;
    },

    /**
     * Ensures that all effects queued after sequenceFx is called on this object are
     * run in sequence.  This is the opposite of {@link #syncFx}.
     * @return {Object} this
     */
    sequenceFx: function() {
        Ext.fx.Manager.setFxDefaults(this.id, {
            concurrent: false
        });
        return this;
    },

    /**
     * @deprecated 4.0 Replaced by {@link #getActiveAnimation}
     * @alias Ext.util.Animate#getActiveAnimation
     * @method
     */
    hasActiveFx: Ext.Function.alias(Ext.util.Animate, 'getActiveAnimation'),

    /**
     * Returns the current animation if this object has any effects actively running or queued, else returns false.
     * @return {Ext.fx.Anim/Boolean} Anim if element has active effects, else false
     */
    getActiveAnimation: function() {
        return Ext.fx.Manager.getActiveAnimation(this.id);
    }
}, function(){
    // Apply Animate mixin manually until Element is defined in the proper 4.x way
    Ext.applyIf(Ext.Element.prototype, this.prototype);
    // We need to call this again so the animation methods get copied over to CE
    Ext.CompositeElementLite.importElementMethods();
});
