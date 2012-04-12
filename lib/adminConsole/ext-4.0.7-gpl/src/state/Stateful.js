/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.state.Stateful
 * A mixin for being able to save the state of an object to an underlying
 * {@link Ext.state.Provider}.
 */
Ext.define('Ext.state.Stateful', {

    /* Begin Definitions */

   mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: ['Ext.state.Manager'],

    /* End Definitions */

    /**
     * @cfg {Boolean} stateful
     * <p>A flag which causes the object to attempt to restore the state of
     * internal properties from a saved state on startup. The object must have
     * a <code>{@link #stateId}</code> for state to be managed.
     * Auto-generated ids are not guaranteed to be stable across page loads and
     * cannot be relied upon to save and restore the same state for a object.<p>
     * <p>For state saving to work, the state manager's provider must have been
     * set to an implementation of {@link Ext.state.Provider} which overrides the
     * {@link Ext.state.Provider#set set} and {@link Ext.state.Provider#get get}
     * methods to save and recall name/value pairs. A built-in implementation,
     * {@link Ext.state.CookieProvider} is available.</p>
     * <p>To set the state provider for the current page:</p>
     * <pre><code>
Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
    expires: new Date(new Date().getTime()+(1000*60*60*24*7)), //7 days from now
}));
     * </code></pre>
     * <p>A stateful object attempts to save state when one of the events
     * listed in the <code>{@link #stateEvents}</code> configuration fires.</p>
     * <p>To save state, a stateful object first serializes its state by
     * calling <b><code>{@link #getState}</code></b>. By default, this function does
     * nothing. The developer must provide an implementation which returns an
     * object hash which represents the restorable state of the object.</p>
     * <p>The value yielded by getState is passed to {@link Ext.state.Manager#set}
     * which uses the configured {@link Ext.state.Provider} to save the object
     * keyed by the <code>{@link #stateId}</code>.</p>
     * <p>During construction, a stateful object attempts to <i>restore</i>
     * its state by calling {@link Ext.state.Manager#get} passing the
     * <code>{@link #stateId}</code></p>
     * <p>The resulting object is passed to <b><code>{@link #applyState}</code></b>.
     * The default implementation of <code>{@link #applyState}</code> simply copies
     * properties into the object, but a developer may override this to support
     * more behaviour.</p>
     * <p>You can perform extra processing on state save and restore by attaching
     * handlers to the {@link #beforestaterestore}, {@link #staterestore},
     * {@link #beforestatesave} and {@link #statesave} events.</p>
     */
    stateful: true,

    /**
     * @cfg {String} stateId
     * The unique id for this object to use for state management purposes.
     * <p>See {@link #stateful} for an explanation of saving and restoring state.</p>
     */

    /**
     * @cfg {String[]} stateEvents
     * <p>An array of events that, when fired, should trigger this object to
     * save its state. Defaults to none. <code>stateEvents</code> may be any type
     * of event supported by this object, including browser or custom events
     * (e.g., <tt>['click', 'customerchange']</tt>).</p>
     * <p>See <code>{@link #stateful}</code> for an explanation of saving and
     * restoring object state.</p>
     */

    /**
     * @cfg {Number} saveDelay
     * A buffer to be applied if many state events are fired within a short period.
     */
    saveDelay: 100,

    autoGenIdRe: /^((\w+-)|(ext-comp-))\d{4,}$/i,

    constructor: function(config) {
        var me = this;

        config = config || {};
        if (Ext.isDefined(config.stateful)) {
            me.stateful = config.stateful;
        }
        if (Ext.isDefined(config.saveDelay)) {
            me.saveDelay = config.saveDelay;
        }
        me.stateId = me.stateId || config.stateId;

        if (!me.stateEvents) {
            me.stateEvents = [];
        }
        if (config.stateEvents) {
            me.stateEvents.concat(config.stateEvents);
        }
        this.addEvents(
            /**
             * @event beforestaterestore
             * Fires before the state of the object is restored. Return false from an event handler to stop the restore.
             * @param {Ext.state.Stateful} this
             * @param {Object} state The hash of state values returned from the StateProvider. If this
             * event is not vetoed, then the state object is passed to <b><tt>applyState</tt></b>. By default,
             * that simply copies property values into this object. The method maybe overriden to
             * provide custom state restoration.
             */
            'beforestaterestore',

            /**
             * @event staterestore
             * Fires after the state of the object is restored.
             * @param {Ext.state.Stateful} this
             * @param {Object} state The hash of state values returned from the StateProvider. This is passed
             * to <b><tt>applyState</tt></b>. By default, that simply copies property values into this
             * object. The method maybe overriden to provide custom state restoration.
             */
            'staterestore',

            /**
             * @event beforestatesave
             * Fires before the state of the object is saved to the configured state provider. Return false to stop the save.
             * @param {Ext.state.Stateful} this
             * @param {Object} state The hash of state values. This is determined by calling
             * <b><tt>getState()</tt></b> on the object. This method must be provided by the
             * developer to return whetever representation of state is required, by default, Ext.state.Stateful
             * has a null implementation.
             */
            'beforestatesave',

            /**
             * @event statesave
             * Fires after the state of the object is saved to the configured state provider.
             * @param {Ext.state.Stateful} this
             * @param {Object} state The hash of state values. This is determined by calling
             * <b><tt>getState()</tt></b> on the object. This method must be provided by the
             * developer to return whetever representation of state is required, by default, Ext.state.Stateful
             * has a null implementation.
             */
            'statesave'
        );
        me.mixins.observable.constructor.call(me);
        if (me.stateful !== false) {
            me.initStateEvents();
            me.initState();
        }
    },

    /**
     * Initializes any state events for this object.
     * @private
     */
    initStateEvents: function() {
        this.addStateEvents(this.stateEvents);
    },

    /**
     * Add events that will trigger the state to be saved.
     * @param {String/String[]} events The event name or an array of event names.
     */
    addStateEvents: function(events){
        if (!Ext.isArray(events)) {
            events = [events];
        }

        var me = this,
            i = 0,
            len = events.length;

        for (; i < len; ++i) {
            me.on(events[i], me.onStateChange, me);
        }
    },

    /**
     * This method is called when any of the {@link #stateEvents} are fired.
     * @private
     */
    onStateChange: function(){
        var me = this,
            delay = me.saveDelay;

        if (delay > 0) {
            if (!me.stateTask) {
                me.stateTask = Ext.create('Ext.util.DelayedTask', me.saveState, me);
            }
            me.stateTask.delay(me.saveDelay);
        } else {
            me.saveState();
        }
    },

    /**
     * Saves the state of the object to the persistence store.
     * @private
     */
    saveState: function() {
        var me = this,
            id,
            state;

        if (me.stateful !== false) {
            id = me.getStateId();
            if (id) {
                state = me.getState();
                if (me.fireEvent('beforestatesave', me, state) !== false) {
                    Ext.state.Manager.set(id, state);
                    me.fireEvent('statesave', me, state);
                }
            }
        }
    },

    /**
     * Gets the current state of the object. By default this function returns null,
     * it should be overridden in subclasses to implement methods for getting the state.
     * @return {Object} The current state
     */
    getState: function(){
        return null;
    },

    /**
     * Applies the state to the object. This should be overridden in subclasses to do
     * more complex state operations. By default it applies the state properties onto
     * the current object.
     * @param {Object} state The state
     */
    applyState: function(state) {
        if (state) {
            Ext.apply(this, state);
        }
    },

    /**
     * Gets the state id for this object.
     * @return {String} The state id, null if not found.
     */
    getStateId: function() {
        var me = this,
            id = me.stateId;

        if (!id) {
            id = me.autoGenIdRe.test(String(me.id)) ? null : me.id;
        }
        return id;
    },

    /**
     * Initializes the state of the object upon construction.
     * @private
     */
    initState: function(){
        var me = this,
            id = me.getStateId(),
            state;

        if (me.stateful !== false) {
            if (id) {
                state = Ext.state.Manager.get(id);
                if (state) {
                    state = Ext.apply({}, state);
                    if (me.fireEvent('beforestaterestore', me, state) !== false) {
                        me.applyState(state);
                        me.fireEvent('staterestore', me, state);
                    }
                }
            }
        }
    },

    /**
     * Conditionally saves a single property from this object to the given state object.
     * The idea is to only save state which has changed from the initial state so that
     * current software settings do not override future software settings. Only those
     * values that are user-changed state should be saved.
     *
     * @param {String} propName The name of the property to save.
     * @param {Object} state The state object in to which to save the property.
     * @param {String} stateName (optional) The name to use for the property in state.
     * @return {Boolean} True if the property was saved, false if not.
     */
    savePropToState: function (propName, state, stateName) {
        var me = this,
            value = me[propName],
            config = me.initialConfig;

        if (me.hasOwnProperty(propName)) {
            if (!config || config[propName] !== value) {
                if (state) {
                    state[stateName || propName] = value;
                }
                return true;
            }
        }
        return false;
    },

    savePropsToState: function (propNames, state) {
        var me = this;
        Ext.each(propNames, function (propName) {
            me.savePropToState(propName, state);
        });
        return state;
    },

    /**
     * Destroys this stateful object.
     */
    destroy: function(){
        var task = this.stateTask;
        if (task) {
            task.cancel();
        }
        this.clearListeners();

    }

});

