/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

// From code originally written by David Davis (http://www.sencha.com/blog/html5-video-canvas-and-ext-js/)

/* -NOTICE-
 * For HTML5 video to work, your server must
 * send the right content type, for more info see:
 * http://developer.mozilla.org/En/HTML/Element/Video
 */

Ext.define('Ext.ux.desktop.Video', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.video',
    layout: 'fit',
    width: '100%',
    height: '100%',
    autoplay: false,
    controls: true,
    bodyStyle: 'background-color:#000;color:#fff',
    html: '',

    initComponent: function () {
        this.callParent();
    },

    afterRender: function () {
        var fallback;

        if (this.fallbackHTML) {
            fallback = this.fallbackHTML;
        } else {
            fallback = "Your browser does not support HTML5 Video. ";

            if (Ext.isChrome) {
                fallback += 'Upgrade Chrome.';
            } else if (Ext.isGecko) {
                fallback += 'Upgrade to Firefox 3.5 or newer.';
            } else {
                var chrome = '<a href="http://www.google.com/chrome">Chrome</a>';
                fallback += 'Please try <a href="http://www.mozilla.com">Firefox</a>';

                if (Ext.isIE) {
                    fallback += ', ' + chrome +
                        ' or <a href="http://www.apple.com/safari/">Safari</a>.';
                } else {
                    fallback += ' or ' + chrome + '.';
                }
            }
        }

        // match the video size to the panel dimensions
        var size = this.getSize();

        var cfg = Ext.copyTo({
            tag   : 'video',
            width : size.width,
            height: size.height
        },
        this, 'poster,start,loopstart,loopend,playcount,autobuffer,loop');

        // just having the params exist enables them
        if (this.autoplay) {
            cfg.autoplay = 1;
        }
        if (this.controls) {
            cfg.controls = 1;
        }

        // handle multiple sources
        if (Ext.isArray(this.src)) {
            cfg.children = [];

            for (var i = 0, len = this.src.length; i < len; i++) {
                if (!Ext.isObject(this.src[i])) {
                    Ext.Error.raise('The src list passed to "video" must be an array of objects');
                }

                cfg.children.push(
                    Ext.applyIf({tag: 'source'}, this.src[i])
                );
            }

            cfg.children.push({
                html: fallback
            });

        } else {
            cfg.src  = this.src;
            cfg.html = fallback;
        }

        this.video = this.body.createChild(cfg);
        var el = this.video.dom;
        this.supported = (el && el.tagName.toLowerCase() == 'video');
    },

    doComponentLayout : function() {
        var me = this;

        me.callParent(arguments);

        if (me.video)
            me.video.setSize(me.body.getSize());
    },

    onDestroy: function () {
        var video = this.video;
        if (video) {
            var videoDom = video.dom;
            if (videoDom && videoDom.pause) {
                videoDom.pause();
            }
            video.remove();
            this.video = null;
        }

        this.callParent();
    }
});

