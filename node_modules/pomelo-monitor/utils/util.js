/**
 * convert Date as  yyyy-mm-dd
 */
function formatTime(date){
	var n=date.getFullYear(); 
	var y=date.getMonth();
	var r=date.getDate(); 
	var mytime=date.toLocaleTimeString(); 
	var mytimes= n+ "-" + y + "-" + r + " " + mytime;
    return mytimes;
}
module.exports.formatTime=formatTime;