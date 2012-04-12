/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This class functions between siblings of a {@link Ext.layout.container.VBox VBox} or {@link Ext.layout.container.HBox HBox}
 * layout to resize both immediate siblings.
 *
 * By default it will set the size of both siblings. <b>One</b> of the siblings may be configured with
 * `{@link Ext.Component#maintainFlex maintainFlex}: true` which will cause it not to receive a new size explicitly, but to be resized
 * by the layout.
 *
 * A Splitter may be configured to show a centered mini-collapse tool orientated to collapse the {@link #collapseTarget}.
 * The Splitter will then call that sibling Panel's {@link Ext.panel.Panel#collapse collapse} or {@link Ext.panel.Panel#expand expand} method
 * to perform the appropriate operation (depending on the sibling collapse state). To create the mini-collapse tool but take care
 * of collapsing yourself, configure the splitter with <code>{@link #performCollapse} false</code>.
 */
Ext.define('Ext.resizer.Splitter', {
    extend: 'Ext.Component',
    requires: ['Ext.XTemplate'],
    uses: ['Ext.resizer.SplitterTracker'],
    alias: 'widget.splitter',

    renderTpl: [
        '<tpl if="collapsible===true">',
            '<div id="{id}-collapseEl" class="', Ext.baseCSSPrefix, 'collapse-el ',
                    Ext.baseCSSPrefix, 'layout-split-{collapseDir}">&nbsp;</div>',
        '</tpl>'
    ],

    baseCls: Ext.baseCSSPrefix + 'splitter',
    collapsedClsInternal: Ext.baseCSSPrefix + 'splitter-collapsed',

    /**
     * @cfg {Boolean} collapsible
     * <code>true</code> to show a mini-collapse tool in the Splitter to toggle expand and collapse on the {@link #collapseTarget} Panel.
     * Defaults to the {@link Ext.panel.Panel#collapsible collapsible} setting of the Panel.
     */
    collapsible: false,

    /**
     * @cfg {Boolean} performCollapse
     * <p>Set to <code>false</code> to prevent this Splitter's mini-collapse tool from managing the collapse
     * state of the {@link #collapseTarget}.</p>
     */

    /**
     * @cfg {Boolean} collapseOnDblClick
     * <code>true</code> to enable dblclick to toggle expand and collapse on the {@link #collapseTarget} Panel.
     */
    collapseOnDblClick: true,

    /**
     * @cfg {Number} defaultSplitMin
     * Provides a default minimum width or height for the two components
     * that the splitter is between.
     */
    defaultSplitMin: 40,

    /**
     * @cfg {Number} defaultSplitMax
     * Provides a default maximum width or height for the two components
     * that the splitter is between.
     */
    defaultSplitMax: 1000,

    /**
     * @cfg {String} collapsedCls
     * A class to add to the splitter when it is collapsed. See {@link #collapsible}.
     */

    width: 5,
    height: 5,

    /**
     * @cfg {String/Ext.panel.Panel} collapseTarget
     * <p>A string describing the relative position of the immediate sibling Panel to collapse. May be 'prev' or 'next' (Defaults to 'next')</p>
     * <p>Or the immediate sibling Panel to collapse.</p>
     * <p>The orientation of the mini-collapse tool will be inferred from this setting.</p>
     * <p><b>Note that only Panels may be collapsed.</b></p>
     */
    collapseTarget: 'next',

    /**
     * @property orientation
     * @type String
     * Orientation of this Splitter. <code>'vertical'</code> when used in an hbox layout, <code>'horizontal'</code>
     * when used in a vbox layout.
     */

    onRender: function() {
        var me = this,
            target = me.getCollapseTarget(),
            collapseDir = me.getCollapseDirection();

        Ext.applyIf(me.renderData, {
            collapseDir: collapseDir,
            collapsible: me.collapsible || target.collapsible
        });

        me.addChildEls('collapseEl');

        this.callParent(arguments);

        // Add listeners on the mini-collapse tool unless performCollapse is set to false
        if (me.performCollapse !== false) {
            if (me.renderData.collapsible) {
                me.mon(me.collapseEl, 'click', me.toggleTargetCmp, me);
            }
            if (me.collapseOnDblClick) {
                me.mon(me.el, 'dblclick', me.toggleTargetCmp, me);
            }
        }

        // Ensure the mini collapse icon is set to the correct direction when the target is collapsed/expanded by any means
        me.mon(target, 'collapse', me.onTargetCollapse, me);
        me.mon(target, 'expand', me.onTargetExpand, me);

        me.el.addCls(me.baseCls + '-' + me.orientation);
        me.el.unselectable();

        me.tracker = Ext.create('Ext.resizer.SplitterTracker', {
            el: me.el
        });

        // Relay the most important events to our owner (could open wider later):
        me.relayEvents(me.tracker, [ 'beforedragstart', 'dragstart', 'dragend' ]);
    },

    getCollapseDirection: function() {
        var me = this,
            idx,
            type = me.ownerCt.layout.type;

        // Avoid duplication of string tests.
        // Create a two bit truth table of the configuration of the Splitter:
        // Collapse Target | orientation
        //        0              0             = next, horizontal
        //        0              1             = next, vertical
        //        1              0             = prev, horizontal
        //        1              1             = prev, vertical
        if (me.collapseTarget.isComponent) {
            idx = Number(me.ownerCt.items.indexOf(me.collapseTarget) == me.ownerCt.items.indexOf(me) - 1) << 1 | Number(type == 'hbox');
        } else {
            idx = Number(me.collapseTarget == 'prev') << 1 | Number(type == 'hbox');
        }

        // Read the data out the truth table
        me.orientation = ['horizontal', 'vertical'][idx & 1];
        return ['bottom', 'right', 'top', 'left'][idx];
    },

    getCollapseTarget: function() {
        var me = this;

        return me.collapseTarget.isComponent ? me.collapseTarget : me.collapseTarget == 'prev' ? me.previousSibling() : me.nextSibling();
    },

    onTargetCollapse: function(target) {
        this.el.addCls([this.collapsedClsInternal, this.collapsedCls]);
    },

    onTargetExpand: function(target) {
        this.el.removeCls([this.collapsedClsInternal, this.collapsedCls]);
    },

    toggleTargetCmp: function(e, t) {
        var cmp = this.getCollapseTarget();

        if (cmp.isVisible()) {
            // restore
            if (cmp.collapsed) {
                cmp.expand(cmp.animCollapse);
            // collapse
            } else {
                cmp.collapse(this.renderData.collapseDir, cmp.animCollapse);
            }
        }
    },

    /*
     * Work around IE bug. %age margins do not get recalculated on element resize unless repaint called.
     */
    setSize: function() {
        var me = this;
        me.callParent(arguments);
        if (Ext.isIE) {
            me.el.repaint();
        }
    }
});

