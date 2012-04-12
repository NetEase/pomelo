/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.util.Format", function() {
    var num = Ext.util.Format.number,
        usMoney = Ext.util.Format.usMoney,
        currency = Ext.util.Format.currency,
        savedFormatLocale = {
            thousandSeparator: Ext.util.Format.thousandSeparator,
            decimalSeparator: Ext.util.Format.decimalSeparator,
            currencySign: Ext.util.Format.currencySign
        };

    describe("usMoney", function(){
        it("should format with 2 decimals, prefixed by a dollar sign", function() {
            expect(usMoney(1234.567)).toEqual("$1,234.57");
        });
        it("should format with 2 decimals, prefixed by a negative sign, and a dollar sign", function() {
            expect(usMoney(-1234.567)).toEqual("-$1,234.57");
        });
        it("should format with a comma as a thousand separator", function() {
            expect(usMoney(1234567.89)).toEqual("$1,234,567.89");
        });
    });

    describe("currency in FR locale", function(){
        beforeEach(function() {
            Ext.apply(Ext.util.Format, {
                thousandSeparator: '.',
                decimalSeparator: ',',
                currencySign: '\u20ac',
                dateFormat: 'd/m/Y'
            });
        });
        afterEach(function() {
            Ext.apply(Ext.util.Format, savedFormatLocale);
        });

        it("should format with 2 decimals, prefixed by a euro sign", function() {
            expect(currency(1234.567)).toEqual("\u20ac1.234,57");
        });
        it("should format with 2 decimals, prefixed by a negative sign, and a euro sign", function() {
            expect(currency(-1234.567)).toEqual("-\u20ac1.234,57");
        });
    });

    describe("number in default (US) locale", function() {
        it("should format with no decimals", function() {
            expect(num(1, "0")).toEqual("1");
        });
        it("should format with two decimals", function() {
            expect(num(1, "0.00")).toEqual("1.00");
        });
        it("should format+round with two decimals, and no thousand separators", function() {
            expect(num(1234.567, "0.00")).toEqual("1234.57");
        });
        it("should format+round with two decimals, and ',' as the thousand separator", function() {
            expect(num(1234.567, ",0.00")).toEqual("1,234.57");
        });
        it("should format+round with no decimals, and ',' as the thousand separator", function() {
            expect(num(1234.567, ",0")).toEqual("1,235");
        });
    });

    describe("number using FR locale", function() {
        var savedFormatLocale = {
            thousandSeparator: Ext.util.Format.thousandSeparator,
            decimalSeparator: Ext.util.Format.decimalSeparator,
            currencySign: Ext.util.Format.currencySign,
            dateFormat: Ext.util.Format.dateFormat
        };

        beforeEach(function() {
            Ext.apply(Ext.util.Format, {
                thousandSeparator: '.',
                decimalSeparator: ',',
                currencySign: '\u20ac',
                dateFormat: 'd/m/Y'
            });
        });
        afterEach(function() {
            Ext.apply(Ext.util.Format, savedFormatLocale);
        });

        it("should format with no decimals", function() {
            expect(num(1, "0")).toEqual("1");
        });
        it("should format with two decimals", function() {
            expect(num(1, "0.00")).toEqual("1,00");
        });
        it("should format+round with two decimals, and no thousand separators", function() {
            expect(num(1234.567, "0.00")).toEqual("1234,57");
        });
        it("should format+round with two decimals after a ',', and '.' as the thousand separator", function() {
            expect(num(1234.567, ",0.00")).toEqual("1.234,57");
        });
        it("should format+round with no decimals, and '.' as the thousand separator", function() {
            expect(num(1234.567, ",0")).toEqual("1.235");
        });
    });

    // In Ext4, the "/i" suffix allows you to use locale-specific separators in the format string, as opposed
    // to US/UK conventions. Output however ALWAYS follows the local settings in the Format singleton which may
    // be overridden by locale files.
    describe("number using FR locale with /i", function() {
        var savedFormatLocale = {
            thousandSeparator: Ext.util.Format.thousandSeparator,
            decimalSeparator: Ext.util.Format.decimalSeparator,
            currencySign: Ext.util.Format.currencySign,
            dateFormat: Ext.util.Format.dateFormat
        };

        // set up the FR formatting locale
        beforeEach(function() {
            Ext.apply(Ext.util.Format, {
                thousandSeparator: '.',
                decimalSeparator: ',',
                currencySign: '\u20ac',
                dateFormat: 'd/m/Y'
            });
        });
        afterEach(function() {
            Ext.apply(Ext.util.Format, savedFormatLocale);
        });

        // Demonstrate "Incorrect" use with "/i". '.' means thousand separator and ',' means decimal in FR locale.
        // Read carefully. In the formatting strings below, '.' is taken to mean thousand separator, and
        // ',' is taken to mean decimal separator
        it("should format with no decimals", function() {
            expect(num(1, "0.00/i")).toEqual("1");
        });
        it("should format+round with no decimals, and '.' as thousand separator", function() {
            expect(num(1234.567, "0.00/i")).toEqual("1.235");
        });
        it("should format+round with three decimals after a ',', and '.' as the thousand separator", function() {
            expect(num(1234.567, ",0.00/i")).toEqual("1.234,567");
        });
        it("should format+round with one decimal, and no thousand separator", function() {
            expect(num(1234.567, ",0/i")).toEqual("1234,6");
        });

        // Correct usage
        it("should format with two decimals", function() {
            expect(num(1, "0,00/i")).toEqual("1,00");
        });
        it("should format+round with two decimals, and no thousand separators", function() {
            expect(num(1234.567, "0,00/i")).toEqual("1234,57");
        });
        it("should format+round with two decimals after a ',', and '.' as the thousand separator", function() {
            expect(num(1234.567, ".0,00/i")).toEqual("1.234,57");
        });
        it("should format+round with no decimals, and '.' as the thousand separator", function() {
            expect(num(1234.567, ".0/i")).toEqual("1.235");
        });

    });
    
    it("should check for a 0 value before appending negative", function(){
        expect(num(-2.842170943040401e-14, "0,000.00")).toEqual('0.00'); 
    });
    
});

