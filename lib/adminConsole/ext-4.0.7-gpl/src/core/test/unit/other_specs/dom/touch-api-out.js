/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("API", function() {
    var actual = window;
    var expected = {Ext:{core:{Element: function(){} }}},
        Ext = expected.Ext,
        undefined;

    /* Touch out -- Element-more.js */ Ext.core.Element.prototype.clean = undefined; 
    /* Touch out -- Element-more.js */ Ext.core.Element.prototype.createProxy = undefined; 
    /* Touch out -- Element-more.js */ Ext.core.Element.prototype.getLoader = undefined; 
    /* Touch out -- Element-more.js */ Ext.core.Element.prototype.monitorMouseLeave = undefined; 
    /* Touch out -- Element-more.js */ Ext.core.Element.prototype.relayEvent = undefined; 
    /* Touch out -- Element-more.js */ Ext.core.Element.prototype.swallowEvent = undefined; 
    /* Touch out -- Element-more.js,Element.js */ Ext.core.Element.prototype.load = undefined; 
    /* Touch out -- Element.alignment.js */ Ext.core.Element.prototype.getConstrainVector = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.fadeIn = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.fadeOut = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.frame = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.ghost = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.highlight = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.pause = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.puff = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.scale = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.shift = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.slideIn = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.slideOut = undefined; 
    /* Touch out -- Element.anim.js */ Ext.core.Element.prototype.switchOff = undefined; 
    /* Touch out -- Element.dd.js */ Ext.core.Element.prototype.initDD = undefined; 
    /* Touch out -- Element.dd.js */ Ext.core.Element.prototype.initDDProxy = undefined; 
    /* Touch out -- Element.dd.js */ Ext.core.Element.prototype.initDDTarget = undefined; 
    /* Touch out -- Element.fx-more.js */ Ext.core.Element.prototype.createShim = undefined; 
    /* Touch out -- Element.fx-more.js */ Ext.core.Element.prototype.enableDisplayMode = undefined; 
    /* Touch out -- Element.fx-more.js */ Ext.core.Element.prototype.isDisplayed = undefined; 
    /* Touch out -- Element.fx-more.js */ Ext.core.Element.prototype.isMasked = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.originalDisplay = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.prototype.animate = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.prototype.isVisible = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.prototype.setDisplayed = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.prototype.setVisibilityMode = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.prototype.toggle = undefined; 
    /* Touch out -- Element.fx.js */ Ext.core.Element.visibilityCls = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.appendChild = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.appendTo = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.createChild = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.insertAfter = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.insertBefore = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.insertFirst = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.insertHtml = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.insertSibling = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.replace = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.replaceWith = undefined; 
    /* Touch out -- Element.insertion.js */ Ext.core.Element.prototype.wrap = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.autoBoxAdjust = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.blur = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.clearListeners = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.destroy = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.focus = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.getAttributeNS = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.hover = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.isBorderBox = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.on = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.un = undefined; 
    /* Touch out -- Element.js */ Ext.core.Element.prototype.update = undefined; 
    /* Touch out -- Element.keys.js */ Ext.core.Element.prototype.addKeyListener = undefined; 
    /* Touch out -- Element.keys.js */ Ext.core.Element.prototype.addKeyMap = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.clearPositioning = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.getPositioning = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.getRegion = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.getViewRegion = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.move = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.moveTo = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.position = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.setBounds = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.setLeftTop = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.setLocation = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.setPositioning = undefined; 
    /* Touch out -- Element.position.js */ Ext.core.Element.prototype.setRegion = undefined; 
    /* Touch out -- Element.scroll.js */ Ext.core.Element.prototype.getScroll = undefined; 
    /* Touch out -- Element.scroll.js */ Ext.core.Element.prototype.isScrollable = undefined; 
    /* Touch out -- Element.scroll.js */ Ext.core.Element.prototype.scroll = undefined; 
    /* Touch out -- Element.scroll.js */ Ext.core.Element.prototype.scrollIntoView = undefined; 
    /* Touch out -- Element.scroll.js */ Ext.core.Element.prototype.scrollTo = undefined; 
    /* Touch out -- Element.static-more.js */ Ext.core.Element.prototype.getActiveElement = undefined; 
    /* Touch out -- Element.static-more.js */ Ext.core.Element.prototype.serializeForm = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.fromPoint = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.getDocumentHeight = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.getDocumentWidth = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.getOrientation = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.getViewportHeight = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.getViewportWidth = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.normalize = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.parseBox = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.parseStyles = undefined; 
    /* Touch out -- Element.static.js */ Ext.core.Element.prototype.unitizeBox = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.addClass = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.addClsOnClick = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.addClsOnFocus = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.addClsOnOver = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.boxWrap = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.clearOpacity = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.clip = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.getColor = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.getComputedHeight = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.getComputedWidth = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.getFrameWidth = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.getStyleSize = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.getStyles = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.hasClass = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.radioClass = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.removeClass = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.replaceClass = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.setOpacity = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.toggleClass = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.unclip = undefined; 
    /* Touch out -- Element.style.js */ Ext.core.Element.prototype.unselectable = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.child = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.down = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.findParent = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.findParentNode = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.first = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.last = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.next = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.parent = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.prev = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.query = undefined; 
    /* Touch out -- Element.traversal.js */ Ext.core.Element.prototype.up = undefined;

    APITest({Ext:expected.Ext}, {Ext:actual.Ext});
});

