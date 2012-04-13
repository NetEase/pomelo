/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.Absolute
 * @extends Ext.layout.container.Anchor
 *
 * This is a layout that inherits the anchoring of {@link Ext.layout.container.Anchor} and adds the
 * ability for x/y positioning using the standard x and y component config options.
 *
 * This class is intended to be extended or created via the {@link Ext.container.Container#layout layout}
 * configuration property.  See {@link Ext.container.Container#layout} for additional details.
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         title: 'Absolute Layout',
 *         width: 300,
 *         height: 275,
 *         layout:'absolute',
 *         layoutConfig: {
 *             // layout-specific configs go here
 *             //itemCls: 'x-abs-layout-item',
 *         },
 *         url:'save-form.php',
 *         defaultType: 'textfield',
 *         items: [{
 *             x: 10,
 *             y: 10,
 *             xtype:'label',
 *             text: 'Send To:'
 *         },{
 *             x: 80,
 *             y: 10,
 *             name: 'to',
 *             anchor:'90%'  // anchor width by percentage
 *         },{
 *             x: 10,
 *             y: 40,
 *             xtype:'label',
 *             text: 'Subject:'
 *         },{
 *             x: 80,
 *             y: 40,
 *             name: 'subject',
 *             anchor: '90%'  // anchor width by percentage
 *         },{
 *             x:0,
 *             y: 80,
 *             xtype: 'textareafield',
 *             name: 'msg',
 *             anchor: '100% 100%'  // anchor width and height
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Absolute', {

    /* Begin Definitions */

    alias: 'layout.absolute',
    extend: 'Ext.layout.container.Anchor',
    alternateClassName: 'Ext.layout.AbsoluteLayout',

    /* End Definitions */

    itemCls: Ext.baseCSSPrefix + 'abs-layout-item',

    type: 'absolute',

    onLayout: function() {
        var me = this,
            target = me.getTarget(),
            targetIsBody = target.dom === document.body;

        // Do not set position: relative; when the absolute layout target is the body
        if (!targetIsBody) {
            target.position();
        }
        me.paddingLeft = target.getPadding('l');
        me.paddingTop = target.getPadding('t');
        me.callParent(arguments);
    },

    // private
    adjustWidthAnchor: function(value, comp) {
        //return value ? value - comp.getPosition(true)[0] + this.paddingLeft: value;
        return value ? value - comp.getPosition(true)[0] : value;
    },

    // private
    adjustHeightAnchor: function(value, comp) {
        //return value ? value - comp.getPosition(true)[1] + this.paddingTop: value;
        return value ? value - comp.getPosition(true)[1] : value;
    }
});
