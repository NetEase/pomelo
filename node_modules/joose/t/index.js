var Harness

if (typeof process != 'undefined' && process.pid) {
    Harness = require('test-run')
} else
    Harness = Test.Run.Harness.Browser

    
Harness.configure({
	title           : 'Joose test suite',
    
    verbosity       : 0,
	
//    cachePreload    : true,
//    transparentEx   : true,
    
    keepResults         : false,
    
    autoCheckGlobals    : true,
    expectedGlobals     : [
        'Joose', 'Class', 'Role', 'Module', 'Singleton', 'require'
    ],
    
	preload : [
//        '../joose-webseed.js',
//        '../joose-all-web.js'
        
        '../joose-all.js'
    ]
})


Harness.start(
    '001_helpers.t.js',
    {
        group       : 'Proto class tests',
        
        items       : [
            '010_proto_class.t.js',
            '011_propertyset.t.js',
            '012_propertyset_mutable.t.js'
        ]
    },
    {
        group       : 'Managed class tests',
        
        items       : [
            '020_managed_class.t.js',
            '021_method_modifiers.t.js',
            '022_inheriting_from_proto_class.t.js',
            '023_builder_stem_inheritance.t.js',
            '024_builder_stem_inheritance.t.js',
            '031_managed_role.t.js',
            '032_role_application_basic.t.js',
            '033_role_application_sugar.t.js',
            '040_my_symbiont.t.js',
            '041_my_mutation.t.js',
            '045_role_builder.t.js'
        ]
    },
    {
        group       : 'Meta level',
        
        items       : [
            '050_helpers.t.js',
            '051_advanced_attribute.t.js',
            '052_advanced_attribute.t.js',
            '052_role_application_advanced.t.js',
            '052_adv_attr_in_metaclasses.t.js',
            '052_advanced_attribute_set_raw_inlining.t.js',
            '053_using_class_as_role.t.js',
            '054_meta_roles.t.js',
            '055_role_to_instance_application.t.js',
            '056_arbitrary_object_from_constructor.t.js',
            '057_role_with_tostring.t.js',
            {
                group       : 'Misc (testing nesting)',
                
                items       : [
                    '060_modules.t.js',
                    '061_modules.t.js',
                    '070_reflection.t.js',
                    '071_reflection_current_method.t.js',
                    '080_non_joose_inheritance.t.js',
                    '090_sanity_checks.t.js'
                ]
            }
        ]
    },
    {
        group       : 'Advanced features of attribute',
        
        items       : [
            'attribute/010_trigger.t.js',
            'attribute/020_lazy.t.js',
            'attribute/030_combined.t.js',
            'attribute/040_delegation.t.js',
            'attribute/100_all_in_one.t.js'
        ]
    },
    {
        group       : 'Singleton',
        
        items       : [
            'singleton/010_sanity.t.js',
            'singleton/020_singleton_with_traits.t.js'
        ]
    }
)

