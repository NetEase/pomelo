var dnode = require('dnode');

dnode(function (client) {
    // Poll the client's own temperature() in celsius and convert that value to
    // fahrenheit in the supplied callback
    this.clientTempF = function (cb) {
        client.temperature(function (degC) {
            var degF = Math.round(degC * 9 / 5 + 32);
            cb(degF);
        });
    }; 
}).listen(6060);
