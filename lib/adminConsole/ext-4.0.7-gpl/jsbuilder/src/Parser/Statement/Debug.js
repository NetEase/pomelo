Loader.require('Parser.Statement.If');

(function() {

var priorities = {
    error: 3,
    warn: 2,
    info: 1
};

var Debug = Parser.Statement.Debug = Ext.extend(Parser.Statement.If, {
    constructor: function() {
        var priority, name;

        Debug.superclass.constructor.apply(this, arguments);

        this.setProperty('debug', true);

        for (name in priorities) {
            if (priorities.hasOwnProperty(name)) {
                if (this.getProperty(name)) {
                    priority = priorities[name];
                    this.removeProperty(name);
                    break;
                }
            }
        }

        if (!priority) {
            priority = 1;
        }

        this.setProperty('debugLevel', '<=' + priority);
    }
});


})();
