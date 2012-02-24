var burrito = require('./');

window.onload = function () {
    var res = burrito.microwave('Math.sin(2)', function (node) {
        if (node.name === 'num') node.wrap('Math.PI / %s');
    });

    document.body.innerHTML += res;
};

if (document.readyState === 'complete') window.onload();
