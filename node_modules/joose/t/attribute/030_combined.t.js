StartTest(function(t) {
    
    t.plan(14)
    
    //==================================================================================================================================================================================
    t.diag("Sanity")    
    
    t.ok(Joose.Attribute.Accessor.Combined, "Joose.Attribute.Accessor.Combined is here")
    

    //==================================================================================================================================================================================
    t.diag("Testing combined accessors")    
    
    Class('TestClass', {
        has : {
            res : {
                is      : 'rwc',
                init    : 'combined'
            }
        }
    })
    
    t.ok(TestClass.meta.hasAttribute('res'), "TestClass has 'res' attribute")
    t.ok(TestClass.meta.hasMethod('res'), "TestClass has 'res' method as well")
    
    
    var testClass = new TestClass()    
    
    t.ok(typeof testClass.res == 'function', 'Combined accessor was created')
    
    t.ok(testClass.res() == 'combined', "Attribute was correctly initialized, combined getter works") 
    
    testClass.res('value')
    
    t.ok(testClass.res() == 'value', "Combined setter works")
    
    
    //==================================================================================================================================================================================
    t.diag("Testing combined accessors")    
    
    Class('TestClass2', {
        has : {
            res : {
                is      : 'roc',
                init    : 'combined2'
            }
        }
    })
    
    var testClass2 = new TestClass2()    
    
    t.ok(testClass2.res() == 'combined2', "Attribute was correctly initialized, combined getter works") 
    
    t.throws_ok(function () {
        testClass2.res('value')    
    }, "Call to setter of read-only attribute:", "Attempt to use setter on read-only attribute throws an exception")
    
    t.ok(testClass2.res() == 'combined2', "Attribute hasn't change")
    
    
    //==================================================================================================================================================================================
    t.diag("Testing combined accessors #2")    
    
    Class('TestClass3', {
        has : {
            res : {
                is      : 'rw',
                init    : 'combined',
                
                isCombined : true
            }
        }
    })
    
    t.ok(TestClass3.meta.hasAttribute('res'), "TestClass3 has 'res' attribute")
    t.ok(TestClass3.meta.hasMethod('res'), "TestClass3 has 'res' method as well")
    
    
    var testClass3 = new TestClass3()    
    
    t.ok(typeof testClass3.res == 'function', 'Combined accessor was created')
    
    t.ok(testClass3.res() == 'combined', "Attribute was correctly initialized, combined getter works") 
    
    testClass3.res('value')
    
    t.ok(testClass3.res() == 'value', "Combined setter works")
    
})    