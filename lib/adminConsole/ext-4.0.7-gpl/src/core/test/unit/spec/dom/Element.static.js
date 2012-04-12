/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Element.static", function() {
    var proto = Ext.Element,
        el, testEl,
        input, testInputEl,
        child1, child2, child3;
    
    beforeEach(function() {
        testEl = Ext.getBody().createChild({
            id      : 'ExtElementHelper',
            style   : 'position:absolute;',
            children: [
                {id: 'child1', style: 'position:absolute;'},
                {id: 'child2', style: 'position:absolute;'},
                {id: 'child3', style: 'position:absolute;'}
            ]
        });
        
        testInputEl = Ext.getBody().createChild({
            id  : 'ExtElementInputHelper',
            tag : 'input',
            type: 'text'
        });
        
        el    = new Ext.Element(Ext.getDom(testEl));
        input = new Ext.Element(Ext.getDom(testInputEl));
        
        child1 = Ext.get('child1');
        child2 = Ext.get('child2');
        child3 = Ext.get('child3');
    });
    
    afterEach(function() {
        testEl.remove();
        testInputEl.remove();
    });
    
    it("should have a defaultUnit", function() {
        expect(proto.defaultUnit).toEqual('px');
    });
    
    describe("addUnits", function() {
        it("should add the defualt unit", function() {
            expect(proto.addUnits(10)).toEqual('10px');
        });
        
        it("should not add the defualt unit", function() {
            expect(proto.addUnits('10px')).toEqual('10px');
        });
    });
    
    describe("parseBox", function() {
        describe("number", function() {
            describe("when 1 argument", function() {
                it("should return an object with correct values", function() {
                    expect(proto.parseBox(10)).toEqual({
                        top   : 10,
                        right : 10,
                        bottom: 10,
                        left  : 10
                    });
                });
            });
        });
        
        describe("string", function() {
            describe("when 1 argument", function() {
                it("should return an object with correct values", function() {
                    expect(proto.parseBox("10")).toEqual({
                        top   : 10,
                        right : 10,
                        bottom: 10,
                        left  : 10
                    });
                });
            });
            
            describe("when 2 arguments", function() {
                it("should return an object with correct values", function() {
                    expect(proto.parseBox("10 5")).toEqual({
                        top   : 10,
                        right : 5,
                        bottom: 10,
                        left  : 5
                    });
                });
            });
            
            describe("when 3 arguments", function() {
                it("should return an object with correct values", function() {
                    expect(proto.parseBox("10 5 10")).toEqual({
                        top   : 10,
                        right : 5,
                        bottom: 10,
                        left  : 5
                    });
                });
            });
            
            describe("when 4 arguments", function() {
                it("should return an object with correct values", function() {
                    expect(proto.parseBox("10 5 15 0")).toEqual({
                        top   : 10,
                        right : 5,
                        bottom: 15,
                        left  : 0
                    });
                });
            });
        });
    });
    
    describe("unitizeBox", function() {
        it("should return a string", function() {
            expect(proto.unitizeBox('10 5 15 0')).toEqual('10px 5px 15px 0px');
        });
    });
    
    describe("normalize", function() {
        it("should change border-radius > borderRadius", function() {
            expect(proto.normalize('border-radius')).toEqual('borderRadius');
        });
    });
    
    describe("getDocumentHeight", function() {
        it("should return the document height", function() {
            var result = proto.getDocumentHeight();
            
            expect(result).toBeDefined();
            expect(Ext.isNumber(result)).toBeTruthy();
        });
    });
    
    describe("getDocumentWidth", function() {
        it("should return the document width", function() {
            var result = proto.getDocumentWidth();
            
            expect(result).toBeDefined();
            expect(Ext.isNumber(result)).toBeTruthy();
        });
    });
    
    describe("getViewportHeight", function() {
        it("should return the window height", function() {
            var result = proto.getViewportHeight();
            
            expect(result).toBeDefined();
            expect(Ext.isNumber(result)).toBeTruthy();
        });
    });
    
    describe("getViewportWidth", function() {
        it("should return the window width", function() {
            var result = proto.getViewportWidth();
            
            expect(result).toBeDefined();
            expect(Ext.isNumber(result)).toBeTruthy();
        });
    });
    
    describe("getViewSize", function() {
        it("should return the window height and width", function() {
            expect(proto.getViewSize()).toEqual({
                width : window.innerWidth,
                height: window.innerHeight
            });
        });
    });
    
    describe("getOrientation", function() {
        it("should return the correct orientation", function() {
            expect(proto.getOrientation()).toEqual((window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape');
        });
    });
    
    if (!Ext.isSafari3 && !Ext.isSafari4) {
        describe("fromPoint", function() {
            it("should return nothing", function() {
                    expect(proto.fromPoint(-550000, -550000)).toBeNull();
            });
        });
    }
}, "/src/dom/Element.static.js");

