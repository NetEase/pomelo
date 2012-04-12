/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("API", function() {

    var actual = window;
    var expected = {Ext:{core:{Element: function(){} }}},
    Ext = expected.Ext;

    /* Element.static-more.js */ Ext.core.Element.getActiveElement = function getActiveElement(){};
    /* Element.static-more.js */ Ext.core.Element.serializeForm = function serializeForm(){};

    APITest({Ext:expected.Ext}, {Ext:actual.Ext});

});

