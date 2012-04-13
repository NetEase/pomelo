/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A custom drag proxy implementation specific to {@link Ext.panel.Panel}s. This class
 * is primarily used internally for the Panel's drag drop implementation, and
 * should never need to be created directly.
 * @private
 */
Ext.define('Ext.panel.Proxy', {

    alternateClassName: 'Ext.dd.PanelProxy',

    /**
     * Creates new panel proxy.
     * @param {Ext.panel.Panel} panel The {@link Ext.panel.Panel} to proxy for
     * @param {Object} [config] Config object
     */
    constructor: function(panel, config){
        /**
         * @property panel
         * @type Ext.panel.Panel
         */
        this.panel = panel;
        this.id = this.panel.id +'-ddproxy';
        Ext.apply(this, config);
    },

    /**
     * @cfg {Boolean} insertProxy
     * True to insert a placeholder proxy element while dragging the panel, false to drag with no proxy.
     * Most Panels are not absolute positioned and therefore we need to reserve this space.
     */
    insertProxy: true,

    // private overrides
    setStatus: Ext.emptyFn,
    reset: Ext.emptyFn,
    update: Ext.emptyFn,
    stop: Ext.emptyFn,
    sync: Ext.emptyFn,

    /**
     * Gets the proxy's element
     * @return {Ext.Element} The proxy's element
     */
    getEl: function(){
        return this.ghost.el;
    },

    /**
     * Gets the proxy's ghost Panel
     * @return {Ext.panel.Panel} The proxy's ghost Panel
     */
    getGhost: function(){
        return this.ghost;
    },

    /**
     * Gets the proxy element. This is the element that represents where the
     * Panel was before we started the drag operation.
     * @return {Ext.Element} The proxy's element
     */
    getProxy: function(){
        return this.proxy;
    },

    /**
     * Hides the proxy
     */
    hide : function(){
        if (this.ghost) {
            if (this.proxy) {
                this.proxy.remove();
                delete this.proxy;
            }

            // Unghost the Panel, do not move the Panel to where the ghost was
            this.panel.unghost(null, false);
            delete this.ghost;
        }
    },

    /**
     * Shows the proxy
     */
    show: function(){
        if (!this.ghost) {
            var panelSize = this.panel.getSize();
            this.panel.el.setVisibilityMode(Ext.Element.DISPLAY);
            this.ghost = this.panel.ghost();
            if (this.insertProxy) {
                // bc Panels aren't absolute positioned we need to take up the space
                // of where the panel previously was
                this.proxy = this.panel.el.insertSibling({cls: Ext.baseCSSPrefix + 'panel-dd-spacer'});
                this.proxy.setSize(panelSize);
            }
        }
    },

    // private
    repair: function(xy, callback, scope) {
        this.hide();
        if (typeof callback == "function") {
            callback.call(scope || this);
        }
    },

    /**
     * Moves the proxy to a different position in the DOM.  This is typically
     * called while dragging the Panel to keep the proxy sync'd to the Panel's
     * location.
     * @param {HTMLElement} parentNode The proxy's parent DOM node
     * @param {HTMLElement} [before] The sibling node before which the
     * proxy should be inserted (defaults to the parent's last child if not
     * specified)
     */
    moveProxy : function(parentNode, before){
        if (this.proxy) {
            parentNode.insertBefore(this.proxy.dom, before);
        }
    }
});
