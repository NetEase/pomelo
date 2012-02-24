var temp = require('../lib/temp'),
    fs   = require('fs'),
    sys  = require('sys'),
    exec = require('child_process').exec;

var myData = "foo\nbar\nfoo\nbaz";

temp.open('myprefix', function(err, info) {
  if (err) throw err;
  fs.write(info.fd, myData);
  fs.close(info.fd, function(err) {
    if (err) throw err;
    exec("grep foo '" + info.path + "' | wc -l", function(err, stdout) {
      if (err) throw err;
      sys.puts(stdout.trim());
    });
  });
});
