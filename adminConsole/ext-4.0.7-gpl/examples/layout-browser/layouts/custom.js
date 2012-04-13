/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
function getCustomLayouts() {
    return {
        /*
         * CenterLayout demo panel
         */
        centerLayout: {
            id: 'center-panel',
            layout: 'ux.center',
            items: {
                title: 'Centered Panel: 75% of container width and fit height',
                layout: 'ux.center',
                autoScroll: true,
                widthRatio: 0.75,
                bodyStyle: 'padding:20px 0;',
                items: [{
                    title: 'Inner Centered Panel',
                    html: 'Fixed 300px wide and auto height. The container panel will also autoscroll if narrower than 300px.',
                    width: 300,
                    frame: true,
                    autoHeight: true,
                    bodyStyle: 'padding:10px 20px;'
                }]
            }
        }
    };

}
