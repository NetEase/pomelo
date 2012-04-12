/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.ComponentDragger
 * @extends Ext.dd.DragTracker
 * <p>A subclass of Ext.dd.DragTracker which handles dragging any Component.</p>
 * <p>This is configured with a Component to be made draggable, and a config object for the
 * {@link Ext.dd.DragTracker} class.</p>
 * <p>A {@link #delegate} may be provided which may be either the element to use as the mousedown target
 * or a {@link Ext.DomQuery} selector to activate multiple mousedown targets.</p>
 */
Ext.define('Ext.util.ComponentDragger', {

    /**
     * @cfg {Boolean} constrain
     * Specify as <code>true</code> to constrain the Component to within the bounds of the {@link #constrainTo} region.
     */

    /**
     * @cfg {String/Ext.Element} delegate
     * Optional. <p>A {@link Ext.DomQuery DomQuery} selector which identifies child elements within the Component's encapsulating
     * Element which are the drag handles. This limits dragging to only begin when the matching elements are mousedowned.</p>
     * <p>This may also be a specific child element within the Component's encapsulating element to use as the drag handle.</p>
     */

    /**
     * @cfg {Boolean} constrainDelegate
     * Specify as <code>true</code> to constrain the drag handles within the {@link #constrainTo} region.
     */

    extend: 'Ext.dd.DragTracker',

    autoStart: 500,

    /**
     * Creates new ComponentDragger.
     * @param {Object} comp The Component to provide dragging for.
     * @param {Object} config (optional) Config object
     */
    constructor: function(comp, config) {
        this.comp = comp;
        this.initialConstrainTo = config.constrainTo;
        this.callParent([ config ]);
    },

    onStart: function(e) {
        var me = this,
            comp = me.comp;

        // Cache the start [X, Y] array
        this.startPosition = comp.getPosition();

        // If client Component has a ghost method to show a lightweight version of itself
        // then use that as a drag proxy unless configured to liveDrag.
        if (comp.ghost && !comp.liveDrag) {
             me.proxy = comp.ghost();
             me.dragTarget = me.proxy.header.el;
        }

        // Set the constrainTo Region before we start dragging.
        if (me.constrain || me.constrainDelegate) {
            me.constrainTo = me.calculateConstrainRegion();
        }
    },

    calculateConstrainRegion: function() {
        var me = this,
            comp = me.comp,
            c = me.initialConstrainTo,
            delegateRegion,
            elRegion,
            shadowSize = comp.el.shadow ? comp.el.shadow.offset : 0;

        // The configured constrainTo might be a Region or an element
        if (!(c instanceof Ext.util.Region)) {
            c =  Ext.fly(c).getViewRegion();
        }

        // Reduce the constrain region to allow for shadow
        if (shadowSize) {
            c.adjust(0, -shadowSize, -shadowSize, shadowSize);
        }

        // If they only want to constrain the *delegate* to within the constrain region,
        // adjust the region to be larger based on the insets of the delegate from the outer
        // edges of the Component.
        if (!me.constrainDelegate) {
            delegateRegion = Ext.fly(me.dragTarget).getRegion();
            elRegion = me.proxy ? me.proxy.el.getRegion() : comp.el.getRegion();

            c.adjust(
                delegateRegion.top - elRegion.top,
                delegateRegion.right - elRegion.right,
                delegateRegion.bottom - elRegion.bottom,
                delegateRegion.left - elRegion.left
            );
        }
        return c;
    },

    // Move either the ghost Component or the target Component to its new position on drag
    onDrag: function(e) {
        var me = this,
            comp = (me.proxy && !me.comp.liveDrag) ? me.proxy : me.comp,
            offset = me.getOffset(me.constrain || me.constrainDelegate ? 'dragTarget' : null);

        comp.setPosition(me.startPosition[0] + offset[0], me.startPosition[1] + offset[1]);
    },

    onEnd: function(e) {
        if (this.proxy && !this.comp.liveDrag) {
            this.comp.unghost();
        }
    }
});
