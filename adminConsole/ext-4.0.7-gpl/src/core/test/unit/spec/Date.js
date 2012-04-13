/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Date", function() {
    var dateSave,
        dateValue = 0,
        increment = 3;
    
    beforeEach(function() {
        dateSave = Date;

        Date = function() {
            return {
                getTime: function() {
                },
                valueOf: function() {
                    dateValue = dateValue + increment;
                    return dateValue;
                }
            };
        };   
    });
    
    afterEach(function() {
        Date = dateSave;
        increment += 16;
    });
    
    it("should get time elapsed in millisecond between date instantiation", function() {
        var dateA = new Date();
        expect(Ext.Date.getElapsed(dateA)).toEqual(3);
    });
    
    it("should get time elapsed in millisecond between two dates", function() {
        var dateA = new Date(),
            dateB = new Date();
        
        expect(Ext.Date.getElapsed(dateA)).toEqual(19);
    });    
});

