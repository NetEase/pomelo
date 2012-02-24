StartTest(function (t) {
    t.plan(13)
    
    //==================================================================================================================================================================================
    t.diag("Sanity")
    
    t.ok(Joose.Proto.Class, "Joose.Proto.Class is here")
    t.ok(Joose.Managed.Class, "Joose.Managed.Class is here")
    
    
    //==================================================================================================================================================================================
    t.diag("Inherited from class with Joose.Proto.Class meta")
    
    var TestClass3 = new Joose.Proto.Class('TestClass3', {
        res1 : false,
        
        met1 : function () {},
        
        inc : function (a) { return a + 'T3' }
    }).c
    
    
    var TestClass4 = new Joose.Proto.Class('TestClass4', {
        isa : TestClass3,
        
        res2 : 'res2',
        
        testMeta : TestClass3,
        
        met2 : function () {},
        
        aug : function (a) { return '|T4augment' + this.INNER(a) },
        
        inc : function (a) { return this.SUPER(a) + '|T4' }
        
    }).c
    
    
    var TestClass5 = new Joose.Managed.Class('TestClass5', {
        isa : TestClass4,
        
        have : {
            res3 : null
        },
        
        methods : {
            met3 : function () {},
            inc : function (a) { return this.SUPERARG(arguments) + '|T5' }
        }
    }).c
    
    
    t.ok(TestClass5.meta.hasAttribute('res1') && !TestClass5.meta.hasOwnAttribute('res1'), "TestClass has inherited 'res1' attribute")
    t.ok(TestClass5.meta.hasAttribute('res2') && !TestClass5.meta.hasOwnAttribute('res2'), "TestClass has inherited 'res2' attribute")
    t.ok(TestClass5.meta.hasAttribute('res3') && TestClass5.meta.hasOwnAttribute('res3'), "TestClass has own 'res3' attribute")
    
    t.ok(TestClass5.meta.hasAttribute('testMeta') && !TestClass5.meta.hasOwnAttribute('testMeta'), "TestClass has inherited 'testMeta' attribute")

    t.ok(TestClass5.meta.hasMethod('met1') && !TestClass5.meta.hasOwnMethod('met1'), "TestClass has inherited 'met1' method")
    t.ok(TestClass5.meta.hasMethod('met2') && !TestClass5.meta.hasOwnMethod('met2'), "TestClass has inherited 'met2' method")
    t.ok(TestClass5.meta.hasMethod('met3') && TestClass5.meta.hasOwnMethod('met3'), "TestClass has own 'met3' method")
    
    var testClass5 = new TestClass5()
    
    t.is(testClass5.inc(''), 'T3|T4|T5', "'inc' was inherited, overriden and works correctly")
    
    
    //==================================================================================================================================================================================
    t.diag("Inherited from class with Joose.Proto.Class meta & method modifiers")

    
    var TestClass6 = new Joose.Managed.Class('TestClass6', {
        isa : TestClass4,
        
        after : {
            inc : function (a) { this.res2 += '|T6after' }
        },
        
        override : {
            inc : function (a) { 
                this.res2 += '|T6override'
                
                return this.SUPER(a) + '|T6override'
            }
        },
        
        before : {
            inc : function (a) { this.res2 += '|T6before' }
        },
        
        augment : {
            aug : function (a) {
                return '|T6augment' + this.INNER(a)
            }
        }
        
    }).c
    
    var testClass6 = new TestClass6()
    
    
    t.is(testClass6.inc(''), 'T3|T4|T6override', "inherited 'inc' works correctly")
    t.is(testClass6.res2, 'res2|T6before|T6override|T6after', "after&before for inherited 'inc' works correctly")
    

    //==================================================================================================================================================================================
    t.diag("Inherited from class with Joose.Proto.Class meta & augment modifier")
    
    var TestClass7 = new Joose.Managed.Class('TestClass6', {
        isa : TestClass6,
        
        augment : {
            aug : function (a) {
                return '|T7augment'
            }
        }
        
    }).c
    
    var testClass7 = new TestClass7()
    
    t.is(testClass7.aug(''), '|T4augment|T6augment|T7augment', "'augment' modifier from Joose.Proto.Class works correctly")
    
})