const path = require('path');
const srcDir = path.join(__dirname, '..', 'lib');

require('blanket')({pattern : srcDir});