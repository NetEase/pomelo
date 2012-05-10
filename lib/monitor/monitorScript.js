var fs = require('fs');
var logger = require('../util/log/log').getLogger(__filename);

var file=process.cwd()+'/scripts/';

console.error('file is :'+file);

var MonitorScript=module.exports;
//Reads the contents of a directory,Asynchronous
MonitorScript.readDir=function(callback){
	fs.readdir(file,function(err,files){
		if(!!err){
			console.info('readdir '+file+' error,'+err);
		}else{
			callback(files);
		}
	});
};
//Synchronous version of fs.readFile. Returns the contents of the filename.
MonitorScript.readFile=function(filename){
	var filePath=file+filename;
	var fileBody=null;
	fileBody=fs.readFileSync(filePath);
	return fileBody;
}
//Asynchronously writes data to a file, replacing the file if it already exists.
MonitorScript.writeFile=function(filename,data,callback){
	var filePath=file+filename;
	console.error('MonitorScript write data is :'+data);
	var success='no';
	fs.writeFile(filePath,data,function(err){
		if(err){
			logger.info('the file '+filename+'is not saved!');
		}else{
			success='yes';
		}
		callback(success);
	})
}
