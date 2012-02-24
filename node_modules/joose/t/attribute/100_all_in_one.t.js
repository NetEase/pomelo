StartTest(function(t) {
    
    //==================================================================================================================================================================================
    t.diag("All-in-one test")    
    
    
    var TestClass = Class({
        has : {
            
            lazyTrack    : 0,
            triggerTrack : 0,
            
            res : {
                is      : 'rwc',
                
                lazy    : function () {
                    this.lazyTrack++
                    
                    return 'lazyinit'
                },
                
                trigger : function (value, oldValue) {
                    this.triggerTrack++
                    
                    if (this.triggerTrack == 1) {
                        t.ok(value == 'lazyinit', 'Correct new value')
                        t.ok(oldValue == null, 'Correct old value')
                    }
                    
                    if (this.triggerTrack == 2) {
                        t.ok(value == 'value', 'Correct new value')
                        t.ok(oldValue == 'lazyinit', 'Correct old value')
                    } 
                }
            }
        }
    })
    
    t.ok(TestClass.meta.hasAttribute('res'), "TestClass has 'res' attribute")
    t.ok(TestClass.meta.hasMethod('res'), "TestClass has 'res' method as well")

    
    //==================================================================================================================================================================================
    t.diag("Checking initial state")    
    
    var testClass = new TestClass()    
    
    t.ok(typeof testClass.res == 'function', 'Combined accessor was created')
    
    t.ok(testClass.triggerTrack == 0, "Trigger wasn't called yet")
    t.ok(testClass.lazyTrack == 0, "Lazy initializer wasn't called yet")
    
    
    //==================================================================================================================================================================================
    t.diag("Call to initializer")
    
    t.ok(testClass.res() == 'lazyinit', "Attribute was correctly and lazily initialized, combined getter works")
    
    t.ok(testClass.triggerTrack == 1, "Trigger was called with initialization value")
    t.ok(testClass.lazyTrack == 1, "Lazy initializer was called")
    
    
    //==================================================================================================================================================================================
    t.diag("Call to setter")
    
    testClass.res('value')

    t.ok(testClass.triggerTrack == 2, "Trigger was called")
    t.ok(testClass.lazyTrack == 1, "Lazy initializer was called only once")
    
    t.ok(testClass.res() == 'value', "Combined setter works")
    
    
    t.done()
})    