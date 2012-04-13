/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @private
 * @class Ext.layout.component.field.HtmlEditor
 * @extends Ext.layout.component.field.Field
 * Layout class for {@link Ext.form.field.HtmlEditor} fields. Sizes the toolbar, textarea, and iframe elements.
 * @private
 */

Ext.define('Ext.layout.component.field.HtmlEditor', {
    extend: 'Ext.layout.component.field.Field',
    alias: ['layout.htmleditor'],

    type: 'htmleditor',

    sizeBodyContents: function(width, height) {
        var me = this,
            owner = me.owner,
            bodyEl = owner.bodyEl,
            toolbar = owner.getToolbar(),
            textarea = owner.textareaEl,
            iframe = owner.iframeEl,
            editorHeight;

        if (Ext.isNumber(width)) {
            width -= bodyEl.getFrameWidth('lr');
        }
        toolbar.setWidth(width);
        textarea.setWidth(width);
        iframe.setWidth(width);

        // If fixed height, subtract toolbar height from the input area height
        if (Ext.isNumber(height)) {
            editorHeight = height - toolbar.getHeight() - bodyEl.getFrameWidth('tb');
            textarea.setHeight(editorHeight);
            iframe.setHeight(editorHeight);
        }
    }
});
