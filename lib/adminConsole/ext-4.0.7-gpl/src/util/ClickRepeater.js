/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.ClickRepeater
 * @extends Ext.util.Observable
 *
 * A wrapper class which can be applied to any element. Fires a "click" event while the
 * mouse is pressed. The interval between firings may be specified in the config but
 * defaults to 20 milliseconds.
 *
 * Optionally, a CSS class may be applied to the element during the time it is pressed.
 *
 */
Ext.define('Ext.util.ClickRepeater', {
    extend: 'Ext.util.Observable',

    /**
     * Creates new ClickRepeater.
     * @param {String/HTMLElement/Ext.Element} el The element or its ID to listen on
     * @param {Object} config (optional) Config object.
     */
    constructor : function(el, config){
        this.el = Ext.get(el);
        this.el.unselectable();

        Ext.apply(this, config);

        this.addEvents(
        /**
         * @event mousedown
         * Fires when the mouse button is depressed.
         * @param {Ext.util.ClickRepeater} this
         * @param {Ext.EventObject} e
         */
        "mousedown",
        /**
         * @event click
         * Fires on a specified interval during the time the element is pressed.
         * @param {Ext.util.ClickRepeater} this
         * @param {Ext.EventObject} e
         */
        "click",
        /**
         * @event mouseup
         * Fires when the mouse key is released.
         * @param {Ext.util.ClickRepeater} this
         * @param {Ext.EventObject} e
         */
        "mouseup"
        );

        if(!this.disabled){
            this.disabled = true;
            this.enable();
        }

        // allow inline handler
        if(this.handler){
            this.on("click", this.handler,  this.scope || this);
        }

        this.callParent();
    },

    /**
     * @cfg {String/HTMLElement/Ext.Element} el The element to act as a button.
     */

    /**
     * @cfg {String} pressedCls A CSS class name to be applied to the element while pressed.
     */

    /**
     * @cfg {Boolean} accelerate True if autorepeating should start slowly and accelerate.
     * "interval" and "delay" are ignored.
     */

    /**
     * @cfg {Number} interval The interval between firings of the "click" event. Default 20 ms.
     */
    interval : 20,

    /**
     * @cfg {Number} delay The initial delay before the repeating event begins firing.
     * Similar to an autorepeat key delay.
     */
    delay: 250,

    /**
     * @cfg {Boolean} preventDefault True to prevent the default click event
     */
    preventDefault : true,
    /**
     * @cfg {Boolean} stopDefault True to stop the default click event
     */
    stopDefault : false,

    timer : 0,

    /**
     * Enables the repeater and allows events to fire.
     */
    enable: function(){
        if(this.disabled){
            this.el.on('mousedown', this.handleMouseDown, this);
            if (Ext.isIE){
                this.el.on('dblclick', this.handleDblClick, this);
            }
            if(this.preventDefault || this.stopDefault){
                this.el.on('click', this.eventOptions, this);
            }
        }
        this.disabled = false;
    },

    /**
     * Disables the repeater and stops events from firing.
     */
    disable: function(/* private */ force){
        if(force || !this.disabled){
            clearTimeout(this.timer);
            if(this.pressedCls){
                this.el.removeCls(this.pressedCls);
            }
            Ext.getDoc().un('mouseup', this.handleMouseUp, this);
            this.el.removeAllListeners();
        }
        this.disabled = true;
    },

    /**
     * Convenience function for setting disabled/enabled by boolean.
     * @param {Boolean} disabled
     */
    setDisabled: function(disabled){
        this[disabled ? 'disable' : 'enable']();
    },

    eventOptions: function(e){
        if(this.preventDefault){
            e.preventDefault();
        }
        if(this.stopDefault){
            e.stopEvent();
        }
    },

    // private
    destroy : function() {
        this.disable(true);
        Ext.destroy(this.el);
        this.clearListeners();
    },

    handleDblClick : function(e){
        clearTimeout(this.timer);
        this.el.blur();

        this.fireEvent("mousedown", this, e);
        this.fireEvent("click", this, e);
    },

    // private
    handleMouseDown : function(e){
        clearTimeout(this.timer);
        this.el.blur();
        if(this.pressedCls){
            this.el.addCls(this.pressedCls);
        }
        this.mousedownTime = new Date();

        Ext.getDoc().on("mouseup", this.handleMouseUp, this);
        this.el.on("mouseout", this.handleMouseOut, this);

        this.fireEvent("mousedown", this, e);
        this.fireEvent("click", this, e);

        // Do not honor delay or interval if acceleration wanted.
        if (this.accelerate) {
            this.delay = 400;
        }

        // Re-wrap the event object in a non-shared object, so it doesn't lose its context if
        // the global shared EventObject gets a new Event put into it before the timer fires.
        e = new Ext.EventObjectImpl(e);

        this.timer =  Ext.defer(this.click, this.delay || this.interval, this, [e]);
    },

    // private
    click : function(e){
        this.fireEvent("click", this, e);
        this.timer =  Ext.defer(this.click, this.accelerate ?
            this.easeOutExpo(Ext.Date.getElapsed(this.mousedownTime),
                400,
                -390,
                12000) :
            this.interval, this, [e]);
    },

    easeOutExpo : function (t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },

    // private
    handleMouseOut : function(){
        clearTimeout(this.timer);
        if(this.pressedCls){
            this.el.removeCls(this.pressedCls);
        }
        this.el.on("mouseover", this.handleMouseReturn, this);
    },

    // private
    handleMouseReturn : function(){
        this.el.un("mouseover", this.handleMouseReturn, this);
        if(this.pressedCls){
            this.el.addCls(this.pressedCls);
        }
        this.click();
    },

    // private
    handleMouseUp : function(e){
        clearTimeout(this.timer);
        this.el.un("mouseover", this.handleMouseReturn, this);
        this.el.un("mouseout", this.handleMouseOut, this);
        Ext.getDoc().un("mouseup", this.handleMouseUp, this);
        if(this.pressedCls){
            this.el.removeCls(this.pressedCls);
        }
        this.fireEvent("mouseup", this, e);
    }
});

