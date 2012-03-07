var Class = require('joose').Class;

/**
 * webgame error
 */
var WGError = Class({
	/**
	 * 构造函数：
	 * @param code 错误编码
	 * @param msg 错误描述信息
	 * @param cause 引起错误的错误堆栈（可选）
	 */
	constructor : function(code, msg, cause) {
		this.code = code;
		this.msg = msg;
		this.cause = cause;
	},
	
	has : {
		code : {init : -1},
		msg : {init : 'Unknown Error'}, 
		cause : {init : null}
	}
});

module.exports = WGError;