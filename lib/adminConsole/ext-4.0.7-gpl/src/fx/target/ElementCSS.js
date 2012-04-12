/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.fx.target.ElementCSS
 * @extends Ext.fx.target.Element
 * 
 * This class represents a animation target for an {@link Ext.Element} that supports CSS
 * based animation. In general this class will not be created directly, the {@link Ext.Element} 
 * will be passed to the animation and the appropriate target will be created.
 */
Ext.define('Ext.fx.target.ElementCSS', {

    /* Begin Definitions */

    extend: 'Ext.fx.target.Element',

    /* End Definitions */

    setAttr: function(targetData, isFirstFrame) {
        var cssArr = {
                attrs: [],
                duration: [],
                easing: []
            },
            ln = targetData.length,
            attributes,
            attrs,
            attr,
            easing,
            duration,
            o,
            i,
            j,
            ln2;
        for (i = 0; i < ln; i++) {
            attrs = targetData[i];
            duration = attrs.duration;
            easing = attrs.easing;
            attrs = attrs.attrs;
            for (attr in attrs) {
                if (Ext.Array.indexOf(cssArr.attrs, attr) == -1) {
                    cssArr.attrs.push(attr.replace(/[A-Z]/g, function(v) {
                        return '-' + v.toLowerCase();
                    }));
                    cssArr.duration.push(duration + 'ms');
                    cssArr.easing.push(easing);
                }
            }
        }
        attributes = cssArr.attrs.join(',');
        duration = cssArr.duration.join(',');
        easing = cssArr.easing.join(', ');
        for (i = 0; i < ln; i++) {
            attrs = targetData[i].attrs;
            for (attr in attrs) {
                ln2 = attrs[attr].length;
                for (j = 0; j < ln2; j++) {
                    o = attrs[attr][j];
                    o[0].setStyle(Ext.supports.CSS3Prefix + 'TransitionProperty', isFirstFrame ? '' : attributes);
                    o[0].setStyle(Ext.supports.CSS3Prefix + 'TransitionDuration', isFirstFrame ? '' : duration);
                    o[0].setStyle(Ext.supports.CSS3Prefix + 'TransitionTimingFunction', isFirstFrame ? '' : easing);
                    o[0].setStyle(attr, o[1]);

                    // Must trigger reflow to make this get used as the start point for the transition that follows
                    if (isFirstFrame) {
                        o = o[0].dom.offsetWidth;
                    }
                    else {
                        // Remove transition properties when completed.
                        o[0].on(Ext.supports.CSS3TransitionEnd, function() {
                            this.setStyle(Ext.supports.CSS3Prefix + 'TransitionProperty', null);
                            this.setStyle(Ext.supports.CSS3Prefix + 'TransitionDuration', null);
                            this.setStyle(Ext.supports.CSS3Prefix + 'TransitionTimingFunction', null);
                        }, o[0], { single: true });
                    }
                }
            }
        }
    }
});
