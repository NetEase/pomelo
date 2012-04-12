/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.JSON
 * Modified version of Douglas Crockford's JSON.js that doesn't
 * mess with the Object prototype
 * http://www.json.org/js.html
 * @singleton
 */
Ext.JSON = new(function() {
    var useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
        var useNative = null;

        return function() {
            if (useNative === null) {
                useNative = Ext.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
            }

            return useNative;
        };
    }(),
    pad = function(n) {
        return n < 10 ? "0" + n : n;
    },
    doDecode = function(json) {
        return eval("(" + json + ')');
    },
    doEncode = function(o) {
        if (!Ext.isDefined(o) || o === null) {
            return "null";
        } else if (Ext.isArray(o)) {
            return encodeArray(o);
        } else if (Ext.isDate(o)) {
            return Ext.JSON.encodeDate(o);
        } else if (Ext.isString(o)) {
            return encodeString(o);
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (Ext.isBoolean(o)) {
            return String(o);
        } else if (Ext.isObject(o)) {
            return encodeObject(o);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },
    m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
        return '"' + s.replace(charToReplace, function(a) {
            var c = m[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },
    encodeArray = function(o) {
        var a = ["[", ""],
        // Note empty string in case there are no serializable members.
        len = o.length,
        i;
        for (i = 0; i < len; i += 1) {
            a.push(doEncode(o[i]), ',');
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = ']';
        return a.join("");
    },
    encodeObject = function(o) {
        var a = ["{", ""],
        // Note empty string in case there are no serializable members.
        i;
        for (i in o) {
            if (!useHasOwn || o.hasOwnProperty(i)) {
                a.push(doEncode(i), ":", doEncode(o[i]), ',');
            }
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = '}';
        return a.join("");
    };

    /**
     * <p>Encodes a Date. This returns the actual string which is inserted into the JSON string as the literal expression.
     * <b>The returned value includes enclosing double quotation marks.</b></p>
     * <p>The default return format is "yyyy-mm-ddThh:mm:ss".</p>
     * <p>To override this:</p><pre><code>
Ext.JSON.encodeDate = function(d) {
    return Ext.Date.format(d, '"Y-m-d"');
};
     </code></pre>
     * @param {Date} d The Date to encode
     * @return {String} The string literal to use in a JSON string.
     */
    this.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-"
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
    };

    /**
     * Encodes an Object, Array or other value
     * @param {Object} o The variable to encode
     * @return {String} The JSON string
     */
    this.encode = function() {
        var ec;
        return function(o) {
            if (!ec) {
                // setup encoding function on first access
                ec = isNative() ? JSON.stringify : doEncode;
            }
            return ec(o);
        };
    }();


    /**
     * Decodes (parses) a JSON string to an object. If the JSON is invalid, this function throws a SyntaxError unless the safe option is set.
     * @param {String} json The JSON string
     * @param {Boolean} safe (optional) Whether to return null or throw an exception if the JSON is invalid.
     * @return {Object} The resulting object
     */
    this.decode = function() {
        var dc;
        return function(json, safe) {
            if (!dc) {
                // setup decoding function on first access
                dc = isNative() ? JSON.parse : doDecode;
            }
            try {
                return dc(json);
            } catch (e) {
                if (safe === true) {
                    return null;
                }
                Ext.Error.raise({
                    sourceClass: "Ext.JSON",
                    sourceMethod: "decode",
                    msg: "You're trying to decode an invalid JSON String: " + json
                });
            }
        };
    }();

})();
/**
 * Shorthand for {@link Ext.JSON#encode}
 * @member Ext
 * @method encode
 * @alias Ext.JSON#encode
 */
Ext.encode = Ext.JSON.encode;
/**
 * Shorthand for {@link Ext.JSON#decode}
 * @member Ext
 * @method decode
 * @alias Ext.JSON#decode
 */
Ext.decode = Ext.JSON.decode;


/**
 * @class Ext

 The Ext namespace (global object) encapsulates all classes, singletons, and utility methods provided by Sencha's libraries.</p>
 Most user interface Components are at a lower level of nesting in the namespace, but many common utility functions are provided
 as direct properties of the Ext namespace.

 Also many frequently used methods from other classes are provided as shortcuts within the Ext namespace.
 For example {@link Ext#getCmp Ext.getCmp} aliases {@link Ext.ComponentManager#get Ext.ComponentManager.get}.

 Many applications are initiated with {@link Ext#onReady Ext.onReady} which is called once the DOM is ready.
 This ensures all scripts have been loaded, preventing dependency issues. For example

     Ext.onReady(function(){
         new Ext.Component({
             renderTo: document.body,
             html: 'DOM ready!'
         });
     });

For more information about how to use the Ext classes, see

- <a href="http://www.sencha.com/learn/">The Learning Center</a>
- <a href="http://www.sencha.com/learn/Ext_FAQ">The FAQ</a>
- <a href="http://www.sencha.com/forum/">The forums</a>

 * @singleton
 * @markdown
 */
Ext.apply(Ext, {
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    windowId: 'ext-window',
    documentId: 'ext-document',

    /**
     * True when the document is fully initialized and ready for action
     * @type Boolean
     */
    isReady: false,

    /**
     * True to automatically uncache orphaned Ext.Elements periodically
     * @type Boolean
     */
    enableGarbageCollector: true,

    /**
     * True to automatically purge event listeners during garbageCollection.
     * @type Boolean
     */
    enableListenerCollection: true,

    /**
     * Generates unique ids. If the element already has an id, it is unchanged
     * @param {HTMLElement/Ext.Element} el (optional) The element to generate an id for
     * @param {String} prefix (optional) Id prefix (defaults "ext-gen")
     * @return {String} The generated Id.
     */
    id: function(el, prefix) {
        var me = this,
            sandboxPrefix = '';
        el = Ext.getDom(el, true) || {};
        if (el === document) {
            el.id = me.documentId;
        }
        else if (el === window) {
            el.id = me.windowId;
        }
        if (!el.id) {
            if (me.isSandboxed) {
                if (!me.uniqueGlobalNamespace) {
                    me.getUniqueGlobalNamespace();
                }
                sandboxPrefix = me.uniqueGlobalNamespace + '-';
            }
            el.id = sandboxPrefix + (prefix || "ext-gen") + (++Ext.idSeed);
        }
        return el.id;
    },

    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @return Ext.Element The document body
     */
    getBody: function() {
        return Ext.get(document.body || false);
    },

    /**
     * Returns the current document head as an {@link Ext.Element}.
     * @return Ext.Element The document head
     * @method
     */
    getHead: function() {
        var head;

        return function() {
            if (head == undefined) {
                head = Ext.get(document.getElementsByTagName("head")[0]);
            }

            return head;
        };
    }(),

    /**
     * Returns the current HTML document object as an {@link Ext.Element}.
     * @return Ext.Element The document
     */
    getDoc: function() {
        return Ext.get(document);
    },

    /**
     * This is shorthand reference to {@link Ext.ComponentManager#get}.
     * Looks up an existing {@link Ext.Component Component} by {@link Ext.Component#id id}
     * @param {String} id The component {@link Ext.Component#id id}
     * @return Ext.Component The Component, <tt>undefined</tt> if not found, or <tt>null</tt> if a
     * Class was found.
    */
    getCmp: function(id) {
        return Ext.ComponentManager.get(id);
    },

    /**
     * Returns the current orientation of the mobile device
     * @return {String} Either 'portrait' or 'landscape'
     */
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    /**
     * Attempts to destroy any objects passed to it by removing all event listeners, removing them from the
     * DOM (if applicable) and calling their destroy functions (if available).  This method is primarily
     * intended for arguments of type {@link Ext.Element} and {@link Ext.Component}, but any subclass of
     * {@link Ext.util.Observable} can be passed in.  Any number of elements and/or components can be
     * passed into this function in a single call as separate arguments.
     * @param {Ext.Element/Ext.Component/Ext.Element[]/Ext.Component[]...} arg1
     * An {@link Ext.Element}, {@link Ext.Component}, or an Array of either of these to destroy
     */
    destroy: function() {
        var ln = arguments.length,
        i, arg;

        for (i = 0; i < ln; i++) {
            arg = arguments[i];
            if (arg) {
                if (Ext.isArray(arg)) {
                    this.destroy.apply(this, arg);
                }
                else if (Ext.isFunction(arg.destroy)) {
                    arg.destroy();
                }
                else if (arg.dom) {
                    arg.remove();
                }
            }
        }
    },

    /**
     * Execute a callback function in a particular scope. If no function is passed the call is ignored.
     *
     * For example, these lines are equivalent:
     *
     *     Ext.callback(myFunc, this, [arg1, arg2]);
     *     Ext.isFunction(myFunc) && myFunc.apply(this, [arg1, arg2]);
     *
     * @param {Function} callback The callback to execute
     * @param {Object} scope (optional) The scope to execute in
     * @param {Array} args (optional) The arguments to pass to the function
     * @param {Number} delay (optional) Pass a number to delay the call by a number of milliseconds.
     */
    callback: function(callback, scope, args, delay){
        if(Ext.isFunction(callback)){
            args = args || [];
            scope = scope || window;
            if (delay) {
                Ext.defer(callback, delay, scope, args);
            } else {
                callback.apply(scope, args);
            }
        }
    },

    /**
     * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
     * @param {String} value The string to encode
     * @return {String} The encoded text
     */
    htmlEncode : function(value) {
        return Ext.String.htmlEncode(value);
    },

    /**
     * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
     * @param {String} value The string to decode
     * @return {String} The decoded text
     */
    htmlDecode : function(value) {
         return Ext.String.htmlDecode(value);
    },

    /**
     * Appends content to the query string of a URL, handling logic for whether to place
     * a question mark or ampersand.
     * @param {String} url The URL to append to.
     * @param {String} s The content to append to the URL.
     * @return (String) The resulting URL
     */
    urlAppend : function(url, s) {
        if (!Ext.isEmpty(s)) {
            return url + (url.indexOf('?') === -1 ? '?' : '&') + s;
        }
        return url;
    }
});


Ext.ns = Ext.namespace;

// for old browsers
window.undefined = window.undefined;

/**
 * @class Ext
 * Ext core utilities and functions.
 * @singleton
 */
(function(){
/*
FF 3.6      - Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.17) Gecko/20110420 Firefox/3.6.17
FF 4.0.1    - Mozilla/5.0 (Windows NT 5.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1
FF 5.0      - Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0

IE6         - Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1;)
IE7         - Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; SV1;)
IE8         - Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)
IE9         - Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)

Chrome 11   - Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.60 Safari/534.24

Safari 5    - Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1

Opera 11.11 - Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11
*/
    var check = function(regex){
            return regex.test(Ext.userAgent);
        },
        isStrict = document.compatMode == "CSS1Compat",
        version = function (is, regex) {
            var m;
            return (is && (m = regex.exec(Ext.userAgent))) ? parseFloat(m[1]) : 0;
        },
        docMode = document.documentMode,
        isOpera = check(/opera/),
        isOpera10_5 = isOpera && check(/version\/10\.5/),
        isChrome = check(/\bchrome\b/),
        isWebKit = check(/webkit/),
        isSafari = !isChrome && check(/safari/),
        isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
        isSafari3 = isSafari && check(/version\/3/),
        isSafari4 = isSafari && check(/version\/4/),
        isSafari5 = isSafari && check(/version\/5/),
        isIE = !isOpera && check(/msie/),
        isIE7 = isIE && (check(/msie 7/) || docMode == 7),
        isIE8 = isIE && (check(/msie 8/) && docMode != 7 && docMode != 9 || docMode == 8),
        isIE9 = isIE && (check(/msie 9/) && docMode != 7 && docMode != 8 || docMode == 9),
        isIE6 = isIE && check(/msie 6/),
        isGecko = !isWebKit && check(/gecko/),
        isGecko3 = isGecko && check(/rv:1\.9/),
        isGecko4 = isGecko && check(/rv:2\.0/),
        isGecko5 = isGecko && check(/rv:5\./),
        isFF3_0 = isGecko3 && check(/rv:1\.9\.0/),
        isFF3_5 = isGecko3 && check(/rv:1\.9\.1/),
        isFF3_6 = isGecko3 && check(/rv:1\.9\.2/),
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isLinux = check(/linux/),
        scrollbarSize = null,
        chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/),
        firefoxVersion = version(true, /\bfirefox\/(\d+\.\d+)/),
        ieVersion = version(isIE, /msie (\d+\.\d+)/),
        operaVersion = version(isOpera, /version\/(\d+\.\d+)/),
        safariVersion = version(isSafari, /version\/(\d+\.\d+)/),
        webKitVersion = version(isWebKit, /webkit\/(\d+\.\d+)/),
        isSecure = /^https/i.test(window.location.protocol);

    // remove css image flicker
    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch(e) {}

    //<debug>
    function dumpObject (object) {
        var member, members = [];

        // Cannot use Ext.encode since it can recurse endlessly (if we're lucky)
        // ...and the data could be prettier!
        Ext.Object.each(object, function (name, value) {
            if (typeof(value) === "function") {
                return;
            }

            if (!Ext.isDefined(value) || value === null ||
                    Ext.isDate(value) ||
                    Ext.isString(value) || (typeof(value) == "number") ||
                    Ext.isBoolean(value)) {
                member = Ext.encode(value);
            } else if (Ext.isArray(value)) {
                member = '[ ]';
            } else if (Ext.isObject(value)) {
                member = '{ }';
            } else {
                member = 'undefined';
            }
            members.push(Ext.encode(name) + ': ' + member);
        });

        if (members.length) {
            return ' \nData: {\n  ' + members.join(',\n  ') + '\n}';
        }
        return '';
    }

    function log (message) {
        var options, dump,
            con = Ext.global.console,
            level = 'log',
            indent = log.indent || 0,
            stack;

        log.indent = indent;

        if (!Ext.isString(message)) {
            options = message;
            message = options.msg || '';
            level = options.level || level;
            dump = options.dump;
            stack = options.stack;

            if (options.indent) {
                ++log.indent;
            } else if (options.outdent) {
                log.indent = indent = Math.max(indent - 1, 0);
            }

            if (dump && !(con && con.dir)) {
                message += dumpObject(dump);
                dump = null;
            }
        }

        if (arguments.length > 1) {
            message += Array.prototype.slice.call(arguments, 1).join('');
        }

        message = indent ? Ext.String.repeat('   ', indent) + message : message;
        // w/o console, all messages are equal, so munge the level into the message:
        if (level != 'log') {
            message = '[' + level.charAt(0).toUpperCase() + '] ' + message;
        }

        // Not obvious, but 'console' comes and goes when Firebug is turned on/off, so
        // an early test may fail either direction if Firebug is toggled.
        //
        if (con) { // if (Firebug-like console)
            if (con[level]) {
                con[level](message);
            } else {
                con.log(message);
            }

            if (dump) {
                con.dir(dump);
            }

            if (stack && con.trace) {
                // Firebug's console.error() includes a trace already...
                if (!con.firebug || level != 'error') {
                    con.trace();
                }
            }
        } else {
            if (Ext.isOpera) {
                opera.postError(message);
            } else {
                var out = log.out,
                    max = log.max;

                if (out.length >= max) {
                    // this formula allows out.max to change (via debugger), where the
                    // more obvious "max/4" would not quite be the same
                    Ext.Array.erase(out, 0, out.length - 3 * Math.floor(max / 4)); // keep newest 75%
                }

                out.push(message);
            }
        }

        // Mostly informational, but the Ext.Error notifier uses them:
        ++log.count;
        ++log.counters[level];
    }

    log.count = 0;
    log.counters = { error: 0, warn: 0, info: 0, log: 0 };
    log.out = [];
    log.max = 250;
    log.show = function () {
        window.open('','extlog').document.write([
            '<html><head><script type="text/javascript">',
                'var lastCount = 0;',
                'function update () {',
                    'var ext = window.opener.Ext,',
                        'extlog = ext && ext.log;',
                    'if (extlog && extlog.out && lastCount != extlog.count) {',
                        'lastCount = extlog.count;',
                        'var s = "<tt>" + extlog.out.join("<br>").replace(/[ ]/g, "&nbsp;") + "</tt>";',
                        'document.body.innerHTML = s;',
                    '}',
                    'setTimeout(update, 1000);',
                '}',
                'setTimeout(update, 1000);',
            '</script></head><body></body></html>'].join(''));
    };
    //</debug>

    Ext.setVersion('extjs', '4.0.7');
    Ext.apply(Ext, {
        /**
         * URL to a blank file used by Ext when in secure mode for iframe src and onReady src to prevent
         * the IE insecure content warning (<tt>'about:blank'</tt>, except for IE in secure mode, which is <tt>'javascript:""'</tt>).
         * @type String
         */
        SSL_SECURE_URL : isSecure && isIE ? 'javascript:""' : 'about:blank',

        /**
         * True if the {@link Ext.fx.Anim} Class is available
         * @type Boolean
         * @property enableFx
         */

        /**
         * True to scope the reset CSS to be just applied to Ext components. Note that this wraps root containers
         * with an additional element. Also remember that when you turn on this option, you have to use ext-all-scoped {
         * unless you use the bootstrap.js to load your javascript, in which case it will be handled for you.
         * @type Boolean
         */
        scopeResetCSS : Ext.buildSettings.scopeResetCSS,

        /**
         * EXPERIMENTAL - True to cascade listener removal to child elements when an element is removed.
         * Currently not optimized for performance.
         * @type Boolean
         */
        enableNestedListenerRemoval : false,

        /**
         * Indicates whether to use native browser parsing for JSON methods.
         * This option is ignored if the browser does not support native JSON methods.
         * <b>Note: Native JSON methods will not work with objects that have functions.
         * Also, property names must be quoted, otherwise the data will not parse.</b> (Defaults to false)
         * @type Boolean
         */
        USE_NATIVE_JSON : false,

        /**
         * Return the dom node for the passed String (id), dom node, or Ext.Element.
         * Optional 'strict' flag is needed for IE since it can return 'name' and
         * 'id' elements by using getElementById.
         * Here are some examples:
         * <pre><code>
// gets dom node based on id
var elDom = Ext.getDom('elId');
// gets dom node based on the dom node
var elDom1 = Ext.getDom(elDom);

// If we don&#39;t know if we are working with an
// Ext.Element or a dom node use Ext.getDom
function(el){
    var dom = Ext.getDom(el);
    // do something with the dom node
}
         * </code></pre>
         * <b>Note</b>: the dom node to be found actually needs to exist (be rendered, etc)
         * when this method is called to be successful.
         * @param {String/HTMLElement/Ext.Element} el
         * @return HTMLElement
         */
        getDom : function(el, strict) {
            if (!el || !document) {
                return null;
            }
            if (el.dom) {
                return el.dom;
            } else {
                if (typeof el == 'string') {
                    var e = document.getElementById(el);
                    // IE returns elements with the 'name' and 'id' attribute.
                    // we do a strict check to return the element with only the id attribute
                    if (e && isIE && strict) {
                        if (el == e.getAttribute('id')) {
                            return e;
                        } else {
                            return null;
                        }
                    }
                    return e;
                } else {
                    return el;
                }
            }
        },

        /**
         * Removes a DOM node from the document.
         * <p>Removes this element from the document, removes all DOM event listeners, and deletes the cache reference.
         * All DOM event listeners are removed from this element. If {@link Ext#enableNestedListenerRemoval Ext.enableNestedListenerRemoval} is
         * <code>true</code>, then DOM event listeners are also removed from all child nodes. The body node
         * will be ignored if passed in.</p>
         * @param {HTMLElement} node The node to remove
         * @method
         */
        removeNode : isIE6 || isIE7 ? function() {
            var d;
            return function(n){
                if(n && n.tagName != 'BODY'){
                    (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);
                    d = d || document.createElement('div');
                    d.appendChild(n);
                    d.innerHTML = '';
                    delete Ext.cache[n.id];
                }
            };
        }() : function(n) {
            if (n && n.parentNode && n.tagName != 'BODY') {
                (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);
                n.parentNode.removeChild(n);
                delete Ext.cache[n.id];
            }
        },

        isStrict: isStrict,

        isIEQuirks: isIE && !isStrict,

        /**
         * True if the detected browser is Opera.
         * @type Boolean
         */
        isOpera : isOpera,

        /**
         * True if the detected browser is Opera 10.5x.
         * @type Boolean
         */
        isOpera10_5 : isOpera10_5,

        /**
         * True if the detected browser uses WebKit.
         * @type Boolean
         */
        isWebKit : isWebKit,

        /**
         * True if the detected browser is Chrome.
         * @type Boolean
         */
        isChrome : isChrome,

        /**
         * True if the detected browser is Safari.
         * @type Boolean
         */
        isSafari : isSafari,

        /**
         * True if the detected browser is Safari 3.x.
         * @type Boolean
         */
        isSafari3 : isSafari3,

        /**
         * True if the detected browser is Safari 4.x.
         * @type Boolean
         */
        isSafari4 : isSafari4,

        /**
         * True if the detected browser is Safari 5.x.
         * @type Boolean
         */
        isSafari5 : isSafari5,

        /**
         * True if the detected browser is Safari 2.x.
         * @type Boolean
         */
        isSafari2 : isSafari2,

        /**
         * True if the detected browser is Internet Explorer.
         * @type Boolean
         */
        isIE : isIE,

        /**
         * True if the detected browser is Internet Explorer 6.x.
         * @type Boolean
         */
        isIE6 : isIE6,

        /**
         * True if the detected browser is Internet Explorer 7.x.
         * @type Boolean
         */
        isIE7 : isIE7,

        /**
         * True if the detected browser is Internet Explorer 8.x.
         * @type Boolean
         */
        isIE8 : isIE8,

        /**
         * True if the detected browser is Internet Explorer 9.x.
         * @type Boolean
         */
        isIE9 : isIE9,

        /**
         * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
         * @type Boolean
         */
        isGecko : isGecko,

        /**
         * True if the detected browser uses a Gecko 1.9+ layout engine (e.g. Firefox 3.x).
         * @type Boolean
         */
        isGecko3 : isGecko3,

        /**
         * True if the detected browser uses a Gecko 2.0+ layout engine (e.g. Firefox 4.x).
         * @type Boolean
         */
        isGecko4 : isGecko4,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko5 : isGecko5,

        /**
         * True if the detected browser uses FireFox 3.0
         * @type Boolean
         */
        isFF3_0 : isFF3_0,

        /**
         * True if the detected browser uses FireFox 3.5
         * @type Boolean
         */
        isFF3_5 : isFF3_5,

        /**
         * True if the detected browser uses FireFox 3.6
         * @type Boolean
         */
        isFF3_6 : isFF3_6,

        /**
         * True if the detected browser uses FireFox 4
         * @type Boolean
         */
        isFF4 : 4 <= firefoxVersion && firefoxVersion < 5,

        /**
         * True if the detected browser uses FireFox 5
         * @type Boolean
         */
        isFF5 : 5 <= firefoxVersion && firefoxVersion < 6,

        /**
         * True if the detected platform is Linux.
         * @type Boolean
         */
        isLinux : isLinux,

        /**
         * True if the detected platform is Windows.
         * @type Boolean
         */
        isWindows : isWindows,

        /**
         * True if the detected platform is Mac OS.
         * @type Boolean
         */
        isMac : isMac,

        /**
         * The current version of Chrome (0 if the browser is not Chrome).
         * @type Number
         */
        chromeVersion: chromeVersion,

        /**
         * The current version of Firefox (0 if the browser is not Firefox).
         * @type Number
         */
        firefoxVersion: firefoxVersion,

        /**
         * The current version of IE (0 if the browser is not IE). This does not account
         * for the documentMode of the current page, which is factored into {@link #isIE7},
         * {@link #isIE8} and {@link #isIE9}. Thus this is not always true:
         *
         *      Ext.isIE8 == (Ext.ieVersion == 8)
         *
         * @type Number
         * @markdown
         */
        ieVersion: ieVersion,

        /**
         * The current version of Opera (0 if the browser is not Opera).
         * @type Number
         */
        operaVersion: operaVersion,

        /**
         * The current version of Safari (0 if the browser is not Safari).
         * @type Number
         */
        safariVersion: safariVersion,

        /**
         * The current version of WebKit (0 if the browser does not use WebKit).
         * @type Number
         */
        webKitVersion: webKitVersion,

        /**
         * True if the page is running over SSL
         * @type Boolean
         */
        isSecure: isSecure,

        /**
         * URL to a 1x1 transparent gif image used by Ext to create inline icons with CSS background images.
         * In older versions of IE, this defaults to "http://sencha.com/s.gif" and you should change this to a URL on your server.
         * For other browsers it uses an inline data URL.
         * @type String
         */
        BLANK_IMAGE_URL : (isIE6 || isIE7) ? '/' + '/www.sencha.com/s.gif' : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

        /**
         * <p>Utility method for returning a default value if the passed value is empty.</p>
         * <p>The value is deemed to be empty if it is<div class="mdetail-params"><ul>
         * <li>null</li>
         * <li>undefined</li>
         * <li>an empty array</li>
         * <li>a zero length string (Unless the <tt>allowBlank</tt> parameter is <tt>true</tt>)</li>
         * </ul></div>
         * @param {Object} value The value to test
         * @param {Object} defaultValue The value to return if the original value is empty
         * @param {Boolean} allowBlank (optional) true to allow zero length strings to qualify as non-empty (defaults to false)
         * @return {Object} value, if non-empty, else defaultValue
         * @deprecated 4.0.0 Use {@link Ext#valueFrom} instead
         */
        value : function(v, defaultValue, allowBlank){
            return Ext.isEmpty(v, allowBlank) ? defaultValue : v;
        },

        /**
         * Escapes the passed string for use in a regular expression
         * @param {String} str
         * @return {String}
         * @deprecated 4.0.0 Use {@link Ext.String#escapeRegex} instead
         */
        escapeRe : function(s) {
            return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
        },

        /**
         * Applies event listeners to elements by selectors when the document is ready.
         * The event name is specified with an <tt>&#64;</tt> suffix.
         * <pre><code>
Ext.addBehaviors({
    // add a listener for click on all anchors in element with id foo
    '#foo a&#64;click' : function(e, t){
        // do something
    },

    // add the same listener to multiple selectors (separated by comma BEFORE the &#64;)
    '#foo a, #bar span.some-class&#64;mouseover' : function(){
        // do something
    }
});
         * </code></pre>
         * @param {Object} obj The list of behaviors to apply
         */
        addBehaviors : function(o){
            if(!Ext.isReady){
                Ext.onReady(function(){
                    Ext.addBehaviors(o);
                });
            } else {
                var cache = {}, // simple cache for applying multiple behaviors to same selector does query multiple times
                    parts,
                    b,
                    s;
                for (b in o) {
                    if ((parts = b.split('@'))[1]) { // for Object prototype breakers
                        s = parts[0];
                        if(!cache[s]){
                            cache[s] = Ext.select(s);
                        }
                        cache[s].on(parts[1], o[b]);
                    }
                }
                cache = null;
            }
        },

        /**
         * Returns the size of the browser scrollbars. This can differ depending on
         * operating system settings, such as the theme or font size.
         * @param {Boolean} force (optional) true to force a recalculation of the value.
         * @return {Object} An object containing the width of a vertical scrollbar and the
         * height of a horizontal scrollbar.
         */
        getScrollbarSize: function (force) {
            if(!Ext.isReady){
                return 0;
            }

            if(force === true || scrollbarSize === null){
                // BrowserBug: IE9
                // When IE9 positions an element offscreen via offsets, the offsetWidth is
                // inaccurately reported. For IE9 only, we render on screen before removing.
                var cssClass = Ext.isIE9 ? '' : Ext.baseCSSPrefix + 'hide-offsets',
                    // Append our div, do our calculation and then remove it
                    div = Ext.getBody().createChild('<div class="' + cssClass + '" style="width:100px;height:50px;overflow:hidden;"><div style="height:200px;"></div></div>'),
                    child = div.child('div', true),
                    w1 = child.offsetWidth;

                div.setStyle('overflow', (Ext.isWebKit || Ext.isGecko) ? 'auto' : 'scroll');

                var w2 = child.offsetWidth, width = w1 - w2;
                div.remove();

                // We assume width == height for now. TODO: is this always true?
                scrollbarSize = { width: width, height: width };
            }

            return scrollbarSize;
        },

        /**
         * Utility method for getting the width of the browser's vertical scrollbar. This
         * can differ depending on operating system settings, such as the theme or font size.
         *
         * This method is deprected in favor of {@link #getScrollbarSize}.
         *
         * @param {Boolean} force (optional) true to force a recalculation of the value.
         * @return {Number} The width of a vertical scrollbar.
         * @deprecated
         */
        getScrollBarWidth: function(force){
            var size = Ext.getScrollbarSize(force);
            return size.width + 2; // legacy fudge factor
        },

        /**
         * Copies a set of named properties fom the source object to the destination object.
         *
         * Example:
         *
         *     ImageComponent = Ext.extend(Ext.Component, {
         *         initComponent: function() {
         *             this.autoEl = { tag: 'img' };
         *             MyComponent.superclass.initComponent.apply(this, arguments);
         *             this.initialBox = Ext.copyTo({}, this.initialConfig, 'x,y,width,height');
         *         }
         *     });
         *
         * Important note: To borrow class prototype methods, use {@link Ext.Base#borrow} instead.
         *
         * @param {Object} dest The destination object.
         * @param {Object} source The source object.
         * @param {String/String[]} names Either an Array of property names, or a comma-delimited list
         * of property names to copy.
         * @param {Boolean} usePrototypeKeys (Optional) Defaults to false. Pass true to copy keys off of the prototype as well as the instance.
         * @return {Object} The modified object.
         */
        copyTo : function(dest, source, names, usePrototypeKeys){
            if(typeof names == 'string'){
                names = names.split(/[,;\s]/);
            }
            Ext.each(names, function(name){
                if(usePrototypeKeys || source.hasOwnProperty(name)){
                    dest[name] = source[name];
                }
            }, this);
            return dest;
        },

        /**
         * Attempts to destroy and then remove a set of named properties of the passed object.
         * @param {Object} o The object (most likely a Component) who's properties you wish to destroy.
         * @param {String...} args One or more names of the properties to destroy and remove from the object.
         */
        destroyMembers : function(o){
            for (var i = 1, a = arguments, len = a.length; i < len; i++) {
                Ext.destroy(o[a[i]]);
                delete o[a[i]];
            }
        },

        /**
         * Logs a message. If a console is present it will be used. On Opera, the method
         * "opera.postError" is called. In other cases, the message is logged to an array
         * "Ext.log.out". An attached debugger can watch this array and view the log. The
         * log buffer is limited to a maximum of "Ext.log.max" entries (defaults to 250).
         * The `Ext.log.out` array can also be written to a popup window by entering the
         * following in the URL bar (a "bookmarklet"):
         *
         *    javascript:void(Ext.log.show());
         *
         * If additional parameters are passed, they are joined and appended to the message.
         * A technique for tracing entry and exit of a function is this:
         *
         *      function foo () {
         *          Ext.log({ indent: 1 }, '>> foo');
         *
         *          // log statements in here or methods called from here will be indented
         *          // by one step
         *
         *          Ext.log({ outdent: 1 }, '<< foo');
         *      }
         *
         * This method does nothing in a release build.
         *
         * @param {String/Object} message The message to log or an options object with any
         * of the following properties:
         *
         *  - `msg`: The message to log (required).
         *  - `level`: One of: "error", "warn", "info" or "log" (the default is "log").
         *  - `dump`: An object to dump to the log as part of the message.
         *  - `stack`: True to include a stack trace in the log.
         *  - `indent`: Cause subsequent log statements to be indented one step.
         *  - `outdent`: Cause this and following statements to be one step less indented.
         * @markdown
         */
        log :
            //<debug>
            log ||
            //</debug>
            Ext.emptyFn,

        /**
         * Partitions the set into two sets: a true set and a false set.
         * Example:
         * Example2:
         * <pre><code>
// Example 1:
Ext.partition([true, false, true, true, false]); // [[true, true, true], [false, false]]

// Example 2:
Ext.partition(
    Ext.query("p"),
    function(val){
        return val.className == "class1"
    }
);
// true are those paragraph elements with a className of "class1",
// false set are those that do not have that className.
         * </code></pre>
         * @param {Array/NodeList} arr The array to partition
         * @param {Function} truth (optional) a function to determine truth.  If this is omitted the element
         * itself must be able to be evaluated for its truthfulness.
         * @return {Array} [array of truish values, array of falsy values]
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        partition : function(arr, truth){
            var ret = [[],[]];
            Ext.each(arr, function(v, i, a) {
                ret[ (truth && truth(v, i, a)) || (!truth && v) ? 0 : 1].push(v);
            });
            return ret;
        },

        /**
         * Invokes a method on each item in an Array.
         * <pre><code>
// Example:
Ext.invoke(Ext.query("p"), "getAttribute", "id");
// [el1.getAttribute("id"), el2.getAttribute("id"), ..., elN.getAttribute("id")]
         * </code></pre>
         * @param {Array/NodeList} arr The Array of items to invoke the method on.
         * @param {String} methodName The method name to invoke.
         * @param {Object...} args Arguments to send into the method invocation.
         * @return {Array} The results of invoking the method on each item in the array.
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        invoke : function(arr, methodName){
            var ret = [],
                args = Array.prototype.slice.call(arguments, 2);
            Ext.each(arr, function(v,i) {
                if (v && typeof v[methodName] == 'function') {
                    ret.push(v[methodName].apply(v, args));
                } else {
                    ret.push(undefined);
                }
            });
            return ret;
        },

        /**
         * <p>Zips N sets together.</p>
         * <pre><code>
// Example 1:
Ext.zip([1,2,3],[4,5,6]); // [[1,4],[2,5],[3,6]]
// Example 2:
Ext.zip(
    [ "+", "-", "+"],
    [  12,  10,  22],
    [  43,  15,  96],
    function(a, b, c){
        return "$" + a + "" + b + "." + c
    }
); // ["$+12.43", "$-10.15", "$+22.96"]
         * </code></pre>
         * @param {Array/NodeList...} arr This argument may be repeated. Array(s) to contribute values.
         * @param {Function} zipper (optional) The last item in the argument list. This will drive how the items are zipped together.
         * @return {Array} The zipped set.
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        zip : function(){
            var parts = Ext.partition(arguments, function( val ){ return typeof val != 'function'; }),
                arrs = parts[0],
                fn = parts[1][0],
                len = Ext.max(Ext.pluck(arrs, "length")),
                ret = [];

            for (var i = 0; i < len; i++) {
                ret[i] = [];
                if(fn){
                    ret[i] = fn.apply(fn, Ext.pluck(arrs, i));
                }else{
                    for (var j = 0, aLen = arrs.length; j < aLen; j++){
                        ret[i].push( arrs[j][i] );
                    }
                }
            }
            return ret;
        },

        /**
         * Turns an array into a sentence, joined by a specified connector - e.g.:
         * Ext.toSentence(['Adama', 'Tigh', 'Roslin']); //'Adama, Tigh and Roslin'
         * Ext.toSentence(['Adama', 'Tigh', 'Roslin'], 'or'); //'Adama, Tigh or Roslin'
         * @param {String[]} items The array to create a sentence from
         * @param {String} connector The string to use to connect the last two words. Usually 'and' or 'or' - defaults to 'and'.
         * @return {String} The sentence string
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        toSentence: function(items, connector) {
            var length = items.length;

            if (length <= 1) {
                return items[0];
            } else {
                var head = items.slice(0, length - 1),
                    tail = items[length - 1];

                return Ext.util.Format.format("{0} {1} {2}", head.join(", "), connector || 'and', tail);
            }
        },

        /**
         * By default, Ext intelligently decides whether floating elements should be shimmed. If you are using flash,
         * you may want to set this to true.
         * @type Boolean
         */
        useShims: isIE6
    });
})();

/**
 * Loads Ext.app.Application class and starts it up with given configuration after the page is ready.
 *
 * See Ext.app.Application for details.
 *
 * @param {Object} config
 */
Ext.application = function(config) {
    Ext.require('Ext.app.Application');

    Ext.onReady(function() {
        Ext.create('Ext.app.Application', config);
    });
};

/**
 * @class Ext.util.Format

This class is a centralized place for formatting functions. It includes
functions to format various different types of data, such as text, dates and numeric values.

__Localization__
This class contains several options for localization. These can be set once the library has loaded,
all calls to the functions from that point will use the locale settings that were specified.
Options include:
- thousandSeparator
- decimalSeparator
- currenyPrecision
- currencySign
- currencyAtEnd
This class also uses the default date format defined here: {@link Ext.Date#defaultFormat}.

__Using with renderers__
There are two helper functions that return a new function that can be used in conjunction with
grid renderers:

    columns: [{
        dataIndex: 'date',
        renderer: Ext.util.Format.dateRenderer('Y-m-d')
    }, {
        dataIndex: 'time',
        renderer: Ext.util.Format.numberRenderer('0.000')
    }]

Functions that only take a single argument can also be passed directly:
    columns: [{
        dataIndex: 'cost',
        renderer: Ext.util.Format.usMoney
    }, {
        dataIndex: 'productCode',
        renderer: Ext.util.Format.uppercase
    }]

__Using with XTemplates__
XTemplates can also directly use Ext.util.Format functions:

    new Ext.XTemplate([
        'Date: {startDate:date("Y-m-d")}',
        'Cost: {cost:usMoney}'
    ]);

 * @markdown
 * @singleton
 */
(function() {
    Ext.ns('Ext.util');

    Ext.util.Format = {};
    var UtilFormat     = Ext.util.Format,
        stripTagsRE    = /<\/?[^>]+>/gi,
        stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
        nl2brRe        = /\r?\n/g,

        // A RegExp to remove from a number format string, all characters except digits and '.'
        formatCleanRe  = /[^\d\.]/g,

        // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
        // Created on first use. The local decimal separator character must be initialized for this to be created.
        I18NFormatCleanRe;

    Ext.apply(UtilFormat, {
        /**
         * @property {String} thousandSeparator
         * <p>The character that the {@link #number} function uses as a thousand separator.</p>
         * <p>This may be overridden in a locale file.</p>
         */
        thousandSeparator: ',',

        /**
         * @property {String} decimalSeparator
         * <p>The character that the {@link #number} function uses as a decimal point.</p>
         * <p>This may be overridden in a locale file.</p>
         */
        decimalSeparator: '.',

        /**
         * @property {Number} currencyPrecision
         * <p>The number of decimal places that the {@link #currency} function displays.</p>
         * <p>This may be overridden in a locale file.</p>
         */
        currencyPrecision: 2,

        /**
         * @property {String} currencySign
         * <p>The currency sign that the {@link #currency} function displays.</p>
         * <p>This may be overridden in a locale file.</p>
         */
        currencySign: '$',

        /**
         * @property {Boolean} currencyAtEnd
         * <p>This may be set to <code>true</code> to make the {@link #currency} function
         * append the currency sign to the formatted value.</p>
         * <p>This may be overridden in a locale file.</p>
         */
        currencyAtEnd: false,

        /**
         * Checks a reference and converts it to empty string if it is undefined
         * @param {Object} value Reference to check
         * @return {Object} Empty string if converted, otherwise the original value
         */
        undef : function(value) {
            return value !== undefined ? value : "";
        },

        /**
         * Checks a reference and converts it to the default value if it's empty
         * @param {Object} value Reference to check
         * @param {String} defaultValue The value to insert of it's undefined (defaults to "")
         * @return {String}
         */
        defaultValue : function(value, defaultValue) {
            return value !== undefined && value !== '' ? value : defaultValue;
        },

        /**
         * Returns a substring from within an original string
         * @param {String} value The original text
         * @param {Number} start The start index of the substring
         * @param {Number} length The length of the substring
         * @return {String} The substring
         */
        substr : function(value, start, length) {
            return String(value).substr(start, length);
        },

        /**
         * Converts a string to all lower case letters
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        lowercase : function(value) {
            return String(value).toLowerCase();
        },

        /**
         * Converts a string to all upper case letters
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        uppercase : function(value) {
            return String(value).toUpperCase();
        },

        /**
         * Format a number as US currency
         * @param {Number/String} value The numeric value to format
         * @return {String} The formatted currency string
         */
        usMoney : function(v) {
            return UtilFormat.currency(v, '$', 2);
        },

        /**
         * Format a number as a currency
         * @param {Number/String} value The numeric value to format
         * @param {String} sign The currency sign to use (defaults to {@link #currencySign})
         * @param {Number} decimals The number of decimals to use for the currency (defaults to {@link #currencyPrecision})
         * @param {Boolean} end True if the currency sign should be at the end of the string (defaults to {@link #currencyAtEnd})
         * @return {String} The formatted currency string
         */
        currency: function(v, currencySign, decimals, end) {
            var negativeSign = '',
                format = ",0",
                i = 0;
            v = v - 0;
            if (v < 0) {
                v = -v;
                negativeSign = '-';
            }
            decimals = decimals || UtilFormat.currencyPrecision;
            format += format + (decimals > 0 ? '.' : '');
            for (; i < decimals; i++) {
                format += '0';
            }
            v = UtilFormat.number(v, format);
            if ((end || UtilFormat.currencyAtEnd) === true) {
                return Ext.String.format("{0}{1}{2}", negativeSign, v, currencySign || UtilFormat.currencySign);
            } else {
                return Ext.String.format("{0}{1}{2}", negativeSign, currencySign || UtilFormat.currencySign, v);
            }
        },

        /**
         * Formats the passed date using the specified format pattern.
         * @param {String/Date} value The value to format. If a string is passed, it is converted to a Date by the Javascript
         * Date object's <a href="http://www.w3schools.com/jsref/jsref_parse.asp">parse()</a> method.
         * @param {String} format (Optional) Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
         * @return {String} The formatted date string.
         */
        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Ext.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return Ext.Date.dateFormat(v, format || Ext.Date.defaultFormat);
        },

        /**
         * Returns a date rendering function that can be reused to apply a date format multiple times efficiently
         * @param {String} format Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
         * @return {Function} The date formatting function
         */
        dateRenderer : function(format) {
            return function(v) {
                return UtilFormat.date(v, format);
            };
        },

        /**
         * Strips all HTML tags
         * @param {Object} value The text from which to strip tags
         * @return {String} The stripped text
         */
        stripTags : function(v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        },

        /**
         * Strips all script tags
         * @param {Object} value The text from which to strip script tags
         * @return {String} The stripped text
         */
        stripScripts : function(v) {
            return !v ? v : String(v).replace(stripScriptsRe, "");
        },

        /**
         * Simple format for a file size (xxx bytes, xxx KB, xxx MB)
         * @param {Number/String} size The numeric value to format
         * @return {String} The formatted file size
         */
        fileSize : function(size) {
            if (size < 1024) {
                return size + " bytes";
            } else if (size < 1048576) {
                return (Math.round(((size*10) / 1024))/10) + " KB";
            } else {
                return (Math.round(((size*10) / 1048576))/10) + " MB";
            }
        },

        /**
         * It does simple math for use in a template, for example:<pre><code>
         * var tpl = new Ext.Template('{value} * 10 = {value:math("* 10")}');
         * </code></pre>
         * @return {Function} A function that operates on the passed value.
         * @method
         */
        math : function(){
            var fns = {};

            return function(v, a){
                if (!fns[a]) {
                    fns[a] = Ext.functionFactory('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }(),

        /**
         * Rounds the passed number to the required decimal precision.
         * @param {Number/String} value The numeric value to round.
         * @param {Number} precision The number of decimal places to which to round the first parameter's value.
         * @return {Number} The rounded value.
         */
        round : function(value, precision) {
            var result = Number(value);
            if (typeof precision == 'number') {
                precision = Math.pow(10, precision);
                result = Math.round(value * precision) / precision;
            }
            return result;
        },

        /**
         * <p>Formats the passed number according to the passed format string.</p>
         * <p>The number of digits after the decimal separator character specifies the number of
         * decimal places in the resulting string. The <u>local-specific</u> decimal character is used in the result.</p>
         * <p>The <i>presence</i> of a thousand separator character in the format string specifies that
         * the <u>locale-specific</u> thousand separator (if any) is inserted separating thousand groups.</p>
         * <p>By default, "," is expected as the thousand separator, and "." is expected as the decimal separator.</p>
         * <p><b>New to Ext JS 4</b></p>
         * <p>Locale-specific characters are always used in the formatted output when inserting
         * thousand and decimal separators.</p>
         * <p>The format string must specify separator characters according to US/UK conventions ("," as the
         * thousand separator, and "." as the decimal separator)</p>
         * <p>To allow specification of format strings according to local conventions for separator characters, add
         * the string <code>/i</code> to the end of the format string.</p>
         * <div style="margin-left:40px">examples (123456.789):
         * <div style="margin-left:10px">
         * 0 - (123456) show only digits, no precision<br>
         * 0.00 - (123456.78) show only digits, 2 precision<br>
         * 0.0000 - (123456.7890) show only digits, 4 precision<br>
         * 0,000 - (123,456) show comma and digits, no precision<br>
         * 0,000.00 - (123,456.78) show comma and digits, 2 precision<br>
         * 0,0.00 - (123,456.78) shortcut method, show comma and digits, 2 precision<br>
         * To allow specification of the formatting string using UK/US grouping characters (,) and decimal (.) for international numbers, add /i to the end.
         * For example: 0.000,00/i
         * </div></div>
         * @param {Number} v The number to format.
         * @param {String} format The way you would like to format this text.
         * @return {String} The formatted number.
         */
        number: function(v, formatString) {
            if (!formatString) {
                return v;
            }
            v = Ext.Number.from(v, NaN);
            if (isNaN(v)) {
                return '';
            }
            var comma = UtilFormat.thousandSeparator,
                dec   = UtilFormat.decimalSeparator,
                i18n  = false,
                neg   = v < 0,
                hasComma,
                psplit;

            v = Math.abs(v);

            // The "/i" suffix allows caller to use a locale-specific formatting string.
            // Clean the format string by removing all but numerals and the decimal separator.
            // Then split the format string into pre and post decimal segments according to *what* the
            // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
            if (formatString.substr(formatString.length - 2) == '/i') {
                if (!I18NFormatCleanRe) {
                    I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']','g');
                }
                formatString = formatString.substr(0, formatString.length - 2);
                i18n   = true;
                hasComma = formatString.indexOf(comma) != -1;
                psplit = formatString.replace(I18NFormatCleanRe, '').split(dec);
            } else {
                hasComma = formatString.indexOf(',') != -1;
                psplit = formatString.replace(formatCleanRe, '').split('.');
            }

            if (1 < psplit.length) {
                v = v.toFixed(psplit[1].length);
            } else if(2 < psplit.length) {
                //<debug>
                Ext.Error.raise({
                    sourceClass: "Ext.util.Format",
                    sourceMethod: "number",
                    value: v,
                    formatString: formatString,
                    msg: "Invalid number format, should have no more than 1 decimal"
                });
                //</debug>
            } else {
                v = v.toFixed(0);
            }

            var fnum = v.toString();

            psplit = fnum.split('.');

            if (hasComma) {
                var cnum = psplit[0],
                    parr = [],
                    j    = cnum.length,
                    m    = Math.floor(j / 3),
                    n    = cnum.length % 3 || 3,
                    i;

                for (i = 0; i < j; i += n) {
                    if (i !== 0) {
                        n = 3;
                    }

                    parr[parr.length] = cnum.substr(i, n);
                    m -= 1;
                }
                fnum = parr.join(comma);
                if (psplit[1]) {
                    fnum += dec + psplit[1];
                }
            } else {
                if (psplit[1]) {
                    fnum = psplit[0] + dec + psplit[1];
                }
            }

            if (neg) {
                /*
                 * Edge case. If we have a very small negative number it will get rounded to 0,
                 * however the initial check at the top will still report as negative. Replace
                 * everything but 1-9 and check if the string is empty to determine a 0 value.
                 */
                neg = fnum.replace(/[^1-9]/g, '') !== '';
            }

            return (neg ? '-' : '') + formatString.replace(/[\d,?\.?]+/, fnum);
        },

        /**
         * Returns a number rendering function that can be reused to apply a number format multiple times efficiently
         * @param {String} format Any valid number format string for {@link #number}
         * @return {Function} The number formatting function
         */
        numberRenderer : function(format) {
            return function(v) {
                return UtilFormat.number(v, format);
            };
        },

        /**
         * Selectively do a plural form of a word based on a numeric value. For example, in a template,
         * {commentCount:plural("Comment")}  would result in "1 Comment" if commentCount was 1 or would be "x Comments"
         * if the value is 0 or greater than 1.
         * @param {Number} value The value to compare against
         * @param {String} singular The singular form of the word
         * @param {String} plural (optional) The plural form of the word (defaults to the singular with an "s")
         */
        plural : function(v, s, p) {
            return v +' ' + (v == 1 ? s : (p ? p : s+'s'));
        },

        /**
         * Converts newline characters to the HTML tag &lt;br/>
         * @param {String} The string value to format.
         * @return {String} The string with embedded &lt;br/> tags in place of newlines.
         */
        nl2br : function(v) {
            return Ext.isEmpty(v) ? '' : v.replace(nl2brRe, '<br/>');
        },

        /**
         * Alias for {@link Ext.String#capitalize}.
         * @method
         * @alias Ext.String#capitalize
         */
        capitalize: Ext.String.capitalize,

        /**
         * Alias for {@link Ext.String#ellipsis}.
         * @method
         * @alias Ext.String#ellipsis
         */
        ellipsis: Ext.String.ellipsis,

        /**
         * Alias for {@link Ext.String#format}.
         * @method
         * @alias Ext.String#format
         */
        format: Ext.String.format,

        /**
         * Alias for {@link Ext.String#htmlDecode}.
         * @method
         * @alias Ext.String#htmlDecode
         */
        htmlDecode: Ext.String.htmlDecode,

        /**
         * Alias for {@link Ext.String#htmlEncode}.
         * @method
         * @alias Ext.String#htmlEncode
         */
        htmlEncode: Ext.String.htmlEncode,

        /**
         * Alias for {@link Ext.String#leftPad}.
         * @method
         * @alias Ext.String#leftPad
         */
        leftPad: Ext.String.leftPad,

        /**
         * Alias for {@link Ext.String#trim}.
         * @method
         * @alias Ext.String#trim
         */
        trim : Ext.String.trim,

        /**
         * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
         * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
         * @param {Number/String} v The encoded margins
         * @return {Object} An object with margin sizes for top, right, bottom and left
         */
        parseBox : function(box) {
            if (Ext.isNumber(box)) {
                box = box.toString();
            }
            var parts  = box.split(' '),
                ln = parts.length;

            if (ln == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            }
            else if (ln == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            }
            else if (ln == 3) {
                parts[3] = parts[1];
            }

            return {
                top   :parseInt(parts[0], 10) || 0,
                right :parseInt(parts[1], 10) || 0,
                bottom:parseInt(parts[2], 10) || 0,
                left  :parseInt(parts[3], 10) || 0
            };
        },

        /**
         * Escapes the passed string for use in a regular expression
         * @param {String} str
         * @return {String}
         */
        escapeRegex : function(s) {
            return s.replace(/([\-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        }
    });
})();

/**
 * @class Ext.util.TaskRunner
 * Provides the ability to execute one or more arbitrary tasks in a multithreaded
 * manner.  Generally, you can use the singleton {@link Ext.TaskManager} instead, but
 * if needed, you can create separate instances of TaskRunner.  Any number of
 * separate tasks can be started at any time and will run independently of each
 * other. Example usage:
 * <pre><code>
// Start a simple clock task that updates a div once per second
var updateClock = function(){
    Ext.fly('clock').update(new Date().format('g:i:s A'));
} 
var task = {
    run: updateClock,
    interval: 1000 //1 second
}
var runner = new Ext.util.TaskRunner();
runner.start(task);

// equivalent using TaskManager
Ext.TaskManager.start({
    run: updateClock,
    interval: 1000
});

 * </code></pre>
 * <p>See the {@link #start} method for details about how to configure a task object.</p>
 * Also see {@link Ext.util.DelayedTask}. 
 * 
 * @constructor
 * @param {Number} [interval=10] The minimum precision in milliseconds supported by this TaskRunner instance
 */
Ext.ns('Ext.util');

Ext.util.TaskRunner = function(interval) {
    interval = interval || 10;
    var tasks = [],
    removeQueue = [],
    id = 0,
    running = false,

    // private
    stopThread = function() {
        running = false;
        clearInterval(id);
        id = 0;
    },

    // private
    startThread = function() {
        if (!running) {
            running = true;
            id = setInterval(runTasks, interval);
        }
    },

    // private
    removeTask = function(t) {
        removeQueue.push(t);
        if (t.onStop) {
            t.onStop.apply(t.scope || t);
        }
    },

    // private
    runTasks = function() {
        var rqLen = removeQueue.length,
            now = new Date().getTime(),
            i;

        if (rqLen > 0) {
            for (i = 0; i < rqLen; i++) {
                Ext.Array.remove(tasks, removeQueue[i]);
            }
            removeQueue = [];
            if (tasks.length < 1) {
                stopThread();
                return;
            }
        }
        i = 0;
        var t,
            itime,
            rt,
            len = tasks.length;
        for (; i < len; ++i) {
            t = tasks[i];
            itime = now - t.taskRunTime;
            if (t.interval <= itime) {
                rt = t.run.apply(t.scope || t, t.args || [++t.taskRunCount]);
                t.taskRunTime = now;
                if (rt === false || t.taskRunCount === t.repeat) {
                    removeTask(t);
                    return;
                }
            }
            if (t.duration && t.duration <= (now - t.taskStartTime)) {
                removeTask(t);
            }
        }
    };

    /**
     * Starts a new task.
     * @method start
     * @param {Object} task <p>A config object that supports the following properties:<ul>
     * <li><code>run</code> : Function<div class="sub-desc"><p>The function to execute each time the task is invoked. The
     * function will be called at each interval and passed the <code>args</code> argument if specified, and the
     * current invocation count if not.</p>
     * <p>If a particular scope (<code>this</code> reference) is required, be sure to specify it using the <code>scope</code> argument.</p>
     * <p>Return <code>false</code> from this function to terminate the task.</p></div></li>
     * <li><code>interval</code> : Number<div class="sub-desc">The frequency in milliseconds with which the task
     * should be invoked.</div></li>
     * <li><code>args</code> : Array<div class="sub-desc">(optional) An array of arguments to be passed to the function
     * specified by <code>run</code>. If not specified, the current invocation count is passed.</div></li>
     * <li><code>scope</code> : Object<div class="sub-desc">(optional) The scope (<tt>this</tt> reference) in which to execute the
     * <code>run</code> function. Defaults to the task config object.</div></li>
     * <li><code>duration</code> : Number<div class="sub-desc">(optional) The length of time in milliseconds to invoke
     * the task before stopping automatically (defaults to indefinite).</div></li>
     * <li><code>repeat</code> : Number<div class="sub-desc">(optional) The number of times to invoke the task before
     * stopping automatically (defaults to indefinite).</div></li>
     * </ul></p>
     * <p>Before each invocation, Ext injects the property <code>taskRunCount</code> into the task object so
     * that calculations based on the repeat count can be performed.</p>
     * @return {Object} The task
     */
    this.start = function(task) {
        tasks.push(task);
        task.taskStartTime = new Date().getTime();
        task.taskRunTime = 0;
        task.taskRunCount = 0;
        startThread();
        return task;
    };

    /**
     * Stops an existing running task.
     * @method stop
     * @param {Object} task The task to stop
     * @return {Object} The task
     */
    this.stop = function(task) {
        removeTask(task);
        return task;
    };

    /**
     * Stops all tasks that are currently running.
     * @method stopAll
     */
    this.stopAll = function() {
        stopThread();
        for (var i = 0, len = tasks.length; i < len; i++) {
            if (tasks[i].onStop) {
                tasks[i].onStop();
            }
        }
        tasks = [];
        removeQueue = [];
    };
};

/**
 * @class Ext.TaskManager
 * @extends Ext.util.TaskRunner
 * A static {@link Ext.util.TaskRunner} instance that can be used to start and stop arbitrary tasks.  See
 * {@link Ext.util.TaskRunner} for supported methods and task config properties.
 * <pre><code>
// Start a simple clock task that updates a div once per second
var task = {
    run: function(){
        Ext.fly('clock').update(new Date().format('g:i:s A'));
    },
    interval: 1000 //1 second
}
Ext.TaskManager.start(task);
</code></pre>
 * <p>See the {@link #start} method for details about how to configure a task object.</p>
 * @singleton
 */
Ext.TaskManager = Ext.create('Ext.util.TaskRunner');
/**
 * @class Ext.is
 * 
 * Determines information about the current platform the application is running on.
 * 
 * @singleton
 */
Ext.is = {
    init : function(navigator) {
        var platforms = this.platforms,
            ln = platforms.length,
            i, platform;

        navigator = navigator || window.navigator;

        for (i = 0; i < ln; i++) {
            platform = platforms[i];
            this[platform.identity] = platform.regex.test(navigator[platform.property]);
        }

        /**
         * @property Desktop True if the browser is running on a desktop machine
         * @type {Boolean}
         */
        this.Desktop = this.Mac || this.Windows || (this.Linux && !this.Android);
        /**
         * @property Tablet True if the browser is running on a tablet (iPad)
         */
        this.Tablet = this.iPad;
        /**
         * @property Phone True if the browser is running on a phone.
         * @type {Boolean}
         */
        this.Phone = !this.Desktop && !this.Tablet;
        /**
         * @property iOS True if the browser is running on iOS
         * @type {Boolean}
         */
        this.iOS = this.iPhone || this.iPad || this.iPod;
        
        /**
         * @property Standalone Detects when application has been saved to homescreen.
         * @type {Boolean}
         */
        this.Standalone = !!window.navigator.standalone;
    },
    
    /**
     * @property iPhone True when the browser is running on a iPhone
     * @type {Boolean}
     */
    platforms: [{
        property: 'platform',
        regex: /iPhone/i,
        identity: 'iPhone'
    },
    
    /**
     * @property iPod True when the browser is running on a iPod
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /iPod/i,
        identity: 'iPod'
    },
    
    /**
     * @property iPad True when the browser is running on a iPad
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /iPad/i,
        identity: 'iPad'
    },
    
    /**
     * @property Blackberry True when the browser is running on a Blackberry
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /Blackberry/i,
        identity: 'Blackberry'
    },
    
    /**
     * @property Android True when the browser is running on an Android device
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /Android/i,
        identity: 'Android'
    },
    
    /**
     * @property Mac True when the browser is running on a Mac
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Mac/i,
        identity: 'Mac'
    },
    
    /**
     * @property Windows True when the browser is running on Windows
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Win/i,
        identity: 'Windows'
    },
    
    /**
     * @property Linux True when the browser is running on Linux
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Linux/i,
        identity: 'Linux'
    }]
};

Ext.is.init();

/**
 * @class Ext.supports
 *
 * Determines information about features are supported in the current environment
 * 
 * @singleton
 */
Ext.supports = {
    init : function() {
        var doc = document,
            div = doc.createElement('div'),
            tests = this.tests,
            ln = tests.length,
            i, test;

        div.innerHTML = [
            '<div style="height:30px;width:50px;">',
                '<div style="height:20px;width:20px;"></div>',
            '</div>',
            '<div style="width: 200px; height: 200px; position: relative; padding: 5px;">',
                '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>',
            '</div>',
            '<div style="float:left; background-color:transparent;"></div>'
        ].join('');

        doc.body.appendChild(div);

        for (i = 0; i < ln; i++) {
            test = tests[i];
            this[test.identity] = test.fn.call(this, doc, div);
        }

        doc.body.removeChild(div);
    },

    /**
     * @property CSS3BoxShadow True if document environment supports the CSS3 box-shadow style.
     * @type {Boolean}
     */
    CSS3BoxShadow: Ext.isDefined(document.documentElement.style.boxShadow),

    /**
     * @property ClassList True if document environment supports the HTML5 classList API.
     * @type {Boolean}
     */
    ClassList: !!document.documentElement.classList,

    /**
     * @property OrientationChange True if the device supports orientation change
     * @type {Boolean}
     */
    OrientationChange: ((typeof window.orientation != 'undefined') && ('onorientationchange' in window)),
    
    /**
     * @property DeviceMotion True if the device supports device motion (acceleration and rotation rate)
     * @type {Boolean}
     */
    DeviceMotion: ('ondevicemotion' in window),
    
    /**
     * @property Touch True if the device supports touch
     * @type {Boolean}
     */
    // is.Desktop is needed due to the bug in Chrome 5.0.375, Safari 3.1.2
    // and Safari 4.0 (they all have 'ontouchstart' in the window object).
    Touch: ('ontouchstart' in window) && (!Ext.is.Desktop),

    tests: [
        /**
         * @property Transitions True if the device supports CSS3 Transitions
         * @type {Boolean}
         */
        {
            identity: 'Transitions',
            fn: function(doc, div) {
                var prefix = [
                        'webkit',
                        'Moz',
                        'o',
                        'ms',
                        'khtml'
                    ],
                    TE = 'TransitionEnd',
                    transitionEndName = [
                        prefix[0] + TE,
                        'transitionend', //Moz bucks the prefixing convention
                        prefix[2] + TE,
                        prefix[3] + TE,
                        prefix[4] + TE
                    ],
                    ln = prefix.length,
                    i = 0,
                    out = false;
                div = Ext.get(div);
                for (; i < ln; i++) {
                    if (div.getStyle(prefix[i] + "TransitionProperty")) {
                        Ext.supports.CSS3Prefix = prefix[i];
                        Ext.supports.CSS3TransitionEnd = transitionEndName[i];
                        out = true;
                        break;
                    }
                }
                return out;
            }
        },
        
        /**
         * @property RightMargin True if the device supports right margin.
         * See https://bugs.webkit.org/show_bug.cgi?id=13343 for why this is needed.
         * @type {Boolean}
         */
        {
            identity: 'RightMargin',
            fn: function(doc, div) {
                var view = doc.defaultView;
                return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight != '0px');
            }
        },

        /**
         * @property DisplayChangeInputSelectionBug True if INPUT elements lose their
         * selection when their display style is changed. Essentially, if a text input
         * has focus and its display style is changed, the I-beam disappears.
         * 
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Safari 4.0.4 and older, and appears to be fixed
         * in Safari 5. It's not clear if Safari 4.1 has the bug, but it has the same WebKit
         * version number as Safari 5 (according to http://unixpapa.com/js/gecko.html).
         */
        {
            identity: 'DisplayChangeInputSelectionBug',
            fn: function() {
                var webKitVersion = Ext.webKitVersion;
                // WebKit but older than Safari 5 or Chrome 6:
                return 0 < webKitVersion && webKitVersion < 533;
            }
        },

        /**
         * @property DisplayChangeTextAreaSelectionBug True if TEXTAREA elements lose their
         * selection when their display style is changed. Essentially, if a text area has
         * focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Chrome 10 and Safari 5 and older, and appears to
         * be fixed in Chrome 11.
         */
        {
            identity: 'DisplayChangeTextAreaSelectionBug',
            fn: function() {
                var webKitVersion = Ext.webKitVersion;

                /*
                Has bug w/textarea:

                (Chrome) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-US)
                            AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.127
                            Safari/534.16
                (Safari) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us)
                            AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5
                            Safari/533.21.1

                No bug:

                (Chrome) Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7)
                            AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57
                            Safari/534.24
                */
                return 0 < webKitVersion && webKitVersion < 534.24;
            }
        },

        /**
         * @property TransparentColor True if the device supports transparent color
         * @type {Boolean}
         */
        {
            identity: 'TransparentColor',
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return !(view && view.getComputedStyle(div.lastChild, null).backgroundColor != 'transparent');
            }
        },

        /**
         * @property ComputedStyle True if the browser supports document.defaultView.getComputedStyle()
         * @type {Boolean}
         */
        {
            identity: 'ComputedStyle',
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return view && view.getComputedStyle;
            }
        },
        
        /**
         * @property SVG True if the device supports SVG
         * @type {Boolean}
         */
        {
            identity: 'Svg',
            fn: function(doc) {
                return !!doc.createElementNS && !!doc.createElementNS( "http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect;
            }
        },
    
        /**
         * @property Canvas True if the device supports Canvas
         * @type {Boolean}
         */
        {
            identity: 'Canvas',
            fn: function(doc) {
                return !!doc.createElement('canvas').getContext;
            }
        },
        
        /**
         * @property VML True if the device supports VML
         * @type {Boolean}
         */
        {
            identity: 'Vml',
            fn: function(doc) {
                var d = doc.createElement("div");
                d.innerHTML = "<!--[if vml]><br><br><![endif]-->";
                return (d.childNodes.length == 2);
            }
        },
        
        /**
         * @property Float True if the device supports CSS float
         * @type {Boolean}
         */
        {
            identity: 'Float',
            fn: function(doc, div) {
                return !!div.lastChild.style.cssFloat;
            }
        },
        
        /**
         * @property AudioTag True if the device supports the HTML5 audio tag
         * @type {Boolean}
         */
        {
            identity: 'AudioTag',
            fn: function(doc) {
                return !!doc.createElement('audio').canPlayType;
            }
        },
        
        /**
         * @property History True if the device supports HTML5 history
         * @type {Boolean}
         */
        {
            identity: 'History',
            fn: function() {
                return !!(window.history && history.pushState);
            }
        },
        
        /**
         * @property CSS3DTransform True if the device supports CSS3DTransform
         * @type {Boolean}
         */
        {
            identity: 'CSS3DTransform',
            fn: function() {
                return (typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'));
            }
        },

		/**
         * @property CSS3LinearGradient True if the device supports CSS3 linear gradients
         * @type {Boolean}
         */
        {
            identity: 'CSS3LinearGradient',
            fn: function(doc, div) {
                var property = 'background-image:',
                    webkit   = '-webkit-gradient(linear, left top, right bottom, from(black), to(white))',
                    w3c      = 'linear-gradient(left top, black, white)',
                    moz      = '-moz-' + w3c,
                    options  = [property + webkit, property + w3c, property + moz];
                
                div.style.cssText = options.join(';');
                
                return ("" + div.style.backgroundImage).indexOf('gradient') !== -1;
            }
        },
        
        /**
         * @property CSS3BorderRadius True if the device supports CSS3 border radius
         * @type {Boolean}
         */
        {
            identity: 'CSS3BorderRadius',
            fn: function(doc, div) {
                var domPrefixes = ['borderRadius', 'BorderRadius', 'MozBorderRadius', 'WebkitBorderRadius', 'OBorderRadius', 'KhtmlBorderRadius'],
                    pass = false,
                    i;
                for (i = 0; i < domPrefixes.length; i++) {
                    if (document.body.style[domPrefixes[i]] !== undefined) {
                        return true;
                    }
                }
                return pass;
            }
        },
        
        /**
         * @property GeoLocation True if the device supports GeoLocation
         * @type {Boolean}
         */
        {
            identity: 'GeoLocation',
            fn: function() {
                return (typeof navigator != 'undefined' && typeof navigator.geolocation != 'undefined') || (typeof google != 'undefined' && typeof google.gears != 'undefined');
            }
        },
        /**
         * @property MouseEnterLeave True if the browser supports mouseenter and mouseleave events
         * @type {Boolean}
         */
        {
            identity: 'MouseEnterLeave',
            fn: function(doc, div){
                return ('onmouseenter' in div && 'onmouseleave' in div);
            }
        },
        /**
         * @property MouseWheel True if the browser supports the mousewheel event
         * @type {Boolean}
         */
        {
            identity: 'MouseWheel',
            fn: function(doc, div) {
                return ('onmousewheel' in div);
            }
        },
        /**
         * @property Opacity True if the browser supports normal css opacity
         * @type {Boolean}
         */
        {
            identity: 'Opacity',
            fn: function(doc, div){
                // Not a strict equal comparison in case opacity can be converted to a number.
                if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                    return false;
                }
                div.firstChild.style.cssText = 'opacity:0.73';
                return div.firstChild.style.opacity == '0.73';
            }
        },
        /**
         * @property Placeholder True if the browser supports the HTML5 placeholder attribute on inputs
         * @type {Boolean}
         */
        {
            identity: 'Placeholder',
            fn: function(doc) {
                return 'placeholder' in doc.createElement('input');
            }
        },
        
        /**
         * @property Direct2DBug True if when asking for an element's dimension via offsetWidth or offsetHeight, 
         * getBoundingClientRect, etc. the browser returns the subpixel width rounded to the nearest pixel.
         * @type {Boolean}
         */
        {
            identity: 'Direct2DBug',
            fn: function() {
                return Ext.isString(document.body.style.msTransformOrigin);
            }
        },
        /**
         * @property BoundingClientRect True if the browser supports the getBoundingClientRect method on elements
         * @type {Boolean}
         */
        {
            identity: 'BoundingClientRect',
            fn: function(doc, div) {
                return Ext.isFunction(div.getBoundingClientRect);
            }
        },
        {
            identity: 'IncludePaddingInWidthCalculation',
            fn: function(doc, div){
                var el = Ext.get(div.childNodes[1].firstChild);
                return el.getWidth() == 210;
            }
        },
        {
            identity: 'IncludePaddingInHeightCalculation',
            fn: function(doc, div){
                var el = Ext.get(div.childNodes[1].firstChild);
                return el.getHeight() == 210;
            }
        },
        
        /**
         * @property ArraySort True if the Array sort native method isn't bugged.
         * @type {Boolean}
         */
        {
            identity: 'ArraySort',
            fn: function() {
                var a = [1,2,3,4,5].sort(function(){ return 0; });
                return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
            }
        },
        /**
         * @property Range True if browser support document.createRange native method.
         * @type {Boolean}
         */
        {
            identity: 'Range',
            fn: function() {
                return !!document.createRange;
            }
        },
        /**
         * @property CreateContextualFragment True if browser support CreateContextualFragment range native methods.
         * @type {Boolean}
         */
        {
            identity: 'CreateContextualFragment',
            fn: function() {
                var range = Ext.supports.Range ? document.createRange() : false;
                
                return range && !!range.createContextualFragment;
            }
        },

        /**
         * @property WindowOnError True if browser supports window.onerror.
         * @type {Boolean}
         */
        {
            identity: 'WindowOnError',
            fn: function () {
                // sadly, we cannot feature detect this...
                return Ext.isIE || Ext.isGecko || Ext.webKitVersion >= 534.16; // Chrome 10+
            }
        }
    ]
};


