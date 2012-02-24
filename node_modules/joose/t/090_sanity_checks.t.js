StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Sanity checks - empty Supeclass")
    
    
    t.throws_ok(function () {
        
        Class('TestClass1', {
            
            isa     : null
        })
        
    }, Joose.is_IE ? '' : 'Attempt to inherit from undefined superclass [TestClass1]', 'Empty superclass is detected')
    
    
    
    //==================================================================================================================================================================================
    t.diag("Sanity checks - empty Role")

    
    t.throws_ok(function () {
        
        Class('TestClass2', {
            
            does : undefined
        })
        
    }, Joose.is_IE ? '' : 'Attempt to consume an undefined Role into [TestClass2]', 'Empty Role is detected')
    
    
    t.expectGlobals('TestClass1', 'TestClass2')
    
    t.done()
})
