/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.env.OS
 * Provides useful information about the current operating system environment.
 * Access the global instance stored in {@link Ext#os}. Example:
 *
 *     if (Ext.os.is.Windows) {
 *          // Windows specific code here
 *     }
 *
 *     if (Ext.os.is.iOS) {
 *          // iPad, iPod, iPhone, etc.
 *     }
 *
 *     console.log("Version " + Ext.os.version);
 *
 * For a full list of supported values, refer to: {@link Ext.env.OS#is}
 */
Ext.define('Ext.env.OS', {

    statics: {
        osNames: {
            ios: 'iOS',
            android: 'Android',
            webos: 'WebOS',
            blackberry: 'BlackBerry',
            mac: 'MacOSX',
            win: 'Windows',
            linux: 'Linux',
            other: 'Other'
        },
        osPrefixes: {
            ios: 'iPhone OS ',
            android: 'Android ',
            blackberry: 'BlackBerry ',
            webos: 'webOS/'
        }
    },

    /**
     * A "hybrid" property, can be either accessed as a method call, i.e:
     *
     *     if (Ext.os.is('Android')) { ... }
     *
     * or as an object with boolean properties, i.e:
     *
     *     if (Ext.os.is.Android) { ... }
     *
     * Versions can be conveniently checked as well. For example:
     *
     *     if (Ext.os.is.Android2) { ... } // Equivalent to (Ext.os.is.Android && Ext.os.version.equals(2))
     * 
     *     if (Ext.os.is.iOS32) { ... } // Equivalent to (Ext.os.is.iOS && Ext.os.version.equals(3.2))
     *
     * Note that only {@link Ext.Version#getMajor major component}  and {@link Ext.Version#getShortVersion shortVersion}
     * value of the version are available via direct property checking.
     *
     * Supported values are: iOS, iPad, iPhone, iPod, Android, WebOS, BlackBerry, MacOSX, Windows, Linux and Other
     *
     * @param {String} value The OS name to check
     * @return {Boolean}
     * @method
     */
    is: Ext.emptyFn,

    /**
     * @property {String} name
     * Read-only - the full name of the current operating system
     * Possible values are: iOS, Android, WebOS, BlackBerry, MacOSX, Windows, Linux and Other
     */
    name: null,

    /**
     * @property {Ext.Version} version
     * Read-only, refer to {@link Ext.Version}
     */
    version: null,

    constructor: function() {
        var userAgent = Ext.global.navigator.userAgent,
            platform = Ext.global.navigator.platform,
            selfClass = this.statics(),
            osMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(selfClass.osPrefixes).join(')|(?:') + '))([^\\s;]+)')),
            name = 'other',
            version = '',
            actualVersionMatch;

        if (osMatch) {
            name = selfClass.osNames[Ext.Object.getKey(selfClass.osPrefixes, osMatch[1])];
            version = osMatch[2];

            if (name === 'BlackBerry') {
                actualVersionMatch = userAgent.match(/Version\/([\d\._]+)/);

                if (actualVersionMatch) {
                    version = actualVersionMatch[1];
                }
            }
        }
        else {
            name = selfClass.osNames[(userAgent.toLowerCase().match(/mac|win|linux/i) || ['other'])[0]];
        }

        Ext.apply(this, {
            name: name,
            version: new Ext.Version(version)
        });

        this.is = function(name) {
            return this.is[name] === true;
        };

        if (name === 'iOS') {
            this.is[platform] = true;
        }

        this.is[this.name] = true;
        this.is[this.name + (this.version.getMajor() || '')] = true;
        this.is[this.name + this.version.getShortVersion()] = true;

        Ext.Object.each(selfClass.osNames, function(key, name) {
            this.is[name] = (this.name === name);
        }, this);

        return this;
    }
}, function() {

    /**
     * @property {Ext.env.OS} os
     * @member Ext
     * Global convenient instance of {@link Ext.env.OS}.
     */
    Ext.os = new Ext.env.OS();

});

