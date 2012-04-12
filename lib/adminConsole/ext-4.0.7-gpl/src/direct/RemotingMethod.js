/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Small utility class used internally to represent a Direct method.
 * @class Ext.direct.RemotingMethod
 * @ignore
 */
Ext.define('Ext.direct.RemotingMethod', {

    constructor: function(config){
        var me = this,
            params = Ext.isDefined(config.params) ? config.params : config.len,
            name;

        me.name = config.name;
        me.formHandler = config.formHandler;
        if (Ext.isNumber(params)) {
            // given only the number of parameters
            me.len = params;
            me.ordered = true;
        } else {
            /*
             * Given an array of either
             * a) String
             * b) Objects with a name property. We may want to encode extra info in here later
             */
            me.params = [];
            Ext.each(params, function(param){
                name = Ext.isObject(param) ? param.name : param;
                me.params.push(name);
            });
        }
    },

    /**
     * Takes the arguments for the Direct function and splits the arguments
     * from the scope and the callback.
     * @param {Array} args The arguments passed to the direct call
     * @return {Object} An object with 3 properties, args, callback & scope.
     */
    getCallData: function(args){
        var me = this,
            data = null,
            len  = me.len,
            params = me.params,
            callback,
            scope,
            name;

        if (me.ordered) {
            callback = args[len];
            scope = args[len + 1];
            if (len !== 0) {
                data = args.slice(0, len);
            }
        } else {
            data = Ext.apply({}, args[0]);
            callback = args[1];
            scope = args[2];

            // filter out any non-existent properties
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if (!Ext.Array.contains(params, name)) {
                        delete data[name];
                    }
                }
            }
        }

        return {
            data: data,
            callback: callback,
            scope: scope
        };
    }
});

