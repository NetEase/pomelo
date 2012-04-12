// Normal comment here
//<if debug>
var lorem = {
    ipsum: true,
    // Nested if here
    //<if browser=ie browserVersion=7>
    if_here: 'blah',
    //<elseif browser="!ie">
    elseif_here: 'tada',
    //<else>
    else_here: 'ok',
    //</if>
    other: 'thing'
};
//</if>
//<unknownTag>
var testing = 123;