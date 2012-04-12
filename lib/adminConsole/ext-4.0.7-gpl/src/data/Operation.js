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
 * Represents a single read or write operation performed by a {@link Ext.data.proxy.Proxy Proxy}. Operation objects are
 * used to enable communication between Stores and Proxies. Application developers should rarely need to interact with
 * Operation objects directly.
 *
 * Several Operations can be batched together in a {@link Ext.data.Batch batch}.
 */
Ext.define('Ext.data.Operation', {
    /**
     * @cfg {Boolean} synchronous
     * True if this Operation is to be executed synchronously. This property is inspected by a
     * {@link Ext.data.Batch Batch} to see if a series of Operations can be executed in parallel or not.
     */
    synchronous: true,

    /**
     * @cfg {String} action
     * The action being performed by this Operation. Should be one of 'create', 'read', 'update' or 'destroy'.
     */
    action: undefined,

    /**
     * @cfg {Ext.util.Filter[]} filters
     * Optional array of filter objects. Only applies to 'read' actions.
     */
    filters: undefined,

    /**
     * @cfg {Ext.util.Sorter[]} sorters
     * Optional array of sorter objects. Only applies to 'read' actions.
     */
    sorters: undefined,

    /**
     * @cfg {Ext.util.Grouper} group
     * Optional grouping configuration. Only applies to 'read' actions where grouping is desired.
     */
    group: undefined,

    /**
     * @cfg {Number} start
     * The start index (offset), used in paging when running a 'read' action.
     */
    start: undefined,

    /**
     * @cfg {Number} limit
     * The number of records to load. Used on 'read' actions when paging is being used.
     */
    limit: undefined,

    /**
     * @cfg {Ext.data.Batch} batch
     * The batch that this Operation is a part of.
     */
    batch: undefined,

    /**
     * @cfg {Function} callback
     * Function to execute when operation completed.  Will be called with the following parameters:
     *
     * - records : Array of Ext.data.Model objects.
     * - operation : The Ext.data.Operation itself.
     * - success : True when operation completed successfully.
     */
    callback: undefined,

    /**
     * @cfg {Object} scope
     * Scope for the {@link #callback} function.
     */
    scope: undefined,

    /**
     * @property {Boolean} started
     * Read-only property tracking the start status of this Operation. Use {@link #isStarted}.
     * @private
     */
    started: false,

    /**
     * @property {Boolean} running
     * Read-only property tracking the run status of this Operation. Use {@link #isRunning}.
     * @private
     */
    running: false,

    /**
     * @property {Boolean} complete
     * Read-only property tracking the completion status of this Operation. Use {@link #isComplete}.
     * @private
     */
    complete: false,

    /**
     * @property {Boolean} success
     * Read-only property tracking whether the Operation was successful or not. This starts as undefined and is set to true
     * or false by the Proxy that is executing the Operation. It is also set to false by {@link #setException}. Use
     * {@link #wasSuccessful} to query success status.
     * @private
     */
    success: undefined,

    /**
     * @property {Boolean} exception
     * Read-only property tracking the exception status of this Operation. Use {@link #hasException} and see {@link #getError}.
     * @private
     */
    exception: false,

    /**
     * @property {String/Object} error
     * The error object passed when {@link #setException} was called. This could be any object or primitive.
     * @private
     */
    error: undefined,

    /**
     * @property {RegExp} actionCommitRecordsRe
     * The RegExp used to categorize actions that require record commits.
     */
    actionCommitRecordsRe: /^(?:create|update)$/i,

    /**
     * @property {RegExp} actionSkipSyncRe
     * The RegExp used to categorize actions that skip local record synchronization. This defaults
     * to match 'destroy'.
     */
    actionSkipSyncRe: /^destroy$/i,

    /**
     * Creates new Operation object.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        Ext.apply(this, config || {});
    },

    /**
     * This method is called to commit data to this instance's records given the records in
     * the server response. This is followed by calling {@link Ext.data.Model#commit} on all
     * those records (for 'create' and 'update' actions).
     *
     * If this {@link #action} is 'destroy', any server records are ignored and the
     * {@link Ext.data.Model#commit} method is not called.
     *
     * @param {Ext.data.Model[]} serverRecords An array of {@link Ext.data.Model} objects returned by
     * the server.
     * @markdown
     */
    commitRecords: function (serverRecords) {
        var me = this,
            mc, index, clientRecords, serverRec, clientRec;

        if (!me.actionSkipSyncRe.test(me.action)) {
            clientRecords = me.records;

            if (clientRecords && clientRecords.length) {
                mc = Ext.create('Ext.util.MixedCollection', true, function(r) {return r.getId();});
                mc.addAll(clientRecords);

                for (index = serverRecords ? serverRecords.length : 0; index--; ) {
                    serverRec = serverRecords[index];
                    clientRec = mc.get(serverRec.getId());

                    if (clientRec) {
                        clientRec.beginEdit();
                        clientRec.set(serverRec.data);
                        clientRec.endEdit(true);
                    }
                }

                if (me.actionCommitRecordsRe.test(me.action)) {
                    for (index = clientRecords.length; index--; ) {
                        clientRecords[index].commit();
                    }
                }
            }
        }
    },

    /**
     * Marks the Operation as started.
     */
    setStarted: function() {
        this.started = true;
        this.running = true;
    },

    /**
     * Marks the Operation as completed.
     */
    setCompleted: function() {
        this.complete = true;
        this.running  = false;
    },

    /**
     * Marks the Operation as successful.
     */
    setSuccessful: function() {
        this.success = true;
    },

    /**
     * Marks the Operation as having experienced an exception. Can be supplied with an option error message/object.
     * @param {String/Object} error (optional) error string/object
     */
    setException: function(error) {
        this.exception = true;
        this.success = false;
        this.running = false;
        this.error = error;
    },

    /**
     * Returns true if this Operation encountered an exception (see also {@link #getError})
     * @return {Boolean} True if there was an exception
     */
    hasException: function() {
        return this.exception === true;
    },

    /**
     * Returns the error string or object that was set using {@link #setException}
     * @return {String/Object} The error object
     */
    getError: function() {
        return this.error;
    },

    /**
     * Returns an array of Ext.data.Model instances as set by the Proxy.
     * @return {Ext.data.Model[]} Any loaded Records
     */
    getRecords: function() {
        var resultSet = this.getResultSet();

        return (resultSet === undefined ? this.records : resultSet.records);
    },

    /**
     * Returns the ResultSet object (if set by the Proxy). This object will contain the {@link Ext.data.Model model}
     * instances as well as meta data such as number of instances fetched, number available etc
     * @return {Ext.data.ResultSet} The ResultSet object
     */
    getResultSet: function() {
        return this.resultSet;
    },

    /**
     * Returns true if the Operation has been started. Note that the Operation may have started AND completed, see
     * {@link #isRunning} to test if the Operation is currently running.
     * @return {Boolean} True if the Operation has started
     */
    isStarted: function() {
        return this.started === true;
    },

    /**
     * Returns true if the Operation has been started but has not yet completed.
     * @return {Boolean} True if the Operation is currently running
     */
    isRunning: function() {
        return this.running === true;
    },

    /**
     * Returns true if the Operation has been completed
     * @return {Boolean} True if the Operation is complete
     */
    isComplete: function() {
        return this.complete === true;
    },

    /**
     * Returns true if the Operation has completed and was successful
     * @return {Boolean} True if successful
     */
    wasSuccessful: function() {
        return this.isComplete() && this.success === true;
    },

    /**
     * @private
     * Associates this Operation with a Batch
     * @param {Ext.data.Batch} batch The batch
     */
    setBatch: function(batch) {
        this.batch = batch;
    },

    /**
     * Checks whether this operation should cause writing to occur.
     * @return {Boolean} Whether the operation should cause a write to occur.
     */
    allowWrite: function() {
        return this.action != 'read';
    }
});
