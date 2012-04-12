/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.fx.Queue
 * Animation Queue mixin to handle chaining and queueing by target.
 * @private
 */

Ext.define('Ext.fx.Queue', {

    requires: ['Ext.util.HashMap'],

    constructor: function() {
        this.targets = Ext.create('Ext.util.HashMap');
        this.fxQueue = {};
    },

    // @private
    getFxDefaults: function(targetId) {
        var target = this.targets.get(targetId);
        if (target) {
            return target.fxDefaults;
        }
        return {};
    },

    // @private
    setFxDefaults: function(targetId, obj) {
        var target = this.targets.get(targetId);
        if (target) {
            target.fxDefaults = Ext.apply(target.fxDefaults || {}, obj);
        }
    },

    // @private
    stopAnimation: function(targetId) {
        var me = this,
            queue = me.getFxQueue(targetId),
            ln = queue.length;
        while (ln) {
            queue[ln - 1].end();
            ln--;
        }
    },

    /**
     * @private
     * Returns current animation object if the element has any effects actively running or queued, else returns false.
     */
    getActiveAnimation: function(targetId) {
        var queue = this.getFxQueue(targetId);
        return (queue && !!queue.length) ? queue[0] : false;
    },

    // @private
    hasFxBlock: function(targetId) {
        var queue = this.getFxQueue(targetId);
        return queue && queue[0] && queue[0].block;
    },

    // @private get fx queue for passed target, create if needed.
    getFxQueue: function(targetId) {
        if (!targetId) {
            return false;
        }
        var me = this,
            queue = me.fxQueue[targetId],
            target = me.targets.get(targetId);

        if (!target) {
            return false;
        }

        if (!queue) {
            me.fxQueue[targetId] = [];
            // GarbageCollector will need to clean up Elements since they aren't currently observable
            if (target.type != 'element') {
                target.target.on('destroy', function() {
                    me.fxQueue[targetId] = [];
                });
            }
        }
        return me.fxQueue[targetId];
    },

    // @private
    queueFx: function(anim) {
        var me = this,
            target = anim.target,
            queue, ln;

        if (!target) {
            return;
        }

        queue = me.getFxQueue(target.getId());
        ln = queue.length;

        if (ln) {
            if (anim.concurrent) {
                anim.paused = false;
            }
            else {
                queue[ln - 1].on('afteranimate', function() {
                    anim.paused = false;
                });
            }
        }
        else {
            anim.paused = false;
        }
        anim.on('afteranimate', function() {
            Ext.Array.remove(queue, anim);
            if (anim.remove) {
                if (target.type == 'element') {
                    var el = Ext.get(target.id);
                    if (el) {
                        el.remove();
                    }
                }
            }
        }, this);
        queue.push(anim);
    }
});
