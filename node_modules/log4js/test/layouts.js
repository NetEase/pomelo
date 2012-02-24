var vows = require('vows'),
assert = require('assert');

//used for patternLayout tests.
function test(args, pattern, value) {
    var layout = args[0]
    , event = args[1];

    assert.equal(layout(pattern)(event), value);
}

vows.describe('log4js layouts').addBatch({
    'colouredLayout': {
        topic: function() {
            return require('../lib/layouts').colouredLayout;
        },

        'should apply level colour codes to output': function(layout) {
            var output = layout({
                data: ["nonsense"],
                startTime: new Date(2010, 11, 5, 14, 18, 30, 45),
                categoryName: "cheese",
                level: {
                    toString: function() { return "ERROR"; }
                }
            });
            assert.equal(output, '\033[31m[2010-12-05 14:18:30.045] [ERROR] cheese - \033[39mnonsense');
        },

        'should support the console.log format for the message': function(layout) {
            var output = layout({
                data: ["thing %d", 2],
                startTime: new Date(2010, 11, 5, 14, 18, 30, 45),
                categoryName: "cheese",
                level: {
                    toString: function() { return "ERROR"; }
                }
            });
            assert.equal(output, '\033[31m[2010-12-05 14:18:30.045] [ERROR] cheese - \033[39mthing 2');
        }
    },

    'messagePassThroughLayout': {
        topic: function() {
            return require('../lib/layouts').messagePassThroughLayout;
        },
        'should take a logevent and output only the message' : function(layout) {
            assert.equal(layout({
                data: ["nonsense"],
                startTime: new Date(2010, 11, 5, 14, 18, 30, 45),
                categoryName: "cheese",
                level: {
                    colour: "green",
                    toString: function() { return "ERROR"; }
                }
            }), "nonsense");
        },
        'should support the console.log format for the message' : function(layout) {
              assert.equal(layout({
                  data: ["thing %d", 1, "cheese"]
                , startTime: new Date(2010, 11, 5, 14, 18, 30, 45)
                , categoryName: "cheese"
                , level : {
                    colour: "green"
                  , toString: function() { return "ERROR"; }
                }
              }), "thing 1 'cheese'");
          },
        'should output the first item even if it is not a string': function(layout) {
            assert.equal(layout({
                data: [ { thing: 1} ]
              , startTime: new Date(2010, 11, 5, 14, 18, 30, 45)
              , categoryName: "cheese"
              , level: {
                  colour: "green"
                , toString: function() { return "ERROR"; }
              }
            }), "{ thing: 1 }");
        }

    },

    'basicLayout': {
        topic: function() {
            var layout = require('../lib/layouts').basicLayout,
            event = {
                data: ['this is a test'],
                startTime: new Date(2010, 11, 5, 14, 18, 30, 45),
                categoryName: "tests",
                level: {
                    toString: function() { return "DEBUG"; }
                }
            };
            return [layout, event];
        },
        'should take a logevent and output a formatted string': function(args) {
            var layout = args[0], event = args[1];
            assert.equal(layout(event), "[2010-12-05 14:18:30.045] [DEBUG] tests - this is a test");
        },
        'should output a stacktrace, message if the event has an error attached': function(args) {
            var layout = args[0], event = args[1], output, lines,
            error = new Error("Some made-up error"),
            stack = error.stack.split(/\n/);

            event.data = ['this is a test', error];
            output = layout(event);
            lines = output.split(/\n/);

            assert.equal(lines.length, stack.length);
            assert.equal(lines[0], "[2010-12-05 14:18:30.045] [DEBUG] tests - this is a test Error: Some made-up error");
            for (var i = 1; i < stack.length; i++) {
                assert.equal(lines[i+1], stack[i+1]);
            }
        },
        'should output any extra data in the log event as util.inspect strings': function(args) {
            var layout = args[0], event = args[1], output, lines;
            event.data = ['this is a test', {
                    name: 'Cheese',
                    message: 'Gorgonzola smells.'
            }];
            output = layout(event);
            assert.equal(output, "[2010-12-05 14:18:30.045] [DEBUG] tests - this is a test { name: 'Cheese', message: 'Gorgonzola smells.' }");
        }
    },

    'patternLayout': {
        topic: function() {
            var event = {
                data: ['this is a test'],
                startTime: new Date(2010, 11, 5, 14, 18, 30, 45),
                categoryName: "multiple.levels.of.tests",
                level: {
                    toString: function() { return "DEBUG"; }
                }
            }, layout = require('../lib/layouts').patternLayout;
            return [layout, event];
        },

        'should default to "time logLevel loggerName - message"': function(args) {
            test(args, null, "14:18:30 DEBUG multiple.levels.of.tests - this is a test\n");
        },
        '%r should output time only': function(args) {
            test(args, '%r', '14:18:30');
        },
        '%p should output the log level': function(args) {
            test(args, '%p', 'DEBUG');
        },
        '%c should output the log category': function(args) {
            test(args, '%c', 'multiple.levels.of.tests');
        },
        '%m should output the log data': function(args) {
            test(args, '%m', 'this is a test');
        },
        '%n should output a new line': function(args) {
            test(args, '%n', '\n');
        },
        '%c should handle category names like java-style package names': function(args) {
            test(args, '%c{1}', 'tests');
            test(args, '%c{2}', 'of.tests');
            test(args, '%c{3}', 'levels.of.tests');
            test(args, '%c{4}', 'multiple.levels.of.tests');
            test(args, '%c{5}', 'multiple.levels.of.tests');
            test(args, '%c{99}', 'multiple.levels.of.tests');
        },
        '%d should output the date in ISO8601 format': function(args) {
            test(args, '%d', '2010-12-05 14:18:30.045');
        },
        '%d should allow for format specification': function(args) {
            test(args, '%d{ISO8601}', '2010-12-05 14:18:30.045');
            test(args, '%d{ABSOLUTE}', '14:18:30.045');
            test(args, '%d{DATE}', '05 12 2010 14:18:30.045');
            test(args, '%d{yyyy MM dd}', '2010 12 05');
            test(args, '%d{yyyy MM dd hh mm ss SSS}', '2010 12 05 14 18 30 045');
        },
        '%% should output %': function(args) {
            test(args, '%%', '%');
        },
        'should output anything not preceded by % as literal': function(args) {
            test(args, 'blah blah blah', 'blah blah blah');
        },
        'should handle complicated patterns': function(args) {
            test(args,
                 '%m%n %c{2} at %d{ABSOLUTE} cheese %p%n',
                 'this is a test\n of.tests at 14:18:30.045 cheese DEBUG\n'
                );
        },
        'should truncate fields if specified': function(args) {
            test(args, '%.4m', 'this');
            test(args, '%.7m', 'this is');
            test(args, '%.9m', 'this is a');
            test(args, '%.14m', 'this is a test');
            test(args, '%.2919102m', 'this is a test');
        },
        'should pad fields if specified': function(args) {
            test(args, '%10p', '     DEBUG');
            test(args, '%8p', '   DEBUG');
            test(args, '%6p', ' DEBUG');
            test(args, '%4p', 'DEBUG');
            test(args, '%-4p', 'DEBUG');
            test(args, '%-6p', 'DEBUG ');
            test(args, '%-8p', 'DEBUG   ');
            test(args, '%-10p', 'DEBUG     ');
        }

    }

}).export(module);

