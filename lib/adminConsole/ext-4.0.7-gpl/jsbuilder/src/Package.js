Package = Ext.extend(Target, {
    getDefaultTarget : function() {
        return 'pkgs' + Fs.sep + (this.get('id') || this.get('name').replace(/ /g, '').toLowerCase()) + '.js';
    }
});