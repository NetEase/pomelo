StartTest(function (t) {
    t.plan(30)
    
    //==================================================================================================================================================================================
    t.diag("Joose.Managed.Class")
    
    t.ok(Joose.Managed.Class, "Joose.Managed.Class is here")
    
    
    //==================================================================================================================================================================================
    t.diag("Creation & managed extending (building)")
    
    var TestClass = new Joose.Managed.Class('TestClass', {
        have : {
            res : true
        },
        
        methods : {
            result : function () { return 'TestClass' }
        }
    }).c
    
    t.ok(typeof TestClass == 'function', "TestClass was created")
    
    t.ok(TestClass.meta.hasAttribute('res'), "TestClass has 'res' attribute"); 
    t.ok(TestClass.meta.hasMethod('result'), "TestClass has 'result' method")

    t.ok(TestClass.meta.hasOwnAttribute('res'), "TestClass has own 'res' attribute")
    t.ok(TestClass.meta.getAttribute('res') instanceof Joose.Managed.Property.Attribute, "'res' attribute is instance of Joose.Managed.Property.Attribute")
    
    t.ok(TestClass.meta.hasOwnMethod('result'), "TestClass has own 'result' method")
    t.ok(TestClass.meta.getMethod('result') instanceof Joose.Managed.Property.MethodModifier.Put, "'result' method is instance of Joose.Managed.Property.MethodModifier.Put")
    t.ok(typeof TestClass.prototype.result == 'function', "Some function was installed into prototype")
    
    t.ok(TestClass.meta.hasMethod('initialize'), "TestClass has 'initialize' method")
    t.ok(TestClass.meta.hasMethod('SUPER'), "TestClass has 'SUPER' method")
    
    t.ok(!TestClass.meta.hasOwnMethod('initialize'), "TestClass doesnt have own 'initialize' method")
    t.ok(!TestClass.meta.hasOwnMethod('SUPER'), "TestClass doesnt have own 'SUPER' method")
    
    var testClass = new TestClass()
    
    t.ok(testClass, "TestClass was instantiated")
    t.ok(testClass.res == true, "Attribute was correctly installed")
    t.is(testClass.result(), 'TestClass', "Method was correctly installed")
    
    
    //==================================================================================================================================================================================
    t.diag("Extending of builder")
    
    var TestMetaClass = new Joose.Managed.Class('TestMetaClass', {
        isa : Joose.Managed.Class,
        
        builder : {
            methods : {
                testBuilder : function (meta, props) {
                    var name = props.name
                    var value = props.value
                    
                    meta.addMethod(name, function () {
                        return value
                    })
                }
            }
        }
        
    }).c
    
    
    var TestClass1 = new TestMetaClass('TestClass1', {
        isa : TestClass,
        
        testBuilder : {
            name : 'result',
            value : 'TestClass1'
        }
        
    }).c
    
    var testClass1 = new TestClass1()
    
    t.ok(TestClass1.meta.hasOwnMethod('result') && testClass1.result() == 'TestClass1', "Builder was extened and works correctly")

    
    var TestClass11 = new TestMetaClass('TestClass11', {
        testBuilder : {
            name : 'result',
            value : 'TestClass11'
        }
    }).c
    
    var testClass11 = new TestClass11()
    
    t.ok(TestClass11.meta.hasOwnMethod('result') && testClass11.result() == 'TestClass11', "Builder was extened and works correctly #2")
    

    //==================================================================================================================================================================================
    t.diag("Method & Attribute objects")
    
    var result = TestClass1.meta.getMethod('result')
    
    t.ok(result instanceof Joose.Managed.Property.MethodModifier.Put, "'result' method have a meta object - instance of Joose.Managed.Property.MethodModifier.Put")
    
    t.ok(result.value == TestClass1.prototype.result.__CONTAIN__, "'result' method is a wrapper")
    
    
    var res = TestClass1.meta.getAttribute('res')
    
    t.ok(res instanceof Joose.Managed.Property.Attribute, "'res' attribute have a meta object - instance of Joose.Managed.Property.Attribute")
    
    t.ok(res.value == TestClass1.prototype.res, "Default value of 'res' attribute is a 'value' property of its meta")
    
    t.ok(!TestClass1.meta.hasOwnAttribute('res'), "TestClass1 dont have own 'res' attribute - its inherited from TestClass")
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability")
    
    t.ok(TestClass1.meta.hasOwnMethod('result'), "TestClass1 has own 'result' method")
    
    TestClass1.meta.extend({
        removeMethods : ['result']
    })
    
    t.ok(!TestClass1.meta.hasOwnMethod('result'), "TestClass1 dont have own 'result' method")
    t.ok(TestClass1.meta.hasMethod('result'), "TestClass1 still have inherited 'result' method")
    t.is(testClass1.result(), 'TestClass', "... and it works correctly")
    
    t.ok(TestClass1.meta.hasAttribute('res'), "TestClass1 still has 'res' attribute after extension")
    
    TestClass.meta.extend({
        removeMethods : ['result']
    })
    t.ok(!TestClass1.meta.hasMethod('result'), "TestClass1 now dont have any 'result's methods")
    

    //==================================================================================================================================================================================
    t.diag("SUPER call")

    var TestClass3 = new Joose.Managed.Class('TestClass3', {
        methods : {
            inc : function (a) { return a + 1 }
        }
    }).c
    
    var TestClass4 = new Joose.Managed.Class('TestClass4', {
        isa : TestClass3,
        
        methods : {
            inc : function (a) { return this.SUPER(a) + 1 }
        }
    }).c
    
    var TestClass5 = new Joose.Managed.Class('TestClass5', {
        isa : TestClass4,
        
        methods : {
            inc : function (a) { return this.SUPERARG(arguments) + 1 }
        }
    }).c
    
    var testClass5 = new TestClass5()
    
    t.is(testClass5.inc(1), 4, "'inc' was overriden and works correctly")
    
})