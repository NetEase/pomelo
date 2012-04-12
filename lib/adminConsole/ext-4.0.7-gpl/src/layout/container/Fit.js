/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This is a base class for layouts that contain **a single item** that automatically expands to fill the layout's
 * container. This class is intended to be extended or created via the `layout: 'fit'`
 * {@link Ext.container.Container#layout} config, and should generally not need to be created directly via the new keyword.
 *
 * Fit layout does not have any direct config options (other than inherited ones). To fit a panel to a container using
 * Fit layout, simply set `layout: 'fit'` on the container and add a single panel to it. If the container has multiple
 * panels, only the first one will be displayed.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Fit Layout',
 *         width: 300,
 *         height: 150,
 *         layout:'fit',
 *         items: {
 *             title: 'Inner Panel',
 *             html: 'This is the inner panel content',
 *             bodyPadding: 20,
 *             border: false
 *         },
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Fit', {

    /* Begin Definitions */

    extend: 'Ext.layout.container.AbstractFit',
    alias: 'layout.fit',
    alternateClassName: 'Ext.layout.FitLayout',
    requires: ['Ext.layout.container.Box'],

    /* End Definitions */

    /**
     * @cfg {Object} defaultMargins
     * <p>If the individual contained items do not have a <tt>margins</tt>
     * property specified or margin specified via CSS, the default margins from this property will be
     * applied to each item.</p>
     * <br><p>This property may be specified as an object containing margins
     * to apply in the format:</p><pre><code>
{
    top: (top margin),
    right: (right margin),
    bottom: (bottom margin),
    left: (left margin)
}</code></pre>
     * <p>This property may also be specified as a string containing
     * space-separated, numeric margin values. The order of the sides associated
     * with each value matches the way CSS processes margin values:</p>
     * <div class="mdetail-params"><ul>
     * <li>If there is only one value, it applies to all sides.</li>
     * <li>If there are two values, the top and bottom borders are set to the
     * first value and the right and left are set to the second.</li>
     * <li>If there are three values, the top is set to the first value, the left
     * and right are set to the second, and the bottom is set to the third.</li>
     * <li>If there are four values, they apply to the top, right, bottom, and
     * left, respectively.</li>
     * </ul></div>
     * <p>Defaults to:</p><pre><code>
     * {top:0, right:0, bottom:0, left:0}
     * </code></pre>
     */
    defaultMargins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    // @private
    onLayout : function() {
        var me = this,
            size,
            item,
            margins;
        me.callParent();

        if (me.owner.items.length) {
            item = me.owner.items.get(0);
            margins = item.margins || me.defaultMargins;
            size = me.getLayoutTargetSize();
            size.width  -= margins.width;
            size.height -= margins.height;
            me.setItemBox(item, size);

            // If any margins were configure either through the margins config, or in the CSS style,
            // Then positioning will be used.
            if (margins.left || margins.top) {
                item.setPosition(margins.left, margins.top);
            }
        }
    },

    getTargetBox : function() {
        return this.getLayoutTargetSize();
    },

    setItemBox : function(item, box) {
        var me = this;
        if (item && box.height > 0) {
            if (!me.owner.isFixedWidth()) {
               box.width = undefined;
            }
            if (!me.owner.isFixedHeight()) {
               box.height = undefined;
            }
            me.setItemSize(item, box.width, box.height);
        }
    },

    configureItem: function(item) {

        // Card layout only controls dimensions which IT has controlled.
        // That calculation has to be determined at run time by examining the ownerCt's isFixedWidth()/isFixedHeight() methods
        item.layoutManagedHeight = 0;
        item.layoutManagedWidth = 0;

        this.callParent(arguments);
    }
}, function() {
    // Use Box layout's renderItem which reads CSS margins, and adds them to any configured item margins
    // (Defaulting to "0 0 0 0")
    this.prototype.renderItem = Ext.layout.container.Box.prototype.renderItem;
});
