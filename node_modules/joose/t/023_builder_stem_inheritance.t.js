StartTest(function (t) {
    
    t.plan(7)
    
    //==================================================================================================================================================================================
    t.diag("Sanity")
    
    t.ok(Joose.Managed.Class, "Joose.Managed.Class is here")
    
    
    //==================================================================================================================================================================================
    t.diag("Inheritance of builder class")
    
    var BaseMetaClass = new Joose.Managed.Class('BaseMetaClass', {
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
    
    
    var TestClass1 = new BaseMetaClass('TestClass1', {
        
        testBuilder : {
            name : 'result',
            value : 'TestClass1'
        }
        
    }).c
    
    var testClass1 = new TestClass1()
    
    t.ok(TestClass1.meta.hasOwnMethod('result') && testClass1.result() == 'TestClass1', "Builder was extened and works correctly #1")
    
    t.ok(BaseMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder'), "BaseMetaClass extended its builder class")
    
    

    var SuperMetaClass = new Joose.Managed.Class('SuperMetaClass', {
        
        isa : BaseMetaClass,
        
        builder : {
            methods : {
                testBuilder2 : function (meta, props) {
                    var name = props.name
                    var value = props.value
                    
                    meta.addMethod(name, function () {
                        return name
                    })
                }
            }
        }
    }).c
    
    
    t.ok(SuperMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder'), "'SuperMetaClass' inherited 'testBuilder'")
    t.ok(SuperMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder2'), "'SuperMetaClass' received 'testBuilder2'")
    
    
    
    var TestClass2 = new SuperMetaClass('TestClass2', {
        
        testBuilder : {
            name : 'result',
            value : 'TestClass2'
        },
        
        testBuilder2 : {
            name : 'result2',
            value : 'TestClass2'
        }
        
    }).c
    
    var testClass2 = new TestClass2()
    
    t.ok(TestClass2.meta.hasOwnMethod('result') && testClass2.result() == 'TestClass2', "Builder was inherited #1")
    t.ok(TestClass2.meta.hasOwnMethod('result2') && testClass2.result2() == 'result2', "Builder was extened and works correctly #2")
    
})