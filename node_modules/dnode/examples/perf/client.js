var frames = 0, last = 0;
setInterval(function () {
    if (last) {
        var fps = frames / (Date.now() - last) * 1000;
        console.log('fps: ' + fps);
    }
    
    last = Date.now();
    frames = 0;
}, 1000);

var dnode = require('dnode');
dnode({
    emit : function (i) { frames ++ }
}).connect(7575);
