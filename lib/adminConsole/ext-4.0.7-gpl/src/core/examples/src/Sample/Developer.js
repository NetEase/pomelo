/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('Sample.Developer', {
    extend: 'Sample.Person',

    statics: {
        averageIQ: 120
    },

    config: {
        languages: ['JavaScript', 'C++', 'Python']
    },

    constructor: function(config) {
        this.isGeek = true;

        // Apply a method from the parent class' prototype
        return this.callParent(arguments);
    },

    canCode: function(language) {
        return Ext.Array.contains(this.getLanguages(), language);
    },

    code: function(language) {
        if (!this.canCode(language)) {
            alert("I can't code in: " + language);

            return this;
        }

        alert("I'm coding in: " + language);

        this.eat("Bugs");

        return this;
    },

    clone: function() {
        var self = this.statics(),
            cloned = new self(this.config);

        return cloned;
    }
});

