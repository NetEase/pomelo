var exports = module.exports;

var Move = function(param){
	this.uid = param.uid;
	this.startx = param.startx;
	this.starty = param.starty;
	this.startTime = param.startTime;
	this.time = param.time;
	this.curX = param.curX;
    this.speed = param.speed;
    this.path = param.path;
}



/**
 * 创建一个寻路项
 * 
 * @param param
 * @returns {Move}
 */
exports.create = function (param){
	if(!param || !param.uid) {
		throw new Error('move uid property not be empty. ' + JSON.stringify(param));
	}
	return new Move(param);
};