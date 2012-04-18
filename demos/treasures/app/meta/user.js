var exports = module.exports;


var User = function(params){
	this.uid = params.uid;
	this.username = params.username;
	this.name = params.name;
	this.roleId = params.roleId;
    this.level = params.level;
    this.sceneId = params.sceneId;
    this.x = params.x;
    this.y = params.y;
    this.path = params.path;
    this.speed = params.speed;
    this.score = params.score;
    this.status = params.status;
}

exports.create = function(param) {
	if(!param || !param.uid || !param.username || !param.name || !param.roleId) {
		throw new Error('id, name and roleId should not be empty. ' + JSON.stringify(param));
	}
	
	return new User(param);
};