StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Inheritance from non-Joose classes")
    
    var nonJooseClass = function (param1, param2) {
        
        this.param1 = param1
        this.param2 = param2
    }
    
    nonJooseClass.prototype = {
        
        attr    : false,
        
        result1 : function () {
            return 'result1'
        },
        
        result2 : function () {
            return 'result2'
        }
    }
    
    
    Class('TestClass1', {
        
        isa     : nonJooseClass,
        meta    : Joose.Meta.Class,
        
        has : {
            attribute1 : 'attribute1',
            attribute2 : 'attribute2'
        },
        
        methods : {
            
            BUILD   : function (param1, param2) {
                return {
                    param1 : param1,
                    param2 : param2
                }
            },
            
            initialize : function (config) {
                TestClass1.meta.superClass.call(this, config.param1, config.param2)
            },
            
            
            method1 : function () { return 'method1' },
            
            method2 : function () { return 'method2' }
        }
    
    })
    
    t.ok(TestClass1, 'TestClass1 was created')
    t.ok(TestClass1.meta instanceof Joose.Meta.Class, 'Default meta-class has been used for that')
    

    //==================================================================================================================================================================================
    t.diag("Reflection - methods")
    
    
    var methods = TestClass1.meta.getMethods()
    
    t.ok(methods.haveProperty('method1'), "TestClass1 have 'method1' method")
    t.ok(methods.haveOwnProperty('method1'), "its 'own' method")
    
    t.ok(methods.haveProperty('result1'), "TestClass1 have 'result1' method")
    t.ok(!methods.haveOwnProperty('result1'), "its not 'own' method")
    

    
    //==================================================================================================================================================================================
    t.diag("Reflection - attributes")

    var attributes = TestClass1.meta.getAttributes()
    
    t.ok(attributes.haveProperty('attribute1'), "TestClass1 have 'attribute1' attribute")
    t.ok(attributes.haveOwnProperty('attribute1'), "its 'own' attribute")
    
    t.ok(attributes.haveProperty('attr'), "TestClass1 have 'attr' attribute")
    t.ok(!attributes.haveOwnProperty('attr'), "its not 'own' attribute though")

    
    //==================================================================================================================================================================================
    t.diag("Reflection - inheritance")
    
    var obj = new TestClass1(1, 10)
    
    t.ok(obj.param1 == 1, '`Correct parameter #1')
    t.ok(obj.param2 == 10, '`Correct parameter #2')
    
    t.isaOk(obj, TestClass1, '`obj` is a correct instance #1')
    t.isaOk(obj, nonJooseClass, '`obj` is a correct instance #2')
    
    t.ok(obj.result1() == 'result1', 'Correct result from inherited method')
    
    
    
    //==================================================================================================================================================================================
    t.diag("Inheritance - no BUILD method")
    
    Class('TestClass2', {
        
        isa : nonJooseClass,
        meta    : Joose.Meta.Class,
        
        has : {
            attribute1 : 'attribute1'
        },
        
        methods : {
            
            initialize : function (config) {
                TestClass2.meta.superClass.call(this, config.param1, config.param2)
            }
        }
    })
    
    t.ok(TestClass2, 'TestClass2 was created')
    t.ok(TestClass2.meta instanceof Joose.Meta.Class, 'Default meta-class has been used for that')
    
    
    var obj2 = new TestClass2({
        param1      : 1,
        param2      : 10,
        
        attribute1  : 'foo'
    })
    
    t.ok(obj2.param1 == 1, '`Correct parameter #1')
    t.ok(obj2.param2 == 10, '`Correct parameter #2')
    t.ok(obj2.attribute1 == 'foo', '`Correct parameter #3')
    
    t.expectGlobals('TestClass1', 'TestClass2')
    
    t.done()
})