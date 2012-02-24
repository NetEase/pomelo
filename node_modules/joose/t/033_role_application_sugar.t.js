StartTest(function (t) {
    t.plan(11)
    
    //==================================================================================================================================================================================
    t.diag("Sugar in Role application")
    
    t.ok(Joose.Managed.Role, "Joose.Managed.Role is here")
    t.ok(Joose.Managed.Class, "Joose.Managed.Class is here")
    
    //==================================================================================================================================================================================
    t.diag("Does with non-array argument")
    
    var Walk = new Joose.Managed.Role('Walk', { 
        have : {
            walking : false
        },
        
        methods : {
            walk : function (where) { this.walking = true },
            stop : function () { this.walking = false }
        }
    }).c
    
    t.ok(Walk, 'role Walk was created')
    
    
    var Creature = new Joose.Managed.Class('Creature', {
        does : Walk
    }).c
    
    t.ok(Creature.meta.hasAttribute('walking') && Creature.meta.getAttribute('walking').value == false, "Creature has correct attribute 'walking'")
    t.ok(Creature.meta.hasMethod('walk'), 'Creature has method walk')
    t.ok(Creature.meta.hasMethod('stop'), 'Creature has method stop')
    
    var creature = new Creature()
    
    creature.walk('there')
    t.ok(creature.walking, 'Creature is walking')
    creature.stop()
    t.ok(!creature.walking, 'Creature is not walking')
    

    //==================================================================================================================================================================================
    t.diag("Doesnt with non-array argument")
  
    Creature.meta.extend({
        doesnt : Walk
    })
    
    t.ok(!Creature.meta.hasAttribute('walking'), "Creature has not 'walking' attribute")
    t.ok(!Creature.meta.hasMethod('walk'), 'Creature has not method walk')
    t.ok(!Creature.meta.hasMethod('stop'), 'Creature has not method stop')
    
})