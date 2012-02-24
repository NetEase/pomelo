var dnode = require('dnode');

dnode.connect(7070, function (remote, conn) {
    remote.zing(33, function (n) {
        console.log('n = ' + n);
        conn.end();
    });
});
