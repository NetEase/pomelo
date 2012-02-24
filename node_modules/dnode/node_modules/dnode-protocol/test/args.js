var assert = require('assert');
var protocol = require('../');

function argv () { return arguments }

exports.args = function () {
    assert.eql(
        protocol.parseArgs(argv('moo.com', 555)),
        { host : 'moo.com', port : 555 }
    );
    
    assert.eql(
        protocol.parseArgs(argv('7777')),
        { port : 7777 }
    );
    
    assert.eql(
        protocol.parseArgs(argv({
            host : 'moosy.moo.com',
            port : 5050,
        })),
        { host : 'moosy.moo.com', port : 5050 }
    );
    
    assert.eql(
        protocol.parseArgs(argv('meow.cats.com', { port : '1234', })),
        { host : 'meow.cats.com', port : 1234 }
    );
    
    assert.eql(
        typeof protocol.parseArgs(argv('789')).port,
        'number'
    );
    
    assert.eql(
        protocol.parseArgs(argv(
            { host : 'woof.dogs.com' }, { port : 4050 }
        )),
        { host : 'woof.dogs.com', port : 4050 }
    );
    
    assert.eql(
        protocol.parseArgs(argv(
            undefined,
            { host : 'woof.dogs.com' },
            undefined,
            { port : 4050 },
            undefined
        )),
        { host : 'woof.dogs.com', port : 4050 }
    );
};
