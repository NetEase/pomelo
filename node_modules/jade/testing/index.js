
/**
 * Module dependencies.
 */

var jade = require('../');

jade.renderFile('testing/index.jade', { pretty: true }, function(err, str){
  if (err) throw err;
  console.log(str);
});