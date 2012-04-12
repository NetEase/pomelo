/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.EventManager", function() {
    var element,
        elementWithId,
        elementWithoutId;
    
    beforeEach(function() {
        // add global variable in whitelist
        addGlobal("id");
        addGlobal("ExtBox1");
        element = document.body;
        
        elementWithId = document.createElement("DIV");
        elementWithId.id = 'element-with-id';
        element.appendChild(elementWithId);
        
        elementWithoutId = document.createElement("DIV");
        element.appendChild(elementWithoutId);
    });
    
    afterEach(function() {
        var el = Ext.get(elementWithId);
        if (el) {
            el.remove();
        }
        el = Ext.get(elementWithoutId);
        if (el) {
            el.remove();
        }
    });
    
    describe("event binding", function() {
        describe("getId", function() {
            describe("if element has an id", function() {
                it("should return element id", function() {
                    expect(elementWithId.id).toBe(Ext.EventManager.getId(elementWithId));
                });
            });
            
            describe("if element hasn't an id", function() {
                var id, result;
                beforeEach(function() {
                    id = 'nf-42';
                    spyOn(Ext, "id").andCallFake(function(dom) {
                        return (dom.id = id);
                    });
                    result = Ext.EventManager.getId(elementWithoutId);
                });
                

                it("should add an id to element with Ext.id", function() {
                    expect(elementWithoutId.id).toBe(id);
                });
                
                it("should return the element id", function() {
                    expect(result).toBe(id);
                });
                
                it("should add element to Ext.cache", function() {
                   expect(Ext.cache[id].el.dom).toBe(elementWithoutId);
                });
            });
            
            describe("document and window", function() {
                describe("document", function() {
                    var result;
                    beforeEach(function() {
                        result = Ext.EventManager.getId(document);
                    });
                    
                    afterEach(function() {
                        delete Ext.cache[Ext.documentId];
                    });
                    it("should add document Ext.Element to cache", function() {
                        expect(Ext.cache[Ext.documentId].el.dom).toBe(document);
                    });
                    
                    it("should enable skipGarbageCollection flag", function() {
                        expect(Ext.cache[Ext.documentId].skipGarbageCollection).toBe(true);
                    });
                    
                    it("should return Ext.documentId", function() {
                        expect(result).toBe(Ext.documentId);
                    });
                });
                
                describe("window", function() {
                    var result;
                    beforeEach(function() {
                        result = Ext.EventManager.getId(window);
                    });
                    
                    afterEach(function() {
                        delete Ext.cache[Ext.windowId];
                    });
                    it("should add window Ext.Element to cache", function() {
                        expect(Ext.cache[Ext.windowId].el.dom).toBe(window);
                    });
                    
                    it("should enable skipGarbageCollection flag", function() {
                        expect(Ext.cache[Ext.windowId].skipGarbageCollection).toBe(true);
                    });
                    
                    it("should return Ext.windowId", function() {
                        expect(result).toBe(Ext.windowId);
                    });
                });
            });
        });
        
        describe("prepareListenerConfig", function() {
            var config, configWithFn;
            
            beforeEach(function() {
                config = {
                    click: Ext.emptyFn,
                    scope: fakeScope
                };
                
                configWithFn = {
                    click: {
                       fn: Ext.emptyFn, 
                       scope: fakeScope
                    }
                };
                spyOn(Ext.EventManager, "removeListener");
                spyOn(Ext.EventManager, "addListener");
            });
            
            describe("if remove", function() {
                describe("with an object like click: function(){}, scope: this", function() {
                    it("should call removeListener", function() {
                        Ext.EventManager.prepareListenerConfig(element, config, true);
                        expect(Ext.EventManager.removeListener).toHaveBeenCalledWith(element, 'click', Ext.emptyFn, fakeScope, config);
                    });
                });
                
                describe("with an object like click: {fn: function(){}, scope: this}", function() {
                    it("should call removeListener", function() {
                        Ext.EventManager.prepareListenerConfig(element, configWithFn, true);
                        expect(Ext.EventManager.removeListener).toHaveBeenCalledWith(element, 'click', Ext.emptyFn, fakeScope, configWithFn.click);
                    });                    
                });
            });
            
            describe("if add", function() {
                describe("with an object like click: function(){}, scope: this", function() {
                    it("should call addListener", function() {
                        Ext.EventManager.prepareListenerConfig(element, config);
                        expect(Ext.EventManager.addListener).toHaveBeenCalledWith(element, 'click', Ext.emptyFn, fakeScope, config);
                    });
                });
                
                describe("with an object like click: {fn: function(){}, scope: this}", function() {
                    it("should call addListener", function() {
                        Ext.EventManager.prepareListenerConfig(element, configWithFn);
                        expect(Ext.EventManager.addListener).toHaveBeenCalledWith(element, 'click', Ext.emptyFn, fakeScope, configWithFn.click);
                    });                    
                });
            });
        });
        
        describe("addListener", function() {
            describe("if eventName is an object", function() {
                var eventName;
                
                beforeEach(function() {
                    eventName = {};    
                });
                
                it("should call prepareListenerConfig", function() {
                    spyOn(Ext.EventManager, "prepareListenerConfig");
                    Ext.EventManager.addListener(element, eventName);
                    expect(Ext.EventManager.prepareListenerConfig).toHaveBeenCalledWith(element, eventName);
                });
                
                it("should throw an error if the element doesn't exist", function() {
                    expect(function() {
                        Ext.EventManager.addListener(undefined, "click");
                    }).toRaiseExtError();
                });
            });
            
            it("should throw an error if the element doesn't exist", function() {
                expect(function() {
                    Ext.EventManager.addListener(undefined, "click");
                }).toRaiseExtError();
            });
            
            describe("event firing", function() {
                var config;
   
                beforeEach(function() {
                    config = {
                        click: {
                           fn: jasmine.createSpy(), 
                           scope: fakeScope
                        }
                    };
                    
                    Ext.EventManager.addListener(element, config);
                });
                
                afterEach(function() {
                    Ext.EventManager.removeListener(element, config);
                });
                                
                it("should call the listener", function() {
                    jasmine.fireMouseEvent(element, "click", 1, 1);
                    
                    expect(config.click.fn).toHaveBeenCalled();
                });
                

            });
            
            describe("options", function() {
                var config;
                
                afterEach(function() {
                    Ext.EventManager.removeListener(element, config);
                });
                
                describe("scope", function() {
                    it("should call the listener with the correct scope", function() {
                        config = {
                            click: {
                               fn: jasmine.createSpy(), 
                               scope: fakeScope
                            }
                        };     
                        
                        Ext.EventManager.addListener(element, config);

                        jasmine.fireMouseEvent(element, "click", 1, 1);
                        expect(config.click.fn.calls[0].object).toBe(fakeScope);                   
                    });
                });
                
                describe("delegate", function() {
                    var child;
                    beforeEach(function() {
                        config = {
                            click: {
                               fn: jasmine.createSpy(),
                               delegate: ".something",
                               scope: fakeScope
                            }
                        };
                        
                        child = Ext.get(element).createChild({
                            cls: "child"
                        }).dom;
                    });
                    
                    afterEach(function() {
                        var elChild = Ext.get(child);
                        if (elChild) {
                            elChild.remove();
                        }
                    });
                    
                    describe("if filter found nothing", function() {
                        it("should not call the listener", function() {
                            Ext.EventManager.addListener(element, config);
                            jasmine.fireMouseEvent(child, "click", 1, 1);
                            
                            expect(config.click.fn).not.toHaveBeenCalled();                 
                        });
                    });
                    
                    describe("if filter found something", function() {
                        it("should call the listener", function() {
                            Ext.get(child).addCls("something");
                            Ext.EventManager.addListener(element, config);
                            jasmine.fireMouseEvent(child, "click", 1, 1);
                            
                            expect(config.click.fn).toHaveBeenCalled();                 
                        });
                    });
                    
                    describe("stopevent", function() {
                        var checkbox;
                        
                        beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   stopEvent: true,
                                   scope: fakeScope
                                }
                            };
                            
                            checkbox = Ext.get(element).createChild({
                                tag: "input",
                                type: "checkbox"
                            }).dom;
                                                 
                            Ext.EventManager.addListener(element, config);
                            Ext.EventManager.addListener(checkbox, config);
                            if (jasmine.browser.isIE) {
                                checkbox.click();
                            } else {
                                jasmine.fireMouseEvent(checkbox, "click", 1, 1);
                            }
                        });
                        
                        afterEach(function() {
                            var checkBoxEl = Ext.get(checkbox);
                            if (checkBoxEl) {
                                checkBoxEl.remove();
                            }
                            Ext.EventManager.removeListener(checkbox, config);
                        });
                        
                        it("should stop propagation to parent elements", function() {
                            expect(config.click.fn.calls.length).toEqual(1);
                        });
                        
                        it("should prevent default browser handling of the event", function() {
                            expect(checkbox.checked).toBe(false);
                        });
                    });
                    
                    describe("preventDefault", function() {
                        var checkbox;
                        
                        beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   preventDefault: true,
                                   scope: fakeScope
                                }
                            };
                            
                            checkbox = Ext.get(element).createChild({
                                tag: "input",
                                type: "checkbox"
                            }).dom;
                                                 
                            Ext.EventManager.addListener(element, config);
                            Ext.EventManager.addListener(checkbox, config);
                            if (jasmine.browser.isIE) {
                                checkbox.click();
                            } else {
                                jasmine.fireMouseEvent(checkbox, "click", 1, 1);
                            }
                        });
                        
                        afterEach(function() {
                            var checkBoxEl = Ext.get(checkbox);
                            if (checkBoxEl) {
                                checkBoxEl.remove();
                            }
                            Ext.EventManager.removeListener(checkbox, config);
                        });
                                                
                        it("should prevent default browser handling of the event", function() {
                            expect(checkbox.checked).toBe(false);
                        });  
                        
                        it("should not stop the propagation of the event", function() {
                            expect(config.click.fn.calls.length).toEqual(2);
                        });
                    });
                                        
                    describe("stopPropagation", function() {
                        var checkbox;
                        
                        beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   stopPropagation: true,
                                   scope: fakeScope
                                }
                            };
                            
                            checkbox = Ext.getBody().createChild({
                                tag: "input",
                                type: "checkbox"
                            }).dom;
                                                 
                            Ext.EventManager.addListener(element, config);
                            Ext.EventManager.addListener(checkbox, config);
                            if (jasmine.browser.isIE) {
                                checkbox.click();
                            } else {
                                jasmine.fireMouseEvent(checkbox, "click", 1, 1);
                            }
        
                        });
                        
                        afterEach(function() {
                            var checkBoxEl = Ext.get(checkbox);
                            if (checkBoxEl) {
                                checkBoxEl.remove();
                            }
                            Ext.EventManager.removeListener(checkbox, config);
                        });
                        
                        it("should stop propagation to parent elements", function() {
                            expect(config.click.fn.calls.length).toEqual(1);
                        });
                        
                        it("should not prevent default browser handling of the event", function() {
                            expect(checkbox.checked).toBe(true);
                        });
                    });
                    
                    describe("normalized", function() {
                        var event;
                        beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   normalized: false,
                                   scope: fakeScope
                                }
                            };
                                                 
                            Ext.EventManager.addListener(element, config);

                            event = jasmine.fireMouseEvent(element, "click", 1, 1);
                        });
                        
                        it("should pass a browser event instead of an Ext.EventObject", function() {
                            expect(config.click.fn).toHaveBeenCalledWith(event, element, config.click);
                        });
                    });
                    
                    describe("delay", function() {
                         beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   delay: 1,
                                   scope: fakeScope
                                }
                            };
                                                 
                            Ext.EventManager.addListener(element, config);
                        });
                        
                        it("should not call listener before 1 ms", function() {
                            jasmine.fireMouseEvent(element, "click", 1, 1);
                            expect(config.click.fn).not.toHaveBeenCalled();
                        });
                        
                        it("should call listener after 1 ms", function() {
                            runs(function() {
                                jasmine.fireMouseEvent(element, "click", 1, 1);
                            });
                            
                            waits(1);
                            
                            runs(function() {
                                expect(config.click.fn).toHaveBeenCalled();
                            });
                        });
                    });
                    
                    describe("single", function() {
                         beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   single: true,
                                   scope: fakeScope
                                }
                            };
                                                 
                            Ext.EventManager.addListener(element, config);
                            jasmine.fireMouseEvent(element, "click", 1, 1);
                            jasmine.fireMouseEvent(element, "click", 1, 1);
                        });
                        
                        it("should call listener only one time", function() {
                            expect(config.click.fn.calls.length).toEqual(1);
                        });
                    });
                    
                    describe("buffer", function() {
                        beforeEach(function() {
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   buffer: 1,
                                   scope: fakeScope
                                }
                            };
                                                 
                            Ext.EventManager.addListener(element, config);
                            jasmine.fireMouseEvent(element, "click", 1, 1);
                            jasmine.fireMouseEvent(element, "click", 1, 1);
                        });
                        
                        it("should call listener only one time", function() {
                            waits(1);
                            runs(function() {
                                expect(config.click.fn.calls.length).toEqual(1);
                            });
                        });                       
                    });
                    
                    describe("target", function() {
                        var child;
                        beforeEach(function() {
                            child = Ext.get(element).createChild({
                            }).dom;
                            
                            config = {
                                click: {
                                   fn: jasmine.createSpy(),
                                   target: element,
                                   scope: fakeScope
                                }
                            };
                                                 
                            Ext.EventManager.addListener(element, config);                            
                        });
                        
                        afterEach(function() {
                            var childEl = Ext.get(child);
                            if (childEl) {
                                childEl.remove();
                            }
                        });
                        
                        it("should call listener if element event is fired", function() {
                            jasmine.fireMouseEvent(element, "click", 1, 1);
                            expect(config.click.fn).toHaveBeenCalled();
                        });
                        
                        it("should not call listener if child event is fired (no bubbling)", function() {
                            jasmine.fireMouseEvent(child, "click", 1, 1);
                            expect(config.click.fn).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
        
        describe("removeListener", function() {
            describe("if eventName is an object", function() {
                it("should call prepareListenerConfig", function() {
                    var eventName = {};
                    spyOn(Ext.EventManager, "prepareListenerConfig");
                    Ext.EventManager.removeListener(element, eventName);
                    expect(Ext.EventManager.prepareListenerConfig).toHaveBeenCalledWith(element, eventName, true);
                });
            });            
            
            describe("event firing", function() {
                var config;
   
                beforeEach(function() {
                    config = {
                        click: {
                           fn: jasmine.createSpy(), 
                           scope: fakeScope
                        }
                    };
                    
                    Ext.EventManager.addListener(element, config);
                    Ext.EventManager.removeListener(element, config);
                });
                
                it("should not call the listener", function() {
                    jasmine.fireMouseEvent(element, "click", 1, 1);
                    
                    expect(config.click.fn).not.toHaveBeenCalled();
                });
            });
        });
    
        describe("removeAll", function() {
            var config;

            beforeEach(function() {
                config = {
                    click: {
                       fn: jasmine.createSpy(), 
                       scope: fakeScope
                    },
                    mouseover: {
                        fn: jasmine.createSpy(),
                        scope: fakeScope
                    }
                };
                
                Ext.EventManager.addListener(element, config);
                Ext.EventManager.removeAll(element, config);
            });
            
            it("should should not call click listener", function() {
                jasmine.fireMouseEvent(element, "click", 1, 1);
                
                expect(config.click.fn).not.toHaveBeenCalled();
            });
            
            it("should not call mouseover listener", function() {
                jasmine.fireMouseEvent(element, "mouseover", 1, 1);
                
                expect(config.mouseover.fn).not.toHaveBeenCalled();
            });
        });
        
        describe("purgeElement", function() {
            var child, config;
            
            beforeEach(function() {
                child = Ext.get(element).createChild({
                    cls: "child"
                }).dom;
                
                config = {
                    mouseover: {
                        fn: jasmine.createSpy(),
                        scope: fakeScope
                    }
                };  
                              
                Ext.EventManager.addListener(element, config);
                Ext.EventManager.addListener(child, config);
                Ext.EventManager.purgeElement(element);
            });
            
            afterEach(function() {
                var childEl = Ext.get(child);
                if (childEl) {
                    childEl.remove();
                }
            });
            
            it("should remove all listeners from element", function() {
                jasmine.fireMouseEvent(element, "mouseover", 1, 1);

                expect(config.mouseover.fn).not.toHaveBeenCalled();                
            });
            
            it("should remove all listeners from element children", function() {
                jasmine.fireMouseEvent(child, "mouseover", 1, 1);
                               
                expect(config.mouseover.fn).not.toHaveBeenCalled(); 
            });
        });
        
        describe("methods alias", function() {
            it("should alias addListener with on", function() {
                expect(Ext.EventManager.on).toBe(Ext.EventManager.addListener);
            });
            
            it("should alias removeListener with un", function() {
                expect(Ext.EventManager.un).toBe(Ext.EventManager.removeListener);
            });
        });
    });
});

