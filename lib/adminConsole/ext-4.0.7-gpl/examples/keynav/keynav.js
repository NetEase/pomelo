/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.XTemplate',
    'Ext.util.KeyNav',
    'Ext.fx.*'
]);

Ext.define('Board', {
    constructor: function(size, activeCls){
        this.size = size;
        this.activeCls = activeCls;
    },

    render: function(el){
        el = Ext.get(el);

        var tpl = Ext.create('Ext.XTemplate',
            '<tpl for=".">',
                '<div class="square">{.}</div>',
                '<tpl if="xindex % ' + this.size + ' === 0"><div class="x-clear"></div></tpl>',
            '</tpl>'),
            data = [],
            i = 0,
            max = this.size * this.size;

        for (; i < max; ++i) {
            data.push(i + 1);
        }
        tpl.append(el, data);
        this.cells = el.select('.square');
    },

    getIndex: function(xy){
        return this.size * xy[0] + xy[1];
    },

    constrain: function(x, y) {
        x = Ext.Number.constrain(x, 0, this.size - 1);
        y = Ext.Number.constrain(y, 0, this.size - 1);
        return [x, y];
    },

    setActive: function(x, y) {
        var xy = this.constrain(x, y),
            cell = this.cells.item(this.getIndex(xy));

        cell.radioCls(this.activeCls);
        this.active = xy;
    },

    setActiveCls: function(activeCls){
        this.cells.removeCls(this.activeCls);
        this.activeCls = activeCls;
        var active = this.active;
        this.setActive(active[0], active[1]);
    },

    highlightActive: function(){
        var cell = this.cells.item(this.getIndex(this.active));
        Ext.create('Ext.fx.Anim', {
            target: cell,
            duration: 1000,
            alternate: true,
            iterations: 2,
            to: {
                backgroundColor: '#FFFF00'
            },
            callback: function(){
                cell.setStyle('background-color', '');
            }
        });
    },

    moveUp: function(){
        var active = this.active;
        this.setActive(active[0] - 1, active[1]);
    },

    moveDown: function(){
        var active = this.active;
        this.setActive(active[0] + 1, active[1]);
    },

    moveLeft: function(){
        var active = this.active;
        this.setActive(active[0], active[1] - 1);
    },

    moveRight: function(){
        var active = this.active;
        this.setActive(active[0], active[1] + 1);
    }
});

Ext.onReady(function(){

    var cls = 'active-green';
    var board = new Board(4, cls);
    board.render('board');
    board.setActive(0, 0);

    var nav = Ext.create('Ext.util.KeyNav', Ext.getDoc(), {
        scope: board,
        left: board.moveLeft,
        up: board.moveUp,
        right: board.moveRight,
        down: board.moveDown,
        space: board.highlightActive,
        home: function(){
            cls = Ext.String.toggle(cls, 'active-green', 'active-red');
            board.setActiveCls(cls);
        }
    });

});

