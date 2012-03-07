var filter = module.exports;

filter.doFilter = function(msg, session, next){
    console.log('entering filter!');
    next(null, msg, context);
    console.log('quit filter!');
}
