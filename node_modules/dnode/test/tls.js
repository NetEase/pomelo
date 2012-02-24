// (A) dnode.listen(tls.createServer(options),cb)
// (B) dnode.listen(port,options,cb)
// (C) dnode.connect(tls.connect(port,options),cb)
// (D) dnode.connect(port,options,cb)
//
// (A) and (C) are examples for using servers/streams
// (B) and (D) are examples for using dnode to create server and client

var test = require('tap').test;
var dnode = require('../');
var tls = require('tls');
var fs = require('fs');
var ports = [3001,3002];
var keyA  = fs.readFileSync(__dirname+'/keys/agent1-key.pem');
var certA = fs.readFileSync(__dirname+'/keys/agent1-cert.pem');
var keyB  = fs.readFileSync(__dirname+'/keys/agent1-key.pem');
var certB = fs.readFileSync(__dirname+'/keys/agent1-cert.pem');
var keyC  = fs.readFileSync(__dirname+'/keys/agent2-key.pem');
var certC = fs.readFileSync(__dirname+'/keys/agent2-cert.pem');
var keyD  = fs.readFileSync(__dirname+'/keys/agent2-key.pem');
var certD = fs.readFileSync(__dirname+'/keys/agent2-cert.pem');
var optionsA = { key:keyA, cert:certA, ca:[certC,certD]
               , requestCert:true, rejectUnauthorized:true };
var optionsB = { key:keyB, cert:certB, ca:[certC,certD]
               , requestCert:true, rejectUnauthorized:true };
var optionsC = { key:keyC, cert:certC };
var optionsD = { key:keyD, cert:certD };
var A = dnode({name:function(cb){cb('A')}});
var B = dnode({name:function(cb){cb('B')}});
var C = dnode({name:function(cb){cb('C')}});
var D = dnode({name:function(cb){cb('D')}});

test('tls', function (t) {
    t.plan(4);
    
    var AC = setTimeout(function () { t.fail(); }, 500);
    var AD = setTimeout(function () { t.fail(); }, 500);
    var BC = setTimeout(function () { t.fail(); }, 500);
    var BD = setTimeout(function () { t.fail(); }, 500);
    var CA = setTimeout(function () { t.fail(); }, 500);
    var CB = setTimeout(function () { t.fail(); }, 500);
    var DA = setTimeout(function () { t.fail(); }, 500);
    var DB = setTimeout(function () { t.fail(); }, 500);

    var tlsServer = tls.createServer(optionsA);

    A.listen(tlsServer, function (client, con) {
        client.name(function(data){
            if (data == 'C') clearTimeout(CA);
            if (data == 'D') clearTimeout(DA);
        });
    });
    tlsServer.listen(ports[0], function () {
        var tlsStream = tls.connect(ports[0], optionsC, function () {
            C.connect(tlsStream, function(remote, con){
                remote.name(function (data) {
                  t.equal(data,'A');
                  con.end();
                });
            });
        });
        D.connect(ports[0], optionsD, function (remote, con) {
            remote.name(function (data) {
              t.equal(data,'A');
              con.end();
            });
        });
    });

    B.listen(ports[1], optionsB, function (client, con) {
        client.name(function(data){
            if (data == 'C') clearTimeout(CB);
            if (data == 'D') clearTimeout(DB);
        })
    }).on('ready',function(){
        var tlsStream = tls.connect(ports[1], optionsC, function () {
            C.connect(tlsStream, function(remote, con){
                remote.name(function (data) {
                  t.equal(data,'B');
                  con.end();
                });
            });
        });
        D.connect(ports[1], optionsD, function (remote, con) {
            remote.name(function (data) {
              t.equal(data,'B');
              con.end();
            });
        });
    });

    setTimeout(function () {
        tlsServer.close();
        B.close();
        t.end();
    }, 500);
});
