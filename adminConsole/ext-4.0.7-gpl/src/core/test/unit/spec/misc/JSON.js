/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.JSON", function() {
    var nativeJson;

    beforeEach(function() {
        nativeJson = Ext.USE_NATIVE_JSON;
        Ext.USE_NATIVE_JSON = false;

    });

    afterEach(function() {
        Ext.USE_NATIVE_JSON = nativeJson;
    });

    describe("encode", function() {
        var encode = Ext.JSON.encode;

        describe("numbers encoding", function() {
            it("should convert integer to string", function() {
                expect(encode(15)).toEqual("15");
            });

            it("should convert float to string", function() {
                expect(encode(14.7)).toEqual("14.7");
            });

            it("should convert Infinity to null string", function() {
                expect(encode(Infinity)).toEqual("null");
            });

            it("should convert NaN to null string", function() {
                expect(encode(NaN)).toEqual("null");
            });
        });

        describe("encoding of not defined values", function() {
            it("should convert undefined to null string", function() {
                expect(encode(undefined)).toEqual("null");
            });

            it("should convert null to null string", function() {
                expect(encode(null)).toEqual("null");
            });
        });

        describe("encoding function", function() {
            it("should convert function to null string", function() {
                expect(encode(Ext.emptyFn)).toEqual("null");
            });
        });

        describe("boolean encoding", function() {
            it("should convert true to 'true'' string", function() {
                expect(encode(true)).toEqual("true");
            });

            it("should convert null to 'false' string", function() {
                expect(encode(false)).toEqual("false");
            });
        });

        describe("array encoding", function() {
            it("should convert empty array", function() {
                expect(encode([])).toEqual("[]");
            });
            
            it("should convert array of numbers to string", function() {
                expect(encode([1, 2, 3])).toEqual("[1,2,3]");
            });

            it("should convert array of strings to string", function() {
                expect(encode(["a", "b", "c"])).toEqual("[\"a\",\"b\",\"c\"]");
            });

            it("should encode array including function member to string", function() {
                expect(encode([1, Ext.emptyFn, 3])).toEqual("[1,null,3]");
            });

            it("should convert array including undefined member to string", function() {
                expect(encode([1, undefined, 3])).toEqual("[1,null,3]");
            });

            it("should convert array including null member to string", function() {
                expect(encode([1, null, 3])).toEqual("[1,null,3]");
            });
        });

        describe("string encoding", function() {
            it("should convert string", function() {
                expect(encode("You're fired!")).toEqual("\"You're fired!\"");
            });

            it("should convert string with international character", function() {
                expect(encode("You're fired!")).toEqual("\"You're fired!\"");
            });

            it("should convert string with tab character", function() {
                expect(encode("a\tb")).toEqual("\"a\\tb\"");
            });

            it("should convert string with carriage return character", function() {
                expect(encode("a\rb")).toEqual("\"a\\rb\"");
            });

            it("should convert string with form feed character", function() {
                expect(encode("a\fb")).toEqual("\"a\\fb\"");
            });

            it("should convert string with new line character", function() {
                expect(encode("a\nb")).toEqual("\"a\\nb\"");
            });

            it("should convert string with vertical tab character", function() {
                expect(encode("a\x0bb")).toEqual("\"a\\u000bb\"");
            });

            it("should convert string with backslash character", function() {
                expect(encode("a\\b")).toEqual("\"a\\\\b\"");
            });
        });

        describe("object encoding", function() {
            it("should convert empty object", function() {
                expect(encode({})).toEqual("{}");
            });
            
            it("should convert empty object with undefined property", function() {
                expect(encode({
                    foo: "bar",
                    bar: undefined
                })).toEqual("{\"foo\":\"bar\",\"bar\":null}");
            });
            
            it("should convert empty object with null property", function() {
                expect(encode({
                    foo: "bar",
                    bar: null
                })).toEqual("{\"foo\":\"bar\",\"bar\":null}");
            });
            
            it("should convert empty object with function property", function() {
                expect(encode({
                    foo: "bar",
                    bar: Ext.emptyFn
                })).toEqual("{\"foo\":\"bar\",\"bar\":null}");
            });
            
            it("should not encode dom object", function() {
               expect(encode(Ext.getBody().dom)).toBe('undefined');
            });
            
            it("should handle encoding unknown child objects", function(){
                expect(encode({
                    prop: Ext.getBody().dom
                })).toBe('{"prop":undefined}');
            });
        });

        describe('encodeDate', function() {
            var date;
            
            it("should encode a date object", function() {
                date = new Date("October 13, 1983 04:04:00");
    
                expect(encode(date)).toEqual("\"1983-10-13T04:04:00\"");
            });
            
            it("should format integers to have at least two digits", function() {
                date = new Date("August 9, 1983 06:03:02");
                
                expect(encode(date)).toEqual("\"1983-08-09T06:03:02\"");            
            });
        });
        
        describe("mix all possibilities", function() {
            it("should encode data", function() {
                 expect(encode({
                    arr: [1, Ext.emptyFn, undefined, 2, [1, 2, 3], {a: 1, b: null}],
                    foo: "bar",
                    woo: {
                        chu: "a\tb"
                    }
                 })).toEqual("{\"arr\":[1,null,null,2,[1,2,3],{\"a\":1,\"b\":null}],\"foo\":\"bar\",\"woo\":{\"chu\":\"a\\tb\"}}");
            });
        });
    });

    describe("decode", function() {
        it("should decode data", function() {
            expect(Ext.decode("{\"arr\":[1,null,null,2,[1,2,3],{\"a\":1,\"b\":null}],\"foo\":\"bar\",\"woo\":{\"chu\":\"a\\tb\"}}")).toEqual({
                    arr: [1, null, null, 2, [1, 2, 3], {a: 1, b: null}],
                    foo: "bar",
                    woo: {
                        chu: "a\tb"
                    }            
            });
        });
        
        it("should raise an Ext.Error with invalid data", function() {
            expect(function(){
                Ext.decode('{foo:"bar", x}');
            }).toRaiseExtError();
        });
            
        describe("with safe param", function(){
            it("should decode valid data", function() {
                expect(Ext.decode("{\"foo\":\"bar\"}", true)).toEqual({
                    foo: "bar"        
                });
            });
            
            it("should return null with invalid data", function() {
                expect(Ext.decode('{foo+"bar"}', true)).toBeNull();
            });
        });
    });
    
    it('should encode and decode an object', function(){
        var object = {
            a: [0, 1, 2],
            s: "It's-me-Jacky!!",
            ss: "!@#$%^&*()~=_-+][{};:?/.,<>'\"",
            u: '\x01',
            i: 1,
            f: 3.14,
            b: false,
            n: null,
            tree: {
                sub: {
                    subMore: {
                        subEvenMore: {
                            arr: [5,6,7, {
                                complex: true
                            }]
                        }
                    }
                }
            }
        };

        expect(Ext.JSON.decode(Ext.JSON.encode(object))).toEqual(object);
    });
    
    describe("aliases", function() {
        it("should alias Ext.JSON.decode with Ext.decode", function() {
            expect(Ext.decode).toBe(Ext.JSON.decode);
        });

        it("should alias Ext.JSON.encode with Ext.encode", function() {
            expect(Ext.encode).toBe(Ext.JSON.encode);
        });
    });
});

