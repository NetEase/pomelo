var exports = module.exports;

var Treasure = function(params){
	this.id = params.id;
    this.imgId = params.imgId;
    this.name = params.name;
    this.score = params.score;
    this.posX = params.posX;
    this.posY = params.posY;
}

exports.create = function(params){
	return new Treasure(params);
} 
