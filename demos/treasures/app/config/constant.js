var constant = module.exports;


/**
 * 状态码定义
 */
constant.RES_CODE = {
	SUC_OK									: 1, 		// 成功
	ERR_FAIL								: -1,		// 失败,不需要明确指定原因的错误，如：参数错误等
	ERR_USER_NOT_LOGINED		: -2,		// 用户未登录
	// 后面的错误状态继续补充
	ERR_CHANNEL_DESTROYED		: -10,	// channel已销毁
	ERR_SESSION_NOT_EXIST 	: -11,	// session不存在
	ERR_CHANNEL_DUPLICATE 	: -12,	// channel名重复
	ERR_CHANNEL_NOT_EXIST 	: -13		// channel不存在
};
