/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A non-rendering placeholder item which instructs the Toolbar's Layout to begin using
 * the right-justified button container.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *          title: 'Toolbar Fill Example',
 *          width: 300,
 *          height: 200,
 *          tbar : [
 *              'Item 1',
 *              { xtype: 'tbfill' },
 *              'Item 2'
 *          ],
 *          renderTo: Ext.getBody()
 *      });
 */
Ext.define('Ext.toolbar.Fill', {
    extend: 'Ext.Component',
    alias: 'widget.tbfill',
    alternateClassName: 'Ext.Toolbar.Fill',
    isFill : true,
    flex: 1
});
