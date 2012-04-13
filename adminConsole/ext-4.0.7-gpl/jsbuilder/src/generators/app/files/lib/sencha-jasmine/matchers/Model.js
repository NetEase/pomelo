/**
 * Sencha-specific matchers for convenient testing of Model expectations
 */
beforeEach(function() {
    this.addMatchers({
        /**
         * Sample usage:
         * expect('User').toHaveMany('Product');
         */
        toHaveMany: function(expected) {
            if (typeof this.actual == 'string') {
                this.actual = Ext.ModelManager.types[this.actual].prototype;
            }
            
            var associations = this.actual.associations.items,
                length       = associations.length,
                association, i;
            
            for (i = 0; i < length; i++) {
                association = associations[i];
                
                if (association.associatedName == expected && association.type == 'hasMany') {
                    return true;
                }
            }
            
            return false;
        },
        
        /**
         * Sample usage:
         * expect('Product').toBelongTo('User')
         */
        toBelongTo: function(expected) {
            if (typeof this.actual == 'string') {
                this.actual = Ext.ModelManager.types[this.actual].prototype;
            }
            
            var associations = this.actual.associations.items,
                length       = associations.length,
                association, i;
            
            for (i = 0; i < length; i++) {
                association = associations[i];
                
                if (association.associatedName == expected && association.type == 'belongsTo') {
                    return true;
                }
            }
            
            return false;
        }
    });
});