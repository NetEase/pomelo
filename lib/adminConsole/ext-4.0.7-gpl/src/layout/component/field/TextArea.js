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
 * @class Ext.layout.component.field.TextArea
 * @extends Ext.layout.component.field.Field
 * Layout class for {@link Ext.form.field.TextArea} fields. Handles sizing the textarea field.
 */
Ext.define('Ext.layout.component.field.TextArea', {
    extend: 'Ext.layout.component.field.Text',
    alias: 'layout.textareafield',

    type: 'textareafield',


    /**
     * Given the target bodyEl dimensions, adjust them if necessary to return the correct final
     * size based on the text field's {@link Ext.form.field.Text#grow grow config}. Overrides the
     * textfield layout's implementation to handle height rather than width.
     * @param {Number} width The bodyEl width
     * @param {Number} height The bodyEl height
     * @return {Number[]} [inputElWidth, inputElHeight]
     */
    adjustForGrow: function(width, height) {
        var me = this,
            owner = me.owner,
            inputEl, value, max,
            curWidth, curHeight, calcHeight,
            result = [width, height];

        if (owner.grow) {
            inputEl = owner.inputEl;
            curWidth = inputEl.getWidth(true); //subtract border/padding to get the available width for the text
            curHeight = inputEl.getHeight();

            // Get and normalize the field value for measurement
            value = inputEl.dom.value || '&#160;';
            value += owner.growAppend;

            // Translate newlines to <br> tags
            value = value.replace(/\n/g, '<br>');

            // Find the height that contains the whole text value
            calcHeight = Ext.util.TextMetrics.measure(inputEl, value, curWidth).height +
                         inputEl.getBorderWidth("tb") + inputEl.getPadding("tb");

            // Constrain
            max = owner.growMax;
            if (Ext.isNumber(height)) {
                max = Math.min(max, height);
            }
            result[1] = Ext.Number.constrain(calcHeight, owner.growMin, max);
        }

        return result;
    }

});
