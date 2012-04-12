// Creates list of class with its info ("metaclass") in JSON format.
// Requirement: hammerjs (see https://github.com/senchalabs/hammerjs).

/*global system:true, fs:true, Reflect:true */

if (system.args.length !== 3) {
    system.print('Usage:');
    system.print('  hammerjs create-manifest.js /path/to/src/ output.json');
    system.exit(-1);
}

// Traverses the specified path and collects all *.js files.
// Note: the traversal is recursive to all subdirectories.

var scanDirectory = function (path) {
    var entries = [],
        subdirs;
    if (fs.exists(path) && fs.isFile(path) && path.match('.js$')) {
        entries.push(path);
    } else if (fs.isDirectory(path)) {
        fs.list(path).forEach(function (e) {
            subdirs = scanDirectory(path + '/' + e);
            subdirs.forEach(function (s) {
                entries.push(s);
            });
        });
    }
    return entries;
};

var scanDirectories = function (paths) {
    var sources = [],
        excludes =[];
    paths.split(',').forEach(function (path) {
        if (path[0] === '-') {
            excludes.push(path.substring(1));
        } else {
            scanDirectory(path).forEach(function (source) {
                sources.push(source);
            });
        }
    });
    sources = sources.filter(function (e) {
        var included = true;
        excludes.forEach(function (f) {
            if (e.substring(0, f.length) === f) {
                included = false;
            }
        });
        return included;
    });
    return sources;
};

var timestamp = Date.now(),
    manifest = [],
    sources = scanDirectories(system.args[1]);

system.print('Analyzing ' + sources.length + ' source files. Please wait...');

sources.forEach(function (fileName) {

    // Loads the content of a file and returns the syntax tree.
    var parse = function (fname)
    {
        var f = fs.open(fname, 'r'),
            content = '', line;
        while (true) {
            line = f.readLine();
            if (line.length === 0) {
                break;
            }
            content += line;
        }
        f.close();
        return Reflect.parse(content);
    };

    // Recursively visits v and all child objects of v and executes
    // functions f for each visit.
    var visit = function (v, f) {
        var child;
        f(v);
        for (var i in v) {
            child = v[i];
            if (child !== null && typeof child === 'object') {
                visit(child, f);
            }
        }
    };

    // Matches the subtree 'code' with Ext.extend(Ext.foo, Ext.bar, ...)
    // or Ext.foo = Ext.extend(Ext.bar, ...).
    // Returns the metaclass if successful, otherwise returns undefined.
    var matchExtend = function (code) {
        var meta = {},
            properties;
        if ((code.type === 'ExpressionStatement') &&
            (typeof code.expression !== 'undefined') &&
            (code.expression.type === 'CallExpression') &&
            (typeof code.expression.callee !== 'undefined') &&
            (code.expression.callee.type === 'MemberExpression') &&
            (code.expression.arguments.length === 3) &&
            (code.expression.callee.object.type === 'Identifier') &&
            (code.expression.callee.object.name === 'Ext') &&
            (code.expression.callee.property.type === 'Identifier') &&
            (code.expression.callee.property.name === 'extend')) {
            meta.className = '';
            meta.extend = '';
            visit(code.expression.arguments[0], function (v) {
                if (v.type === 'Identifier') {
                    if (meta.className.length > 0)
                        meta.className += '.';
                    meta.className += v.name;
                }
            });
            visit(code.expression.arguments[1], function (v) {
                if (v.type === 'Identifier') {
                    if (meta.extend.length > 0)
                        meta.extend += '.';
                    meta.extend += v.name;
                }
            });
            properties = code.expression.arguments[2].properties;
            if (properties && properties.length > 0) {
                properties.forEach(function (e) {
                    if ((e.value.type === 'FunctionExpression')) {
                        if (!meta.functions) {
                            meta.functions = [];
                        }
                        meta.functions.push(e.key.name);
                    }
                });
            }
            if (meta.functions) {
                meta.functions.sort();
            }
            if (meta && meta.className.substr(0, 4) !== 'Ext.') {
                meta = undefined;
            }
            return meta;
        }
        if ((code.type === 'AssignmentExpression') &&
           (code.right.type === 'CallExpression') &&
           (code.right.callee.type == 'MemberExpression') &&
           (code.right.callee.object.type == 'Identifier') &&
           (code.right.callee.object.name == 'Ext') &&
           (code.right.callee.property.type == 'Identifier') &&
           (code.right.callee.property.name == 'extend')) {
            meta.className = '';
            meta.extend = '';
            visit(code.left, function (v) {
                if (v.name) {
                    if (meta.className.length > 0)
                        meta.className += '.';
                    meta.className += v.name;
                }
            });
            visit(code.right.arguments[0], function (v) {
                if (v.name) {
                    if (meta.extend.length > 0)
                        meta.extend += '.';
                    meta.extend += v.name;
                }
            });
            properties = code.right.arguments[1].properties;
            if (properties && properties.length > 0) {
                properties.forEach(function (e) {
                    if ((e.value.type === 'FunctionExpression')) {
                        if (!meta.functions) {
                            meta.functions = [];
                        }
                        meta.functions.push(e.key.name);
                    }
                });
            }
            if (meta.functions) {
                meta.functions.sort();
            }
            if (meta && meta.className.substr(0, 4) !== 'Ext.') {
                meta = undefined;
            }
            return meta;
        }
        return undefined;
    };

    // Matches the subtree 'code' with Ext.define('SomeClassName', ...).
    // Returns the metaclass if successful, otherwise returns undefined.
    var matchDefine = function (code) {
        var meta = {},
            properties;
        if ((code.type === 'ExpressionStatement') &&
            (typeof code.expression !== 'undefined') &&
            (code.expression.type === 'CallExpression') &&
            (typeof code.expression.callee !== 'undefined') &&
            (code.expression.callee.type === 'MemberExpression') &&
            (code.expression.callee.object.type === 'Identifier') &&
            (code.expression.callee.object.name === 'Ext') &&
            (code.expression.callee.property.type === 'Identifier') &&
            (code.expression.callee.property.name === 'define') &&
            (code.expression.arguments.length >= 2) &&
            (code.expression.arguments.length <= 3) &&
            (code.expression.arguments[0].type === 'Literal')) {
            meta.className = code.expression.arguments[0].value;
            properties = code.expression.arguments[1].properties;
            if (properties && properties.length > 0) {
                properties.forEach(function (e) {
                    if ((e.type === 'Property') &&
                        (e.key !== undefined) &&
                        (e.value !== undefined) &&
                        (e.key.type === 'Identifier')) {

                        if ((e.key.name === 'extend') &&
                            (e.value.type === 'Literal')) {
                            meta.extend = e.value.value;
                        }

                        if ((e.key.name === 'alias') &&
                            (e.value.type === 'Literal')) {
                            meta.alias = e.value.value;
                        }

                        if ((e.key.name === 'alias') &&
                            (e.value !== undefined) &&
                            (e.value.elements !== undefined) &&
                            (e.value.elements.length > 0) &&
                            (e.value.type === 'ArrayExpression')) {
                            meta.alias = [];
                            e.value.elements.forEach(function (g) {
                                if (g.type === 'Literal') {
                                    meta.alias.push(g.value);
                                }
                            });
                        }
                        if ((e.key.name === 'singleton') &&
                            (e.value.type === 'Literal')) {
                            meta.singleton = e.value.value;
                        }

                        if ((e.key.name === 'alternateClassName') &&
                            (e.value.type === 'Literal')) {
                            meta.alternateClassName = e.value.value;
                        }

                        if ((e.key.name === 'alternateClassName') &&
                            (e.value !== undefined) &&
                            (e.value.elements !== undefined) &&
                            (e.value.elements.length > 0) &&
                            (e.value.type === 'ArrayExpression')) {
                            meta.alternateClassName = [];
                            e.value.elements.forEach(function (g) {
                                if (g.type === 'Literal') {
                                    meta.alternateClassName.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'requires') &&
                            (e.value.value !== undefined) &&
                            (e.value.type === 'Literal')) {
                            meta.requires = [ e.value.value ];
                        }

                        if ((e.key.name === 'requires') &&
                            (e.value !== undefined) &&
                            (e.value.elements !== undefined) &&
                            (e.value.elements.length > 0) &&
                            (e.value.type === 'ArrayExpression')) {
                            meta.requires = [];
                            e.value.elements.forEach(function (g) {
                                if (g.type === 'Literal') {
                                    meta.requires.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'uses') &&
                            (e.value !== undefined) &&
                            (e.value.elements !== undefined) &&
                            (e.value.elements.length > 0) &&
                            (e.value.type === 'ArrayExpression')) {
                            meta.uses = [];
                            e.value.elements.forEach(function (g) {
                                if (g.type === 'Literal') {
                                    meta.uses.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'mixins') &&
                            (e.value !== undefined) &&
                            (e.value.properties !== undefined) &&
                            (e.value.properties.length > 0) &&
                            (e.value.type === 'ObjectExpression')) {
                            meta.mixins = {};
                            e.value.properties.forEach(function (m) {
                                if ((m.type && m.type === 'Property') &&
                                    (m.key && m.key.type && m.key.type === 'Identifier') &&
                                    (m.value && m.value.type && m.value.type === 'Literal')) {
                                    meta.mixins[m.key.name] = m.value.value;
                                }
                            });
                        }

                        if ((e.value.type === 'FunctionExpression')) {
                            if (!meta.functions) {
                                meta.functions = [];
                            }
                            meta.functions.push(e.key.name);
                        }

                    }
                });
            }
        }
        if (meta.functions) {
            meta.functions.sort();
        }
        return meta;
    };

    var tree = parse(fileName);

    if (typeof tree === 'undefined') {
        system.print('Warning:', fileName, 'is not a valid JavaScript source');
        return;
    }

    visit(tree, function (expr) {
        var meta = {};
        meta = matchExtend(expr);
        if (!meta) {
            meta = matchDefine(expr);
        }
        if (meta && meta.className) {
            meta.source = fileName;
            manifest.push(meta);
        }
    });

});

var out = fs.open(system.args[2], 'w');
out.writeLine(JSON.stringify(manifest, undefined, 4));
out.close();
system.print('Manifest is written to ' + system.args[2] + '.');

system.print('Finished in ' + (Date.now() - timestamp) / 1000 + ' seconds.');

system.exit();
