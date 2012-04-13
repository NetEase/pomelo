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
 * @class Ext.layout.component.field.File
 * @extends Ext.layout.component.field.Field
 * Layout class for {@link Ext.form.field.File} fields. Adjusts the input field size to accommodate
 * the file picker trigger button.
 * @private
 */

Ext.define('Ext.layout.component.field.File', {
    alias: ['layout.filefield'],
    extend: 'Ext.layout.component.field.Field',

    type: 'filefield',

    sizeBodyContents: function(width, height) {
        var me = this,
            owner = me.owner;

        if (!owner.buttonOnly) {
            // Decrease the field's width by the width of the button and the configured buttonMargin.
            // Both the text field and the button are floated left in CSS so they'll stack up side by side.
            me.setElementSize(owner.inputEl, Ext.isNumber(width) ? width - owner.button.getWidth() - owner.buttonMargin : width);
        }
    }
});
