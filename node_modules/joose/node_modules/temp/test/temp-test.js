var assert = require('assert');
var path = require('path');
var fs = require('fs');
var util = require('util');

var temp = require('../lib/temp');

var existsSync = function(path){
  try {
    fs.statSync(path);
    return true;
  } catch (e){
    return false;
  }
};

var mkdirFired = false;
var mkdirPath = null;
temp.mkdir('foo', function(err, tpath) {
  mkdirFired = true;
  assert.ok(!err, "temp.mkdir did not execute without errors");
  assert.ok(path.basename(tpath).slice(0, 3) == 'foo', 'temp.mkdir did not use the prefix');
  path.exists(tpath, function(exists) {
    assert.ok(exists, 'temp.mkdir did not create the directory');
  });
  mkdirPath = tpath;
  util.log("mkdir " + mkdirPath);
});

var openFired = false;
var openPath = null;
temp.open('bar', function(err, info) {
  openFired = true;
  assert.equal('object', typeof(info), "temp.open did not invoke the callback with the err and info object");
  assert.equal('number', typeof(info.fd), 'temp.open did not invoke the callback with an fd');
  fs.writeSync(info.fd, 'foo');
  fs.closeSync(info.fd);
  assert.equal('string', typeof(info.path), 'temp.open did not invoke the callback with a path');
  assert.ok(existsSync(info.path), 'temp.open did not create a file');
  openPath = info.path;
  util.log("open " + openPath);
});

for (var i=0; i <= 10; i++) {
  temp.openSync();
};
assert.equal(process.listeners('exit').length, 1, 'temp created more than one listener for exit');

process.addListener('exit', function() {
  assert.ok(mkdirFired, "temp.mkdir callback did not fire");
  assert.ok(openFired, "temp.open callback did not fire");
});
