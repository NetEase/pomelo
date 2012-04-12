/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.fx.target.Target

This class specifies a generic target for an animation. It provides a wrapper around a
series of different types of objects to allow for a generic animation API.
A target can be a single object or a Composite object containing other objects that are 
to be animated. This class and it's subclasses are generally not created directly, the 
underlying animation will create the appropriate Ext.fx.target.Target object by passing 
the instance to be animated.

The following types of objects can be animated:

- {@link Ext.fx.target.Component Components}
- {@link Ext.fx.target.Element Elements}
- {@link Ext.fx.target.Sprite Sprites}

 * @markdown
 * @abstract
 */
Ext.define('Ext.fx.target.Target', {

    isAnimTarget: true,

    /**
     * Creates new Target.
     * @param {Ext.Component/Ext.Element/Ext.draw.Sprite} target The object to be animated
     */
    constructor: function(target) {
        this.target = target;
        this.id = this.getId();
    },
    
    getId: function() {
        return this.target.id;
    }
});

