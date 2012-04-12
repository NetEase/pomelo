Loader.require('Parser.Statement.If');

Parser.Statement.Deprecated = Ext.extend(Parser.Statement.If, {
    constructor: function() {
        Parser.Statement.Deprecated.superclass.constructor.apply(this, arguments);

        if (this.getProperty('since') === null) {
            throw new Error("[Parser.Statement.Deprecated] 'since' property is required for deprecated statement");
        }

        this.setProperty('minVersion', '<=' + this.getProperty('since'));
        this.removeProperty('since');
    }
});
