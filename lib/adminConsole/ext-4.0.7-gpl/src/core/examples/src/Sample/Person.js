/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('Sample.Person', {
    uses: 'Sample.Gun',

    statics: {
        averageIQ: 100
    },

    config: {
        name: 'Unknown',
        gender: 'unknown',
        isCool: false,
        height: 5.8
    },

    constructor: function(config) {
        this.initConfig(config);

        return this;
    },

    eat: function(foodType) {
        alert("I'm eating: " + foodType);

        return this;
    },

    applyScroller: function(scroller) {
        return new Ext.util.Scroller(scroller);
    },

    applyHeight: function(height) {
        return parseFloat(height);
    },

    applyName: function(name) {
        return name || 'Unknown';
    },

    applyGender: function(gender) {
        if (!/^(male|female|gay|lesbian)$/.test(gender)) {
            return 'unknown';
        }

        return gender;
    },

    getAverageIQ: function() {
        return this.self.averageIQ;
    }
});

