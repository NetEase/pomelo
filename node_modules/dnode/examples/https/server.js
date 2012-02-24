var https = require('https');
var fs = require('fs');
var dnode = require('dnode');

try {
    var opts = {
        key : fs.readFileSync(__dirname + '/privatekey.pem'),
        cert : fs.readFileSync(__dirname + '/certificate.pem'),
    };
}
catch (e) {
    console.log('# {privatekey,certificate}.pem missing, do this first:');
    console.log('openssl genrsa -out privatekey.pem 1024');
    console.log('openssl req -new -key privatekey.pem -out certrequest.csr');
    console.log('openssl x509 -req -in certrequest.csr '
        + '-signkey privatekey.pem -out certificate.pem');
    process.exit();
}

var index = fs.readFileSync(__dirname + '/index.html');
var server = https.createServer(opts, function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type' : 'text/html' });
        res.end(index);
    }
    else if (!res.finished) {
        process.nextTick(function () {
            if (!res.finished) {
                res.writeHead(404, { 'Content-Type' : 'text/html' });
                res.end('Not found!');
            }
        });
    }
});

dnode(function (client) {
    this.timesTen = function (n,f) { f(n * 10) };
    this.whoAmI = function (reply) {
        client.name(function (name) {
            reply(name
                .replace(/Mr\.?/,'Mister')
                .replace(/Ms\.?/,'Miss')
                .replace(/Mrs\.?/,'Misses')
            );
        })
    };
}).listen(server);
server.listen(8020);

console.log('https://localhost:8020/');
