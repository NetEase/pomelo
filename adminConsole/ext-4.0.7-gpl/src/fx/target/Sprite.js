/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.fx.target.Sprite
 * @extends Ext.fx.target.Target

This class represents a animation target for a {@link Ext.draw.Sprite}. In general this class will not be
created directly, the {@link Ext.draw.Sprite} will be passed to the animation and
and the appropriate target will be created.

 * @markdown
 */

Ext.define('Ext.fx.target.Sprite', {

    /* Begin Definitions */

    extend: 'Ext.fx.target.Target',

    /* End Definitions */

    type: 'draw',

    getFromPrim: function(sprite, attr) {
        var o;
        if (attr == 'translate') {
            o = {
                x: sprite.attr.translation.x || 0,
                y: sprite.attr.translation.y || 0
            };
        }
        else if (attr == 'rotate') {
            o = {
                degrees: sprite.attr.rotation.degrees || 0,
                x: sprite.attr.rotation.x,
                y: sprite.attr.rotation.y
            };
        }
        else {
            o = sprite.attr[attr];
        }
        return o;
    },

    getAttr: function(attr, val) {
        return [[this.target, val != undefined ? val : this.getFromPrim(this.target, attr)]];
    },

    setAttr: function(targetData) {
        var ln = targetData.length,
            spriteArr = [],
            attrs, attr, attrArr, attPtr, spritePtr, idx, value, i, j, x, y, ln2;
        for (i = 0; i < ln; i++) {
            attrs = targetData[i].attrs;
            for (attr in attrs) {
                attrArr = attrs[attr];
                ln2 = attrArr.length;
                for (j = 0; j < ln2; j++) {
                    spritePtr = attrArr[j][0];
                    attPtr = attrArr[j][1];
                    if (attr === 'translate') {
                        value = {
                            x: attPtr.x,
                            y: attPtr.y
                        };
                    }
                    else if (attr === 'rotate') {
                        x = attPtr.x;
                        if (isNaN(x)) {
                            x = null;
                        }
                        y = attPtr.y;
                        if (isNaN(y)) {
                            y = null;
                        }
                        value = {
                            degrees: attPtr.degrees,
                            x: x,
                            y: y
                        };
                    }
                    else if (attr === 'width' || attr === 'height' || attr === 'x' || attr === 'y') {
                        value = parseFloat(attPtr);
                    }
                    else {
                        value = attPtr;
                    }
                    idx = Ext.Array.indexOf(spriteArr, spritePtr);
                    if (idx == -1) {
                        spriteArr.push([spritePtr, {}]);
                        idx = spriteArr.length - 1;
                    }
                    spriteArr[idx][1][attr] = value;
                }
            }
        }
        ln = spriteArr.length;
        for (i = 0; i < ln; i++) {
            spritePtr = spriteArr[i];
            spritePtr[0].setAttributes(spritePtr[1]);
        }
        this.target.redraw();
    }
});

