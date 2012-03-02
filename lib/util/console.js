/***
 * 得到系统输入的类，可以改成用户输入的方式实现调用
 * 方便调试使用,直接执行用户输入的东西
 * 先WS的用eval
 */
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
	eval(chunk);
});