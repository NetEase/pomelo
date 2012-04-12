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

    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.alignTo = function alignTo(){}; 
    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.anchorTo = function anchorTo(){}; 
    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.center = function center(){}; 
    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.getAlignToXY = function getAlignToXY(){}; 
    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.getAnchorXY = function getAnchorXY(){}; 
    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.getCenterXY = function getCenterXY(){}; 
    /* Touch -- Element.alignment.js */ Ext.core.Element.prototype.removeAnchor = function removeAnchor(){}; 
    /* Touch -- Element.fx-more.js,Element.style.js */ Ext.core.Element.prototype.mask = function mask(){}; 
    /* Touch -- Element.fx-more.js,Element.style.js */ Ext.core.Element.prototype.unmask = function unmask(){}; 
    /* Touch -- Element.fx.js,Element.js */ Ext.core.Element.OFFSETS = Number(); 
    /* Touch -- Element.fx.js,Element.js,Element.fx.js */ Ext.core.Element.DISPLAY = Number(); 
    /* Touch -- Element.fx.js,Element.js,Element.fx.js */ Ext.core.Element.VISIBILITY = Number(); 
    /* Touch -- Element.fx.js,Element.js,Element.fx.js */ Ext.core.Element.prototype.hide = function hide(){}; 
    /* Touch -- Element.fx.js,Element.js,Element.fx.js */ Ext.core.Element.prototype.setVisible = function setVisible(){}; 
    /* Touch -- Element.fx.js,Element.js,Element.fx.js */ Ext.core.Element.prototype.show = function show(){}; 
    /* Touch -- Element.js */ Ext.core.Element.defaultUnit = String(); 
    // /* Touch -- Element.js */ Ext.core.Element.prototype.dom = {}; 
    // /* Touch -- Element.js */ Ext.core.Element.prototype.id = String(); 
    /* Touch -- Element.js */ Ext.core.Element.prototype.addListener = function addListener(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.contains = function contains(){}; 
    /* Touch -- Element.js */ Ext.core.Element.fly = function fly(){}; 
    /* Touch -- Element.js */ Ext.core.Element.get = function get(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.getAttribute = function getAttribute(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.getHTML = function getHTML(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.getValue = function getValue(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.is = function is(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.isDescendent = function isDescendent(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.purgeAllListeners = function purgeAllListeners(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.remove = function remove(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.removeAllListeners = function removeAllListeners(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.removeListener = function removeListener(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.set = function set(){}; 
    /* Touch -- Element.js */ Ext.core.Element.prototype.setHTML = function setHTML(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getBottom = function getBottom(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getBox = function getBox(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getLeft = function getLeft(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getOffsetsTo = function getOffsetsTo(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getPageBox = function getPageBox(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getRight = function getRight(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getTop = function getTop(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getX = function getX(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getXY = function getXY(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.getY = function getY(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setBottom = function setBottom(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setBox = function setBox(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setLeft = function setLeft(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setRight = function setRight(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setTop = function setTop(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setTopLeft = function setTopLeft(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setX = function setX(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setXY = function setXY(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.setY = function setY(){}; 
    /* Touch -- Element.position.js */ Ext.core.Element.prototype.translatePoints = function translatePoints(){}; 
    /* Touch -- Element.static-more.js */ Ext.core.Element.cssTransform = function cssTransform(){}; 
    /* Touch -- Element.static-more.js */ Ext.core.Element.cssTranslate = function cssTranslate(){}; 
    /* Touch -- Element.static-more.js */ Ext.core.Element.getComputedTransformOffset = function getComputedTransformOffset(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.addCls = function addCls(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.applyStyles = function applyStyles(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getBorderWidth = function getBorderWidth(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getHeight = function getHeight(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getMargin = function getMargin(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getOuterHeight = function getOuterHeight(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getOuterWidth = function getOuterWidth(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getPadding = function getPadding(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getSize = function getSize(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getStyle = function getStyle(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getViewSize = function getViewSize(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.getWidth = function getWidth(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.hasCls = function hasCls(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.radioCls = function radioCls(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.removeCls = function removeCls(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.repaint = function repaint(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.replaceCls = function replaceCls(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.setHeight = function setHeight(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.setSize = function setSize(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.setStyle = function setStyle(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.setWidth = function setWidth(){}; 
    /* Touch -- Element.style.js */ Ext.core.Element.prototype.toggleCls = function toggleCls(){}; 
    /* Touch -- Element.traversal-more.js */ Ext.core.Element.prototype.getScrollParent = function getScrollParent(){}; 
    /* Touch -- Element.traversal.js,CompositeElement.js,Element.traversal.js */ Ext.core.Element.prototype.select = function select(){}; 

    APITest({Ext:expected.Ext}, {Ext:actual.Ext});
});

