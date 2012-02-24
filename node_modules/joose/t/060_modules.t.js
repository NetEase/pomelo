StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Modules")
    
    t.autoCheckGlobals = false
    
    t.ok(Joose.Namespace.Manager, "Joose.Namespace.Manager is here")
    t.ok(Joose.Namespace.Keeper, "Joose.Namespace.Keeper is here")
    
    Module('TestModule', {
        
        VERSION : 0.01,
        AUTHORITY : 'auth',
        
        body : function (module) {
            this.foo = 'bar'
            module.bar = 'baz'
            
            t.ok(TestModule.meta.VERSION == 0.01, 'Correct VERSION detected')
            t.ok(TestModule.meta.AUTHORITY == 'auth', 'Correct AUTHORITY detected')
        }
    })
    
    t.ok(TestModule, 'Something in the module spot appears')
    t.ok(TestModule.meta.constructor == Joose.Namespace.Keeper, '.. and its a Joose.Namespace.Keeper')
    
    t.is(TestModule.foo, 'bar', 'Body of module was executed in the scope of its container')
    t.is(TestModule.bar, 'baz', 'Module namespacekeeper was also passed as 1st argument to body')

    
    //==================================================================================================================================================================================
    t.diag("Modules with several name parts")
    
    Module('Test1.Test2.Test3', {
        body : function (module) {
            this.foo = 'bar'
            module.bar = 'baz'
        }
    })
    
    t.ok(Test1 && Test1.meta.constructor == Joose.Namespace.Keeper, "Module 'Test1' was created")
    t.ok(Test1.Test2 && Test1.Test2.meta.constructor == Joose.Namespace.Keeper, "Module 'Test1.Test2' was created")
    t.ok(Test1.Test2.Test3 && Test1.Test2.Test3.meta.constructor == Joose.Namespace.Keeper, "Module 'Test1.Test2.Test3' was created")
    
    t.ok(Test1.Test2.Test3.foo == 'bar' && Test1.Test2.Test3.bar == 'baz', 'Test1.Test2.Test3 was correctly setuped')

    //==================================================================================================================================================================================
    t.diag("Exceptions")

    t.throws_ok(
        function () { new TestModule() }, 
        "Module [TestModule] may not be instantiated.",
        "Not filled Modules can't be instantiated"
    )
    
    t.throws_ok(function () {
        Module("Testy.meta.bla", function () {
            
        })
    }, Joose.is_IE ? "" : "Module name [Testy.meta.bla] may not include a part called 'meta' or 'my' or empty part.", "meta is not allowed in a module name")
    

    t.throws_ok(function () {
        Module("Testy..bla", function () {
            
        })
    }, Joose.is_IE ? "" : "Module name [Testy..bla] may not include a part called 'meta' or 'my' or empty part.", "meta is not allowed in a module name")
    

    t.throws_ok(function () {
        Module("Testy.my.bla", function () {
            
        })
    }, Joose.is_IE ? "" : "Module name [Testy.my.bla] may not include a part called 'meta' or 'my' or empty part.", "meta is not allowed in a module name")
    
    
    //==================================================================================================================================================================================
    t.diag("Basic nesting")
    
    Module("TestModule", {
        body : function () {
            Class("Test1", {
                methods: { world: function () { return "hello1" } }
            })
            
            Class("Test2", {
                methods: { world: function () { return "hello2" } }
            })
            
            Module("Test3", function (mod) {
                this.foo = 'bar'
                mod.bar = 'baz'
            })
            
            Module(".Global.Test3", function (mod) {
                this.foo = 'bar3'
                mod.bar = 'baz3'
            })
        }
    })
    
    
    t.ok(TestModule.Test1, "There is something in the class spot")
    t.ok(TestModule.Test1.meta.constructor == Joose.Meta.Class, "it is a class")
    t.ok(TestModule.Test1.meta.name  == "TestModule.Test1", "The class name is correct")
    t.ok(new TestModule.Test1().world() == 'hello1', "Class was correctly instantiated")
    
    t.ok(TestModule.Test2, "There is something in the class#2 spot")
    t.ok(TestModule.Test2.meta.constructor == Joose.Meta.Class, "it is a class")
    t.ok(TestModule.Test2.meta.name  == "TestModule.Test2", "The class name is correct")
    t.ok(new TestModule.Test2().world() == 'hello2', "Class was correctly instantiated")
    
    t.ok(TestModule.Test3, 'Something in the nested module spot appears')
    t.ok(TestModule.Test3.meta.constructor == Joose.Namespace.Keeper, '.. and its a Joose.Namespace.Keeper')
    t.ok(TestModule.Test3.foo == 'bar' && TestModule.Test3.bar == 'baz', 'TestModule.Test3 was correctly setuped')

    
    t.ok(Global.Test3, 'Something in the nested module spot appears')
    t.ok(Global.Test3.meta.constructor == Joose.Namespace.Keeper, '.. and its a Joose.Namespace.Keeper')
    t.ok(Global.Test3.foo == 'bar3' && Global.Test3.bar == 'baz3', 'Global.Test3 was correctly setuped')
    
    
    //==================================================================================================================================================================================
    t.diag("Modules redeclaration")
    
    t.ok(TestModule.foo == 'bar' && TestModule.bar == 'baz', 'TestModule is still the same after extension')
    
    Module("TestModule.Test3", {
        body : function () {
            Module("Test4")
        }
    })
    
    t.ok(TestModule.Test3.Test4, 'Something in the nested module spot appears')
    t.ok(TestModule.Test3.Test4.meta.constructor == Joose.Namespace.Keeper, '.. and its a Joose.Namespace.Keeper')
    t.ok(TestModule.Test3.foo == 'bar' && TestModule.Test3.bar == 'baz', "TestModule.Test3 hasn't changed")

    
    //==================================================================================================================================================================================
    t.diag("Promotion of Module to Class")
    
    Class("TestModule.Test3", {
        have : {
            one : 1
        },
        
        methods: { 
            two: function () { return 2 } 
        }
    })
    
    t.ok(TestModule.Test3.meta.constructor == Joose.Meta.Class, 'Module was promoted to class')
    
    var test3 = new TestModule.Test3()
    
    t.ok(test3.one == 1 && test3.two() == 2, 'Class was constructed correctly')
    t.ok(TestModule.Test3.foo == 'bar' && TestModule.Test3.bar == 'baz', "and TestModule.Test3 function itself hasn't changed")
    
    
    //==================================================================================================================================================================================
    t.diag("Class usage in Module context")
    
    Class("TestModule.Test3.FooBar", {
        have : {
            one : 1
        },
        
        methods: { 
            two: function () { return 2 } 
        }
    })
    
    t.ok(TestModule.Test3.FooBar, "We can use a class as Module")
    t.ok(TestModule.Test3.FooBar.meta.constructor == Joose.Meta.Class, "it is a class")
    
    var foobar = new TestModule.Test3.FooBar()
    
    t.ok(foobar.one == 1 && foobar.two() == 2, 'Class was constructed correctly')
    
    
    //==================================================================================================================================================================================
    t.diag("More basic nesting")
    
    Module("Testy", function () {
        Module("Nested", function () {
            Class("Testing", {
                methods : {
                    three : function () { return 3 }
                }
            })
        })
        
        
        Module("Nested.Copy", function () {
            Class("Testing", {
                methods : {
                    four : function () { return 4 }
                }
            })
        })
    })
    
    t.ok(Testy && Testy.meta.constructor == Joose.Namespace.Keeper, "Module 'Testy' was created")
    t.ok(Testy.Nested && Testy.Nested.meta.constructor == Joose.Namespace.Keeper, "Module 'Testy.Nested' was created")
    t.ok(Testy.Nested.Copy && Testy.Nested.Copy.meta.constructor == Joose.Namespace.Keeper, "Module 'Testy.Nested.Copy' was created")
    
    t.ok(Testy.Nested.Testing && Testy.Nested.Testing.meta.constructor == Joose.Meta.Class, "Class 'Testy.Nested.Testing' was created")
    t.ok(Testy.Nested.Copy.Testing && Testy.Nested.Copy.Testing.meta.constructor == Joose.Meta.Class, "Class 'Testy.Nested.Copy.Testing' was created")
    
    t.ok(new Testy.Nested.Testing().three() == 3, "Class 'Testy.Nested.Testing' was constructed correctly")
    t.ok(new Testy.Nested.Copy.Testing().four() == 4, "Class 'Testy.Nested.Copy.Testing' was constructed correctly")
    
    
    //==================================================================================================================================================================================
    t.diag("Advanced nesting modules")
    
    Module("Level1.Level2", {
        body : function () {
            
            t.ok(Level1.Level2 && Level1.Level2.meta.constructor == Joose.Namespace.Keeper, "Level1.Level2 spot filled correctly")
            
            Module("Level3_1", {
                body : function () {
                    Class("Level4", {
                        methods : {
                            three : function () { return 3 }
                        }
                    })
                    t.ok(Level1.Level2.Level3_1.Level4 && Level1.Level2.Level3_1.Level4.meta.constructor == Joose.Meta.Class, "Level1.Level2.Level3_1.Level4 spot filled correctly")
                    t.ok(new Level1.Level2.Level3_1.Level4().three() == 3, "Level1.Level2.Level3_1.Level4 class constructed correctly")
                }
            })
            t.ok(Level1.Level2.Level3_1 && Level1.Level2.Level3_1.meta.constructor == Joose.Namespace.Keeper, "Level1.Level2.Level3_1 spot filled correctly")
            
            Module("Level3_2", {
                body : function () {
                    Class("Level4", {
                        methods : {
                            four : function () { return 4 }
                        }
                    })
                    t.ok(Level1.Level2.Level3_2.Level4 && Level1.Level2.Level3_2.Level4.meta.constructor == Joose.Meta.Class, "Level1.Level2.Level3_2.Level4 spot filled correctly")
                    t.ok(new Level1.Level2.Level3_2.Level4().four() == 4, "Level1.Level2.Level3_2.Level4 class constructed correctly")
                    
                    
                    Class(".Glob.Level44", {
                        methods : {
                            four : function () { return 44 }
                        }
                    })
                    t.ok(Glob.Level44 && Glob.Level44.meta.constructor == Joose.Meta.Class, "Glob.Level44 spot filled correctly")
                }
            })
            t.ok(Level1.Level2.Level3_2 && Level1.Level2.Level3_2.meta.constructor == Joose.Namespace.Keeper, "Level1.Level2.Level3_2 spot filled correctly")
        }
    })

    
    //==================================================================================================================================================================================
    t.diag("Class is already constructed in 'body' execution")
    
    Class("TestClass", {
        methods : {
            four : function () { return 4 }
        },
        
        body : function () {
            t.ok(TestClass && TestClass.meta.constructor == Joose.Meta.Class, "TestClass spot filled correctly")
            
            t.ok(!TestClass.meta.stem.opened, "TestClass's stem is closed")
            
            t.ok(new TestClass().four() == 4, "TestClass class is already constructed")
        }
    })
    
    
    t.done()
})