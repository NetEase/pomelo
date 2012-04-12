/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.property.Store
 * @extends Ext.data.Store
 * A custom {@link Ext.data.Store} for the {@link Ext.grid.property.Grid}. This class handles the mapping
 * between the custom data source objects supported by the grid and the {@link Ext.grid.property.Property} format
 * used by the {@link Ext.data.Store} base class.
 */
Ext.define('Ext.grid.property.Store', {

    extend: 'Ext.data.Store',

    alternateClassName: 'Ext.grid.PropertyStore',

    uses: ['Ext.data.reader.Reader', 'Ext.data.proxy.Proxy', 'Ext.data.ResultSet', 'Ext.grid.property.Property'],

    /**
     * Creates new property store.
     * @param {Ext.grid.Panel} grid The grid this store will be bound to
     * @param {Object} source The source data config object
     */
    constructor : function(grid, source){
        var me = this;
        
        me.grid = grid;
        me.source = source;
        me.callParent([{
            data: source,
            model: Ext.grid.property.Property,
            proxy: me.getProxy()
        }]);
    },

    // Return a singleton, customized Proxy object which configures itself with a custom Reader
    getProxy: function() {
        if (!this.proxy) {
            Ext.grid.property.Store.prototype.proxy = Ext.create('Ext.data.proxy.Memory', {
                model: Ext.grid.property.Property,
                reader: this.getReader()
            });
        }
        return this.proxy;
    },

    // Return a singleton, customized Reader object which reads Ext.grid.property.Property records from an object.
    getReader: function() {
        if (!this.reader) {
            Ext.grid.property.Store.prototype.reader = Ext.create('Ext.data.reader.Reader', {
                model: Ext.grid.property.Property,

                buildExtractors: Ext.emptyFn,

                read: function(dataObject) {
                    return this.readRecords(dataObject);
                },

                readRecords: function(dataObject) {
                    var val,
                        propName,
                        result = {
                            records: [],
                            success: true
                        };

                    for (propName in dataObject) {
                        if (dataObject.hasOwnProperty(propName)) {
                            val = dataObject[propName];
                            if (this.isEditableValue(val)) {
                                result.records.push(new Ext.grid.property.Property({
                                    name: propName,
                                    value: val
                                }, propName));
                            }
                        }
                    }
                    result.total = result.count = result.records.length;
                    return Ext.create('Ext.data.ResultSet', result);
                },

                // private
                isEditableValue: function(val){
                    return Ext.isPrimitive(val) || Ext.isDate(val);
                }
            });
        }
        return this.reader;
    },

    // protected - should only be called by the grid.  Use grid.setSource instead.
    setSource : function(dataObject) {
        var me = this;

        me.source = dataObject;
        me.suspendEvents();
        me.removeAll();
        me.proxy.data = dataObject;
        me.load();
        me.resumeEvents();
        me.fireEvent('datachanged', me);
    },

    // private
    getProperty : function(row) {
       return Ext.isNumber(row) ? this.getAt(row) : this.getById(row);
    },

    // private
    setValue : function(prop, value, create){
        var me = this,
            rec = me.getRec(prop);
            
        if (rec) {
            rec.set('value', value);
            me.source[prop] = value;
        } else if (create) {
            // only create if specified.
            me.source[prop] = value;
            rec = new Ext.grid.property.Property({name: prop, value: value}, prop);
            me.add(rec);
        }
    },

    // private
    remove : function(prop) {
        var rec = this.getRec(prop);
        if (rec) {
            this.callParent([rec]);
            delete this.source[prop];
        }
    },

    // private
    getRec : function(prop) {
        return this.getById(prop);
    },

    // protected - should only be called by the grid.  Use grid.getSource instead.
    getSource : function() {
        return this.source;
    }
});
