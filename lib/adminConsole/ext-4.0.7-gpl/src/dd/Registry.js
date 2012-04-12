/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.dd.Registry
 * Provides easy access to all drag drop components that are registered on a page.  Items can be retrieved either
 * directly by DOM node id, or by passing in the drag drop event that occurred and looking up the event target.
 * @singleton
 */
Ext.define('Ext.dd.Registry', {
    singleton: true,
    constructor: function() {
        this.elements = {}; 
        this.handles = {}; 
        this.autoIdSeed = 0;
    },
    
    getId: function(el, autogen){
        if(typeof el == "string"){
            return el;
        }
        var id = el.id;
        if(!id && autogen !== false){
            id = "extdd-" + (++this.autoIdSeed);
            el.id = id;
        }
        return id;
    },
    
    /**
     * Resgister a drag drop element
     * @param {String/HTMLElement} element The id or DOM node to register
     * @param {Object} data (optional) An custom data object that will be passed between the elements that are involved
     * in drag drop operations.  You can populate this object with any arbitrary properties that your own code
     * knows how to interpret, plus there are some specific properties known to the Registry that should be
     * populated in the data object (if applicable):
     * <pre>
Value      Description<br />
---------  ------------------------------------------<br />
handles    Array of DOM nodes that trigger dragging<br />
           for the element being registered<br />
isHandle   True if the element passed in triggers<br />
           dragging itself, else false
</pre>
     */
    register : function(el, data){
        data = data || {};
        if (typeof el == "string") {
            el = document.getElementById(el);
        }
        data.ddel = el;
        this.elements[this.getId(el)] = data;
        if (data.isHandle !== false) {
            this.handles[data.ddel.id] = data;
        }
        if (data.handles) {
            var hs = data.handles;
            for (var i = 0, len = hs.length; i < len; i++) {
                this.handles[this.getId(hs[i])] = data;
            }
        }
    },

    /**
     * Unregister a drag drop element
     * @param {String/HTMLElement} element The id or DOM node to unregister
     */
    unregister : function(el){
        var id = this.getId(el, false);
        var data = this.elements[id];
        if(data){
            delete this.elements[id];
            if(data.handles){
                var hs = data.handles;
                for (var i = 0, len = hs.length; i < len; i++) {
                    delete this.handles[this.getId(hs[i], false)];
                }
            }
        }
    },

    /**
     * Returns the handle registered for a DOM Node by id
     * @param {String/HTMLElement} id The DOM node or id to look up
     * @return {Object} handle The custom handle data
     */
    getHandle : function(id){
        if(typeof id != "string"){ // must be element?
            id = id.id;
        }
        return this.handles[id];
    },

    /**
     * Returns the handle that is registered for the DOM node that is the target of the event
     * @param {Event} e The event
     * @return {Object} handle The custom handle data
     */
    getHandleFromEvent : function(e){
        var t = e.getTarget();
        return t ? this.handles[t.id] : null;
    },

    /**
     * Returns a custom data object that is registered for a DOM node by id
     * @param {String/HTMLElement} id The DOM node or id to look up
     * @return {Object} data The custom data
     */
    getTarget : function(id){
        if(typeof id != "string"){ // must be element?
            id = id.id;
        }
        return this.elements[id];
    },

    /**
     * Returns a custom data object that is registered for the DOM node that is the target of the event
     * @param {Event} e The event
     * @return {Object} data The custom data
     */
    getTargetFromEvent : function(e){
        var t = e.getTarget();
        return t ? this.elements[t.id] || this.handles[t.id] : null;
    }
});
