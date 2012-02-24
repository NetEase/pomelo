var Harness

/*if (typeof process != 'undefined' && process.pid) {
    require('Task/Test/Run/NodeJSBundle')
    
    Harness = Test.Run.Harness.NodeJS
} else
*/    

Harness = Test.Run.Benchmark.Harness.Browser

    
Harness.configure({
	title           : 'Joose benchmark suite',
    id              : 'joose',          
    
	preload : [
	    '../joose-all.js'
    ]
})


Harness.start(
    '010_basic.js',
    {
        url     : '020_basic.js',
        
        preload : [ '../../ext-4.0.2a/ext-all.js' ]
    }
//    ,
//    '030_basic.js'
)

