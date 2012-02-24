StartTest(function (t) {
    t.plan(36)
    
    //==================================================================================================================================================================================
    t.diag("Joose.Managed.Class")
    
    t.ok(Joose.Managed.Property.MethodModifier, "Joose.Managed.Property.MethodModifier is here")
    t.ok(Joose.Managed.Property.MethodModifier.Before, "Joose.Managed.Property.MethodModifier.Before is here")
    t.ok(Joose.Managed.Property.MethodModifier.After, "Joose.Managed.Property.MethodModifier.After is here")
    t.ok(Joose.Managed.Property.MethodModifier.Override, "Joose.Managed.Property.MethodModifier.Override is here")
    t.ok(Joose.Managed.Property.MethodModifier.Around, "Joose.Managed.Property.MethodModifier.Around is here")
    t.ok(Joose.Managed.Property.MethodModifier.Augment, "Joose.Managed.Property.MethodModifier.Augment is here")
    
    
    //==================================================================================================================================================================================
    t.diag("Before & After")
    
    var TestClass = new Joose.Managed.Class('TestClass', {
        have : {
            res : ""
        },
        
        methods : {
            process : function () { return 'TestClass' }
        },
        
        before : {
            process : function () { this.res += "|before" }
        },
        
        after : {
            process : function () { this.res += "|after" }
        }
    }).c
    
    t.ok(typeof TestClass == 'function', "TestClass was created")
    
    t.ok(TestClass.meta.hasAttribute('res'), "TestClass has 'res' attribute"); 
    t.ok(TestClass.meta.hasMethod('process'), "TestClass has 'result' method")

    var testClass = new TestClass()
    
    t.ok(testClass && testClass.res == "", "TestClass was instantiated and 'res' have correct initial value")
    t.is(testClass.process(), 'TestClass', "Method return value from original function")
    t.is(testClass.res, '|before|after', "'before' and 'after' modifiers were applied")
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability #1")
    
    TestClass.meta.extend({
        before : {
            process : function () { this.res += "|before2" }
        },
        
        after : {
            process : function () { this.res += "|after2" }
        }
    })
    
    testClass.res = ''
    
    t.is(testClass.process(), 'TestClass', "Method return value from original function")
    t.is(testClass.res, '|before2|before|after|after2', "New 'before' and 'after' modifiers were applied")

    
    TestClass.meta.extend({
        removeModifier : [ 'process', 'process', 'process' ]
    })
    
    testClass.res = ''
    
    t.is(testClass.process(), 'TestClass', "Method return value from original function")
    t.is(testClass.res, '|before', "Only the 1st 'before' modifier remains")
    

    //==================================================================================================================================================================================
    t.diag("Mutability #2")
    
    var TestClass1 = new Joose.Managed.Class('TestClass1', {
        isa : TestClass,
        
        before : {
            process : function () { this.res += "|beforeTC1" }
        },
        
        after : {
            process : function () { this.res += "|afterTC1" }
        }
    }).c
    
    var testClass1 = new TestClass1()

    t.is(testClass1.process(), 'TestClass', "Inherited method return correct value")
    t.is(testClass1.res, '|beforeTC1|before|afterTC1', "Only the 1st 'before' modifier remains")
    
    
    TestClass.meta.extend({
        after : {
            process : function () { this.res += "|after" }
        }
    })
    
    testClass1.res = ''
    
    t.is(testClass1.process(), 'TestClass', "Method return value from original function")
    t.is(testClass1.res, '|beforeTC1|before|after|afterTC1', "New modifier from subclass was correctly installed into 'modifying chain' ")
    
    
    //==================================================================================================================================================================================
    t.diag("Override & inheritance (SUPER call differentiation)")

    var TestClass3 = new Joose.Managed.Class('TestClass3', {
        methods : {
            inc : function (a) { return a + '|T3' }
        },
        
        override : {
            inc : function (a) {
                return this.SUPER(a) + '|T3O'
            }
        }
    }).c
    
    var testClass3 = new TestClass3();    
    
    t.is(testClass3.inc('T'), 'T|T3|T3O', "'override' modifier works correctly")
    
    
    
    var TestClass4 = new Joose.Managed.Class('TestClass4', {
        isa : TestClass3,
        
        override : {
            inc : function (a) { return this.SUPER(a) + '|T4O1' }
        }
    }).c
    
    var testClass4 = new TestClass4();    
    
    t.is(testClass4.inc('T'), 'T|T3|T3O|T4O1', "'override' modifier was applied to inherited method")
    
    
    
    TestClass3.meta.extend({
        removeModifier : [ 'inc' ]
    })
    
    t.is(testClass4.inc('T'), 'T|T3|T4O1', "'override' chain lost 'T3O' element")
    

    TestClass4.meta.extend({
        methods : {
            inc : function (a) { return a + '|T4' }
        }
    })
    
    t.is(testClass4.inc('T'), 'T|T4|T4O1', "'override' modifier was applied to own method")
    

    TestClass4.meta.extend({
        removeMethods : [ 'inc' ]
    })
    
    t.is(testClass4.inc('T'), 'T|T3|T4O1', "'override' modifier was applied to inherited method again")
    
    
    TestClass4.meta.extend({
        override : {
            inc : function (a) { return this.SUPERARG(arguments) + '|T4O2' }
        }
    })
    
    t.is(testClass4.inc('T'), 'T|T3|T4O1|T4O2', "2nd 'override' modifier was applied to inherited method + it works via SUPERARG")

    
    TestClass4.meta.extend({
        methods : {
            inc : function (a) { return a + '|T4' }
        }
    })
    
    t.is(testClass4.inc('T'), 'T|T4|T4O1|T4O2', "Two 'override's modifiers were applied to own method")
    
    
    //==================================================================================================================================================================================
    t.diag("Around")
    
    var TestClass5 = new Joose.Managed.Class('TestClass5', {
        
        methods : {
            inc : function (a) { return a }
        },
        
        around : {
            inc : function (prev, a) { return prev(a) + "|aroundT5" }
        }
        
    }).c
    

    var testClass5 = new TestClass5()

    t.diag(testClass5.inc('T'))
    t.is(testClass5.inc('T'), 'T|aroundT5', "Around modifier works")
    
    
    var TestClass6 = new Joose.Managed.Class('TestClass6', {
        isa : TestClass5,
        
        around : {
            inc : function (prev, a) { return prev(a) + "|aroundT6" }
        }
        
    }).c
    
    var testClass6 = new TestClass6()

    t.is(testClass6.inc('T'), 'T|aroundT5|aroundT6', "Around modifier works on inherited method")
    
    
    TestClass5.meta.extend({
        removeModifier : [ 'inc' ]
    })
    
    t.is(testClass6.inc('T'), 'T|aroundT6', "Around modifier from TestClass5 was removed")
    
    TestClass6.meta.extend({
        methods : {
            inc : function (a) { return 'T6:' + a }
        }
    })
    
    t.is(testClass6.inc('T'), 'T6:T|aroundT6', "Around modifier was applied to own method")
    
    
    //==================================================================================================================================================================================
    t.diag("Augment")
    
    var HTMLDoc = new Joose.Managed.Class('HTMLDoc', {
        augment: {
            html: function () { return "<html>"+this.INNER()+"</html>" }
        }
    }).c
    
    
    
    var HTMLDocBody = new Joose.Managed.Class('HTMLDocBody', {
        isa: HTMLDoc,
        
        augment: {
            html: function () { return "<head>"+this.head()+"</head><body>"+this.INNER()+"</body>" },
            head: function () { return "<title>"+this.INNER()+"</title>" }
        }
    }).c
    
    
    var TPSReport = new Joose.Managed.Class('TPSReport', {
        isa: HTMLDocBody,
        
        augment: {
            html: function () { return this.INNER() || '' },
            head: function () { return "TPS-Report" }
        }
    }).c
    
    var tps = new TPSReport()
    
    t.ok(tps.html() == "<html><head><title>TPS-Report</title></head><body></body></html>", "Augment method modifier works")

    
    
    HTMLDocBody.meta.extend({
        removeModifier : [ 'head' ]
    })
    
    t.ok(tps.html() == "<html><head>TPS-Report</head><body></body></html>", "Dynamic Augment modifier removing works")
    
    
    HTMLDocBody.meta.extend({
        methods : {
            html: function () { return "<xhtml>"+this.INNER()+"</xhtml>" }
        }
    })
    
    t.ok(tps.html() == "<xhtml><head>TPS-Report</head><body></body></xhtml>", "Dynamically inserted in 'augments' chain method works")
    

    //==================================================================================================================================================================================
    t.diag("Augment - alternate inheritance path")

    var TPSReport1 = new Joose.Managed.Class('TPSReport1', {
        isa: HTMLDocBody,
        
        augment: {
            html: function () { return "<h1>TPS-Report1</h1>" },
            head: function () { return "TPS-Report1" }
        }
    }).c
    
    var tps1 = new TPSReport1()
    t.ok(tps1.html() == "<xhtml><head>TPS-Report1</head><body><h1>TPS-Report1</h1></body></xhtml>", "Augment in class on alternate inheritance path works")
    
    
    //==================================================================================================================================================================================
    t.diag("Combined")
    
    var TestClass7 = new Joose.Managed.Class('TestClass7', {
        
        have : {
            res : ''
        },
        
        methods : {
            inc : function () { return this.res += '|T7' }
        },
        
        before : {
            inc : function () { return this.res += '|T7-before' }
        },
        
        override : {
            inc : function () {
                this.SUPER()
                this.res += '|T7-override'
            }
        },
        
        after : {
            inc : function () { this.res += '|T7-after' }
        }

    }).c
    

    var TestClass8 = new Joose.Managed.Class('TestClass8', {
        isa : TestClass7,
        
        override : {
            inc : function () {
                this.SUPER()
                this.res += '|T8-override'
            }
        },
        
        before : {
            inc : function () { this.res += '|T8-before' }
        },

        
        after : {
            inc : function () { this.res += '|T8-after' }
        },
        
        around : {
            inc : function (prev) { 
                prev()
                this.res += '|T8-around'
                this.INNER()
            }
        },
        
        augment : {
            inc : function () { 
                this.res += '|T8-augment'
                this.INNER()
            }
        }
        
    }).c
    
    var TestClass9 = new Joose.Managed.Class('TestClass9', {
        isa : TestClass8,
        
        augment : {
            inc : function () { 
                this.res += '|T9-augment'
                this.INNER()
            }
        }
        
    }).c
    
    var testClass9 = new TestClass9()
    
    testClass9.inc()
    
    t.is(testClass9.res, "|T8-before|T7-before|T7|T7-override|T7-after|T8-override|T8-after|T8-around|T8-augment|T9-augment", "Combined test passed"); 
    
})