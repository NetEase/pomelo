/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A simple class that renders text directly into a toolbar.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Panel with TextItem',
 *         width: 300,
 *         height: 200,
 *         tbar: [
 *             { xtype: 'tbtext', text: 'Sample Text Item' }
 *         ],
 *         renderTo: Ext.getBody()
 *     });
 *
 * @constructor
 * Creates a new TextItem
 * @param {Object} text A text string, or a config object containing a <tt>text</tt> property
 */
Ext.define('Ext.toolbar.TextItem', {
    extend: 'Ext.toolbar.Item',
    requires: ['Ext.XTemplate'],
    alias: 'widget.tbtext',
    alternateClassName: 'Ext.Toolbar.TextItem',

    /**
     * @cfg {String} text The text to be used as innerHTML (html tags are accepted)
     */
    text: '',

    renderTpl: '{text}',
    //
    baseCls: Ext.baseCSSPrefix + 'toolbar-text',

    onRender : function() {
        Ext.apply(this.renderData, {
            text: this.text
        });
        this.callParent(arguments);
    },

    /**
     * Updates this item's text, setting the text to be used as innerHTML.
     * @param {String} t The text to display (html accepted).
     */
    setText : function(t) {
        if (this.rendered) {
            this.el.update(t);
            this.ownerCt.doLayout(); // In case an empty text item (centered at zero height) receives new text.
        } else {
            this.text = t;
        }
    }
});
