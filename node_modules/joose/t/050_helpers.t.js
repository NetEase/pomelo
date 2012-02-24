StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Modules")
    
    t.autoCheckGlobals = false
    
    t.ok(Joose.Namespace.Manager, "Joose.Namespace.Manager is here")
    t.ok(Joose.Namespace.Keeper, "Joose.Namespace.Keeper is here")
    
    
    Module('TestModule', {})
    
    t.ok(TestModule, 'Something in the module spot appears')
    t.ok(TestModule.meta instanceof Joose.Namespace.Keeper, '.. and its a Joose.Namespace.Keeper')
    
    //==================================================================================================================================================================================
    t.diag("Class")
    
    Class('TestClass', {
        have : {
            res : 'instance'
        },
        
        methods : {
            result : function () { return 'TestClass:instance' }
        },
        
        
        my : {
            have : {
                res : 'class'
            },
            
            methods : {
                result : function () { return 'TestClass:class' }
            }
        }
        
    })
    
    t.ok(typeof TestClass == 'function', "TestClass was created")
    t.ok(TestClass.my && TestClass.my.meta, "Class-level symbiont was created")
    
    t.ok(TestClass.meta.hasAttribute('res'), "TestClass has 'res' attribute"); 
    t.ok(TestClass.meta.hasMethod('result'), "TestClass has 'result' method")

    t.ok(TestClass.my.meta.hasAttribute('res'), "TestClass.my has 'res' attribute"); 
    t.ok(TestClass.my.meta.hasMethod('result'), "TestClass.my has 'result' method")
    
    
    var testClass = new TestClass()
    
    t.ok(testClass, "TestClass was instantiated")
    t.ok(testClass.res == 'instance', "Usual attribute was correctly installed")
    t.is(testClass.result(), 'TestClass:instance', "Method was correctly installed")
    
    t.ok(TestClass.my.res == 'class', "Symbiont's attribute was correctly installed")
    t.is(TestClass.my.result(), 'TestClass:class', "Symbiont's method was correctly installed")
    

    //==================================================================================================================================================================================
    t.diag("Class extension")
    
    TestClass.meta.extend({
        have : {
            res1 : 'instance1'
        },
        
        methods : {
            result1 : function () { return 'TestClass:instance1' }
        },
        
        
        my : {
            have : {
                res1 : 'class1'
            },
            
            methods : {
                result1 : function () { return 'TestClass:class1' }
            }
        }
        
    })
    
    
    t.ok(TestClass.meta.hasAttribute('res1'), "TestClass has 'res1' attribute via extension with helper"); 
    t.ok(TestClass.meta.hasMethod('result1'), "TestClass has 'result1' method via extension with helper")

    t.ok(TestClass.my.meta.hasAttribute('res1'), "TestClass.my has 'res1' attribute via extension with helper"); 
    t.ok(TestClass.my.meta.hasMethod('result1'), "TestClass.my has 'result1' method via extension with helper")
    
    t.ok(testClass.res1 == 'instance1', "re1 attribute was correctly installed")
    t.is(testClass.result1(), 'TestClass:instance1', "result1 method was correctly installed")
    
    t.ok(TestClass.my.res1 == 'class1', "Symbiont's attribute was correctly installed also")
    t.is(TestClass.my.result1(), 'TestClass:class1', "Symbiont's method was correctly installed also")
    
    
    //==================================================================================================================================================================================
    t.diag("Role creation")
    
    Role('Walk', { 
        have : {
            walking : false
        },
        
        methods : {
            walk : function (where) { this.walking = true },
            stop : function () { this.walking = false }
        }
    })
    
    t.ok(Walk.meta.hasAttribute('walking') && Walk.meta.getAttribute('walking').value == false, 'Walk has correct attribute walking')
    t.ok(Walk.meta.hasMethod('walk'), 'Walk has method walk')
    t.ok(Walk.meta.hasMethod('stop'), 'Walk has method stop')


    Role('Eat', { 
        have : {
            eating : false
        },
        
        methods : {
            eat : function (food) { this.eating = true },
            stop : function () { this.eating = false }
        }
    })
    
    
    //==================================================================================================================================================================================
    t.diag("Exceptions")
    
    t.throws_ok(function () {
        Class('TestCreature1', {
            does : [ Walk, Eat ]
        })
    }, Joose.is_IE ? "" : "Attempt to apply ConflictMarker [stop] to [TestCreature1]", "Conflicts are detecting")
    
    
    t.throws_ok(function () {
        Class('TestCreature2', {
            requires : [ 'walk' ]
        })
    }, Joose.is_IE ? "" : "Unknown builder [requires] was used during extending of [TestCreature2]", "'requires' builder can only be used with Roles")
    
    
    //==================================================================================================================================================================================
    t.diag("Composing a class from roles with aliasing")
    
    
    Class('Creature', {
        does : [{
            role : Walk,
            alias : {
                stop : 'stopWalk'
            },
            exclude : [ 'stop' ]
        }, {
            role : Eat,
            alias : {
                stop : 'stopEat'
            },
            exclude : [ 'stop' ]
        }]
    })
    

    t.ok(Creature.meta.hasAttribute('walking') && Creature.meta.getAttribute('walking').value == false, "Creature has correct attribute 'walking'")
    t.ok(Creature.meta.hasAttribute('eating') && Creature.meta.getAttribute('eating').value == false, "Creature has correct attribute 'eating'")
    t.ok(Creature.meta.hasMethod('walk'), 'Creature has method walk')
    t.ok(Creature.meta.hasMethod('eat'), 'Creature has method eat')
    t.ok(Creature.meta.hasMethod('stopWalk'), 'Creature has method stopWalk')
    t.ok(Creature.meta.hasMethod('stopEat'), 'Creature has method stopEat')
    t.ok(!Creature.meta.hasMethod('stop'), 'Creature hasnt method stop')
    
    var creature = new Creature()
    
    creature.walk('there')
    t.ok(creature.walking, 'Creature is walking')
    creature.stopWalk()
    t.ok(!creature.walking, 'Creature is not walking')
    

    //==================================================================================================================================================================================
    t.diag("Cannibal creature")
    
    Role('Cannibalism', {
        requires : [ 'eat' ],
        
        override : {
            eat : function (food) { 
                if (food.constructor == this.constructor) this.SUPER(food); 
            }
        }
    })
    
    
    Class('Cannibal', {
        isa : Creature,
        
        does : [ Cannibalism ]
    });    
    
    
    var cannibal1 = new Cannibal()
    var cannibal2 = new Cannibal()
    var creature = new Creature()
    
    cannibal1.eat(creature)
    t.ok(!cannibal1.eating, "Cannibal eats only creatures from his species #1 + method modifier from Role works")

    cannibal1.eat(cannibal2)
    t.ok(cannibal1.eating, "Cannibal eats only creatures from his species #2")
    cannibal1.stopEat()
    t.ok(!cannibal1.eating, "Cannibal1 ate cannibal2 )")
    
    
    //==================================================================================================================================================================================
    t.diag("Plant & required methods")
    
    Class('Plant', {
        methods : {
            grow : function () {}
        }
    })
    
    
    t.throws_ok(function () {
        Plant.meta.extend({
            does : [ Cannibalism ]
        })
    }, "Requirement [eat], defined in [Cannibalism] is not satisfied for class [Plant]", "Missing of required method detected")
    
    
    var plant = new Plant()

    //==================================================================================================================================================================================
    t.diag("Human")
    
    Role('Drive', {
        requires : [ 'walk' ],
        
        have : {
            driving : false
        },
        
        methods : {
            drive : function (where) { this.driving = true },
            stop : function () { this.driving = false }
        },
        
        override : {
            walk : function (where) { 
                this.drive(where); 
            }
        }
    });    
    
    
    Role('Vegetarian', {
        requires : [ 'eat' ],
        
        override : {
            eat : function (food) { 
                if (!food.meta.hasMethod('walk')) this.SUPER(food); 
            }
        }
    });    

    
    Class('Human', {
        
        isa : Creature,
        
        does : [ Drive, Vegetarian ],
        
        have : {
            cleanHands : false
        },
        
        methods : {
            washHands : function () {
                this.cleanHands = true
            }
        },
        
        before : {
            eat : function () { this.washHands() }
        },
        
        after : {
            stopEat : function () { this.cleanHands = false; }
        }
        
    })
    
    
    var human = new Human()
    
    human.eat(cannibal1)
    t.ok(!human.eating, "Human doesn't eat thing which can 'walk' #1")
    t.ok(!human.cleanHands, "Human have not washed hands yet")
    
    human.eat(creature)
    t.ok(!human.eating, "Human doesn't eat thing which can 'walk' #2")
    
    human.eat(plant)
    t.ok(human.eating, "Human is vegetarian")
    t.ok(human.cleanHands, "Human washed hands before eating")
    
    human.stopEat()
    t.ok(!human.cleanHands, "Human has dirty hands after he ate")
    
    human.walk('supermarket')
    t.ok(!human.walking, "Humans mostly drives #1")
    t.ok(human.driving, "Humans mostly drives #2")
    
    human.eat(plant)
    t.ok(human.eating, "Human can eat during driving")
    human.stopEat()
    
    human.stop()
    t.ok(!human.driving, "Humans stopped")
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability")
    
    Drive.meta.extend({ 
        override : {
            eat : function (food) { 
                if (!this.driving) this.SUPER(food); 
            }
        }
    });      
    
    human.drive('supermarket')
    t.ok(human.driving, "Humans is driving")
    
    human.eat(plant)
    t.ok(!human.eating, "Human now cant eat during driving")
    
    human.stop()
    
    human.eat(plant)
    t.ok(human.eating, "Human now can eat again")
    human.stopEat()
    

    
    Cannibalism.meta.extend({ 
        does : [ Vegetarian ]
    })
    
    cannibal1.eat(creature)
    t.ok(!cannibal1.eating, "Cannibal eats only creatures from his species which cant walk now")

    cannibal1.eat(cannibal2)
    t.ok(!cannibal1.eating, "Cannibal eats only creatures from his species which cant walk now")
    
    cannibal1.eat(plant)
    t.ok(!cannibal1.eating, "Cannibal eats only creatures from his species which cant walk now")
    

    Cannibalism.meta.extend({ 
        doesnt : [ Vegetarian ]
    })
    
    cannibal1.eat(cannibal2)
    t.ok(cannibal1.eating, "Cannibal now can eat again")
    cannibal1.stopEat()
    
    
    
    Human.meta.extend({ 
        doesnt : [ Drive ]
    })
    
    human.walk('supermarket')
    t.ok(human.walking, "Humans now walks instead driving again")
    
    
    //==================================================================================================================================================================================
    t.diag("Anonymous classes")
    
    var anonymousClass = Class({
        methods : {
            result : function () {
                return 10
            }
        }
    })
  
    t.ok(typeof anonymousClass == 'function', 'Something that looks like an anonymous class was created')
    t.ok(new anonymousClass().result() == 10, 'Anonymous class was created')

    
    //==================================================================================================================================================================================
    t.diag("Anonymous roles")
    
    anonymousClass.meta.extend({
        does : Role({
            methods : {
                result2 : function () {
                    return 10
                }
            }
        })
    })
    
    t.ok(new anonymousClass().result2() == 10, 'Anonymous role was created')
    
    
    //==================================================================================================================================================================================
    t.diag("Creating class with low-level meta")
    
    Class('TestProto', {
        meta : Joose.Proto.Class
    })
      
    t.ok(TestProto, "Class with meta Joose.Proto.Class was successfully created via 'Class' helper")
    
    
    //==================================================================================================================================================================================
    t.diag("Class helpers and global scope")
    
    var customSymbol = CustomSymbol = {}
    
    Class('Test.Meta', {
        isa : Joose.Meta.Class
    })
      
    Joose.Namespace.Manager.my.register('CustomSymbol', Test.Meta)
    
    
    t.ok(customSymbol == CustomSymbol, "Global symbol wasn't overriden")
    
    Joose.CustomSymbol('TestClass2', {
        methods : {
            process : function () { return 'res' }
        }
    })
    
    t.ok(TestClass2.meta instanceof Test.Meta, "Helper for CustomSymbol metaclass was aliased to Joose.CustomSymbol")

    
    //==================================================================================================================================================================================
    t.diag("Modifying helper - should be the last test(!), as it modifies the 'Class'")
    
    Joose.Namespace.Manager.my.meta.extend({
        override : {
            Class : function (name, props) {
                return this.SUPER(name + '_', props)
            }
        }
    })
    
    Class('Private', {
        methods : {
            result : function () {
                return 10
            }
        }
    })
    
    t.ok(new Private_().result() == 10, "'Class' helper was modified correctly")
    
    t.done()
    
})