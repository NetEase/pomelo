/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.Memento
 * This class manages a set of captured properties from an object. These captured properties
 * can later be restored to an object.
 */
Ext.define('Ext.util.Memento', function () {

    function captureOne (src, target, prop) {
        src[prop] = target[prop];
    }

    function removeOne (src, target, prop) {
        delete src[prop];
    }

    function restoreOne (src, target, prop) {
        var value = src[prop];
        if (value || src.hasOwnProperty(prop)) {
            restoreValue(target, prop, value);
        }
    }

    function restoreValue (target, prop, value) {
        if (Ext.isDefined(value)) {
            target[prop] = value;
        } else {
            delete target[prop];
        }
    }

    function doMany (doOne, src, target, props) {
        if (src) {
            if (Ext.isArray(props)) {
                Ext.each(props, function (prop) {
                    doOne(src, target, prop);
                });
            } else {
                doOne(src, target, props);
            }
        }
    }

    return {
        /**
         * @property data
         * The collection of captured properties.
         * @private
         */
        data: null,

        /**
         * @property target
         * The default target object for capture/restore (passed to the constructor).
         */
        target: null,

        /**
         * Creates a new memento and optionally captures properties from the target object.
         * @param {Object} target The target from which to capture properties. If specified in the
         * constructor, this target becomes the default target for all other operations.
         * @param {String/String[]} props The property or array of properties to capture.
         */
        constructor: function (target, props) {
            if (target) {
                this.target = target;
                if (props) {
                    this.capture(props);
                }
            }
        },

        /**
         * Captures the specified properties from the target object in this memento.
         * @param {String/String[]} props The property or array of properties to capture.
         * @param {Object} target The object from which to capture properties.
         */
        capture: function (props, target) {
            doMany(captureOne, this.data || (this.data = {}), target || this.target, props);
        },

        /**
         * Removes the specified properties from this memento. These properties will not be
         * restored later without re-capturing their values.
         * @param {String/String[]} props The property or array of properties to remove.
         */
        remove: function (props) {
            doMany(removeOne, this.data, null, props);
        },

        /**
         * Restores the specified properties from this memento to the target object.
         * @param {String/String[]} props The property or array of properties to restore.
         * @param {Boolean} clear True to remove the restored properties from this memento or
         * false to keep them (default is true).
         * @param {Object} target The object to which to restore properties.
         */
        restore: function (props, clear, target) {
            doMany(restoreOne, this.data, target || this.target, props);
            if (clear !== false) {
                this.remove(props);
            }
        },

        /**
         * Restores all captured properties in this memento to the target object.
         * @param {Boolean} clear True to remove the restored properties from this memento or
         * false to keep them (default is true).
         * @param {Object} target The object to which to restore properties.
         */
        restoreAll: function (clear, target) {
            var me = this,
                t = target || this.target;

            Ext.Object.each(me.data, function (prop, value) {
                restoreValue(t, prop, value);
            });

            if (clear !== false) {
                delete me.data;
            }
        }
    };
}());

