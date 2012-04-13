/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Action
 * <p>An Action is a piece of reusable functionality that can be abstracted out of any particular component so that it
 * can be usefully shared among multiple components.  Actions let you share handlers, configuration options and UI
 * updates across any components that support the Action interface (primarily {@link Ext.toolbar.Toolbar}, {@link Ext.button.Button}
 * and {@link Ext.menu.Menu} components).</p>
 * <p>Use a single Action instance as the config object for any number of UI Components which share the same configuration. The
 * Action not only supplies the configuration, but allows all Components based upon it to have a common set of methods
 * called at once through a single call to the Action.</p>
 * <p>Any Component that is to be configured with an Action must also support
 * the following methods:<ul>
 * <li><code>setText(string)</code></li>
 * <li><code>setIconCls(string)</code></li>
 * <li><code>setDisabled(boolean)</code></li>
 * <li><code>setVisible(boolean)</code></li>
 * <li><code>setHandler(function)</code></li></ul></p>
 * <p>This allows the Action to control its associated Components.</p>
 * Example usage:<br>
 * <pre><code>
// Define the shared Action.  Each Component below will have the same
// display text and icon, and will display the same message on click.
var action = new Ext.Action({
    {@link #text}: 'Do something',
    {@link #handler}: function(){
        Ext.Msg.alert('Click', 'You did something.');
    },
    {@link #iconCls}: 'do-something',
    {@link #itemId}: 'myAction'
});

var panel = new Ext.panel.Panel({
    title: 'Actions',
    width: 500,
    height: 300,
    tbar: [
        // Add the Action directly to a toolbar as a menu button
        action,
        {
            text: 'Action Menu',
            // Add the Action to a menu as a text item
            menu: [action]
        }
    ],
    items: [
        // Add the Action to the panel body as a standard button
        new Ext.button.Button(action)
    ],
    renderTo: Ext.getBody()
});

// Change the text for all components using the Action
action.setText('Something else');

// Reference an Action through a container using the itemId
var btn = panel.getComponent('myAction');
var aRef = btn.baseAction;
aRef.setText('New text');
</code></pre>
 */
Ext.define('Ext.Action', {

    /* Begin Definitions */

    /* End Definitions */

    /**
     * @cfg {String} [text='']
     * The text to set for all components configured by this Action.
     */
    /**
     * @cfg {String} [iconCls='']
     * The CSS class selector that specifies a background image to be used as the header icon for
     * all components configured by this Action.
     * <p>An example of specifying a custom icon class would be something like:
     * </p><pre><code>
// specify the property in the config for the class:
     ...
     iconCls: 'do-something'

// css class that specifies background image to be used as the icon image:
.do-something { background-image: url(../images/my-icon.gif) 0 6px no-repeat !important; }
</code></pre>
     */
    /**
     * @cfg {Boolean} [disabled=false]
     * True to disable all components configured by this Action, false to enable them.
     */
    /**
     * @cfg {Boolean} [hidden=false]
     * True to hide all components configured by this Action, false to show them.
     */
    /**
     * @cfg {Function} handler
     * The function that will be invoked by each component tied to this Action
     * when the component's primary event is triggered.
     */
    /**
     * @cfg {String} itemId
     * See {@link Ext.Component}.{@link Ext.Component#itemId itemId}.
     */
    /**
     * @cfg {Object} scope
     * The scope (this reference) in which the {@link #handler} is executed.
     * Defaults to the browser window.
     */

    /**
     * Creates new Action.
     * @param {Object} config Config object.
     */
    constructor : function(config){
        this.initialConfig = config;
        this.itemId = config.itemId = (config.itemId || config.id || Ext.id());
        this.items = [];
    },

    // private
    isAction : true,

    /**
     * Sets the text to be displayed by all components configured by this Action.
     * @param {String} text The text to display
     */
    setText : function(text){
        this.initialConfig.text = text;
        this.callEach('setText', [text]);
    },

    /**
     * Gets the text currently displayed by all components configured by this Action.
     */
    getText : function(){
        return this.initialConfig.text;
    },

    /**
     * Sets the icon CSS class for all components configured by this Action.  The class should supply
     * a background image that will be used as the icon image.
     * @param {String} cls The CSS class supplying the icon image
     */
    setIconCls : function(cls){
        this.initialConfig.iconCls = cls;
        this.callEach('setIconCls', [cls]);
    },

    /**
     * Gets the icon CSS class currently used by all components configured by this Action.
     */
    getIconCls : function(){
        return this.initialConfig.iconCls;
    },

    /**
     * Sets the disabled state of all components configured by this Action.  Shortcut method
     * for {@link #enable} and {@link #disable}.
     * @param {Boolean} disabled True to disable the component, false to enable it
     */
    setDisabled : function(v){
        this.initialConfig.disabled = v;
        this.callEach('setDisabled', [v]);
    },

    /**
     * Enables all components configured by this Action.
     */
    enable : function(){
        this.setDisabled(false);
    },

    /**
     * Disables all components configured by this Action.
     */
    disable : function(){
        this.setDisabled(true);
    },

    /**
     * Returns true if the components using this Action are currently disabled, else returns false.
     */
    isDisabled : function(){
        return this.initialConfig.disabled;
    },

    /**
     * Sets the hidden state of all components configured by this Action.  Shortcut method
     * for <code>{@link #hide}</code> and <code>{@link #show}</code>.
     * @param {Boolean} hidden True to hide the component, false to show it
     */
    setHidden : function(v){
        this.initialConfig.hidden = v;
        this.callEach('setVisible', [!v]);
    },

    /**
     * Shows all components configured by this Action.
     */
    show : function(){
        this.setHidden(false);
    },

    /**
     * Hides all components configured by this Action.
     */
    hide : function(){
        this.setHidden(true);
    },

    /**
     * Returns true if the components configured by this Action are currently hidden, else returns false.
     */
    isHidden : function(){
        return this.initialConfig.hidden;
    },

    /**
     * Sets the function that will be called by each Component using this action when its primary event is triggered.
     * @param {Function} fn The function that will be invoked by the action's components.  The function
     * will be called with no arguments.
     * @param {Object} scope The scope (<code>this</code> reference) in which the function is executed. Defaults to the Component firing the event.
     */
    setHandler : function(fn, scope){
        this.initialConfig.handler = fn;
        this.initialConfig.scope = scope;
        this.callEach('setHandler', [fn, scope]);
    },

    /**
     * Executes the specified function once for each Component currently tied to this Action.  The function passed
     * in should accept a single argument that will be an object that supports the basic Action config/method interface.
     * @param {Function} fn The function to execute for each component
     * @param {Object} scope The scope (<code>this</code> reference) in which the function is executed.  Defaults to the Component.
     */
    each : function(fn, scope){
        Ext.each(this.items, fn, scope);
    },

    // private
    callEach : function(fnName, args){
        var items = this.items,
            i = 0,
            len = items.length;

        for(; i < len; i++){
            items[i][fnName].apply(items[i], args);
        }
    },

    // private
    addComponent : function(comp){
        this.items.push(comp);
        comp.on('destroy', this.removeComponent, this);
    },

    // private
    removeComponent : function(comp){
        Ext.Array.remove(this.items, comp);
    },

    /**
     * Executes this Action manually using the handler function specified in the original config object
     * or the handler function set with <code>{@link #setHandler}</code>.  Any arguments passed to this
     * function will be passed on to the handler function.
     * @param {Object...} args (optional) Variable number of arguments passed to the handler function
     */
    execute : function(){
        this.initialConfig.handler.apply(this.initialConfig.scope || Ext.global, arguments);
    }
});

