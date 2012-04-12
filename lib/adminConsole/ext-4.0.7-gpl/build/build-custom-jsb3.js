var help =  [
"Usage:",
"   build-custom.sh [app_location] [path_to_jsb3]",
"",
"Notes:",
"   - [app_location] can either be an URL to the application's page or a local HTML file's path",
"",
"Examples",
"   - build-custom.sh /path/to/my/app.html /path/to/my/app/app.jsb3",
"   - build-custom.sh http://localhost/path/to/my/app.html /path/to/my/app/app.jsb3"
];

if (phantom.args.length === 0 || phantom.args[0] === "--help") {
    console.log(help.join("\n"));
    phantom.exit();
}

function cleanPath(path) {
    return path.replace(/\/\.\.\//g, '/');
}

function parseArguments() {
    var args = { targets: [] },
        key = null,
        i, ln, arg, match;

    for (i = 0, ln = phantom.args.length; i < ln; i++) {
        arg = phantom.args[i];

        if (key !== null) {
            if (!arg.match(/^-{1,2}([^-])/i)) {
                args[key] = arg;
                key = null;
                continue;
            }

            args[key] = true;
            key = null;
        }

        if ((match = arg.match(/^-(\w)$/i)) || (match = arg.match(/^--(\w+)$/i))) {
            key = match[1];
        }
        else if (match = arg.match(/^--([\w]+)=(.*)$/i)) {
            args[match[1]] = match[2];
        }
        else if (match = arg.match(/^-([\w]+)$/i)) {
            match[1].split('').forEach(function(a) {
                args[a] = true;
            });
        }
        else {
            args.targets.push(arg);
        }
    }

    if (key !== null) {
        args[key] = true;
    }

    return args;
}

function getRelativePath(from, to) {
    var root = '',
        i, ln, match;

    for (i = 0, ln = from.length; i < ln; i++) {
        if (from[i] === to[i]) {
            root += from[i];
        }
        else {
            break;
        }
    }

    if (root.length === 0) {
        return from;
    }

    from = from.substring(root.length);
    to = to.substring(root.length);
    match = to.match(/\//g);

    if (!match) {
        ln = 0;
    }
    else {
        ln = match.length;
    }

    for (i = 0; i < ln; i++) {
        from = '../' + from;
    }

    return from;
}

function navigateObject(object, target) {
    var ret = object,
        originalTarget =  target,
        expect = function(expected) {
            if (typeof expected === 'string') {
                var ln = expected.length;

                if (target.substring(0, ln) === expected) {
                    target = target.slice(ln);

                    return expected;
                }

                return null;
            }

            var result = target.match(expected);

            if (result !== null) {
                target = target.slice(result[0].length);
                return result[0];
            }

            return null;
        },
        push = function(property) {
            if (!ret.hasOwnProperty(property)) {
                throw new Error("Invalid target property name " + property);
            }

            ret = ret[property];
        },
        name, bracket, dot, quote;

    while (target.length > 0) {
        name = expect(/^[\w]+/i);

        if (name !== null) {
            push(name);
            continue;
        }
        else {
            bracket = expect(/^\[/);

            if (bracket !== null) {
                quote = expect(/^'|"/);

                push(expect(new RegExp('^[^\\]' + (quote ? quote[0] : '') + ']+', 'i')));

                if (quote !== null) {
                    expect(quote[0]);
                }

                expect(/^\]/);

                continue;
            }
            else {
                dot = expect(/^\./);

                if (dot !== null) {
                    push(expect(/^[\w]+/i));
                    continue;
                }
            }
        }

        throw new Error("Malformed target: '" + originalTarget + "', failed parsing from: '" + target + "'");
    }

    return ret;
}

var args = parseArguments(),
    writeTarget = args.target || args.t || 'builds[0].files',
    verbose = !!args.verbose || !!args.v,
    appLocation = args.targets[0],
    jsb3Path = args.targets[1],
    jsb3Content, jsb3Object, targetObject,
    path, pathParts, fileName;

try {
    jsb3Content = phantomfs.readFile(jsb3Path);
    jsb3Object = JSON.parse(jsb3Content);
} catch (e) {
    throw new Error("Failed parsing JSB file: " + jsb3Path + ". Please make sure the file exists and its content is valid");
}

targetObject = navigateObject(jsb3Object, writeTarget);
targetObject.length = 0;

if (phantom.state.length === 0) {
  phantom.state = 'build';
  phantom.open(appLocation);
} else {
    var currentLocation = window.location.href;

    if (typeof Ext === 'undefined') {
        console.log("[ERROR] Ext is not defined, please verify that the library is loaded properly on the application's page");
        phantom.exit();
    }

    Ext.onReady(function() {
        Ext.Loader.history.forEach(function(item) {
            path = Ext.Loader.getPath(item);
            path = getRelativePath(path, currentLocation);
            pathParts = path.split('/');
            fileName = pathParts.pop();
            path = pathParts.join('/');

            if (path !== '') {
                path += '/';
            }

            targetObject.push({path: path, name: fileName});
        });

        jsb3Content = JSON.stringify(jsb3Object, null, 4);

        if (verbose) {
            console.log(jsb3Content);
        }

        phantom.fs.writeFile(jsb3Path, jsb3Content);
        phantom.exit();
    });
}



