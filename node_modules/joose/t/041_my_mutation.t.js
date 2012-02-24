StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Mutation of the static class")
    
    
    Role('TestRole', {
        my : {
            methods : {
                resultFromRole : function () { return 'TestRole:instance' }
            }
        }
    })
    
    
    Role('TestRole2', {
        methods : {
            roleInMy : function () { return 'roleInMy' }
        }
    })
    
    
    Class('TestClass', {
        
        does    : TestRole,
        
        have : {
            res : 'instance'
        },
        
        methods : {
            result : function () { return 'TestClass:instance' }
        },
        
        
        my : {
            does    : TestRole2,
            
            have : {
                res : 'class',
                
                HOST : null
            },
            
            methods : {
                result : function () { return 'TestClass:class' }
            }
        }
        
    })
    
    t.expectGlobals('TestRole', 'TestRole2', 'TestClass')
    
    t.ok(TestClass.my.res == 'class', "Symbiont is accesible via 'my' in prototype")
    t.is(TestClass.my.result(), 'TestClass:class', "`result` method works correctly")
    
    t.is(TestClass.my.resultFromRole(), 'TestRole:instance', "Methods from role were received")
    
    t.is(TestClass.my.roleInMy(), 'roleInMy', "Methods from role, applied to `my` directly, were received")
    
    t.is(TestClass.result(),            'TestClass:class',      "Symbiont's method was correctly aliased to constructor")
    t.is(TestClass.resultFromRole(),    'TestRole:instance',    "Methods from role were aliased as well")
    t.is(TestClass.roleInMy(),          'roleInMy',             "Methods from role, applied to `my` directly, were aliased")
    
    
    //==================================================================================================================================================================================
    t.diag("Mutation")
    
    
    TestClass.meta.extend({
        
        doesnt : TestRole,
        
        my : {
            removeMethods : [ 'result' ],
            
            methods : {
                result2 : function () { return 'TestClass:class2' }
            }
        }
    })
    
    t.ok(!TestClass.my.meta.hasMethod('resultFromRole'), "Method from role were removed")
    
    t.ok(typeof TestClass.my.resultFromRole == 'undefined', '.. indeed')
    t.ok(typeof TestClass.resultFromRole == 'undefined', 'alias for it was removed as well')
    
    
    t.ok(!TestClass.my.meta.hasMethod('result'), "Usual method from role were removed")
    
    t.ok(typeof TestClass.my.result == 'undefined', '.. indeed')
    t.ok(typeof TestClass.result == 'undefined', 'alias for it was removed as well')

    
    t.is(TestClass.my.result2(), 'TestClass:class2', "Static part mutated correctly")
    t.is(TestClass.result2(), 'TestClass:class2', ".. and re-aliased")
    

    
    t.done()
})