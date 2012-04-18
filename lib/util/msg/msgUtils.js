var exp = module.exports;

exp.checkServerType = function(msg) {
	var route = msg.route;
	if(!route) return null;
	var idx = route.indexOf('.');
	if(idx < 0) return null;
	return route.substring(0, idx);
};