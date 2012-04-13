/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * An updateable progress bar component. The progress bar supports two different modes: manual and automatic.
 *
 * In manual mode, you are responsible for showing, updating (via {@link #updateProgress}) and clearing the progress bar
 * as needed from your own code. This method is most appropriate when you want to show progress throughout an operation
 * that has predictable points of interest at which you can update the control.
 *
 * In automatic mode, you simply call {@link #wait} and let the progress bar run indefinitely, only clearing it once the
 * operation is complete. You can optionally have the progress bar wait for a specific amount of time and then clear
 * itself. Automatic mode is most appropriate for timed operations or asynchronous operations in which you have no need
 * for indicating intermediate progress.
 *
 *     @example
 *     var p = Ext.create('Ext.ProgressBar', {
 *        renderTo: Ext.getBody(),
 *        width: 300
 *     });
 *
 *     // Wait for 5 seconds, then update the status el (progress bar will auto-reset)
 *     p.wait({
 *         interval: 500, //bar will move fast!
 *         duration: 50000,
 *         increment: 15,
 *         text: 'Updating...',
 *         scope: this,
 *         fn: function(){
 *             p.updateText('Done!');
 *         }
 *     });
 */
Ext.define('Ext.ProgressBar', {
    extend: 'Ext.Component',
    alias: 'widget.progressbar',

    requires: [
        'Ext.Template',
        'Ext.CompositeElement',
        'Ext.TaskManager',
        'Ext.layout.component.ProgressBar'
    ],

    uses: ['Ext.fx.Anim'],

   /**
    * @cfg {Number} [value=0]
    * A floating point value between 0 and 1 (e.g., .5)
    */

   /**
    * @cfg {String} [text='']
    * The progress bar text (defaults to '')
    */

   /**
    * @cfg {String/HTMLElement/Ext.Element} textEl
    * The element to render the progress text to (defaults to the progress bar's internal text element)
    */

   /**
    * @cfg {String} id
    * The progress bar element's id (defaults to an auto-generated id)
    */

   /**
    * @cfg {String} [baseCls='x-progress']
    * The base CSS class to apply to the progress bar's wrapper element.
    */
    baseCls: Ext.baseCSSPrefix + 'progress',

    config: {
        /**
        * @cfg {Boolean} animate
        * True to animate the progress bar during transitions
        */
        animate: false,

        /**
         * @cfg {String} text
         * The text shown in the progress bar
         */
        text: ''
    },

    // private
    waitTimer: null,

    renderTpl: [
        '<div class="{baseCls}-text {baseCls}-text-back">',
            '<div>&#160;</div>',
        '</div>',
        '<div id="{id}-bar" class="{baseCls}-bar">',
            '<div class="{baseCls}-text">',
                '<div>&#160;</div>',
            '</div>',
        '</div>'
    ],

    componentLayout: 'progressbar',

    // private
    initComponent: function() {
        this.callParent();

        this.addChildEls('bar');

        this.addEvents(
            /**
             * @event update
             * Fires after each update interval
             * @param {Ext.ProgressBar} this
             * @param {Number} value The current progress value
             * @param {String} text The current progress text
             */
            "update"
        );
    },

    afterRender : function() {
        var me = this;

        // This produces a composite w/2 el's (which is why we cannot use childEls or
        // renderSelectors):
        me.textEl = me.textEl ? Ext.get(me.textEl) : me.el.select('.' + me.baseCls + '-text');

        me.callParent(arguments);

        if (me.value) {
            me.updateProgress(me.value, me.text);
        }
        else {
            me.updateText(me.text);
        }
    },

    /**
     * Updates the progress bar value, and optionally its text. If the text argument is not specified, any existing text
     * value will be unchanged. To blank out existing text, pass ''. Note that even if the progress bar value exceeds 1,
     * it will never automatically reset -- you are responsible for determining when the progress is complete and
     * calling {@link #reset} to clear and/or hide the control.
     * @param {Number} [value=0] A floating point value between 0 and 1 (e.g., .5)
     * @param {String} [text=''] The string to display in the progress text element
     * @param {Boolean} [animate=false] Whether to animate the transition of the progress bar. If this value is not
     * specified, the default for the class is used
     * @return {Ext.ProgressBar} this
     */
    updateProgress: function(value, text, animate) {
        var me = this,
            newWidth;
            
        me.value = value || 0;
        if (text) {
            me.updateText(text);
        }
        if (me.rendered && !me.isDestroyed) {
            if (me.isVisible(true)) {
                newWidth = Math.floor(me.value * me.el.getWidth(true));
                if (Ext.isForcedBorderBox) {
                    newWidth += me.bar.getBorderWidth("lr");
                }
                if (animate === true || (animate !== false && me.animate)) {
                    me.bar.stopAnimation();
                    me.bar.animate(Ext.apply({
                        to: {
                            width: newWidth + 'px'
                        }
                    }, me.animate));
                } else {
                    me.bar.setWidth(newWidth);
                }
            } else {
                // force a layout when we're visible again
                me.doComponentLayout();
            }
        }
        me.fireEvent('update', me, me.value, text);
        return me;
    },

    /**
     * Updates the progress bar text. If specified, textEl will be updated, otherwise the progress bar itself will
     * display the updated text.
     * @param {String} [text=''] The string to display in the progress text element
     * @return {Ext.ProgressBar} this
     */
    updateText: function(text) {
        var me = this;
        
        me.text = text;
        if (me.rendered) {
            me.textEl.update(me.text);
        }
        return me;
    },

    applyText : function(text) {
        this.updateText(text);
    },

    /**
     * Initiates an auto-updating progress bar. A duration can be specified, in which case the progress bar will
     * automatically reset after a fixed amount of time and optionally call a callback function if specified. If no
     * duration is passed in, then the progress bar will run indefinitely and must be manually cleared by calling
     * {@link #reset}.
     *
     * Example usage:
     *
     *     var p = new Ext.ProgressBar({
     *        renderTo: 'my-el'
     *     });
     *
     *     //Wait for 5 seconds, then update the status el (progress bar will auto-reset)
     *     var p = Ext.create('Ext.ProgressBar', {
     *        renderTo: Ext.getBody(),
     *        width: 300
     *     });
     *
     *     //Wait for 5 seconds, then update the status el (progress bar will auto-reset)
     *     p.wait({
     *        interval: 500, //bar will move fast!
     *        duration: 50000,
     *        increment: 15,
     *        text: 'Updating...',
     *        scope: this,
     *        fn: function(){
     *           p.updateText('Done!');
     *        }
     *     });
     *
     *     //Or update indefinitely until some async action completes, then reset manually
     *     p.wait();
     *     myAction.on('complete', function(){
     *         p.reset();
     *         p.updateText('Done!');
     *     });
     *
     * @param {Object} config (optional) Configuration options
     * @param {Number} config.duration The length of time in milliseconds that the progress bar should
     * run before resetting itself (defaults to undefined, in which case it will run indefinitely
     * until reset is called)
     * @param {Number} config.interval The length of time in milliseconds between each progress update
     * (defaults to 1000 ms)
     * @param {Boolean} config.animate Whether to animate the transition of the progress bar. If this
     * value is not specified, the default for the class is used.
     * @param {Number} config.increment The number of progress update segments to display within the
     * progress bar (defaults to 10).  If the bar reaches the end and is still updating, it will
     * automatically wrap back to the beginning.
     * @param {String} config.text Optional text to display in the progress bar element (defaults to '').
     * @param {Function} config.fn A callback function to execute after the progress bar finishes auto-
     * updating.  The function will be called with no arguments.  This function will be ignored if
     * duration is not specified since in that case the progress bar can only be stopped programmatically,
     * so any required function should be called by the same code after it resets the progress bar.
     * @param {Object} config.scope The scope that is passed to the callback function (only applies when
     * duration and fn are both passed).
     * @return {Ext.ProgressBar} this
     */
    wait: function(o) {
        var me = this;
            
        if (!me.waitTimer) {
            scope = me;
            o = o || {};
            me.updateText(o.text);
            me.waitTimer = Ext.TaskManager.start({
                run: function(i){
                    var inc = o.increment || 10;
                    i -= 1;
                    me.updateProgress(((((i+inc)%inc)+1)*(100/inc))*0.01, null, o.animate);
                },
                interval: o.interval || 1000,
                duration: o.duration,
                onStop: function(){
                    if (o.fn) {
                        o.fn.apply(o.scope || me);
                    }
                    me.reset();
                },
                scope: scope
            });
        }
        return me;
    },

    /**
     * Returns true if the progress bar is currently in a {@link #wait} operation
     * @return {Boolean} True if waiting, else false
     */
    isWaiting: function(){
        return this.waitTimer !== null;
    },

    /**
     * Resets the progress bar value to 0 and text to empty string. If hide = true, the progress bar will also be hidden
     * (using the {@link #hideMode} property internally).
     * @param {Boolean} [hide=false] True to hide the progress bar.
     * @return {Ext.ProgressBar} this
     */
    reset: function(hide){
        var me = this;
        
        me.updateProgress(0);
        me.clearTimer();
        if (hide === true) {
            me.hide();
        }
        return me;
    },

    // private
    clearTimer: function(){
        var me = this;
        
        if (me.waitTimer) {
            me.waitTimer.onStop = null; //prevent recursion
            Ext.TaskManager.stop(me.waitTimer);
            me.waitTimer = null;
        }
    },

    onDestroy: function(){
        var me = this;
        
        me.clearTimer();
        if (me.rendered) {
            if (me.textEl.isComposite) {
                me.textEl.clear();
            }
            Ext.destroyMembers(me, 'textEl', 'progressBar');
        }
        me.callParent();
    }
});

