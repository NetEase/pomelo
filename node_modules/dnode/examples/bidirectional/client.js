var dnode = require('dnode');

var client = dnode({
    // Compute the client's temperature and stuff that value into the callback
    
    temperature : function (cb) {
        var degC = Math.round(20 + Math.random() * 10 - 5);
        console.log(degC + '° C');
        cb(degC);
    }
});

client.connect(6060, function (remote, conn) {
    // Call the server's conversion routine, which polls the client's
    // temperature in celsius degrees and converts to fahrenheit
    
    remote.clientTempF(function (degF) {
        console.log(degF + '° F');
        conn.end(); // all done!
    });
});
