var exp = module.exports;

exp.hello = function(req, session) {
    session.response({msg:'world~'});
};

