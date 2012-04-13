/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.component.field.Slider
 * @extends Ext.layout.component.field.Field
 * @private
 */

Ext.define('Ext.layout.component.field.Slider', {

    /* Begin Definitions */

    alias: ['layout.sliderfield'],

    extend: 'Ext.layout.component.field.Field',

    /* End Definitions */

    type: 'sliderfield',

    sizeBodyContents: function(width, height) {
        var owner = this.owner,
            thumbs = owner.thumbs,
            length = thumbs.length,
            inputEl = owner.inputEl,
            innerEl = owner.innerEl,
            endEl = owner.endEl,
            i = 0;

        /*
         * If we happen to be animating during a resize, the position of the thumb will likely be off
         * when the animation stops. As such, just stop any animations before syncing the thumbs.
         */
        for(; i < length; ++i) {
            thumbs[i].el.stopAnimation();
        }
        
        if (owner.vertical) {
            inputEl.setHeight(height);
            innerEl.setHeight(Ext.isNumber(height) ? height - inputEl.getPadding('t') - endEl.getPadding('b') : height);
        }
        else {
            inputEl.setWidth(width);
            innerEl.setWidth(Ext.isNumber(width) ? width - inputEl.getPadding('l') - endEl.getPadding('r') : width);
        }
        owner.syncThumbs();
    }
});

