var path = require('path');
var srcDir = path.join(__dirname, '..', 'lib');

require('blanket')({
  pattern: srcDir
});