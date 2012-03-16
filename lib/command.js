exports = module.exports;

var program = require('commander');

program
.command('-h')
.description('show help infomation')
.action(function(){
  console.log('help');
 });
    
program
.command('init <dir>')
.description('init application in cur dir')
.action(function(dir){
  console.log('init in cur dir: '+dir);
});

program
.command('list <dir>')
.description('list application information')
.action(function(dir){
  console.log('list application information: '+dir);
});
      
    
program.parse(process.argv);
