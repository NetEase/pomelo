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
 * @class Ext.layout.component.field.Text
 * @extends Ext.layout.component.field.Field
 * Layout class for {@link Ext.form.field.Text} fields. Handles sizing the input field.
 */
Ext.define('Ext.layout.component.field.Text', {
    extend: 'Ext.layout.component.field.Field',
    alias: 'layout.textfield',
    requires: ['Ext.util.TextMetrics'],

    type: 'textfield',


    /**
     * Allow layout to proceed if the {@link Ext.form.field.Text#grow} config is enabled and the value has
     * changed since the last layout.
     */
    beforeLayout: function(width, height) {
        var me = this,
            owner = me.owner,
            lastValue = this.lastValue,
            value = owner.getRawValue();
        this.lastValue = value;
        return me.callParent(arguments) || (owner.grow && value !== lastValue);
    },


    /**
     * Size the field body contents given the total dimensions of the bodyEl, taking into account the optional
     * {@link Ext.form.field.Text#grow} configurations.
     * @param {Number} width The bodyEl width
     * @param {Number} height The bodyEl height
     */
    sizeBodyContents: function(width, height) {
        var size = this.adjustForGrow(width, height);
        this.setElementSize(this.owner.inputEl, size[0], size[1]);
    },


    /**
     * Given the target bodyEl dimensions, adjust them if necessary to return the correct final
     * size based on the text field's {@link Ext.form.field.Text#grow grow config}.
     * @param {Number} width The bodyEl width
     * @param {Number} height The bodyEl height
     * @return {Number[]} [inputElWidth, inputElHeight]
     */
    adjustForGrow: function(width, height) {
        var me = this,
            owner = me.owner,
            inputEl, value, calcWidth,
            result = [width, height];

        if (owner.grow) {
            inputEl = owner.inputEl;

            // Find the width that contains the whole text value
            value = (inputEl.dom.value || (owner.hasFocus ? '' : owner.emptyText) || '') + owner.growAppend;
            calcWidth = inputEl.getTextWidth(value) + inputEl.getBorderWidth("lr") + inputEl.getPadding("lr");

            // Constrain
            result[0] = Ext.Number.constrain(calcWidth, owner.growMin,
                    Math.max(owner.growMin, Math.min(owner.growMax, Ext.isNumber(width) ? width : Infinity)));
        }

        return result;
    }

});

