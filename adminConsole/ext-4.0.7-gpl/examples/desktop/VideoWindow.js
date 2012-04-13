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

Ext.define('MyDesktop.VideoWindow', {
    extend: 'Ext.ux.desktop.Module',

    uses: [
        'Ext.ux.desktop.Video'
    ],

    id:'video',
    windowId: 'video-window',

    tipWidth: 160,
    tipHeight: 96,

    init : function(){
        this.launcher = {
            text: 'About Ext JS',
            iconCls:'video',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function(){
        var me = this, desktop = me.app.getDesktop(),
            win = desktop.getWindow(me.windowId);

        if (!win) {
            win = desktop.createWindow({
                id: me.windowId,
                title: 'About Ext JS',
                width: 740,
                height: 480,
                iconCls: 'video',
                animCollapse: false,
                border: false,

                layout: 'fit',
                items: [
                    {
                        xtype: 'video',
                        id: 'video-player',
                        src: [
                            // browser will pick the format it likes most:
                            { src: 'http://dev.sencha.com/desktopvideo.mp4', type: 'video/mp4' },
                            { src: 'http://dev.sencha.com/desktopvideo.ogv', type: 'video/ogg' },
                            { src: 'http://dev.sencha.com/desktopvideo.mov', type: 'video/quicktime' }
                        ],
                        autobuffer: true,
                        autoplay : true,
                        controls : true,
                        /* default */
                        listeners: {
                            afterrender: function(video) {
                                me.videoEl = video.video.dom;

                                if (video.supported) {
                                    me.tip = new Ext.tip.ToolTip({
                                        anchor   : 'bottom',
                                        dismissDelay : 0,
                                        height   : me.tipHeight,
                                        width    : me.tipWidth,
                                        renderTpl: [
                                            '<canvas width="', me.tipWidth,
                                                  '" height="', me.tipHeight, '">'
                                        ],
                                        renderSelectors: {
                                            body: 'canvas'
                                        },
                                        listeners: {
                                            afterrender: me.onTooltipRender,
                                            show: me.renderPreview,
                                            scope: me
                                        }
                                    }); // tip
                                }
                            }
                        }
                    }
                ],
                listeners: {
                    beforedestroy: function() {
                        me.tip = me.ctx = me.videoEl = null;
                    }
                }
            });
        }

        win.show();

        if (me.tip) {
            me.tip.setTarget(win.taskButton.el);
        }

        return win;
    },

    onTooltipRender: function (tip) {
        // get the canvas 2d context
        var el = tip.body.dom, me = this;
        me.ctx = el.getContext && el.getContext('2d');
    },

    renderPreview: function() {
        var me = this;

        if ((me.tip && !me.tip.isVisible()) || !me.videoEl) {
            return;
        }

        if (me.ctx) {
            try {
                me.ctx.drawImage(me.videoEl, 0, 0, me.tipWidth, me.tipHeight);
            } catch(e) {};
        }

        // 20ms to keep the tooltip video smooth
        Ext.Function.defer(me.renderPreview, 20, me);
    }
});

