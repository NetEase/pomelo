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
 * @class Ext.data.Batch
 *
 * <p>Provides a mechanism to run one or more {@link Ext.data.Operation operations} in a given order. Fires the 'operationcomplete' event
 * after the completion of each Operation, and the 'complete' event when all Operations have been successfully executed. Fires an 'exception'
 * event if any of the Operations encounter an exception.</p>
 *
 * <p>Usually these are only used internally by {@link Ext.data.proxy.Proxy} classes</p>
 *
 */
Ext.define('Ext.data.Batch', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @property {Boolean} autoStart
     * True to immediately start processing the batch as soon as it is constructed.
     */
    autoStart: false,

    /**
     * @property {Number} current
     * The index of the current operation being executed
     */
    current: -1,

    /**
     * @property {Number} total
     * The total number of operations in this batch. Read only
     */
    total: 0,

    /**
     * @property {Boolean} isRunning
     * True if the batch is currently running
     */
    isRunning: false,

    /**
     * @property {Boolean} isComplete
     * True if this batch has been executed completely
     */
    isComplete: false,

    /**
     * @property {Boolean} hasException
     * True if this batch has encountered an exception. This is cleared at the start of each operation
     */
    hasException: false,

    /**
     * @property {Boolean} pauseOnException
     * True to automatically pause the execution of the batch if any operation encounters an exception
     */
    pauseOnException: true,

    /**
     * Creates new Batch object.
     * @param {Object} [config] Config object
     */
    constructor: function(config) {
        var me = this;

        me.addEvents(
          /**
           * @event complete
           * Fired when all operations of this batch have been completed
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The last operation that was executed
           */
          'complete',

          /**
           * @event exception
           * Fired when a operation encountered an exception
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The operation that encountered the exception
           */
          'exception',

          /**
           * @event operationcomplete
           * Fired when each operation of the batch completes
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The operation that just completed
           */
          'operationcomplete'
        );

        me.mixins.observable.constructor.call(me, config);

        /**
         * Ordered array of operations that will be executed by this batch
         * @property {Ext.data.Operation[]} operations
         */
        me.operations = [];
    },

    /**
     * Adds a new operation to this batch
     * @param {Object} operation The {@link Ext.data.Operation Operation} object
     */
    add: function(operation) {
        this.total++;

        operation.setBatch(this);

        this.operations.push(operation);
    },

    /**
     * Kicks off the execution of the batch, continuing from the next operation if the previous
     * operation encountered an exception, or if execution was paused
     */
    start: function() {
        this.hasException = false;
        this.isRunning = true;

        this.runNextOperation();
    },

    /**
     * @private
     * Runs the next operation, relative to this.current.
     */
    runNextOperation: function() {
        this.runOperation(this.current + 1);
    },

    /**
     * Pauses execution of the batch, but does not cancel the current operation
     */
    pause: function() {
        this.isRunning = false;
    },

    /**
     * Executes a operation by its numeric index
     * @param {Number} index The operation index to run
     */
    runOperation: function(index) {
        var me = this,
            operations = me.operations,
            operation  = operations[index],
            onProxyReturn;

        if (operation === undefined) {
            me.isRunning  = false;
            me.isComplete = true;
            me.fireEvent('complete', me, operations[operations.length - 1]);
        } else {
            me.current = index;

            onProxyReturn = function(operation) {
                var hasException = operation.hasException();

                if (hasException) {
                    me.hasException = true;
                    me.fireEvent('exception', me, operation);
                } else {
                    me.fireEvent('operationcomplete', me, operation);
                }

                if (hasException && me.pauseOnException) {
                    me.pause();
                } else {
                    operation.setCompleted();
                    me.runNextOperation();
                }
            };

            operation.setStarted();

            me.proxy[operation.action](operation, onProxyReturn, me);
        }
    }
});
