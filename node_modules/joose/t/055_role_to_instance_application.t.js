StartTest(function (t) {
    
    t.plan(55)
    
    //==================================================================================================================================================================================
    t.diag("Role application")
    
    t.ok(Joose.Meta.Role, "Joose.Meta.Role is here")
    t.ok(Joose.Meta.Class, "Joose.Meta.Class is here")
    
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
    t.diag("Composing a role to an empty instance")
    
    Class('Creature')
    
    var creature = new Creature({
        detached : true
    })
    creature.own_attr = true
    
    t.ok(creature.meta.isDetached, "Instance was detached")
    t.ok(creature.constructor != Creature, "Instance was detached, indeed")
    t.ok(creature instanceof Creature, "However its still creature")
    
    t.ok(creature.meta.name == 'Creature', 'Class name for detached instances is still the same')
    
    creature.meta.extend({
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
    
    t.ok(creature.own_attr == true, "Original attributes havn't changed")

    t.ok(creature.meta.hasAttribute('walking') && creature.meta.getAttribute('walking').value == false, "creature has correct attribute 'walking'")
    t.ok(creature.meta.hasAttribute('eating') && creature.meta.getAttribute('eating').value == false, "creature has correct attribute 'eating'")
    t.ok(creature.meta.hasMethod('walk'), 'creature has method walk')
    t.ok(creature.meta.hasMethod('eat'), 'creature has method eat')
    t.ok(creature.meta.hasMethod('stopWalk'), 'creature has method stopWalk')
    t.ok(creature.meta.hasMethod('stopEat'), 'creature has method stopEat')
    t.ok(!creature.meta.hasMethod('stop'), 'creature hasnt method stop')
    
    t.ok(!Creature.meta.hasAttribute('walking'), "Creature class still has no 'walking' attribute")
    t.ok(!Creature.meta.hasAttribute('eating'), "Creature class still has no 'eating' attribute")
    t.ok(!Creature.meta.hasMethod('walk'), 'Creature class has no method walk')
    t.ok(!Creature.meta.hasMethod('eat'), 'Creature class has no method eat')
    t.ok(!Creature.meta.hasMethod('stopWalk'), 'Creature class has no has method stopWalk')
    t.ok(!Creature.meta.hasMethod('stopEat'), 'Creature class has no has method stopEat')
    t.ok(!Creature.meta.hasMethod('stop'), 'Creature class has no hasnt method stop')

    
    creature.walk('there')
    t.ok(creature.walking, 'Creature is walking')
    creature.stopWalk()
    t.ok(!creature.walking, 'Creature is not walking')
    

    //==================================================================================================================================================================================
    t.diag("Composing a role to an empty instance via 'trait'")
    
    var creature2 = new Creature({
        trait : [{
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
    
    t.ok(creature2.meta.isDetached, "Instance was detached")
    t.ok(creature2.constructor != Creature, "Instance was detached, indeed")
    t.ok(creature2 instanceof Creature, "However its still creature2")
    
    t.ok(creature2.meta.hasAttribute('walking') && creature2.meta.getAttribute('walking').value == false, "creature2 has correct attribute 'walking'")
    t.ok(creature2.meta.hasAttribute('eating') && creature2.meta.getAttribute('eating').value == false, "creature2 has correct attribute 'eating'")
    t.ok(creature2.meta.hasMethod('walk'), 'creature2 has method walk')
    t.ok(creature2.meta.hasMethod('eat'), 'creature2 has method eat')
    t.ok(creature2.meta.hasMethod('stopWalk'), 'creature2 has method stopWalk')
    t.ok(creature2.meta.hasMethod('stopEat'), 'creature2 has method stopEat')
    t.ok(!creature2.meta.hasMethod('stop'), 'creature2 hasnt method stop')
    
    creature2.walk('there')
    t.ok(creature2.walking, 'Creature is walking')
    creature2.stopWalk()
    t.ok(!creature2.walking, 'Creature is not walking')
    
    
    //==================================================================================================================================================================================
    t.diag("Cannibal creature && Role.apply testing")
    
    Role('Cannibalism', {
        requires : [ 'eat' ],
        
        override : {
            eat : function (food) { 
                if (food.constructor == this.constructor) this.SUPER(food)
            }
        }
    })
    
    creature.meta.extend({ does : Cannibalism })
    
    creature.eat({})
    t.ok(!creature.eating, "Creature becomes cannibal ))")

    creature.meta.extend({ doesnt : Cannibalism })
    
    creature.eat({})
    t.ok(creature.eating, "Creature now eats usual food again")

    
    //==================================================================================================================================================================================
    t.diag("Attaching instance back")
    
    creature.meta.extend({
        doesnt : [ Walk, Eat ]
    })
    
    t.ok(creature.own_attr == true, "Original attributes still havn't changed")
    t.ok(!creature.meta.hasAttribute('walking'), "creature hasnt 'walking' attribute")
    t.ok(!creature.meta.hasAttribute('eating') , "creature hasnt 'eating' attribute")
    
    t.ok(!creature.meta.hasMethod('walk') && !creature.walk, "creature hasnt 'walk' method")
    t.ok(!creature.meta.hasMethod('eat') && !creature.eat, "creature hasnt 'eat' method")
    t.ok(!creature.meta.hasMethod('stopWalk') && !creature.stopWalk, "creature hasnt 'stopWalk' method")
    t.ok(!creature.meta.hasMethod('stopEat') && !creature.stopEat, "creature hasnt 'stopEat' method")
    
    
    //==================================================================================================================================================================================
    t.diag("Detaching instance of class with 'my'")
    
    Class('TestClass', {
        my : {
            trait : Walk,
            
            methods : {
                process : function () {
                    return 'res'
                }
            }
        },
        
        methods : {
            process : function () {
                return this.constructor.my.process()
            }
        }
    })
    
    t.ok(TestClass && TestClass.my.process() == 'res', "TestClass was created correctly")
    
    var myMeta = TestClass.my.meta
    
    t.ok(myMeta.meta.isDetached, "'my' instance was detached")
    t.ok(myMeta.meta.hasAttribute('walking') && myMeta.walking === false, "'my' instance has correct attribute 'walking'")
    t.ok(myMeta.meta.hasMethod('walk'), "'my' instance has method walk")
    t.ok(myMeta.meta.hasMethod('stop'), "'my' instance has method stop")
    
    
    var testClass = new TestClass({
        detached : true
    })
    
    t.ok(testClass.meta.isDetached, "Instance of 'TestClass' was created detached")
    t.ok(testClass.process() == 'res', "Instance of 'TestClass' has a correct 'process' method")
    
    
    //==================================================================================================================================================================================
    t.diag("Traits and custom 'BUILD' method")
    
    Class('TestClass2', {
        
        has : {
            attr : 'value'
        },
        
        methods : {
            
            BUILD : function (attr, trait) {
                return {
                    attr : attr,
                    trait : trait
                }
            }
        }
    })
    
    var testClass2 = new TestClass2('testvalue', Walk)
    
    t.ok(testClass2.meta.isDetached, "Instance of 'TestClass2' was created detached")
    t.ok(testClass2.meta.hasAttribute('walking') && testClass2.walking === false, "'testClass2' instance has correct attribute 'walking'")
    t.ok(testClass2.meta.hasMethod('walk'), "'testClass2' instance has method walk")
    t.ok(testClass2.meta.hasMethod('stop'), "'testClass2' instance has method stop")
})