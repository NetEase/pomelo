StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Reflection - currentMethod")
    
    
    Class('TestClass1', {
        has : {
            attribute1 : null,
            attribute2 : null
        },
        
        methods : {
            method1 : function () {
                
                var method = this.meta.getCurrentMethod()
                
                t.ok(method == this.meta.getMethod('method1'), 'Correct method returned')
                
                t.ok(method.name == 'method1', 'Correct name for method')
                
                t.ok(/getCurrentMethod/.test(method.value.toString()), 'Correct content for method')
            },
            
            method2 : function () {}
        }
    
    })
    
    var a1 = new TestClass1()
    
    a1.method1()
    
    
    Class('TestClass2', {
        
        isa : TestClass1,
        
        has : {
            attribute3 : null,
            attribute4 : null
        },
        
        before : {
            
            method1 : function () {
                var method = this.meta.getCurrentMethod()
                    
                t.isa_ok(method, Joose.Managed.Property.MethodModifier.Before, 'Correct method returned - `before` modifier')
                
                t.ok(method.name == 'method1', 'Correct name for modifier')
                
                t.ok(/Joose.Managed.Property.MethodModifier.Before/.test(method.value.toString()), 'Correct content for modifier')
            }
        }
    })
    
    var a2 = new TestClass2()
    
    a2.method1()
    
    t.expectGlobals('TestClass1', 'TestClass2')

    t.done()
})