StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Joose.A.*")
    
//    var Joose = require('../joose-all')
    
    var counter = 0
    
    var res = Joose.A.each([ 1, 2, 3, 4, 5 ], function (value) {
        
        t.ok(value == ++counter, 'Joose.A.each works as expected')
    })
    
    t.is(res, undefined, 'Result value is correct #1')

    
    counter = 0
    
    res = Joose.A.each([ 1, 2, 3, 4, 5 ], function (value) {
        
        counter++
        
        if (value == 3) return false
    })
    
    t.is(counter, 3, "Joose.A.each can be stopped by returning a 'false' value")
    t.isStrict(res, false, 'Result value is correct #2')
    
    
    
    var res = Joose.A.map([ 1, 2 ], function (value) {
        return value + 1
    })
    
    
    t.isDeeply(res, [ 2, 3 ], "Joose.A.map works as expected")
  
    
    //==================================================================================================================================================================================
    t.diag("Joose.O.*")
    
    
    var res = Joose.O.each({ foo : 'bar', bar : 'baz' }, function (value, key) {
        // we aren't checking the number of pairs, assuming some people are using Joose with the 
        // frameworks, which extends `Object` prototype (god help them :)
        
        if (key == 'foo') t.ok(value == 'bar', '1st key/value is correct')
        if (key == 'bar') t.ok(value == 'baz', '2nd key/value is correct')
    })
    
    t.is(res, undefined, 'Result value is correct #1')
    
    counter = 0
    
    var res = Joose.O.each({ foo : 'bar', bar : 'baz' }, function (value, key) {
        counter++
        
        return false
    })
    
    t.is(counter, 1, "Joose.O.each can be stopped by returning a 'false' value")
    t.isStrict(res, false, 'Result value is correct #2')
  
    
    //==================================================================================================================================================================================
    t.diag("Joose.I.*")
    
    t.isStrict(Joose.I.Function(), Joose.I.Function, 'Correct empty Function initiazer')
    
    
    //==================================================================================================================================================================================
    t.diag("Webkit & RegExp issue")
    
    t.ok(Joose.O.isFunction(function () {}), 'Function detected correctly')
    
    t.notOk(Joose.O.isFunction(/a/), 'RegExp is not a function')

    t.done()
})