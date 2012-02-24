StartTest(function (t) {
    
    t.plan(5)
    
    //==================================================================================================================================================================================
    t.diag("Sanity")
    
    t.ok(Joose.Managed.Class, "Joose.Managed.Class is here")
    
    
    //==================================================================================================================================================================================
    t.diag("Defining a metaclass with unmodified builder class")
    
    var BaseMetaClass = new Joose.Managed.Class('BaseMetaClass', {
        isa : Joose.Managed.Class
    }).c

    
    
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
    
    
    t.ok(SuperMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder2'), "'SuperMetaClass' received 'testBuilder2'")
    t.ok(!BaseMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder2'), "BaseMetaClass don't received 'testBuilder2'")

    //==================================================================================================================================================================================
    t.diag("Mutation of builder class")
    
    
    BaseMetaClass.meta.extend({
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
    })
    
    t.ok(BaseMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder'), "BaseMetaClass extended its builder class")
    
    t.ok(SuperMetaClass.meta.getClassInAttribute('builderClass').meta.hasMethod('testBuilder2'), "and it reflected in sub-meta-classes")
    
})