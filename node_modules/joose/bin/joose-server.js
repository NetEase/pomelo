var argv = require('optimist')
    .usage('Usage: $0 {OPTIONS}')
    .wrap(80)

    .option('port', {
        alias       : 'p',
        desc        : 'The port to listen for connections. Default value is 5000',
        'default'   : 5000
    })
    
    .option('root', {
        desc        : 'A path directory which will act as a web root. Default is current working directory',
        'default'   : './'
    })
//    .option('entry', {
//        alias : 'e',
//        desc : 'An entry point of your app'
//    })
//    .option('alias', {
//        alias : 'a',
//        desc : 'Register an alias with a colon separator: "to:from"\n'
//            + "Example: --alias 'jquery:jquery-browserify'"
//    })
//    .option('plugin', {
//        alias : 'p',
//        desc : 'Use a plugin. Use a colon separator to specify additional '
//            + 'plugin arguments as a JSON string.\n'
//            + 'Example: --plugin \'fileify:["files","."]\''
//    })
    .option('help', {
        alias   : 'h',
        desc    : 'Show this message'
    })
    .check(function (argv) {
        if (argv.help) throw ''
    })
    .argv


var url         = require('url')
var path        = require('path')
var http        = require('http')
var paperboy    = require('paperboy')

var Librarian   = require('librarian')

var root        = path.resolve(argv.root)

var librarian   = new Librarian({
    root        : root
})


http.createServer(function(req, res) {

    var pathName        = path.normalize(url.parse(req.url).pathname)
    pathName            = pathName.replace(/^\//, '')
    
    if (/\.\.\//.test(pathName)) throw new Error("Can't serve the files above the root directory")
    
    
    librarian.process(pathName, function (fileName, dir) {
        
        var ip = req.connection.remoteAddress;
        
        paperboy
            .deliver(dir, req, res)
            .addHeader('Expires', 300)
            .before(function() {
              console.log('Received Request');
            })
            .after(function(statCode) {
              log(statCode, req.url, ip);
            })
            .error(function(statCode, msg) {
              res.writeHead(statCode, {'Content-Type': 'text/plain'});
              res.end("Error " + statCode);
              log(statCode, req.url, ip, msg);
            })
            .otherwise(function(err) {
              res.writeHead(404, {'Content-Type': 'text/plain'});
              res.end("Error 404: File not found");
              log(404, req.url, ip, err);
            })
        
    }, function (e) {
        throw new Error("Can't find file: [" + pathName + "] in the webRoot: [" + root + "], e: " + e)
    })
    
}).listen(argv.port)


var log = function (statCode, url, ip, err) {
    var logStr = statCode + ' - ' + url + ' - ' + ip;
    
    if (err) logStr += ' - ' + err;
    
    console.log(logStr);
}
