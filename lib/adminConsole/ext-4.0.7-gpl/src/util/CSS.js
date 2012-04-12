/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.CSS
 * Utility class for manipulating CSS rules
 * @singleton
 */
Ext.define('Ext.util.CSS', function() {
    var rules = null;
    var doc = document;

    var camelRe = /(-[a-z])/gi;
    var camelFn = function(m, a){ return a.charAt(1).toUpperCase(); };

    return {

        singleton: true,

        constructor: function() {
            this.rules = {};
            this.initialized = false;
        },

        /**
         * Creates a stylesheet from a text blob of rules.
         * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
         * @param {String} cssText The text containing the css rules
         * @param {String} id An id to add to the stylesheet for later removal
         * @return {CSSStyleSheet}
         */
        createStyleSheet : function(cssText, id) {
            var ss,
                head = doc.getElementsByTagName("head")[0],
                styleEl = doc.createElement("style");

            styleEl.setAttribute("type", "text/css");
            if (id) {
               styleEl.setAttribute("id", id);
            }

            if (Ext.isIE) {
               head.appendChild(styleEl);
               ss = styleEl.styleSheet;
               ss.cssText = cssText;
            } else {
                try{
                    styleEl.appendChild(doc.createTextNode(cssText));
                } catch(e) {
                   styleEl.cssText = cssText;
                }
                head.appendChild(styleEl);
                ss = styleEl.styleSheet ? styleEl.styleSheet : (styleEl.sheet || doc.styleSheets[doc.styleSheets.length-1]);
            }
            this.cacheStyleSheet(ss);
            return ss;
        },

        /**
         * Removes a style or link tag by id
         * @param {String} id The id of the tag
         */
        removeStyleSheet : function(id) {
            var existing = document.getElementById(id);
            if (existing) {
                existing.parentNode.removeChild(existing);
            }
        },

        /**
         * Dynamically swaps an existing stylesheet reference for a new one
         * @param {String} id The id of an existing link tag to remove
         * @param {String} url The href of the new stylesheet to include
         */
        swapStyleSheet : function(id, url) {
            var doc = document;
            this.removeStyleSheet(id);
            var ss = doc.createElement("link");
            ss.setAttribute("rel", "stylesheet");
            ss.setAttribute("type", "text/css");
            ss.setAttribute("id", id);
            ss.setAttribute("href", url);
            doc.getElementsByTagName("head")[0].appendChild(ss);
        },

        /**
         * Refresh the rule cache if you have dynamically added stylesheets
         * @return {Object} An object (hash) of rules indexed by selector
         */
        refreshCache : function() {
            return this.getRules(true);
        },

        // private
        cacheStyleSheet : function(ss) {
            if(!rules){
                rules = {};
            }
            try {// try catch for cross domain access issue
                var ssRules = ss.cssRules || ss.rules,
                    selectorText,
                    i = ssRules.length - 1,
                    j,
                    selectors;

                for (; i >= 0; --i) {
                    selectorText = ssRules[i].selectorText;
                    if (selectorText) {

                        // Split in case there are multiple, comma-delimited selectors
                        selectorText = selectorText.split(',');
                        selectors = selectorText.length;
                        for (j = 0; j < selectors; j++) {
                            rules[Ext.String.trim(selectorText[j]).toLowerCase()] = ssRules[i];
                        }
                    }
                }
            } catch(e) {}
        },

        /**
        * Gets all css rules for the document
        * @param {Boolean} refreshCache true to refresh the internal cache
        * @return {Object} An object (hash) of rules indexed by selector
        */
        getRules : function(refreshCache) {
            if (rules === null || refreshCache) {
                rules = {};
                var ds = doc.styleSheets,
                    i = 0,
                    len = ds.length;

                for (; i < len; i++) {
                    try {
                        if (!ds[i].disabled) {
                            this.cacheStyleSheet(ds[i]);
                        }
                    } catch(e) {}
                }
            }
            return rules;
        },

        /**
         * Gets an an individual CSS rule by selector(s)
         * @param {String/String[]} selector The CSS selector or an array of selectors to try. The first selector that is found is returned.
         * @param {Boolean} refreshCache true to refresh the internal cache if you have recently updated any rules or added styles dynamically
         * @return {CSSStyleRule} The CSS rule or null if one is not found
         */
        getRule: function(selector, refreshCache) {
            var rs = this.getRules(refreshCache);
            if (!Ext.isArray(selector)) {
                return rs[selector.toLowerCase()];
            }
            for (var i = 0; i < selector.length; i++) {
                if (rs[selector[i]]) {
                    return rs[selector[i].toLowerCase()];
                }
            }
            return null;
        },

        /**
         * Updates a rule property
         * @param {String/String[]} selector If it's an array it tries each selector until it finds one. Stops immediately once one is found.
         * @param {String} property The css property
         * @param {String} value The new value for the property
         * @return {Boolean} true If a rule was found and updated
         */
        updateRule : function(selector, property, value){
            if (!Ext.isArray(selector)) {
                var rule = this.getRule(selector);
                if (rule) {
                    rule.style[property.replace(camelRe, camelFn)] = value;
                    return true;
                }
            } else {
                for (var i = 0; i < selector.length; i++) {
                    if (this.updateRule(selector[i], property, value)) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
}());
