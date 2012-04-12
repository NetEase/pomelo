/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.EventObject

Just as {@link Ext.Element} wraps around a native DOM node, Ext.EventObject
wraps the browser's native event-object normalizing cross-browser differences,
such as which mouse button is clicked, keys pressed, mechanisms to stop
event-propagation along with a method to prevent default actions from taking place.

For example:

    function handleClick(e, t){ // e is not a standard event object, it is a Ext.EventObject
        e.preventDefault();
        var target = e.getTarget(); // same as t (the target HTMLElement)
        ...
    }

    var myDiv = {@link Ext#get Ext.get}("myDiv");  // get reference to an {@link Ext.Element}
    myDiv.on(         // 'on' is shorthand for addListener
        "click",      // perform an action on click of myDiv
        handleClick   // reference to the action handler
    );

    // other methods to do the same:
    Ext.EventManager.on("myDiv", 'click', handleClick);
    Ext.EventManager.addListener("myDiv", 'click', handleClick);

 * @singleton
 * @markdown
 */
Ext.define('Ext.EventObjectImpl', {
    uses: ['Ext.util.Point'],

    /** Key constant @type Number */
    BACKSPACE: 8,
    /** Key constant @type Number */
    TAB: 9,
    /** Key constant @type Number */
    NUM_CENTER: 12,
    /** Key constant @type Number */
    ENTER: 13,
    /** Key constant @type Number */
    RETURN: 13,
    /** Key constant @type Number */
    SHIFT: 16,
    /** Key constant @type Number */
    CTRL: 17,
    /** Key constant @type Number */
    ALT: 18,
    /** Key constant @type Number */
    PAUSE: 19,
    /** Key constant @type Number */
    CAPS_LOCK: 20,
    /** Key constant @type Number */
    ESC: 27,
    /** Key constant @type Number */
    SPACE: 32,
    /** Key constant @type Number */
    PAGE_UP: 33,
    /** Key constant @type Number */
    PAGE_DOWN: 34,
    /** Key constant @type Number */
    END: 35,
    /** Key constant @type Number */
    HOME: 36,
    /** Key constant @type Number */
    LEFT: 37,
    /** Key constant @type Number */
    UP: 38,
    /** Key constant @type Number */
    RIGHT: 39,
    /** Key constant @type Number */
    DOWN: 40,
    /** Key constant @type Number */
    PRINT_SCREEN: 44,
    /** Key constant @type Number */
    INSERT: 45,
    /** Key constant @type Number */
    DELETE: 46,
    /** Key constant @type Number */
    ZERO: 48,
    /** Key constant @type Number */
    ONE: 49,
    /** Key constant @type Number */
    TWO: 50,
    /** Key constant @type Number */
    THREE: 51,
    /** Key constant @type Number */
    FOUR: 52,
    /** Key constant @type Number */
    FIVE: 53,
    /** Key constant @type Number */
    SIX: 54,
    /** Key constant @type Number */
    SEVEN: 55,
    /** Key constant @type Number */
    EIGHT: 56,
    /** Key constant @type Number */
    NINE: 57,
    /** Key constant @type Number */
    A: 65,
    /** Key constant @type Number */
    B: 66,
    /** Key constant @type Number */
    C: 67,
    /** Key constant @type Number */
    D: 68,
    /** Key constant @type Number */
    E: 69,
    /** Key constant @type Number */
    F: 70,
    /** Key constant @type Number */
    G: 71,
    /** Key constant @type Number */
    H: 72,
    /** Key constant @type Number */
    I: 73,
    /** Key constant @type Number */
    J: 74,
    /** Key constant @type Number */
    K: 75,
    /** Key constant @type Number */
    L: 76,
    /** Key constant @type Number */
    M: 77,
    /** Key constant @type Number */
    N: 78,
    /** Key constant @type Number */
    O: 79,
    /** Key constant @type Number */
    P: 80,
    /** Key constant @type Number */
    Q: 81,
    /** Key constant @type Number */
    R: 82,
    /** Key constant @type Number */
    S: 83,
    /** Key constant @type Number */
    T: 84,
    /** Key constant @type Number */
    U: 85,
    /** Key constant @type Number */
    V: 86,
    /** Key constant @type Number */
    W: 87,
    /** Key constant @type Number */
    X: 88,
    /** Key constant @type Number */
    Y: 89,
    /** Key constant @type Number */
    Z: 90,
    /** Key constant @type Number */
    CONTEXT_MENU: 93,
    /** Key constant @type Number */
    NUM_ZERO: 96,
    /** Key constant @type Number */
    NUM_ONE: 97,
    /** Key constant @type Number */
    NUM_TWO: 98,
    /** Key constant @type Number */
    NUM_THREE: 99,
    /** Key constant @type Number */
    NUM_FOUR: 100,
    /** Key constant @type Number */
    NUM_FIVE: 101,
    /** Key constant @type Number */
    NUM_SIX: 102,
    /** Key constant @type Number */
    NUM_SEVEN: 103,
    /** Key constant @type Number */
    NUM_EIGHT: 104,
    /** Key constant @type Number */
    NUM_NINE: 105,
    /** Key constant @type Number */
    NUM_MULTIPLY: 106,
    /** Key constant @type Number */
    NUM_PLUS: 107,
    /** Key constant @type Number */
    NUM_MINUS: 109,
    /** Key constant @type Number */
    NUM_PERIOD: 110,
    /** Key constant @type Number */
    NUM_DIVISION: 111,
    /** Key constant @type Number */
    F1: 112,
    /** Key constant @type Number */
    F2: 113,
    /** Key constant @type Number */
    F3: 114,
    /** Key constant @type Number */
    F4: 115,
    /** Key constant @type Number */
    F5: 116,
    /** Key constant @type Number */
    F6: 117,
    /** Key constant @type Number */
    F7: 118,
    /** Key constant @type Number */
    F8: 119,
    /** Key constant @type Number */
    F9: 120,
    /** Key constant @type Number */
    F10: 121,
    /** Key constant @type Number */
    F11: 122,
    /** Key constant @type Number */
    F12: 123,
    /**
     * The mouse wheel delta scaling factor. This value depends on browser version and OS and
     * attempts to produce a similar scrolling experience across all platforms and browsers.
     *
     * To change this value:
     *
     *      Ext.EventObjectImpl.prototype.WHEEL_SCALE = 72;
     *
     * @type Number
     * @markdown
     */
    WHEEL_SCALE: (function () {
        var scale;

        if (Ext.isGecko) {
            // Firefox uses 3 on all platforms
            scale = 3;
        } else if (Ext.isMac) {
            // Continuous scrolling devices have momentum and produce much more scroll than
            // discrete devices on the same OS and browser. To make things exciting, Safari
            // (and not Chrome) changed from small values to 120 (like IE).

            if (Ext.isSafari && Ext.webKitVersion >= 532.0) {
                // Safari changed the scrolling factor to match IE (for details see
                // https://bugs.webkit.org/show_bug.cgi?id=24368). The WebKit version where this
                // change was introduced was 532.0
                //      Detailed discussion:
                //      https://bugs.webkit.org/show_bug.cgi?id=29601
                //      http://trac.webkit.org/browser/trunk/WebKit/chromium/src/mac/WebInputEventFactory.mm#L1063
                scale = 120;
            } else {
                // MS optical wheel mouse produces multiples of 12 which is close enough
                // to help tame the speed of the continuous mice...
                scale = 12;
            }

            // Momentum scrolling produces very fast scrolling, so increase the scale factor
            // to help produce similar results cross platform. This could be even larger and
            // it would help those mice, but other mice would become almost unusable as a
            // result (since we cannot tell which device type is in use).
            scale *= 3;
        } else {
            // IE, Opera and other Windows browsers use 120.
            scale = 120;
        }

        return scale;
    })(),

    /**
     * Simple click regex
     * @private
     */
    clickRe: /(dbl)?click/,
    // safari keypress events for special keys return bad keycodes
    safariKeys: {
        3: 13, // enter
        63234: 37, // left
        63235: 39, // right
        63232: 38, // up
        63233: 40, // down
        63276: 33, // page up
        63277: 34, // page down
        63272: 46, // delete
        63273: 36, // home
        63275: 35 // end
    },
    // normalize button clicks, don't see any way to feature detect this.
    btnMap: Ext.isIE ? {
        1: 0,
        4: 1,
        2: 2
    } : {
        0: 0,
        1: 1,
        2: 2
    },

    constructor: function(event, freezeEvent){
        if (event) {
            this.setEvent(event.browserEvent || event, freezeEvent);
        }
    },

    setEvent: function(event, freezeEvent){
        var me = this, button, options;

        if (event == me || (event && event.browserEvent)) { // already wrapped
            return event;
        }
        me.browserEvent = event;
        if (event) {
            // normalize buttons
            button = event.button ? me.btnMap[event.button] : (event.which ? event.which - 1 : -1);
            if (me.clickRe.test(event.type) && button == -1) {
                button = 0;
            }
            options = {
                type: event.type,
                button: button,
                shiftKey: event.shiftKey,
                // mac metaKey behaves like ctrlKey
                ctrlKey: event.ctrlKey || event.metaKey || false,
                altKey: event.altKey,
                // in getKey these will be normalized for the mac
                keyCode: event.keyCode,
                charCode: event.charCode,
                // cache the targets for the delayed and or buffered events
                target: Ext.EventManager.getTarget(event),
                relatedTarget: Ext.EventManager.getRelatedTarget(event),
                currentTarget: event.currentTarget,
                xy: (freezeEvent ? me.getXY() : null)
            };
        } else {
            options = {
                button: -1,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
                keyCode: 0,
                charCode: 0,
                target: null,
                xy: [0, 0]
            };
        }
        Ext.apply(me, options);
        return me;
    },

    /**
     * Stop the event (preventDefault and stopPropagation)
     */
    stopEvent: function(){
        this.stopPropagation();
        this.preventDefault();
    },

    /**
     * Prevents the browsers default handling of the event.
     */
    preventDefault: function(){
        if (this.browserEvent) {
            Ext.EventManager.preventDefault(this.browserEvent);
        }
    },

    /**
     * Cancels bubbling of the event.
     */
    stopPropagation: function(){
        var browserEvent = this.browserEvent;

        if (browserEvent) {
            if (browserEvent.type == 'mousedown') {
                Ext.EventManager.stoppedMouseDownEvent.fire(this);
            }
            Ext.EventManager.stopPropagation(browserEvent);
        }
    },

    /**
     * Gets the character code for the event.
     * @return {Number}
     */
    getCharCode: function(){
        return this.charCode || this.keyCode;
    },

    /**
     * Returns a normalized keyCode for the event.
     * @return {Number} The key code
     */
    getKey: function(){
        return this.normalizeKey(this.keyCode || this.charCode);
    },

    /**
     * Normalize key codes across browsers
     * @private
     * @param {Number} key The key code
     * @return {Number} The normalized code
     */
    normalizeKey: function(key){
        // can't feature detect this
        return Ext.isWebKit ? (this.safariKeys[key] || key) : key;
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     * @deprecated 4.0 Replaced by {@link #getX}
     */
    getPageX: function(){
        return this.getX();
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     * @deprecated 4.0 Replaced by {@link #getY}
     */
    getPageY: function(){
        return this.getY();
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     */
    getX: function() {
        return this.getXY()[0];
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     */
    getY: function() {
        return this.getXY()[1];
    },

    /**
     * Gets the page coordinates of the event.
     * @return {Number[]} The xy values like [x, y]
     */
    getXY: function() {
        if (!this.xy) {
            // same for XY
            this.xy = Ext.EventManager.getPageXY(this.browserEvent);
        }
        return this.xy;
    },

    /**
     * Gets the target for the event.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/HTMLElement} maxDepth (optional) The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement}
     */
    getTarget : function(selector, maxDepth, returnEl){
        if (selector) {
            return Ext.fly(this.target).findParent(selector, maxDepth, returnEl);
        }
        return returnEl ? Ext.get(this.target) : this.target;
    },

    /**
     * Gets the related target.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/HTMLElement} maxDepth (optional) The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement}
     */
    getRelatedTarget : function(selector, maxDepth, returnEl){
        if (selector) {
            return Ext.fly(this.relatedTarget).findParent(selector, maxDepth, returnEl);
        }
        return returnEl ? Ext.get(this.relatedTarget) : this.relatedTarget;
    },

    /**
     * Correctly scales a given wheel delta.
     * @param {Number} delta The delta value.
     */
    correctWheelDelta : function (delta) {
        var scale = this.WHEEL_SCALE,
            ret = Math.round(delta / scale);

        if (!ret && delta) {
            ret = (delta < 0) ? -1 : 1; // don't allow non-zero deltas to go to zero!
        }

        return ret;
    },

    /**
     * Returns the mouse wheel deltas for this event.
     * @return {Object} An object with "x" and "y" properties holding the mouse wheel deltas.
     */
    getWheelDeltas : function () {
        var me = this,
            event = me.browserEvent,
            dx = 0, dy = 0; // the deltas

        if (Ext.isDefined(event.wheelDeltaX)) { // WebKit has both dimensions
            dx = event.wheelDeltaX;
            dy = event.wheelDeltaY;
        } else if (event.wheelDelta) { // old WebKit and IE
            dy = event.wheelDelta;
        } else if (event.detail) { // Gecko
            dy = -event.detail; // gecko is backwards

            // Gecko sometimes returns really big values if the user changes settings to
            // scroll a whole page per scroll
            if (dy > 100) {
                dy = 3;
            } else if (dy < -100) {
                dy = -3;
            }

            // Firefox 3.1 adds an axis field to the event to indicate direction of
            // scroll.  See https://developer.mozilla.org/en/Gecko-Specific_DOM_Events
            if (Ext.isDefined(event.axis) && event.axis === event.HORIZONTAL_AXIS) {
                dx = dy;
                dy = 0;
            }
        }

        return {
            x: me.correctWheelDelta(dx),
            y: me.correctWheelDelta(dy)
        };
    },

    /**
     * Normalizes mouse wheel y-delta across browsers. To get x-delta information, use
     * {@link #getWheelDeltas} instead.
     * @return {Number} The mouse wheel y-delta
     */
    getWheelDelta : function(){
        var deltas = this.getWheelDeltas();

        return deltas.y;
    },

    /**
     * Returns true if the target of this event is a child of el.  Unless the allowEl parameter is set, it will return false if if the target is el.
     * Example usage:<pre><code>
// Handle click on any child of an element
Ext.getBody().on('click', function(e){
    if(e.within('some-el')){
        alert('Clicked on a child of some-el!');
    }
});

// Handle click directly on an element, ignoring clicks on child nodes
Ext.getBody().on('click', function(e,t){
    if((t.id == 'some-el') && !e.within(t, true)){
        alert('Clicked directly on some-el!');
    }
});
</code></pre>
     * @param {String/HTMLElement/Ext.Element} el The id, DOM element or Ext.Element to check
     * @param {Boolean} related (optional) true to test if the related target is within el instead of the target
     * @param {Boolean} allowEl (optional) true to also check if the passed element is the target or related target
     * @return {Boolean}
     */
    within : function(el, related, allowEl){
        if(el){
            var t = related ? this.getRelatedTarget() : this.getTarget(),
                result;

            if (t) {
                result = Ext.fly(el).contains(t);
                if (!result && allowEl) {
                    result = t == Ext.getDom(el);
                }
                return result;
            }
        }
        return false;
    },

    /**
     * Checks if the key pressed was a "navigation" key
     * @return {Boolean} True if the press is a navigation keypress
     */
    isNavKeyPress : function(){
        var me = this,
            k = this.normalizeKey(me.keyCode);

       return (k >= 33 && k <= 40) ||  // Page Up/Down, End, Home, Left, Up, Right, Down
       k == me.RETURN ||
       k == me.TAB ||
       k == me.ESC;
    },

    /**
     * Checks if the key pressed was a "special" key
     * @return {Boolean} True if the press is a special keypress
     */
    isSpecialKey : function(){
        var k = this.normalizeKey(this.keyCode);
        return (this.type == 'keypress' && this.ctrlKey) ||
        this.isNavKeyPress() ||
        (k == this.BACKSPACE) || // Backspace
        (k >= 16 && k <= 20) || // Shift, Ctrl, Alt, Pause, Caps Lock
        (k >= 44 && k <= 46);   // Print Screen, Insert, Delete
    },

    /**
     * Returns a point object that consists of the object coordinates.
     * @return {Ext.util.Point} point
     */
    getPoint : function(){
        var xy = this.getXY();
        return Ext.create('Ext.util.Point', xy[0], xy[1]);
    },

   /**
    * Returns true if the control, meta, shift or alt key was pressed during this event.
    * @return {Boolean}
    */
    hasModifier : function(){
        return this.ctrlKey || this.altKey || this.shiftKey || this.metaKey;
    },

    /**
     * Injects a DOM event using the data in this object and (optionally) a new target.
     * This is a low-level technique and not likely to be used by application code. The
     * currently supported event types are:
     * <p><b>HTMLEvents</b></p>
     * <ul>
     * <li>load</li>
     * <li>unload</li>
     * <li>select</li>
     * <li>change</li>
     * <li>submit</li>
     * <li>reset</li>
     * <li>resize</li>
     * <li>scroll</li>
     * </ul>
     * <p><b>MouseEvents</b></p>
     * <ul>
     * <li>click</li>
     * <li>dblclick</li>
     * <li>mousedown</li>
     * <li>mouseup</li>
     * <li>mouseover</li>
     * <li>mousemove</li>
     * <li>mouseout</li>
     * </ul>
     * <p><b>UIEvents</b></p>
     * <ul>
     * <li>focusin</li>
     * <li>focusout</li>
     * <li>activate</li>
     * <li>focus</li>
     * <li>blur</li>
     * </ul>
     * @param {Ext.Element/HTMLElement} target (optional) If specified, the target for the event. This
     * is likely to be used when relaying a DOM event. If not specified, {@link #getTarget}
     * is used to determine the target.
     */
    injectEvent: function () {
        var API,
            dispatchers = {}; // keyed by event type (e.g., 'mousedown')

        // Good reference: http://developer.yahoo.com/yui/docs/UserAction.js.html

        // IE9 has createEvent, but this code causes major problems with htmleditor (it
        // blocks all mouse events and maybe more). TODO

        if (!Ext.isIE && document.createEvent) { // if (DOM compliant)
            API = {
                createHtmlEvent: function (doc, type, bubbles, cancelable) {
                    var event = doc.createEvent('HTMLEvents');

                    event.initEvent(type, bubbles, cancelable);
                    return event;
                },

                createMouseEvent: function (doc, type, bubbles, cancelable, detail,
                                            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey,
                                            button, relatedTarget) {
                    var event = doc.createEvent('MouseEvents'),
                        view = doc.defaultView || window;

                    if (event.initMouseEvent) {
                        event.initMouseEvent(type, bubbles, cancelable, view, detail,
                                    clientX, clientY, clientX, clientY, ctrlKey, altKey,
                                    shiftKey, metaKey, button, relatedTarget);
                    } else { // old Safari
                        event = doc.createEvent('UIEvents');
                        event.initEvent(type, bubbles, cancelable);
                        event.view = view;
                        event.detail = detail;
                        event.screenX = clientX;
                        event.screenY = clientY;
                        event.clientX = clientX;
                        event.clientY = clientY;
                        event.ctrlKey = ctrlKey;
                        event.altKey = altKey;
                        event.metaKey = metaKey;
                        event.shiftKey = shiftKey;
                        event.button = button;
                        event.relatedTarget = relatedTarget;
                    }

                    return event;
                },

                createUIEvent: function (doc, type, bubbles, cancelable, detail) {
                    var event = doc.createEvent('UIEvents'),
                        view = doc.defaultView || window;

                    event.initUIEvent(type, bubbles, cancelable, view, detail);
                    return event;
                },

                fireEvent: function (target, type, event) {
                    target.dispatchEvent(event);
                },

                fixTarget: function (target) {
                    // Safari3 doesn't have window.dispatchEvent()
                    if (target == window && !target.dispatchEvent) {
                        return document;
                    }

                    return target;
                }
            };
        } else if (document.createEventObject) { // else if (IE)
            var crazyIEButtons = { 0: 1, 1: 4, 2: 2 };

            API = {
                createHtmlEvent: function (doc, type, bubbles, cancelable) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    return event;
                },

                createMouseEvent: function (doc, type, bubbles, cancelable, detail,
                                            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey,
                                            button, relatedTarget) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    event.detail = detail;
                    event.screenX = clientX;
                    event.screenY = clientY;
                    event.clientX = clientX;
                    event.clientY = clientY;
                    event.ctrlKey = ctrlKey;
                    event.altKey = altKey;
                    event.shiftKey = shiftKey;
                    event.metaKey = metaKey;
                    event.button = crazyIEButtons[button] || button;
                    event.relatedTarget = relatedTarget; // cannot assign to/fromElement
                    return event;
                },

                createUIEvent: function (doc, type, bubbles, cancelable, detail) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    return event;
                },

                fireEvent: function (target, type, event) {
                    target.fireEvent('on' + type, event);
                },

                fixTarget: function (target) {
                    if (target == document) {
                        // IE6,IE7 thinks window==document and doesn't have window.fireEvent()
                        // IE6,IE7 cannot properly call document.fireEvent()
                        return document.documentElement;
                    }

                    return target;
                }
            };
        }

        //----------------
        // HTMLEvents

        Ext.Object.each({
                load:   [false, false],
                unload: [false, false],
                select: [true, false],
                change: [true, false],
                submit: [true, true],
                reset:  [true, false],
                resize: [true, false],
                scroll: [true, false]
            },
            function (name, value) {
                var bubbles = value[0], cancelable = value[1];
                dispatchers[name] = function (targetEl, srcEvent) {
                    var e = API.createHtmlEvent(name, bubbles, cancelable);
                    API.fireEvent(targetEl, name, e);
                };
            });

        //----------------
        // MouseEvents

        function createMouseEventDispatcher (type, detail) {
            var cancelable = (type != 'mousemove');
            return function (targetEl, srcEvent) {
                var xy = srcEvent.getXY(),
                    e = API.createMouseEvent(targetEl.ownerDocument, type, true, cancelable,
                                detail, xy[0], xy[1], srcEvent.ctrlKey, srcEvent.altKey,
                                srcEvent.shiftKey, srcEvent.metaKey, srcEvent.button,
                                srcEvent.relatedTarget);
                API.fireEvent(targetEl, type, e);
            };
        }

        Ext.each(['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'],
            function (eventName) {
                dispatchers[eventName] = createMouseEventDispatcher(eventName, 1);
            });

        //----------------
        // UIEvents

        Ext.Object.each({
                focusin:  [true, false],
                focusout: [true, false],
                activate: [true, true],
                focus:    [false, false],
                blur:     [false, false]
            },
            function (name, value) {
                var bubbles = value[0], cancelable = value[1];
                dispatchers[name] = function (targetEl, srcEvent) {
                    var e = API.createUIEvent(targetEl.ownerDocument, name, bubbles, cancelable, 1);
                    API.fireEvent(targetEl, name, e);
                };
            });

        //---------
        if (!API) {
            // not even sure what ancient browsers fall into this category...

            dispatchers = {}; // never mind all those we just built :P

            API = {
                fixTarget: function (t) {
                    return t;
                }
            };
        }

        function cannotInject (target, srcEvent) {
            //<debug>
            // TODO log something
            //</debug>
        }

        return function (target) {
            var me = this,
                dispatcher = dispatchers[me.type] || cannotInject,
                t = target ? (target.dom || target) : me.getTarget();

            t = API.fixTarget(t);
            dispatcher(t, me);
        };
    }() // call to produce method

}, function() {

Ext.EventObject = new Ext.EventObjectImpl();

});


