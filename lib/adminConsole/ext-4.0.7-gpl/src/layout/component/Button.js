/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Component layout for buttons
 * @class Ext.layout.component.Button
 * @extends Ext.layout.component.Component
 * @private
 */
Ext.define('Ext.layout.component.Button', {

    /* Begin Definitions */

    alias: ['layout.button'],

    extend: 'Ext.layout.component.Component',

    /* End Definitions */

    type: 'button',

    cellClsRE: /-btn-(tl|br)\b/,
    htmlRE: /<.*>/,

    beforeLayout: function() {
        return this.callParent(arguments) || this.lastText !== this.owner.text;
    },

    /**
     * Set the dimensions of the inner &lt;button&gt; element to match the
     * component dimensions.
     */
    onLayout: function(width, height) {
        var me = this,
            isNum = Ext.isNumber,
            owner = me.owner,
            ownerEl = owner.el,
            btnEl = owner.btnEl,
            btnInnerEl = owner.btnInnerEl,
            btnIconEl = owner.btnIconEl,
            sizeIconEl = (owner.icon || owner.iconCls) && (owner.iconAlign == "top" || owner.iconAlign == "bottom"),
            minWidth = owner.minWidth,
            maxWidth = owner.maxWidth,
            ownerWidth, btnFrameWidth, metrics;

        me.getTargetInfo();
        me.callParent(arguments);

        btnInnerEl.unclip();
        me.setTargetSize(width, height);

        if (!isNum(width)) {
            // In IE7 strict mode button elements with width:auto get strange extra side margins within
            // the wrapping table cell, but they go away if the width is explicitly set. So we measure
            // the size of the text and set the width to match.
            if (owner.text && (Ext.isIE6 || Ext.isIE7) && Ext.isStrict && btnEl && btnEl.getWidth() > 20) {
                btnFrameWidth = me.btnFrameWidth;
                metrics = Ext.util.TextMetrics.measure(btnInnerEl, owner.text);
                ownerEl.setWidth(metrics.width + btnFrameWidth + me.adjWidth);
                btnEl.setWidth(metrics.width + btnFrameWidth);
                btnInnerEl.setWidth(metrics.width + btnFrameWidth);

                if (sizeIconEl) {
                    btnIconEl.setWidth(metrics.width + btnFrameWidth);
                }
            } else {
                // Remove any previous fixed widths
                ownerEl.setWidth(null);
                btnEl.setWidth(null);
                btnInnerEl.setWidth(null);
                btnIconEl.setWidth(null);
            }

            // Handle maxWidth/minWidth config
            if (minWidth || maxWidth) {
                ownerWidth = ownerEl.getWidth();
                if (minWidth && (ownerWidth < minWidth)) {
                    me.setTargetSize(minWidth, height);
                }
                else if (maxWidth && (ownerWidth > maxWidth)) {
                    btnInnerEl.clip();
                    me.setTargetSize(maxWidth, height);
                }
            }
        }

        this.lastText = owner.text;
    },

    setTargetSize: function(width, height) {
        var me = this,
            owner = me.owner,
            isNum = Ext.isNumber,
            btnInnerEl = owner.btnInnerEl,
            btnWidth = (isNum(width) ? width - me.adjWidth : width),
            btnHeight = (isNum(height) ? height - me.adjHeight : height),
            btnFrameHeight = me.btnFrameHeight,
            text = owner.getText(),
            textHeight;

        me.callParent(arguments);
        me.setElementSize(owner.btnEl, btnWidth, btnHeight);
        me.setElementSize(btnInnerEl, btnWidth, btnHeight);
        if (btnHeight >= 0) {
            btnInnerEl.setStyle('line-height', btnHeight - btnFrameHeight + 'px');
        }

        // Button text may contain markup that would force it to wrap to more than one line (e.g. 'Button<br>Label').
        // When this happens, we cannot use the line-height set above for vertical centering; we instead reset the
        // line-height to normal, measure the rendered text height, and add padding-top to center the text block
        // vertically within the button's height. This is more expensive than the basic line-height approach so
        // we only do it if the text contains markup.
        if (text && this.htmlRE.test(text)) {
            btnInnerEl.setStyle('line-height', 'normal');
            textHeight = Ext.util.TextMetrics.measure(btnInnerEl, text).height;
            btnInnerEl.setStyle('padding-top', me.btnFrameTop + Math.max(btnInnerEl.getHeight() - btnFrameHeight - textHeight, 0) / 2 + 'px');
            me.setElementSize(btnInnerEl, btnWidth, btnHeight);
        }
    },

    getTargetInfo: function() {
        var me = this,
            owner = me.owner,
            ownerEl = owner.el,
            frameSize = me.frameSize,
            frameBody = owner.frameBody,
            btnWrap = owner.btnWrap,
            innerEl = owner.btnInnerEl;

        if (!('adjWidth' in me)) {
            Ext.apply(me, {
                // Width adjustment must take into account the arrow area. The btnWrap is the <em> which has padding to accommodate the arrow.
                adjWidth: frameSize.left + frameSize.right + ownerEl.getBorderWidth('lr') + ownerEl.getPadding('lr') +
                          btnWrap.getPadding('lr') + (frameBody ? frameBody.getFrameWidth('lr') : 0),
                adjHeight: frameSize.top + frameSize.bottom + ownerEl.getBorderWidth('tb') + ownerEl.getPadding('tb') +
                           btnWrap.getPadding('tb') + (frameBody ? frameBody.getFrameWidth('tb') : 0),
                btnFrameWidth: innerEl.getFrameWidth('lr'),
                btnFrameHeight: innerEl.getFrameWidth('tb'),
                btnFrameTop: innerEl.getFrameWidth('t')
            });
        }

        return me.callParent();
    }
});
