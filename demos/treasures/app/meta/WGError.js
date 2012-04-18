var WGError = function(code, msg, cause){
    this.code = code;
    this.msg = msg;
    this.casue = cause;
}

module.exports = WGError;