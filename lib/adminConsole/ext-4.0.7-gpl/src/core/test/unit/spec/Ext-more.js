/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext-more", function() {
    beforeEach(function() {
        addGlobal("ExtBox1"); 
    });
    describe("Ext.id", function(){
        var el;
        describe("if element passed as first argument is different of document or window", function() {
            beforeEach(function() {
                el = document.createElement("div");
                document.body.appendChild(el);
            });

            afterEach(function(){
                Ext.getBody().dom.removeChild(el);
            });

            it("should generate an unique id for the element with default prefix ext-gen", function() {
                expect(Ext.id(el)).toEqual("ext-gen" + Ext.idSeed);
            });

            it("should generate an unique id for the element with custom prefix", function() {
                var prefix = "nico-yhwh";
                expect(Ext.id(el, prefix)).toEqual(prefix + Ext.idSeed);
            });

            it("should not override existing id", function() {
                var id = "unchanged";
                el.id = id;
                expect(Ext.id(el)).toEqual(id);
            });
        });

        describe("if element passed as first argument is document", function() {
            it("should return Ext.documentId", function() {
                expect(Ext.id(document)).toEqual(Ext.documentId);
            });
        });

        describe("if element passed as first argument is window", function() {
            it("should return Ext.windowId", function() {
                expect(Ext.id(window)).toEqual(Ext.windowId);
            });
        });
    });

    describe("Ext.getBody", function() {
        it("should return current document body as an Ext.Element", function() {
            expect(Ext.getBody()).toEqual(Ext.get(document.body)); 
        });
    });

    describe("Ext.getHead", function() {
        it("should return current document head as an Ext.Element", function() {
            expect(Ext.getHead()).toEqual(Ext.get(document.getElementsByTagName("head")[0]));
        });
    });

    describe("Ext.getDoc", function() {
        it("should return the current HTML document object as an Ext.element", function() {
            expect(Ext.getDoc()).toEqual(Ext.get(document));
        });
    });
    if (Ext.Component) {
        describe("Ext.getCmp", function() {
            it("should return a component", function() {
                var cmp = new Ext.Component({id: 'foobar'});
                expect(Ext.getCmp('foobar')).toBe(cmp);
                cmp.destroy();
            });
        });
    }
    if (!Ext.isWindows && !Ext.isMac && !Ext.isLinux) {
        describe("Ext.getOrientation", function() {
            it("should return the current orientation of the mobile device", function() {
                if (window.innerHeight <= window.innerWidth) {
                    expect(Ext.getOrientation()).toEqual("landscape");
                } else {
                    expect(Ext.getOrientation()).toEqual("portrait");
                }
            });
        });
    }

    describe("Ext.callback", function() {
        var cfn;

        beforeEach(function() {
            cfn = jasmine.createSpy();
        });

        afterEach(function() {
            cfn = undefined; 
        });

        it("should execute the passed function in the specified scope", function() {
            Ext.callback(cfn, fakeScope);
            expect(cfn.calls[0].object).toBe(fakeScope);
        });

        it("should pass arguments to the callback function", function() {
            Ext.callback(cfn, fakeScope, [1, 2, 3, 4, 6]);
            expect(cfn).toHaveBeenCalledWith(1, 2, 3, 4,6); 
        });

        it("should be able to defer function call", function() {
            runs(function() {
                Ext.callback(cfn, fakeScope, [1, 2, 3, 4, 6], 1);
                expect(cfn).not.toHaveBeenCalled();
            });
            waits(1);
            runs(function() {
                expect(cfn).toHaveBeenCalledWith(1, 2, 3, 4, 6);
                expect(cfn.calls[0].object).toBe(fakeScope);
            });

        });
    });

    describe("Ext.destroy", function() {
        var o1, o2, o3;

        beforeEach(function() {
            o1 = jasmine.createSpyObj("o1", ["destroy"]);

            o2 = jasmine.createSpyObj("o2", ["destroy"]);

            o3 = jasmine.createSpyObj("o3", ["dest"]);

        });

        it("should destroy an object", function() {
            Ext.destroy(o1);

            expect(o1.destroy).toHaveBeenCalled();
        });

        it("should no destroy an object without a destroy method", function() {
            Ext.destroy(o3);

            expect(o3.dest).not.toHaveBeenCalled();
        });

        it("should destroy an array of objects", function() {
            Ext.destroy([o1, o2, o3]);

            expect(o1.destroy).toHaveBeenCalled();
            expect(o2.destroy).toHaveBeenCalled();
            expect(o3.dest).not.toHaveBeenCalled();
        });

        it("should destroy multiple objects", function() {
            Ext.destroy(o1, o2, o3);

            expect(o1.destroy).toHaveBeenCalled();
            expect(o2.destroy).toHaveBeenCalled();
            expect(o3.dest).not.toHaveBeenCalled();
        });

        it("should remove dom if object is an Ext.element", function() {
            var el = Ext.getBody().createChild({id: "to_destroy"});

            Ext.destroy(el);

            expect(Ext.fly("to_destroy")).toBeNull();
        });
    });

    describe("Ext.htmlEncode", function() {
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

    describe("Ext.htmlEncode", function() {
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

    describe("Ext.urlAppend", function() {
        var url = "http://example.com/";

        it("should manage question mark", function() {
            expect(Ext.urlAppend(url, "test=1")).toEqual("http://example.com/?test=1");
        });

        it("should manage ampersand", function() {
            expect(Ext.urlAppend(url + "?test=1","foo=2")).toEqual("http://example.com/?test=1&foo=2");
        });

        it("should return directly url if content is empty", function() {
            expect(Ext.urlAppend(url)).toEqual(url);
        });
    });

    describe("Ext.getDom", function() {
        var el1;

        beforeEach(function() {
            el1 = Ext.getBody().createChild({id: "elone"});
        });

        afterEach(function() {
            el1.remove();
        });

        it("should return a dom element if an Ext.element is passed as first argument", function() {
            expect(Ext.getDom(el1)).toEqual(el1.dom);
        });

        it("should return a dom element if the string (id) passed as first argument", function() {
            expect(Ext.getDom("elone")).toEqual(el1.dom);
        });
    });

    describe("Ext.removeNode", function(){
        describe("if passed element isn't body", function() {
            var el, id;
            beforeEach(function() {
                el = Ext.getBody().createChild({
                    tag: 'span',
                    html: 'foobar'
                });
                id = el.id;
            });

            it("should remove a dom element from document", function(){
                Ext.removeNode(el.dom);
               if (!Ext.isIE) {
                    expect(el.dom.parentNode).toBe(null);
               } else {
                   expect(el.dom.parentNode.innerHTML).toBe(undefined);
               }
            });

            it("should delete the cache reference", function() {
                Ext.removeNode(el.dom);
                expect(Ext.cache[id]).toBeUndefined();
            });
            if (!Ext.isIE6 && !Ext.isIE7) {
                it("should remove all listeners from the dom element", function() {
                        var listener = jasmine.createSpy();
                        el.on('mouseup', listener);
                        Ext.removeNode(el.dom);
                        jasmine.fireMouseEvent(el.dom, 'mouseup');
                        expect(listener).not.toHaveBeenCalled();

                });
            }
        });

        describe("if passed element is body", function() {
            it("should not delete the cache reference", function() {
                Ext.removeNode(document.body);
                expect(Ext.cache[Ext.getBody().id]).toBeDefined();
            });

            it("should not remove listeners from body", function() {
                var listener = jasmine.createSpy();
                Ext.getBody().on('mouseup', listener);
                Ext.removeNode(document.body);
                jasmine.fireMouseEvent(document.body, 'mouseup');
                expect(listener).toHaveBeenCalled();
                Ext.getBody().un('mouseup', listener);
            });
        });
        
        if (!Ext.isIE6 && !Ext.isIE7) {
            describe("if enableNestedListenerRemoval is true", function() {
                var el, child;

                beforeEach(function(){
                    Ext.enableNestedListenerRemoval = true;
                    el = Ext.getBody().createChild();
                    child = el.createChild();
                });

                afterEach(function(){
                    Ext.enableNestedListenerRemoval = false;
                });

                    it("should remove listener on children", function() {
                        var listener = jasmine.createSpy();
                        child.on('mouseup', listener); 
                        Ext.removeNode(el.dom);
                        jasmine.fireMouseEvent(child.dom, 'mouseup');
                        expect(listener).not.toHaveBeenCalled();
                    });


            });
        }
        if (!Ext.isIE6 && !Ext.isIE7) {
            describe("if enableNestedListenerRemoval is false (default)", function() {
                var el, child;

                beforeEach(function(){
                    el = Ext.getBody().createChild();
                    child = el.createChild();
                });

                it("should not remove listener on children", function() {
                    var listener = jasmine.createSpy();
                    child.on('mouseup', listener); 
                    Ext.removeNode(el.dom);
                    jasmine.fireMouseEvent(child.dom, 'mouseup');
                    expect(listener).toHaveBeenCalled();
                    Ext.EventManager.purgeElement(child.dom);
                });
            });
        }
    });

    describe("Ext.addBehaviors", function() {
        var listener, span1, span2, div1;

        beforeEach(function() {
            span1 = Ext.getBody().createChild({
                tag: 'span' 
            });

            span2 = Ext.getBody().createChild({
                tag: 'span'
            });

            div1 = Ext.getBody().createChild({
                cls: 'foo'
            });

            listener = jasmine.createSpy();
        });

        afterEach(function() {
            span1.remove();
            span2.remove();
            div1.remove();
        });

        it("should apply event listeners to elements by selectors", function() {
            Ext.addBehaviors({
                'span @mouseup': listener
            });

            jasmine.fireMouseEvent(span1.dom, 'mouseup');
            jasmine.fireMouseEvent(span2.dom, 'mouseup');
            jasmine.fireMouseEvent(div1.dom, 'mouseup');

            expect(listener.calls.length).toEqual(2);

        });

        it("should manage multiple selectors", function() {
            Ext.addBehaviors({
                'span, div.foo @mouseup': listener
            });

            jasmine.fireMouseEvent(span1.dom, 'mouseup');
            jasmine.fireMouseEvent(span2.dom, 'mouseup');
            jasmine.fireMouseEvent(div1.dom, 'mouseup');

            expect(listener.calls.length).toEqual(3);

        });
    });

    describe("Ext.getScrollBarWidth", function() {
        it("should return a number between 10 and 40 (we assume that document is loaded)", function() {
            expect(Ext.getScrollBarWidth() > 10).toBe(true);
            expect(Ext.getScrollBarWidth() < 40).toBe(true);
        }); 
    });

    describe("Ext.copyTo", function(){
        var src, dest;

        beforeEach(function() {
            src = {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            };

            dest = {};
        });

        afterEach(function(){
            src = null;
            dest = null;
        });

        describe("with an array of named properties", function() {
            it("should copy a set of named properties fom the source object to the destination object.", function() {
                Ext.copyTo(dest, src, ['a', 'b', 'e']);

                expect(dest).toEqual({
                    a: 1,
                    b: 2 
                });
            });
        });

        describe("with a string list of named properties", function() {
            it("should copy a set of named properties fom the source object to the destination object.", function() {
                Ext.copyTo(dest, src, 'c,b,e');
                expect(dest).toEqual({
                    b: 2,
                    c: 3 
                });
            });
        });
    });

    describe("Ext.destroyMembers", function() {
        var obj, destroyable;

        beforeEach(function(){
            destroyable = {
                destroy: jasmine.createSpy()
            };
            obj = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                me : destroyable
            };
        });

        it("should remove named properties from a passed object", function() {
            Ext.destroyMembers(obj, 'a', 'c', 'i');
            expect(obj).toEqual({
                b: 2,
                d: 4,
                me: destroyable
            });
        });

        it("should attempt to destroy passed properties", function() {
            Ext.destroyMembers(obj, 'a', 'c', 'me');

            expect(destroyable.destroy).toHaveBeenCalled();
        });
    });

    describe("Ext.partition", function() {
        describe("with an array of boolean", function() {
            it("should partition the set into two sets: a true and a false set", function() {
                expect(Ext.partition([true, true, false, false, true])).toEqual([[true,true,true], [false,false]]);
            });
        });
        
        describe("with an array to partition and a function to determine truth", function() {
            it("should partition the set into two sets: a true and a false set", function() {
                var array = [
                    'a',
                    'b',
                    'c',
                    'a'
                ];
                 expect(Ext.partition(array, function(item){
                        return item == "a";
                })).toEqual([
                    ['a', 'a'], 
                    ['b', 'c']
                ]);
            });
        });
        
        describe("with a NodeList to partition and a function to determine truth", function() {
            it("should partition the set into two sets: a true and a false set", function() {
                var p = [];
                
                p[0] = Ext.getBody().createChild({
                    tag: "p",
                    cls: "class1"
                });
                p[1] = Ext.getBody().createChild({
                    tag: "p",
                    cls: "class2"
                });
                p[2] = Ext.getBody().createChild({
                    tag: "p",
                    cls: "class1"
                });
                p[3] = Ext.getBody().createChild({
                    tag: "p",
                    cls: "class4"
                });
                p[4] = Ext.getBody().createChild({
                    tag: "p",
                    cls: "class5"
                });
                p[5] = Ext.getBody().createChild({
                    tag: "p",
                    cls: "class1"
                });                    
                
                expect(Ext.partition(Ext.query("p"), function(val){
                        return val.className == "class1";
                })).toEqual([
                    [p[0].dom, p[2].dom, p[5].dom], 
                    [p[1].dom, p[3].dom, p[4].dom]
                ]);
                
                Ext.Array.each(p, function(el) {
                    el.remove();
                });
            });
        });
    });
});

