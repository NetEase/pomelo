/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Provides useful information about the current browser features.
 * Don't instantiate directly, but use the {@link Ext#features} property instead.
 */
Ext.define('Ext.env.FeatureDetector', {

    statics: {
        defaultTests: {
            /**
             * @property {Boolean}
             * True if canvas element supported.
             */
            Canvas: function() {
                var element = this.getTestElement('canvas');
                return !!(element && element.getContext && element.getContext('2d'));
            },
            /**
             * @property {Boolean}
             * True if SVG supported.
             */
            SVG: function() {
                var doc = Ext.global.document;

                return !!(doc.createElementNS && !!doc.createElementNS("http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect);
            },
            /**
             * @property {Boolean}
             * True if VML supported.
             */
            VML: function() {
                var element = this.getTestElement(),
                    ret = false;

                element.innerHTML = "<!--[if vml]><br><br><![endif]-->";
                ret = (element.childNodes.length === 2);
                element.innerHTML = "";

                return ret;
            },
            /**
             * @property {Boolean}
             * True if we're in Sencha Touch environment.
             */
            Touch: function() {
                return ('ontouchstart' in Ext.global) && !(Ext.platform && Ext.platform.name.match(/Windows|MacOSX|Linux/));
            },
            /**
             * @property {Boolean}
             * True if orientation API supported.
             */
            Orientation: function() {
                return ('orientation' in Ext.global);
            },
            /**
             * @property {Boolean}
             * True if geolocation API supported.
             */
            Geolocation: function() {
                return !!Ext.global.navigator.geolocation;
            },
            /**
             * @property {Boolean}
             * True if openDatabase API supported.
             */
            SqlDatabase: function() {
                return !!Ext.global.openDatabase;
            },
            /**
             * @property {Boolean}
             * True if WebSocket API supported.
             */
            Websockets: function() {
                return 'WebSocket' in Ext.global;
            },
            /**
             * @property {Boolean}
             * True if history.pushState supported.
             */
            History: function() {
                return !!(Ext.global.history && Ext.global.history.pushState);
            },
            /**
             * @property {Boolean}
             * True if CSS transforms supported.
             */
            CSSTransforms: function() {
                return this.isStyleSupported('transform');
            },
            /**
             * @property {Boolean}
             * True if CSS 3D transforms supported.
             */
            CSS3DTransforms: function() {
                return this.has('csstransforms') && this.isStyleSupported('perspective');
            },
            /**
             * @property {Boolean}
             * True if CSS animations supported.
             */
            CSSAnimations: function() {
                return this.isStyleSupported('animationName');
            },
            /**
             * @property {Boolean}
             * True if CSS transitions supported.
             */
            CSSTransitions: function() {
                return this.isStyleSupported('transitionProperty');
            },
            /**
             * @property {Boolean}
             * True if audio element supported.
             */
            Audio: function() {
                return !!this.getTestElement('audio').canPlayType;
            },
            /**
             * @property {Boolean}
             * True if video element supported.
             */
            Video: function() {
                return !!this.getTestElement('video').canPlayType;
            }
        },

        stylePrefixes: ['Webkit', 'Moz', 'O', 'ms']
    },

    constructor: function() {
        this.tests = {};

        this.testElements = {};

        this.registerTests(this.self.defaultTests, true);

        return this;
    },

    has: function(name) {
        if (!this.hasTest(name)) {
            return false;
        }
        else if (this.has.hasOwnProperty(name)) {
            return this.has[name];
        }
        else {
            return this.getTestResult(name);
        }
    },

    getTestResult: function(name) {
        return !!this.getTest(name).call(this);
    },

    getTestElement: function(tag) {
        if (!tag) {
            tag = 'div';
        }

        if (!this.testElements[tag]) {
            this.testElements[tag] = Ext.global.document.createElement(tag);
        }

        return this.testElements[tag];
    },

    registerTest: function(name, fn, isDefault) {
        //<debug>
        if (this.hasTest(name)) {
            Ext.Error.raise({
                sourceClass: "Ext.env.FeatureDetector",
                sourceMethod: "registerTest",
                msg: "Test name " + name + " has already been registered"
            });
        }
        //<debug>

        this.tests[name] = fn;

        if (isDefault) {
            this.has[name] = this.getTestResult(name);
        }

        return this;
    },

    registerTests: function(tests, isDefault) {
        Ext.Object.each(tests, function(name, fn) {
            this.registerTest(name, fn, isDefault);
        }, this);

        return this;
    },

    hasTest: function(name) {
        return this.tests.hasOwnProperty(name);
    },

    getTest: function(name) {
        //<debug>
        if (!this.hasTest(name)) {
            Ext.Error.raise({
                sourceClass: "Ext.env.FeatureDetector",
                sourceMethod: "getTest",
                msg: "Test name " + name + " does not exist"
            });
        }
        //<debug>

        return this.tests[name];
    },

    getTests: function() {
        return this.tests;
    },

    isStyleSupported: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style,
            cName = Ext.String.capitalize(name),
            i = this.self.stylePrefixes.length;

        if (elementStyle[name] !== undefined) {
            return true;
        }

        while (i--) {
            if (elementStyle[this.self.stylePrefixes[i] + cName] !== undefined) {
                return true;
            }
        }

        return false;
    },

    isEventSupported: function(name, tag) {
        var element = this.getTestElement(tag),
            eventName = 'on' + name,
            isSupported = false;

        // When using `setAttribute`, IE skips "unload", WebKit skips
        // "unload" and "resize", whereas `in` "catches" those
        isSupported = (eventName in element);

        if (!isSupported) {
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';

                // If property was created, "remove it" (by setting value to `undefined`)
                if (typeof element[eventName] !== 'undefined') {
                    element[eventName] = undefined;
                }

                element.removeAttribute(eventName);
            }
        }

        return isSupported;
    }

}, function() {

    /**
     * @property {Ext.env.FeatureDetector} features
     * @member Ext
     * Global convenient instance of {@link Ext.env.FeatureDetector}.
     */
    Ext.features = new Ext.env.FeatureDetector();

});

