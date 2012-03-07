var filter = module.exports;

filter.doFilter = function(context, next){
    console.log('entering filter!');
    next(null, context);
    console.log('quit filter!');
}
