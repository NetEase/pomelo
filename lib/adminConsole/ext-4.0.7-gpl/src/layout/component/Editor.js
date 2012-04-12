/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Component layout for editors
 * @class Ext.layout.component.Editor
 * @extends Ext.layout.component.Component
 * @private
 */
Ext.define('Ext.layout.component.Editor', {

    /* Begin Definitions */

    alias: ['layout.editor'],

    extend: 'Ext.layout.component.Component',

    /* End Definitions */

    onLayout: function(width, height) {
        var me = this,
            owner = me.owner,
            autoSize = owner.autoSize;
            
        if (autoSize === true) {
            autoSize = {
                width: 'field',
                height: 'field'    
            };
        }
        
        if (autoSize) {
            width = me.getDimension(owner, autoSize.width, 'Width', width);
            height = me.getDimension(owner, autoSize.height, 'Height', height);
        }
        me.setTargetSize(width, height);
        owner.field.setSize(width, height);
    },
    
    getDimension: function(owner, type, dimension, actual){
        var method = 'get' + dimension;
        switch (type) {
            case 'boundEl':
                return owner.boundEl[method]();
            case 'field':
                return owner.field[method]();
            default:
                return actual;
        }
    }
});
