StartTest(function(t) {
    
    //==================================================================================================================================================================================
    t.diag("Sanity")    
    
    t.ok(Joose.Attribute.Delegate, "Joose.Attribute.Delegate is here")
    

    //==================================================================================================================================================================================
    t.diag("Testing attributes with delegation - as array")    
    
    var TestClass = Class({
        has : {
            attr : {
                handles : [ 'method1', 'method2', 'method3' ]
            }
        }
    })
    
    t.ok(TestClass.meta.hasAttribute('attr'), "TestClass has 'attr' attribute")
    t.ok(TestClass.meta.hasMethod('method1'), "TestClass has 'method1' method")
    t.ok(TestClass.meta.hasMethod('method2'), "TestClass has 'method2' method")
    
    
    var testClass = new TestClass({
        attr : {
            method1 : function () { return 1 },
            method2 : function () { return 2 },
            method3 : function (a) { return a }
        }
    })    
    
    
    t.ok(testClass.method1() == 1, "Delegated method works correctly #1") 
    t.ok(testClass.method2() == 2, "Delegated method works correctly #2")
    t.ok(testClass.method3(3) == 3, "Direct method call works correctly")
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability")
    
    TestClass.meta.extend({
        hasnot : [ 'attr' ]
    })
    

    t.ok(!TestClass.meta.hasAttribute('attr'), "TestClass has no 'attr' attribute")
    t.ok(!TestClass.meta.hasMethod('method1'), "TestClass has no 'method1' method")
    t.ok(!TestClass.meta.hasMethod('method2'), "TestClass has no 'method2' method")
    
    
    //==================================================================================================================================================================================
    t.diag("Testing attributes with delegation - as object")    
    
    var TestClass2 = Class({
        has : {
            attr : {
                handles : {
                    first   : 'method1',
                    second  : 'method2'
                }
            }
        }
    })
    
    t.ok(TestClass2.meta.hasAttribute('attr'), "TestClass2 has 'attr' attribute")
    t.ok(TestClass2.meta.hasMethod('first'), "TestClass2 has 'first' method")
    t.ok(TestClass2.meta.hasMethod('second'), "TestClass2 has 'second' method")
    
    
    var testClass = new TestClass2({
        attr : {
            method1 : function (f) { return 1 + f },
            method2 : function (s) { return 2 + s },
            method3 : function (t) { return 3 + t }
        }
    })    
    
    
    t.ok(testClass.first(1) == 2, "Delegated method works correctly #1") 
    t.ok(testClass.second(1) == 3, "Delegated method works correctly #2")
    t.ok(testClass.attr.method3(2) == 5, "Direct method call works correctly")
    
    
    //==================================================================================================================================================================================
    t.diag("Testing attributes with delegation - as simple string")    
    
    var TestClass3 = Class({
        has : {
            attr : {
                handles : 'method1'
            }
        }
    })
    
    t.ok(TestClass3.meta.hasAttribute('attr'), "TestClass3 has 'attr' attribute")
    t.ok(TestClass3.meta.hasMethod('method1'), "TestClass3 has 'method1' method")
    
    
    var testClass3 = new TestClass3({
        attr : {
            method1 : function (f) { return 1 + f }
        }
    })    
    
    t.ok(testClass3.method1(1) == 2, "Delegated method works correctly #1") 
    
    t.done()
})    