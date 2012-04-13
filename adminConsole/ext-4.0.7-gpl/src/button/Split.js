/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A split button that provides a built-in dropdown arrow that can fire an event separately from the default click event
 * of the button. Typically this would be used to display a dropdown menu that provides additional options to the
 * primary button action, but any custom handler can provide the arrowclick implementation.  Example usage:
 *
 *     @example
 *     // display a dropdown menu:
 *     Ext.create('Ext.button.Split', {
 *         renderTo: Ext.getBody(),
 *         text: 'Options',
 *         // handle a click on the button itself
 *         handler: function() {
 *             alert("The button was clicked");
 *         },
 *         menu: new Ext.menu.Menu({
 *             items: [
 *                 // these will render as dropdown menu items when the arrow is clicked:
 *                 {text: 'Item 1', handler: function(){ alert("Item 1 clicked"); }},
 *                 {text: 'Item 2', handler: function(){ alert("Item 2 clicked"); }}
 *             ]
 *         })
 *     });
 *
 * Instead of showing a menu, you can provide any type of custom functionality you want when the dropdown
 * arrow is clicked:
 *
 *     Ext.create('Ext.button.Split', {
 *         renderTo: 'button-ct',
 *         text: 'Options',
 *         handler: optionsHandler,
 *         arrowHandler: myCustomHandler
 *     });
 *
 */
Ext.define('Ext.button.Split', {

    /* Begin Definitions */
    alias: 'widget.splitbutton',

    extend: 'Ext.button.Button',
    alternateClassName: 'Ext.SplitButton',
    /* End Definitions */
    
    /**
     * @cfg {Function} arrowHandler
     * A function called when the arrow button is clicked (can be used instead of click event)
     */
    /**
     * @cfg {String} arrowTooltip
     * The title attribute of the arrow
     */

    // private
    arrowCls      : 'split',
    split         : true,

    // private
    initComponent : function(){
        this.callParent();
        /**
         * @event arrowclick
         * Fires when this button's arrow is clicked.
         * @param {Ext.button.Split} this
         * @param {Event} e The click event
         */
        this.addEvents("arrowclick");
    },

    /**
     * Sets this button's arrow click handler.
     * @param {Function} handler The function to call when the arrow is clicked
     * @param {Object} scope (optional) Scope for the function passed above
     */
    setArrowHandler : function(handler, scope){
        this.arrowHandler = handler;
        this.scope = scope;
    },

    // private
    onClick : function(e, t) {
        var me = this;
        
        e.preventDefault();
        if (!me.disabled) {
            if (me.overMenuTrigger) {
                me.maybeShowMenu();
                me.fireEvent("arrowclick", me, e);
                if (me.arrowHandler) {
                    me.arrowHandler.call(me.scope || me, me, e);
                }
            } else {
                me.doToggle();
                me.fireHandler();
            }
        }
    }
});
