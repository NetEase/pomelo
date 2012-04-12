/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Provides useful information about the current browser.
 * Should not be manually instantiated unless for unit-testing; access the global instance
 * stored in {@link Ext#browser} instead. Example:
 *
 *     if (Ext.browser.is.IE) {
 *          // IE specific code here
 *     }
 *
 *     if (Ext.browser.is.WebKit) {
 *          // WebKit specific code here
 *     }
 *
 *     console.log("Version " + Ext.browser.version);
 *
 * For a full list of supported values, refer to: {@link Ext.env.Browser#is}
 */
Ext.define('Ext.env.Browser', {
    statics: {
        browserNames: {
            ie: 'IE',
            firefox: 'Firefox',
            safari: 'Safari',
            chrome: 'Chrome',
            opera: 'Opera',
            other: 'Other'
        },
        engineNames: {
            webkit: 'WebKit',
            gecko: 'Gecko',
            presto: 'Presto',
            trident: 'Trident',
            other: 'Other'
        },
        enginePrefixes: {
            webkit: 'AppleWebKit/',
            gecko: 'Gecko/',
            presto: 'Presto/',
            trident: 'Trident/'
        },
        browserPrefixes: {
            ie: 'MSIE ',
            firefox: 'Firefox/',
            chrome: 'Chrome/',
            safari: 'Version/',
            opera: 'Opera/'
        }
    },

    /**
     * @property {Boolean} isSecure
     * True if the page is running over SSL
     */
    isSecure: false,

    /**
     * @property {Boolean} isStrict
     * True if the document is in strict mode
     */
    isStrict: false,

    /**
     * A "hybrid" property, can be either accessed as a method call, i.e:
     *
     *     if (Ext.browser.is('IE')) { ... }
     *
     * or as an object with boolean properties, i.e:
     *
     *     if (Ext.browser.is.IE) { ... }
     *
     * Versions can be conveniently checked as well. For example:
     *
     *     if (Ext.browser.is.IE6) { ... } // Equivalent to (Ext.browser.is.IE && Ext.browser.version.equals(6))
     *
     * Note that only {@link Ext.Version#getMajor major component}  and {@link Ext.Version#getShortVersion shortVersion}
     * value of the version are available via direct property checking.
     *
     * Supported values are: IE, Firefox, Safari, Chrome, Opera, WebKit, Gecko, Presto, Trident and Other
     *
     * @param {String} value The OS name to check
     * @return {Boolean}
     * @method
     */
    is: Ext.emptyFn,

    /**
     * @property {String} name
     * Read-only - the full name of the current browser
     * Possible values are: IE, Firefox, Safari, Chrome, Opera and Other
     */
    name: null,

    /**
     * @property {Ext.Version} version
     * Read-only, refer to {@link Ext.Version}
     */
    version: null,

    /**
     * @property {String} engineName
     * Read-only - the full name of the current browser's engine
     * Possible values are: WebKit, Gecko, Presto, Trident and Other
     */
    engineName: null,

    /**
     * @property {String} engineVersion
     * Read-only, refer to {@link Ext.Version}
     */
    engineVersion: null,

    constructor: function() {
        var userAgent = this.userAgent = Ext.global.navigator.userAgent,
            selfClass = this.statics(),
            browserMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(selfClass.browserPrefixes).join(')|(?:') + '))([\\d\\._]+)')),
            engineMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(selfClass.enginePrefixes).join(')|(?:') + '))([\\d\\._]+)')),
            browserName = selfClass.browserNames.other,
            browserVersion = '',
            engineName = selfClass.engineNames.other,
            engineVersion = '';

        this.is = function(name) {
            return this.is[name] === true;
        };

        if (browserMatch) {
            browserName = selfClass.browserNames[Ext.Object.getKey(selfClass.browserPrefixes, browserMatch[1])];
            browserVersion = browserMatch[2];
        }

        if (engineMatch) {
            engineName = selfClass.engineNames[Ext.Object.getKey(selfClass.enginePrefixes, engineMatch[1])];
            engineVersion = engineMatch[2];
        }

        Ext.apply(this, {
            engineName: engineName,
            engineVersion: new Ext.Version(engineVersion),
            name: browserName,
            version: new Ext.Version(browserVersion)
        });

        this.is[this.name] = true;
        this.is[this.name + (this.version.getMajor() || '')] = true;
        this.is[this.name + this.version.getShortVersion()] = true;
        Ext.Object.each(selfClass.browserNames, function(key, name) {
            this.is[name] = (this.name === name);
        }, this);

        this.is[this.name] = true;
        this.is[this.engineName + (this.engineVersion.getMajor() || '')] = true;
        this.is[this.engineName + this.engineVersion.getShortVersion()] = true;
        Ext.Object.each(selfClass.engineNames, function(key, name) {
            this.is[name] = (this.engineName === name);
        }, this);


        this.isSecure = /^https/i.test(Ext.global.location.protocol);

        this.isStrict = Ext.global.document.compatMode === "CSS1Compat";

        return this;
    }

}, function() {

    /**
     * @property {Ext.env.Browser} browser
     * @member Ext
     * Global convenient instance of {@link Ext.env.Browser}.
     */
    Ext.browser = new Ext.env.Browser();

});

