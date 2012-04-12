/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.String", function() {

    describe("ellipsis", function() {
        var ellipsis = Ext.String.ellipsis,
            shortString = "A short string",
            longString  = "A somewhat longer string";
        
        it("should keep short strings intact", function() {
            expect(ellipsis(shortString, 100)).toEqual(shortString);
        });
        
        it("should truncate a longer string", function() {
            expect(ellipsis(longString, 10)).toEqual("A somew...");
        });
        
        describe("word break", function() {
            var longStringWithDot  = "www.sencha.com",
                longStringWithExclamationMark = "Yeah!Yeah!Yeah!",
                longStringWithQuestionMark = "Who?When?What?";
                           
            it("should find a word break on ' '", function() {
                expect(ellipsis(longString, 10, true)).toEqual("A...");
            });      
            
            it("should be able to break on '.'", function() {
                expect(ellipsis(longStringWithDot, 9, true)).toEqual("www...");
            });  
            
            it("should be able to break on '!'", function() {
                expect(ellipsis(longStringWithExclamationMark, 9, true)).toEqual("Yeah...");
            }); 
            
            it("should be able to break on '?'", function() {
                expect(ellipsis(longStringWithQuestionMark, 8, true)).toEqual("Who...");
            });       
        });
    });
    
    describe("escapeRegex", function() {
        var str,
            escapeRegex = Ext.String.escapeRegex;
        
        it("should escape minus", function() {
            str = "12 - 175";
            
            expect(escapeRegex(str)).toEqual("12 \\- 175");
        });
        
        it("should escape dot", function() {
            str = "Brian is in the kitchen.";
            
            expect(escapeRegex(str)).toEqual("Brian is in the kitchen\\.");
        });
        
        it("should escape asterisk", function() {
            str = "12 * 175";
            
            expect(escapeRegex(str)).toEqual("12 \\* 175");
        });
        
        it("should escape plus", function() {
            str = "12 + 175";
            
            expect(escapeRegex(str)).toEqual("12 \\+ 175");
        });
        
        it("should escape question mark", function() {
            str = "What else ?";
            
            expect(escapeRegex(str)).toEqual("What else \\?");
        });
        
        it("should escape caret", function() {
            str = "^^";
            
            expect(escapeRegex(str)).toEqual("\\^\\^");
        });
        
        it("should escape dollar", function() {
            str = "500$";
            
            expect(escapeRegex(str)).toEqual("500\\$");
        });
        
        it("should escape open brace", function() {
            str = "something{stupid";
            
            expect(escapeRegex(str)).toEqual("something\\{stupid");
        });
        
        it("should escape close brace", function() {
            str = "something}stupid";
            
            expect(escapeRegex(str)).toEqual("something\\}stupid");
        });
        
        it("should escape open bracket", function() {
            str = "something[stupid";
            
            expect(escapeRegex(str)).toEqual("something\\[stupid");
        });
        
        it("should escape close bracket", function() {
            str = "something]stupid";
            
            expect(escapeRegex(str)).toEqual("something\\]stupid");
        });
        
        it("should escape open parenthesis", function() {
            str = "something(stupid";
            
            expect(escapeRegex(str)).toEqual("something\\(stupid");
        });
        
        it("should escape close parenthesis", function() {
            str = "something)stupid";
            
            expect(escapeRegex(str)).toEqual("something\\)stupid");
        });
        
        it("should escape vertival bar", function() {
            str = "something|stupid";
            
            expect(escapeRegex(str)).toEqual("something\\|stupid");
        });
        
        it("should escape forward slash", function() {
            str = "something/stupid";
            
            expect(escapeRegex(str)).toEqual("something\\/stupid");
        });
        
        it("should escape backslash", function() {
            str = "something\\stupid";
            
            expect(escapeRegex(str)).toEqual("something\\\\stupid");
        });
    });
    
    describe("htmlEncode", function() {
        var htmlEncode = Ext.String.htmlEncode,
            str;
        
        it("should replace ampersands", function() {
            str = "Fish & Chips";
            
            expect(htmlEncode(str)).toEqual("Fish &amp; Chips");
        });
        
        it("should replace less than", function() {
            str = "Fish > Chips";
            
            expect(htmlEncode(str)).toEqual("Fish &gt; Chips");
        });
        
        it("should replace greater than", function() {
            str = "Fish < Chips";
            
            expect(htmlEncode(str)).toEqual("Fish &lt; Chips");
        });
        
        it("should replace double quote", function() {
            str = 'Fish " Chips';
            
            expect(htmlEncode(str)).toEqual("Fish &quot; Chips");
        });
    });
    
    describe("htmlDecode", function() {
        var htmlDecode = Ext.String.htmlDecode,
            str;
        
        it("should replace ampersands", function() {
            str = "Fish &amp; Chips";
            
            expect(htmlDecode(str)).toEqual("Fish & Chips");
        });
        
        it("should replace less than", function() {
            str = "Fish &gt; Chips";
            
            expect(htmlDecode(str)).toEqual("Fish > Chips");
        });
        
        it("should replace greater than", function() {
            str = "Fish &lt; Chips";
            
            expect(htmlDecode(str)).toEqual("Fish < Chips");
        });
        
        it("should replace double quote", function() {
            str = 'Fish &quot; Chips';
            
            expect(htmlDecode(str)).toEqual('Fish " Chips');
        });
    });
    
    describe("escaping", function() {
        var escape = Ext.String.escape;
        
        it("should leave an empty string alone", function() {
            expect(escape('')).toEqual('');
        });
        
        it("should leave a non-empty string without escapable characters alone", function() {
            expect(escape('Ed')).toEqual('Ed');
        });
        
        it("should correctly escape a double backslash", function() {
            expect(escape("\\")).toEqual("\\\\");
        });
        
        it("should correctly escape a single backslash", function() {
            expect(escape('\'')).toEqual('\\\'');
        });
        
        it("should correctly escape a mixture of escape and non-escape characters", function() {
            expect(escape('\'foo\\')).toEqual('\\\'foo\\\\');
        });
    });
    
    describe("formatting", function() {
        var format = Ext.String.format;
        
        it("should leave a string without format parameters alone", function() {
            expect(format('Ed')).toEqual('Ed');
        });
        
        it("should ignore arguments that don't map to format params", function() {
            expect(format("{0} person", 1, 123)).toEqual("1 person");
        });
        
        it("should accept several format parameters", function() {
            expect(format("{0} person {1}", 1, 'came')).toEqual('1 person came');
        });
    });
    
    describe("leftPad", function() {
        var leftPad = Ext.String.leftPad;
        
        it("should pad the left side of an empty string", function() {
            expect(leftPad("", 5)).toEqual("     ");
        });
        
        it("should pad the left side of a non-empty string", function() {
            expect(leftPad("Ed", 5)).toEqual("   Ed");
        });
        
        it("should not pad a string where the character count already exceeds the pad count", function() {
            expect(leftPad("Abraham", 5)).toEqual("Abraham");
        });
        
        it("should allow a custom padding character", function() {
            expect(leftPad("Ed", 5, "0")).toEqual("000Ed");
        });
    });
    
    describe("when toggling between two values", function() {
        var toggle = Ext.String.toggle;
        
        it("should use the first toggle value if the string is not already one of the toggle values", function() {
            expect(toggle("Aaron", "Ed", "Abe")).toEqual("Ed");
        });
        
        it("should toggle to the second toggle value if the string is currently the first", function() {
            expect(toggle("Ed", "Ed", "Abe")).toEqual("Abe");
        });
        
        it("should toggle to the first toggle value if the string is currently the second", function() {
            expect(toggle("Abe", "Ed", "Abe")).toEqual("Ed");
        });
    });
    
    describe("trimming", function() {
        var trim = Ext.String.trim;
        
        it("should not modify an empty string", function() {
            expect(trim("")).toEqual("");
        });
        
        it("should not modify a string with no whitespace", function() {
            expect(trim("Abe")).toEqual("Abe");
        });
        
        it("should trim a whitespace-only string", function() {
            expect(trim("     ")).toEqual("");
        });
        
        it("should trim leading whitespace", function() {
            expect(trim("  Ed")).toEqual("Ed");
        });
        
        it("should trim trailing whitespace", function() {
            expect(trim("Ed   ")).toEqual("Ed");
        });
        
        it("should trim leading and trailing whitespace", function() {
            expect(trim("   Ed  ")).toEqual("Ed");
        });
        
        it("should not trim whitespace between words", function() {
            expect(trim("Fish and chips")).toEqual("Fish and chips");
            expect(trim("   Fish and chips  ")).toEqual("Fish and chips");
        });
        
        it("should trim tabs", function() {
            expect(trim("\tEd")).toEqual("Ed");
        });
        
        it("should trim a mixture of tabs and whitespace", function() {
            expect(trim("\tEd   ")).toEqual("Ed");
        });
    });
    
    describe("urlAppend", function(){
        var urlAppend = Ext.String.urlAppend;
        
        it("should leave the string untouched if the second argument is empty", function(){
            expect(urlAppend('sencha.com')).toEqual('sencha.com');    
        });
        
        it("should append a ? if one doesn't exist", function(){
            expect(urlAppend('sencha.com', 'foo=bar')).toEqual('sencha.com?foo=bar');
        });
        
        it("should append any new values with & if a ? exists", function(){
            expect(urlAppend('sencha.com?x=y', 'foo=bar')).toEqual('sencha.com?x=y&foo=bar');
        });
    });
    
    describe("capitalize", function(){
        var capitalize = Ext.String.capitalize;
        
        it("should handle an empty string", function(){
            expect(capitalize('')).toEqual('');
        });
        
        it("should capitalize the first letter of the string", function(){
            expect(capitalize('open')).toEqual('Open');
        });
        
        it("should leave the first letter capitalized if it is already capitalized", function(){
            expect(capitalize('Closed')).toEqual('Closed');
        });
        
        it("should capitalize a single letter", function(){
            expect(capitalize('a')).toEqual('A');
        });
        
        it("should not capitalize even when spaces are included", function(){
            expect(capitalize('this is a sentence')).toEqual('This is a sentence');
        });
    });
});

