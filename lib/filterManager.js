var manager = module.exports;

var utils = require('./util/utils');

var innerFilters = [];

manager.addFilters = function(filters) {
	for(var i in filters) {
		innerFilters.push(filters[i]);
	}
};


manager.doFilter = function(context, cb) {
	doFilterInternal(0,  context, cb);
}

var doFilterInternal = function(fIndex, context, cb) {
	if(fIndex >= innerFilters.length) {
		utils.invokeCallback(cb,  context);
		return;
	}
	
	innerFilters[fIndex].doFilter(context, function(context) {
		doFilterInternal(fIndex + 1, context, cb);
	});
}
