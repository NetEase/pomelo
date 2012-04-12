/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.dd.DropTarget
 * @extends Ext.dd.DDTarget
 * A simple class that provides the basic implementation needed to make any element a drop target that can have
 * draggable items dropped onto it.  The drop has no effect until an implementation of notifyDrop is provided.
 */
Ext.define('Ext.dd.DropTarget', {
    extend: 'Ext.dd.DDTarget',
    requires: ['Ext.dd.ScrollManager'],

    /**
     * Creates new DropTarget.
     * @param {String/HTMLElement/Ext.Element} el The container element or ID of it.
     * @param {Object} config
     */
    constructor : function(el, config){
        this.el = Ext.get(el);

        Ext.apply(this, config);

        if(this.containerScroll){
            Ext.dd.ScrollManager.register(this.el);
        }

        this.callParent([this.el.dom, this.ddGroup || this.group,
              {isTarget: true}]);
    },

    /**
     * @cfg {String} ddGroup
     * A named drag drop group to which this object belongs.  If a group is specified, then this object will only
     * interact with other drag drop objects in the same group.
     */
    /**
     * @cfg {String} [overClass=""]
     * The CSS class applied to the drop target element while the drag source is over it.
     */
    /**
     * @cfg {String} [dropAllowed="x-dd-drop-ok"]
     * The CSS class returned to the drag source when drop is allowed.
     */
    dropAllowed : Ext.baseCSSPrefix + 'dd-drop-ok',
    /**
     * @cfg {String} [dropNotAllowed="x-dd-drop-nodrop"]
     * The CSS class returned to the drag source when drop is not allowed.
     */
    dropNotAllowed : Ext.baseCSSPrefix + 'dd-drop-nodrop',

    // private
    isTarget : true,

    // private
    isNotifyTarget : true,

    /**
     * The function a {@link Ext.dd.DragSource} calls once to notify this drop target that the source is now over the
     * target.  This default implementation adds the CSS class specified by overClass (if any) to the drop element
     * and returns the dropAllowed config value.  This method should be overridden if drop validation is required.
     * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
     * @param {Event} e The event
     * @param {Object} data An object containing arbitrary data supplied by the drag source
     * @return {String} status The CSS class that communicates the drop status back to the source so that the
     * underlying {@link Ext.dd.StatusProxy} can be updated
     */
    notifyEnter : function(dd, e, data){
        if(this.overClass){
            this.el.addCls(this.overClass);
        }
        return this.dropAllowed;
    },

    /**
     * The function a {@link Ext.dd.DragSource} calls continuously while it is being dragged over the target.
     * This method will be called on every mouse movement while the drag source is over the drop target.
     * This default implementation simply returns the dropAllowed config value.
     * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
     * @param {Event} e The event
     * @param {Object} data An object containing arbitrary data supplied by the drag source
     * @return {String} status The CSS class that communicates the drop status back to the source so that the
     * underlying {@link Ext.dd.StatusProxy} can be updated
     */
    notifyOver : function(dd, e, data){
        return this.dropAllowed;
    },

    /**
     * The function a {@link Ext.dd.DragSource} calls once to notify this drop target that the source has been dragged
     * out of the target without dropping.  This default implementation simply removes the CSS class specified by
     * overClass (if any) from the drop element.
     * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
     * @param {Event} e The event
     * @param {Object} data An object containing arbitrary data supplied by the drag source
     */
    notifyOut : function(dd, e, data){
        if(this.overClass){
            this.el.removeCls(this.overClass);
        }
    },

    /**
     * The function a {@link Ext.dd.DragSource} calls once to notify this drop target that the dragged item has
     * been dropped on it.  This method has no default implementation and returns false, so you must provide an
     * implementation that does something to process the drop event and returns true so that the drag source's
     * repair action does not run.
     * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
     * @param {Event} e The event
     * @param {Object} data An object containing arbitrary data supplied by the drag source
     * @return {Boolean} False if the drop was invalid.
     */
    notifyDrop : function(dd, e, data){
        return false;
    },

    destroy : function(){
        this.callParent();
        if(this.containerScroll){
            Ext.dd.ScrollManager.unregister(this.el);
        }
    }
});

