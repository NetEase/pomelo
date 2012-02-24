StartTest(function(t) {
    
    t.plan(12)
    
    //==================================================================================================================================================================================
    t.diag("Sanity")    
    
    t.ok(Joose.Attribute.Lazy, "Joose.Attribute.Lazy is here")
    

    //==================================================================================================================================================================================
    t.diag("Lazy testing")    
    
    Class('TestClass', {
        has : {
            lazy1 : {
                lazy : function () { return 'lazy1-value' } 
            },
            
            lazy2 : {
                init : function () { return 'lazy2-value' },
                lazy : true
            },
            
            lazy3 : {
                lazy : 'buildLazy3'
            },
            
            lazy4 : {
                lazy : 'this.buildLazy4'
            },
            
            lazy5 : {
                is  : 'rw',
                lazy : function () { t.fail("Initializer for 'lazy5' has been called") } 
            }
        },
        
        
        methods : {
            
            buildLazy3 : function () { return 'lazy3-value' },
            
            buildLazy4 : function () { return 'lazy4-value' }
        }
    })    
    
    var testClass4 = new TestClass()    
    
    var testClass5 = new TestClass()
    
    t.ok(testClass4.lazy1 == undefined, "Value of 'lazy1' attribute is not initialized yet")    
    t.ok(testClass4.getLazy1() == 'lazy1-value' && testClass4.lazy1 == 'lazy1-value', "Value of 'lazy1' was setuped during 1st getter call")
    
    t.ok(testClass5.lazy1 == undefined, "Value of 'lazy1' attribute is not initialized yet")
    t.ok(testClass5.getLazy1() == 'lazy1-value' && testClass5.lazy1 == 'lazy1-value', "Lazy state is not shared among class instances")
    
    t.ok(testClass4.lazy2 == undefined, "Value of 'lazy2' attribute is not initialized yet")
    t.ok(testClass4.getLazy2() == 'lazy2-value' && testClass4.lazy2 == 'lazy2-value', "Value of 'lazy2' was setuped during 1st getter call")
    
    t.ok(testClass4.lazy3 == undefined, "Value of 'lazy3' attribute is not initialized yet")
    t.ok(testClass4.getLazy3() == 'lazy3-value' && testClass4.lazy3 == 'lazy3-value', "Value of 'lazy3' was setuped during 1st getter call")    
    
    t.ok(testClass4.lazy4 == undefined, "Value of 'lazy4' attribute is not initialized yet")
    t.ok(testClass4.getLazy4() == 'lazy4-value' && testClass4.lazy4 == 'lazy4-value', "Value of 'lazy4' was setuped during 1st getter call")
    
    
    testClass4.setLazy5('lazy5-value')
    
    t.ok(testClass4.getLazy5() == 'lazy5-value', "Initializer for 'lazy5' hasn't been called")
    
    
    //==================================================================================================================================================================================
    t.diag("Get/set raw value")    
    
    
    
    
})    