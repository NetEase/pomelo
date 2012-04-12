/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.dd.StatusProxy
 * A specialized drag proxy that supports a drop status icon, {@link Ext.Layer} styles and auto-repair.  This is the
 * default drag proxy used by all Ext.dd components.
 */
Ext.define('Ext.dd.StatusProxy', {
    animRepair: false,

    /**
     * Creates new StatusProxy.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config){
        Ext.apply(this, config);
        this.id = this.id || Ext.id();
        this.proxy = Ext.createWidget('component', {
            floating: true,
            stateful: false,
            id: this.id,
            html: '<div class="' + Ext.baseCSSPrefix + 'dd-drop-icon"></div>' +
                  '<div class="' + Ext.baseCSSPrefix + 'dd-drag-ghost"></div>',
            cls: Ext.baseCSSPrefix + 'dd-drag-proxy ' + this.dropNotAllowed,
            shadow: !config || config.shadow !== false,
            renderTo: document.body
        });

        this.el = this.proxy.el;
        this.el.show();
        this.el.setVisibilityMode(Ext.Element.VISIBILITY);
        this.el.hide();

        this.ghost = Ext.get(this.el.dom.childNodes[1]);
        this.dropStatus = this.dropNotAllowed;
    },
    /**
     * @cfg {String} [dropAllowed="x-dd-drop-ok"]
     * The CSS class to apply to the status element when drop is allowed.
     */
    dropAllowed : Ext.baseCSSPrefix + 'dd-drop-ok',
    /**
     * @cfg {String} [dropNotAllowed="x-dd-drop-nodrop"]
     * The CSS class to apply to the status element when drop is not allowed.
     */
    dropNotAllowed : Ext.baseCSSPrefix + 'dd-drop-nodrop',

    /**
     * Updates the proxy's visual element to indicate the status of whether or not drop is allowed
     * over the current target element.
     * @param {String} cssClass The css class for the new drop status indicator image
     */
    setStatus : function(cssClass){
        cssClass = cssClass || this.dropNotAllowed;
        if(this.dropStatus != cssClass){
            this.el.replaceCls(this.dropStatus, cssClass);
            this.dropStatus = cssClass;
        }
    },

    /**
     * Resets the status indicator to the default dropNotAllowed value
     * @param {Boolean} clearGhost True to also remove all content from the ghost, false to preserve it
     */
    reset : function(clearGhost){
        this.el.dom.className = Ext.baseCSSPrefix + 'dd-drag-proxy ' + this.dropNotAllowed;
        this.dropStatus = this.dropNotAllowed;
        if(clearGhost){
            this.ghost.update("");
        }
    },

    /**
     * Updates the contents of the ghost element
     * @param {String/HTMLElement} html The html that will replace the current innerHTML of the ghost element, or a
     * DOM node to append as the child of the ghost element (in which case the innerHTML will be cleared first).
     */
    update : function(html){
        if(typeof html == "string"){
            this.ghost.update(html);
        }else{
            this.ghost.update("");
            html.style.margin = "0";
            this.ghost.dom.appendChild(html);
        }
        var el = this.ghost.dom.firstChild;
        if(el){
            Ext.fly(el).setStyle('float', 'none');
        }
    },

    /**
     * Returns the underlying proxy {@link Ext.Layer}
     * @return {Ext.Layer} el
    */
    getEl : function(){
        return this.el;
    },

    /**
     * Returns the ghost element
     * @return {Ext.Element} el
     */
    getGhost : function(){
        return this.ghost;
    },

    /**
     * Hides the proxy
     * @param {Boolean} clear True to reset the status and clear the ghost contents, false to preserve them
     */
    hide : function(clear) {
        this.proxy.hide();
        if (clear) {
            this.reset(true);
        }
    },

    /**
     * Stops the repair animation if it's currently running
     */
    stop : function(){
        if(this.anim && this.anim.isAnimated && this.anim.isAnimated()){
            this.anim.stop();
        }
    },

    /**
     * Displays this proxy
     */
    show : function() {
        this.proxy.show();
        this.proxy.toFront();
    },

    /**
     * Force the Layer to sync its shadow and shim positions to the element
     */
    sync : function(){
        this.proxy.el.sync();
    },

    /**
     * Causes the proxy to return to its position of origin via an animation.  Should be called after an
     * invalid drop operation by the item being dragged.
     * @param {Number[]} xy The XY position of the element ([x, y])
     * @param {Function} callback The function to call after the repair is complete.
     * @param {Object} scope The scope (<code>this</code> reference) in which the callback function is executed. Defaults to the browser window.
     */
    repair : function(xy, callback, scope){
        this.callback = callback;
        this.scope = scope;
        if (xy && this.animRepair !== false) {
            this.el.addCls(Ext.baseCSSPrefix + 'dd-drag-repair');
            this.el.hideUnders(true);
            this.anim = this.el.animate({
                duration: this.repairDuration || 500,
                easing: 'ease-out',
                to: {
                    x: xy[0],
                    y: xy[1]
                },
                stopAnimation: true,
                callback: this.afterRepair,
                scope: this
            });
        } else {
            this.afterRepair();
        }
    },

    // private
    afterRepair : function(){
        this.hide(true);
        if(typeof this.callback == "function"){
            this.callback.call(this.scope || this);
        }
        this.callback = null;
        this.scope = null;
    },

    destroy: function(){
        Ext.destroy(this.ghost, this.proxy, this.el);
    }
});
