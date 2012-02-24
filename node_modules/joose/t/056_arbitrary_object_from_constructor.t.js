StartTest(function (t) {
    
    t.plan(9)
    
    //==================================================================================================================================================================================
    t.diag("Arbitrary object returned from constructor")
    
    Class('TestClass', {
        
        has : {
            someAttr : null
        },
        
        methods : {
            initialize : function (properties) { 
                var res = {
                    self : this
                } 
                
                return res
            }
        }
    })
    
    
    var testClass = new TestClass({ someAttr : 10 })
    
    t.ok(testClass, 'Something was returned')
    
    t.ok(!(testClass instanceof TestClass), 'And its something different from usual instance')
    
    t.ok(testClass.self instanceof TestClass, 'And its an expected object')
    t.ok(testClass.self.someAttr == 10, '... correctly initialized')
    
    
    Class('TestClass2', {
        
        has : {
            someAttr : null
        },
        
        methods : {
            initialize : function (properties) {
                var me = this
                
                var res = function () {
                    return me
                } 
                
                return res
            }
        }
    })
    
    var testClass2 = new TestClass2({ someAttr : 10 })
    
    t.ok(testClass2, 'Something was returned')
    
    t.ok(!(testClass2 instanceof TestClass2), 'And its something different from usual instance')
    t.ok(typeof testClass2 == 'function', 'its a function')
    
    t.ok(testClass2() instanceof TestClass2, 'And it works as expected')
    t.ok(testClass2().someAttr == 10, '... and return correctly initialized instance')
})