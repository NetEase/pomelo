/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 *
 * WebStorageProxy is simply a superclass for the {@link Ext.data.proxy.LocalStorage LocalStorage} and {@link
 * Ext.data.proxy.SessionStorage SessionStorage} proxies. It uses the new HTML5 key/value client-side storage objects to
 * save {@link Ext.data.Model model instances} for offline use.
 * @private
 */
Ext.define('Ext.data.proxy.WebStorage', {
    extend: 'Ext.data.proxy.Client',
    alternateClassName: 'Ext.data.WebStorageProxy',

    /**
     * @cfg {String} id
     * The unique ID used as the key in which all record data are stored in the local storage object.
     */
    id: undefined,

    /**
     * Creates the proxy, throws an error if local storage is not supported in the current browser.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        this.callParent(arguments);

        /**
         * @property {Object} cache
         * Cached map of records already retrieved by this Proxy. Ensures that the same instance is always retrieved.
         */
        this.cache = {};

        //<debug>
        if (this.getStorageObject() === undefined) {
            Ext.Error.raise("Local Storage is not supported in this browser, please use another type of data proxy");
        }
        //</debug>

        //if an id is not given, try to use the store's id instead
        this.id = this.id || (this.store ? this.store.storeId : undefined);

        //<debug>
        if (this.id === undefined) {
            Ext.Error.raise("No unique id was provided to the local storage proxy. See Ext.data.proxy.LocalStorage documentation for details");
        }
        //</debug>

        this.initialize();
    },

    //inherit docs
    create: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            id, record, i;

        operation.setStarted();

        for (i = 0; i < length; i++) {
            record = records[i];

            if (record.phantom) {
                record.phantom = false;
                id = this.getNextId();
            } else {
                id = record.getId();
            }

            this.setRecord(record, id);
            ids.push(id);
        }

        this.setIds(ids);

        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    //inherit docs
    read: function(operation, callback, scope) {
        //TODO: respect sorters, filters, start and limit options on the Operation

        var records = [],
            ids     = this.getIds(),
            length  = ids.length,
            i, recordData, record;

        //read a single record
        if (operation.id) {
            record = this.getRecord(operation.id);

            if (record) {
                records.push(record);
                operation.setSuccessful();
            }
        } else {
            for (i = 0; i < length; i++) {
                records.push(this.getRecord(ids[i]));
            }
            operation.setSuccessful();
        }

        operation.setCompleted();

        operation.resultSet = Ext.create('Ext.data.ResultSet', {
            records: records,
            total  : records.length,
            loaded : true
        });

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    //inherit docs
    update: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            record, id, i;

        operation.setStarted();

        for (i = 0; i < length; i++) {
            record = records[i];
            this.setRecord(record);

            //we need to update the set of ids here because it's possible that a non-phantom record was added
            //to this proxy - in which case the record's id would never have been added via the normal 'create' call
            id = record.getId();
            if (id !== undefined && Ext.Array.indexOf(ids, id) == -1) {
                ids.push(id);
            }
        }
        this.setIds(ids);

        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    //inherit
    destroy: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),

            //newIds is a copy of ids, from which we remove the destroyed records
            newIds  = [].concat(ids),
            i;

        for (i = 0; i < length; i++) {
            Ext.Array.remove(newIds, records[i].getId());
            this.removeRecord(records[i], false);
        }

        this.setIds(newIds);

        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    /**
     * @private
     * Fetches a model instance from the Proxy by ID. Runs each field's decode function (if present) to decode the data.
     * @param {String} id The record's unique ID
     * @return {Ext.data.Model} The model instance
     */
    getRecord: function(id) {
        if (this.cache[id] === undefined) {
            var rawData = Ext.decode(this.getStorageObject().getItem(this.getRecordKey(id))),
                data    = {},
                Model   = this.model,
                fields  = Model.prototype.fields.items,
                length  = fields.length,
                i, field, name, record;

            for (i = 0; i < length; i++) {
                field = fields[i];
                name  = field.name;

                if (typeof field.decode == 'function') {
                    data[name] = field.decode(rawData[name]);
                } else {
                    data[name] = rawData[name];
                }
            }

            record = new Model(data, id);
            record.phantom = false;

            this.cache[id] = record;
        }

        return this.cache[id];
    },

    /**
     * Saves the given record in the Proxy. Runs each field's encode function (if present) to encode the data.
     * @param {Ext.data.Model} record The model instance
     * @param {String} [id] The id to save the record under (defaults to the value of the record's getId() function)
     */
    setRecord: function(record, id) {
        if (id) {
            record.setId(id);
        } else {
            id = record.getId();
        }

        var me = this,
            rawData = record.data,
            data    = {},
            model   = me.model,
            fields  = model.prototype.fields.items,
            length  = fields.length,
            i = 0,
            field, name, obj, key;

        for (; i < length; i++) {
            field = fields[i];
            name  = field.name;

            if (typeof field.encode == 'function') {
                data[name] = field.encode(rawData[name], record);
            } else {
                data[name] = rawData[name];
            }
        }

        obj = me.getStorageObject();
        key = me.getRecordKey(id);

        //keep the cache up to date
        me.cache[id] = record;

        //iPad bug requires that we remove the item before setting it
        obj.removeItem(key);
        obj.setItem(key, Ext.encode(data));
    },

    /**
     * @private
     * Physically removes a given record from the local storage. Used internally by {@link #destroy}, which you should
     * use instead because it updates the list of currently-stored record ids
     * @param {String/Number/Ext.data.Model} id The id of the record to remove, or an Ext.data.Model instance
     */
    removeRecord: function(id, updateIds) {
        var me = this,
            ids;

        if (id.isModel) {
            id = id.getId();
        }

        if (updateIds !== false) {
            ids = me.getIds();
            Ext.Array.remove(ids, id);
            me.setIds(ids);
        }

        me.getStorageObject().removeItem(me.getRecordKey(id));
    },

    /**
     * @private
     * Given the id of a record, returns a unique string based on that id and the id of this proxy. This is used when
     * storing data in the local storage object and should prevent naming collisions.
     * @param {String/Number/Ext.data.Model} id The record id, or a Model instance
     * @return {String} The unique key for this record
     */
    getRecordKey: function(id) {
        if (id.isModel) {
            id = id.getId();
        }

        return Ext.String.format("{0}-{1}", this.id, id);
    },

    /**
     * @private
     * Returns the unique key used to store the current record counter for this proxy. This is used internally when
     * realizing models (creating them when they used to be phantoms), in order to give each model instance a unique id.
     * @return {String} The counter key
     */
    getRecordCounterKey: function() {
        return Ext.String.format("{0}-counter", this.id);
    },

    /**
     * @private
     * Returns the array of record IDs stored in this Proxy
     * @return {Number[]} The record IDs. Each is cast as a Number
     */
    getIds: function() {
        var ids    = (this.getStorageObject().getItem(this.id) || "").split(","),
            length = ids.length,
            i;

        if (length == 1 && ids[0] === "") {
            ids = [];
        } else {
            for (i = 0; i < length; i++) {
                ids[i] = parseInt(ids[i], 10);
            }
        }

        return ids;
    },

    /**
     * @private
     * Saves the array of ids representing the set of all records in the Proxy
     * @param {Number[]} ids The ids to set
     */
    setIds: function(ids) {
        var obj = this.getStorageObject(),
            str = ids.join(",");

        obj.removeItem(this.id);

        if (!Ext.isEmpty(str)) {
            obj.setItem(this.id, str);
        }
    },

    /**
     * @private
     * Returns the next numerical ID that can be used when realizing a model instance (see getRecordCounterKey).
     * Increments the counter.
     * @return {Number} The id
     */
    getNextId: function() {
        var obj  = this.getStorageObject(),
            key  = this.getRecordCounterKey(),
            last = obj.getItem(key),
            ids, id;

        if (last === null) {
            ids = this.getIds();
            last = ids[ids.length - 1] || 0;
        }

        id = parseInt(last, 10) + 1;
        obj.setItem(key, id);

        return id;
    },

    /**
     * @private
     * Sets up the Proxy by claiming the key in the storage object that corresponds to the unique id of this Proxy. Called
     * automatically by the constructor, this should not need to be called again unless {@link #clear} has been called.
     */
    initialize: function() {
        var storageObject = this.getStorageObject();
        storageObject.setItem(this.id, storageObject.getItem(this.id) || "");
    },

    /**
     * Destroys all records stored in the proxy and removes all keys and values used to support the proxy from the
     * storage object.
     */
    clear: function() {
        var obj = this.getStorageObject(),
            ids = this.getIds(),
            len = ids.length,
            i;

        //remove all the records
        for (i = 0; i < len; i++) {
            this.removeRecord(ids[i]);
        }

        //remove the supporting objects
        obj.removeItem(this.getRecordCounterKey());
        obj.removeItem(this.id);
    },

    /**
     * @private
     * Abstract function which should return the storage object that data will be saved to. This must be implemented
     * in each subclass.
     * @return {Object} The storage object
     */
    getStorageObject: function() {
        //<debug>
        Ext.Error.raise("The getStorageObject function has not been defined in your Ext.data.proxy.WebStorage subclass");
        //</debug>
    }
});
