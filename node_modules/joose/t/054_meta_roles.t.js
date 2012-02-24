StartTest(function (t) {
    
    t.plan(38)
    
    //==================================================================================================================================================================================
    t.diag("MetaRoles (roles which applies to metaclass of applicant")
    
    
    Role('MetaRole', {
        
        has : {
            customInitCalled : false
        },
        
        after : {
            extractConstructor : function () {
                this.customInitCalled = true
            }
        },
        
        
        methods : {
            
            customProcess : function () {
                return 'custom'
            }
        }
    
    })
    
    t.ok(!MetaRole.meta.meta.isDetached, "MetaRole itself is not detached")

    
    Class('TestClass', {
        traits : MetaRole
    })
    
    t.ok(TestClass, 'TestClass class was created')
    
    t.ok(TestClass.meta.meta.isDetached, "TestClass's meta is detached")
    
    t.ok(TestClass.meta.meta.hasAttribute('customInitCalled'), "TestClass's meta has 'customInitCalled' attribute")
    t.ok(TestClass.meta.customInitCalled, ".. and it was initialized on early constructring stage")
    
    t.ok(TestClass.meta.meta.hasMethod('customProcess'), "TestClass's meta has 'customProcess' method")
    t.ok(TestClass.meta.customProcess() == 'custom', ".. and its working correctly")
    

    
    //==================================================================================================================================================================================
    t.diag("Mutability")
    
    TestClass.meta.extend({
        removeTrait : MetaRole
    })
    
    t.ok(!TestClass.meta.meta.hasAttribute('customInitCalled'), "TestClass's meta has no 'customInitCalled' attribute")
    
    t.ok(!TestClass.meta.meta.hasMethod('customProcess'), "TestClass's meta has no 'customProcess' method")
    t.ok(!TestClass.meta.customProcess, ".. indeed")
    
    
    //==================================================================================================================================================================================
    t.diag("Indirect trait composing")
    
    Role('CustomBuilder', {
        
        does : MetaRole,
        
        builder : {
            methods : {
                sugar : function (targetMeta, info) {
                    targetMeta.stem.properties.attributes.addProperty(info.name, { init : info.value })
                }
            }
        },
        
        stem : {
            have : {
                attr : 'value'
            }
        }
    
    })
    t.ok(CustomBuilder, 'CustomBuilder role was created')

    
    Role('CustomBuilderWrapper', {
        
        traits : CustomBuilder,
        
        sugar : {
            name : 'custom',
            value : 'attribute'
        }
        
    })
    
    t.ok(CustomBuilderWrapper, 'CustomBuilderWrapper role was created')
    t.ok(CustomBuilderWrapper.meta.meta.isDetached, "CustomBuilderWrapper's meta is detached (Role consume metaroles also)")
    
    t.ok(CustomBuilderWrapper.meta.hasAttribute('custom') && CustomBuilderWrapper.meta.getAttribute('custom').value == 'attribute', "CustomBuilderWrapper has correct attribute 'custom'")
    
    
    Class('TestClass2', {
        
        does : CustomBuilderWrapper,
        
        sugar : {
            name : 'custom',
            value : 'attribute'
        }
        
    })
    t.ok(TestClass2, 'TestClass2 class was created')
    
    
    t.ok(TestClass2.meta.meta.isDetached, "TestClass2's meta is detached")
    
    t.ok(TestClass2.meta.meta.hasAttribute('customInitCalled'), "TestClass2's meta has 'customInitCalled' attribute")
    t.ok(TestClass2.meta.customInitCalled, ".. and it was initialized on early constructring stage")
    
    t.ok(TestClass2.meta.meta.hasMethod('customProcess'), "TestClass2's meta has 'customProcess' method")
    t.ok(TestClass2.meta.customProcess() == 'custom', ".. and its working correctly")
    
    
    t.ok(TestClass2.meta.builder.meta.hasMethod('sugar'), "TestClass2's builder received new method 'sugar'")
    
    t.ok(TestClass2.meta.hasAttribute('custom') && TestClass2.meta.getAttribute('custom').value == 'attribute', "TestClass2 has correct attribute 'custom'")
    
    //==================================================================================================================================================================================
    t.diag("Mutability #2")
    
    
    TestClass2.meta.extend({
        doesnt : CustomBuilderWrapper
    })
    
    t.ok(!TestClass2.meta.builder.meta.hasMethod('sugar'), "TestClass2's builder have no 'sugar' method")
    
    t.ok(!TestClass2.meta.meta.hasAttribute('customInitCalled'), "TestClass2's meta has no 'customInitCalled' attribute")
    
    t.ok(!TestClass2.meta.meta.hasMethod('customProcess'), "TestClass2's meta has no 'customProcess' method")
    t.ok(!TestClass2.meta.customProcess, ".. indeed")
    
    //==================================================================================================================================================================================
    t.diag("MetaRoles inheritance")
    
    Class('TestClass3', {
        
        does : CustomBuilderWrapper,
        
        sugar : {
            name : 'custom3',
            value : 'attribute3'
        }
        
    })
    t.ok(TestClass3, 'TestClass3 class was created')

    
    Class('TestClass4', {
        isa : TestClass3,
        
        sugar : {
            name : 'custom4',
            value : 'attribute4'
        }
        
    })
    t.ok(TestClass4, 'TestClass4 class was created')
    
    t.ok(TestClass4.meta.meta.isDetached, "TestClass4's meta is also detached - its the same meta as for TestClass3 ")
    t.ok(TestClass4.meta.builder.meta.hasMethod('sugar'), "TestClass4's builder received new method")
    
    t.ok(TestClass4.meta.meta.hasAttribute('customInitCalled'), "TestClass4's meta has 'customInitCalled' attribute")
    t.ok(TestClass4.meta.customInitCalled, ".. and it was initialized on early constructring stage")
    
    t.ok(TestClass4.meta.hasAttribute('custom4') && TestClass4.meta.getAttribute('custom4').value == 'attribute4', "TestClass4 has correct attribute 'custom4'")

    
    //==================================================================================================================================================================================
    t.diag("Overriding 'defaultConstructor' from trait")
    
    var constructorOverriden = false
    
    Role('MetaRoleWithConstructor', {
        override : {
            
            defaultConstructor : function () {
                var original = this.SUPER()
                
                return function () {
                    constructorOverriden = true
                    
                    return original.apply(this, arguments)
                }
            }
        }
    })
    
//    debugger

    Class('TestClass5', {
        isa : TestClass3,
        
        trait : MetaRoleWithConstructor
    })
    t.ok(TestClass5, 'TestClass5 class was created')
    
    var testClass5 = new TestClass5()
    
    t.ok(constructorOverriden, "Overriden 'defaultConstructor' was called")
    
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability #3")
    
    TestClass3.meta.extend({
        doesnt : CustomBuilderWrapper
    })
    
    t.ok(TestClass4.meta.meta.isDetached, "TestClass4's meta is still detached")
    t.ok(!TestClass4.meta.builder.meta.hasMethod('sugar'), "TestClass4's builder no longer have 'sugar' method")
    
    t.ok(!TestClass4.meta.meta.hasAttribute('customInitCalled'), "TestClass4's meta has no 'customInitCalled' attribute")
    
    
})