/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Element", function() {
    var domEl,
        element;
        
    afterEach(function() {
        if (element) {
            element.remove();
        }

        if (domEl && domEl.parentNode === document.body) {
            document.body.removeChild(domEl);
        }
    });
    
    describe("instantiation", function() {
        beforeEach(function() {
            domEl = document.createElement("div");
            Ext.getBody().appendChild(domEl);
        });
        

        
        it("should set dom element id if it hasn't already one", function() {
            element = new Ext.Element(domEl);

            expect(domEl.id).toBeDefined();
        });

        it("should not set dom element id if it has already one", function() {
            var id = Ext.id();

            domEl.id = id;
            element = new Ext.Element(domEl);

            expect(domEl.id).toEqual(id);
        });

        it("should set dom property to dom element", function() {
            element = new Ext.Element(domEl);

            expect(element.dom).toBe(domEl);
        });

        it("should set id property to dom id", function() {
            var id = Ext.id();

            domEl.id = id;
            element = new Ext.Element(domEl);

            expect(element.id).toEqual(id);
        });

        it("should not set dom or id property if first argument is undefined", function() {
            element = new Ext.Element();

            expect(element.id).toBeUndefined();
            expect(element.dom).toBeUndefined();
        });

        it("should find a dom element if a string corresponding to it's id is passed as first argument", function() {
            var id = Ext.id();

            domEl.id = id;

            element = new Ext.Element(id);

            expect(element.dom).toBe(domEl);
        });
    });

    describe("methods", function() {
        beforeEach(function() {
            element = Ext.getBody().createChild({tag: "div"});
            domEl = element.dom;
        });

        describe("set", function() {
            it("should call Ext.DomHelper.applyStyles if object passed as first argument has style property", function() {
                var style = {width:'100px'};

                spyOn(Ext.DomHelper, "applyStyles");

                element.set({style: style});

                expect(Ext.DomHelper.applyStyles).toHaveBeenCalledWith(element.dom, style);
            });

            it("should set dom element className if object passed as first argument has cls property", function() {
                var cls = "x-test-class";

                element.set({cls: cls});

                expect(element.dom.className).toEqual(cls);
            });

            it("should use setAttribute by default", function() {
                spyOn(element.dom, "setAttribute");

                element.set({align: "center"});

                expect(element.dom.setAttribute).toHaveBeenCalledWith("align", "center");
            });

            it("should be able to use expandos", function() {
                spyOn(element.dom, "setAttribute");

                element.set({align: "center"}, false);


                expect(element.dom.align).toEqual("center");
            });

        });

        describe("is", function() {
            it("Returns true if this element matches the passed simple selector", function() {
                element.set({cls: "x-test-class"});

                expect(element.is("div.x-test-class")).toBe(true);
            });
        });

        describe("focus", function() {
            it("should focus dom element", function() {
                spyOn(element.dom, "focus");

                element.focus();

                expect(element.dom.focus).toHaveBeenCalled();
            });

            it("should be able to defer dom element focus", function() {
                spyOn(element.dom, "focus");
                element.focus(1);

                waitsFor(function(){
                    return element.dom.focus.calls.length === 1;
                }, "element.dom.focus was never called");

                runs(function() {
                    expect(element.dom.focus).toHaveBeenCalled();
                });
            });

            it("should ignore any exception", function() {
                element.dom.focus = function() {
                    throw "error";
                };

                expect(element.focus).not.toThrow("error");
            });
        });

        describe("blur", function() {
            it("should blur dom element", function() {
                spyOn(element.dom, "blur");

                element.blur();

                expect(element.dom.blur).toHaveBeenCalled();
            });


            it("should ignore any exception", function() {
                element.dom.blur = function() {
                    throw "error";
                };

                expect(element.blur).not.toThrow("error");
            });
        });

        describe("getValue", function() {
            beforeEach(function() {
                element.dom.value = "10";
            });

            it("should return the dom value", function() {
                expect(element.getValue()).toEqual("10");
            });

            it("should return the dom value as Number", function() {
                expect(element.getValue(true)).toEqual(10);
            });
        });

        describe("listeners", function() {
            var options;

            beforeEach(function() {
                options = {delay: 10};
            });

            describe("addListener", function() {
                it("should call Ext.EventManager.on", function() {
                    spyOn(Ext.EventManager, "on");

                    element.addListener("click", Ext.emptyFn, fakeScope, options);

                    expect(Ext.EventManager.on).toHaveBeenCalledWith(element.dom, "click", Ext.emptyFn, fakeScope, options);
                });
            });

            describe("removeListener", function() {
                it("should call Ext.EventManager.un", function() {
                    spyOn(Ext.EventManager, "un");

                    element.removeListener("click", Ext.emptyFn, fakeScope);

                    expect(Ext.EventManager.un).toHaveBeenCalledWith(element.dom, "click", Ext.emptyFn, fakeScope);
                });
            });

            describe("removeAllListener", function() {
                it("should call Ext.EventManager.removeAll", function() {
                    spyOn(Ext.EventManager, "removeAll");

                    element.removeAllListeners();

                    expect(Ext.EventManager.removeAll).toHaveBeenCalledWith(element.dom);
                });
            });

            describe("purgeAllListener", function() {
                it("should call Ext.EventManager.purgeElement", function() {
                    spyOn(Ext.EventManager, "purgeElement");

                    element.purgeAllListeners();

                    expect(Ext.EventManager.purgeElement).toHaveBeenCalledWith(element);
                });
            });
        });
        
        describe("addUnits", function() {
            it("should return an empty string if size passed is an empty string", function() {
                expect(element.addUnits("")).toEqual("");
            });

            it("should return auto if size passed is 'auto' string", function() {
                expect(element.addUnits("auto")).toEqual("auto");
            });

            it("should return an empty string if size passed is undefined", function() {
                expect(element.addUnits(undefined)).toEqual("");
            });

            it("should return an empty string if size passed is null", function() {
                expect(element.addUnits(null)).toEqual("");
            });
        });

        describe("remove", function() {
            beforeEach(function() {
                spyOn(Ext, "removeNode").andCallThrough();
                element.remove();
            });

            it("should remove dom property", function() {
                expect(element.dom).toBeUndefined();
            });

            it("should call Ext.removeNode", function() {
                expect(Ext.removeNode).toHaveBeenCalledWith(domEl);
            });
        });

        describe("hover", function() {
            var overFn, outFn, options;
            beforeEach(function() {
                overFn = function() {
                    return 1;
                };

                outFn = function() {
                    return 2;
                };

                options = {
                    foo: true
                };

                spyOn(element, "on");
            });

            describe("mouseenter event", function() {
                it("should add a listener on mouseenter", function() {
                    element.hover(overFn, outFn, fakeScope, options);

                    expect(element.on).toHaveBeenCalledWith("mouseenter", overFn, fakeScope, options);
                });

                it("should set scope to element.dom if it is not passed in arguments", function() {
                    element.hover(overFn, outFn, null, options);

                    expect(element.on).toHaveBeenCalledWith("mouseenter", overFn, element.dom, options);
                });
            });

            describe("mouseleave event", function() {
                it("should add a listener on mouseleave", function() {
                    element.hover(overFn, outFn, fakeScope, options);

                    expect(element.on).toHaveBeenCalledWith("mouseleave", outFn, fakeScope, options);
                });

                it("should set scope to element.dom if it is not passed in arguments", function() {
                    element.hover(overFn, outFn, null, options);

                    expect(element.on).toHaveBeenCalledWith("mouseleave", outFn, element.dom, options);
                });
            });
        });

        describe("contains", function() {
            /*
             * TODO: Removed tests for now, need to reinstate once the refactoring is done.
             */
        });

        describe("getAttributeNs", function() {
            it("should call element getAttribute", function() {
                spyOn(element, "getAttribute");

                element.getAttributeNS("ns1", "align");

                expect(element.getAttribute).toHaveBeenCalledWith("align", "ns1");
            });
        });

        describe("getAttribute", function() {
            var element2, element3;
            beforeEach(function() {
                element2 = Ext.getBody().createChild({tag: "div"});
                

                if (element.dom.setAttribute) {
                    element.dom.setAttribute("qtip", "bar");
                    element2.dom.setAttribute("ext:qtip", "foo");
                } else {
                    element.dom["qtip"] = "bar";
                    element2.dom["ext:qtip"] = "foo";               
                }

                if (element.dom.setAttributeNS) {
                    element3 = Ext.getBody().createChild({tag: "div"});
                    element3.dom.setAttributeNS("ext", "qtip", "foobar");
                }
            });
            
            afterEach(function() {
                if (element2) {
                    element2.remove();
                }
                
                if (element3) {
                    element3.remove();
                }
            });
            
            describe("without namespace", function() {
                it("should return the attribute value if it exists", function() {
                    expect(element.getAttribute("qtip")).toEqual("bar");
                });

                it("should return null if the attribute does not exist", function() {
                    expect(element.getAttribute("nothing")).toBeNull();
                });
            });

            describe("with namespace", function() {
                it("should return null on a non-namespaced attribute", function() {
                    expect(element.getAttribute("qtip", "ext")).toBeNull();
                });

                it("should return null if the attribute belong to another namespace", function() {
                    expect(element2.getAttribute("qtip", "nothing")).toBeNull();
                });

                it("should return the attribute value if it belongs to the namespace", function() {
                    if (element3) {
                        expect(element3.getAttribute("qtip", "ext")).toEqual("foobar");
                    }
                });
                
                it("should handle xml namespace", function() {
                    expect(element2.getAttribute("qtip", "ext")).toEqual("foo");
                });
            });
        });

        describe("update", function() {
            beforeEach(function() {
                element.dom.innerHTML = "hello world";
            });

            it("should update dom element innerHTML", function() {
                element.update("foobar");

                expect(element.dom).hasHTML("foobar");
            });

            it("should return element", function() {
                expect(element.update("foobar")).toBe(element);
            });
        });

        describe("prototype aliases", function() {
            it("should aliases addListener with on", function() {
                expect(element.on).toBe(element.addListener);
            });

            it("should aliases removeListener with un", function() {
                expect(element.un).toBe(element.removeListener);
            });

            it("should aliases removeAllListeners with clearListeners", function() {
                expect(element.clearListeners).toBe(element.removeAllListeners);
            });
        });
    });

    describe("class methods", function() {
        var element2, domEl2, id;

        beforeEach(function() {
            element = Ext.getBody().createChild({tag: "div"});
            domEl = element.dom;

            id = Ext.id();
            domEl2 = document.createElement("div");
            domEl2.id = id;
            document.body.appendChild(domEl2);

            spyOn(Ext.Element, "addToCache").andCallThrough();
        });

        afterEach(function() {
            if (element2) {
                element2.remove();
            }
            if (domEl2 && domEl2.parentNode === document.body) {
                document.body.removeChild(domEl2);
            }
        });
        
        describe("get", function() {
            describe("alias", function() {
                it("should alias Ext.Element.get with Ext.get", function() {
                    expect(Ext.get).toBe(Ext.Element.get);
                });
            });

            describe("passing string id as first argument", function() {
                describe("with a dom element which is not already encapsulated", function() {
                    it("should return a new Ext.Element", function() {
                        element2 = Ext.get(id);

                        expect(element2 instanceof Ext.Element).toBe(true);
                    });

                    it("should encapsulate the dom element in the Ext.Element", function() {
                        element2 = Ext.get(id);

                        expect(element2.dom).toBe(domEl2);
                    });

                    it("should add element to Ext.cache", function() {
                        element2 = Ext.get(id);
         
                        expect(Ext.Element.addToCache).toHaveBeenCalledWith(element2);
                    });
                });

                describe("with a dom element which is already encapsulated", function() {
                    it("should return the corresponding Ext.element", function() {
                        expect(Ext.get(domEl)).toBe(element);
                    });

                    it("should not add element to Ext.cache if it is already in", function() {
                        Ext.get(domEl);

                        expect(Ext.Element.addToCache).not.toHaveBeenCalled();
                    });
                });
            });

            describe("passing dom element as first argument", function() {
                describe("with a dom element which is not already encapsulated", function() {
                    it("should return a new Ext.Element", function() {
                        element2 = Ext.get(domEl2);

                        expect(element2 instanceof Ext.Element).toBe(true);
                    });

                    it("should encapsulate the dom element in the Ext.Element", function() {
                        element2 = Ext.get(domEl2);

                        expect(element2.dom).toBe(domEl2);
                    });

                    it("should add element to Ext.cache", function() {
                        element2 = Ext.get(domEl2);

                        expect(Ext.Element.addToCache).toHaveBeenCalledWith(element2);
                    });
                });

                describe("with a dom element which is already encapsulated", function() {
                    it("should return the corresponding Ext.element", function() {
                        expect(Ext.get(domEl.id)).toBe(element);
                    });

                    it("should not add element to Ext.cache if it is already in", function() {
                        Ext.get(domEl.id);

                        expect(Ext.Element.addToCache).not.toHaveBeenCalled();
                    });
                });
            });

            describe("passing an Ext.Element as first argument", function() {
                it("should return Ext.Element", function() {
                    expect(Ext.get(element)).toBe(element);
                });
            });

            describe("passing a CompositeElement as first argument", function() {
                var compositeElement;

                beforeEach(function() {
                    compositeElement = Ext.select("div");
                });

                it("should return Ext.Element", function() {
                    expect(Ext.get(compositeElement)).toBe(compositeElement);
                });
            });

            describe("passing an array as first argument", function() {
                it("should call Ext.Element.select", function() {
                    var arr = [domEl, domEl2];
                    spyOn(Ext.Element, "select");

                    Ext.get(arr);

                    expect(Ext.Element.select).toHaveBeenCalledWith(arr);
                });
            });

            describe("passing document as first argument", function() {
                it("should return an Ext.Element", function() {
                    expect(Ext.get(document) instanceof Ext.Element).toBe(true);
                });

                it("should return a bogus Ext.Element", function() {
                    expect(Ext.get(document).id).not.toBeDefined();
                });

                it("should return an Ext.Element that encapsulate document", function() {
                    expect(Ext.get(document).dom).toBe(document);
                });
            });
        });

        xdescribe("garbageCollector", function() {

        });

        describe("fly", function() {
            var flyWeight;

            beforeEach(function() {
                spyOn(Ext, "getDom").andCallThrough();

            });

            describe("global flyweight", function() {
                beforeEach(function() {
                    flyWeight = Ext.fly(domEl2);
                });

                it("should return an Ext.Element.Flyweight", function() {
                    expect(flyWeight instanceof Ext.Element.Flyweight).toBe(true);
                });

                it("should not cache a dom element", function() {
                    expect(Ext.cache[domEl2.id]).toBeUndefined();
                });

                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(domEl2);
                });

                it("should create a one time reference", function() {
                    expect(Ext.Element._flyweights._global).toEqual(flyWeight);
                });
            });

            describe("named reusable flyweight", function() {
                beforeEach(function() {
                    flyWeight = Ext.fly(domEl2, "myflyweight");
                });

                it("should return an Ext.Element.Flyweight", function() {
                    expect(flyWeight instanceof Ext.Element.Flyweight).toBe(true);
                });

                it("should not cache a dom element", function() {
                    expect(Ext.cache[domEl2.id]).toBeUndefined();
                });

                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(domEl2);
                });

                it("should create a one time reference", function() {
                    expect(Ext.Element._flyweights.myflyweight).toEqual(flyWeight);
                });
            });
        });

        describe("aliases", function() {
            it("should aliases Ext.Element.get with Ext.get", function() {
                expect(Ext.get).toBe(Ext.Element.get);
            });

            it("should aliases Ext.element.fly with Ext.fly", function() {
                expect(Ext.fly).toBe(Ext.Element.fly);
            });
        });
    });
}, "/src/dom/Element.js");

