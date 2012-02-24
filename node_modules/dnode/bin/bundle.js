var fs = require('fs');
var path = require('path');
var browserify = require('browserify');

var src = browserify({ filter : require('uglify-js') })
    .require(__dirname + '/../browser/index.js')
    .bundle()
;

var buf = new Buffer('var DNode = (function () {'
    + src + '; return require("/index.js")'
+ '})()');

var file = __dirname + '/../browser/bundle.js';
fs.writeFile(file, buf, function (err) {
    if (err) console.error('Error: ' + err)
    else {
        var bytes = buf.length;
        console.log(bytes + ' bytes written');
    }
});
